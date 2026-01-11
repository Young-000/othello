import { useState, useCallback } from 'react'
import {
  KlondikeState,
  createKlondikeGame,
  drawFromStock,
  moveWasteToTableau,
  moveWasteToFoundation,
  moveTableauToFoundation,
  moveTableauToTableau,
  autoMoveToFoundation,
} from '../domain/game/klondike/KlondikeGame'

export interface Selection {
  type: 'tableau' | 'waste'
  columnIndex?: number
  cardCount: number
}

export function useKlondikeGame() {
  const [state, setState] = useState<KlondikeState>(() => createKlondikeGame())
  const [selection, setSelection] = useState<Selection | null>(null)
  const [history, setHistory] = useState<KlondikeState[]>([])

  const newGame = useCallback(() => {
    setState(createKlondikeGame())
    setSelection(null)
    setHistory([])
  }, [])

  const saveState = useCallback(() => {
    const MAX_HISTORY = 50
    setHistory(prev => {
      const newHistory = [...prev, state]
      return newHistory.length > MAX_HISTORY
        ? newHistory.slice(-MAX_HISTORY)
        : newHistory
    })
  }, [state])

  const undo = useCallback(() => {
    if (history.length > 0) {
      const prev = history[history.length - 1]
      setState(prev)
      setHistory(h => h.slice(0, -1))
      setSelection(null)
    }
  }, [history])

  const handleDraw = useCallback(() => {
    saveState()
    setState(prev => drawFromStock(prev))
    setSelection(null)
  }, [saveState])

  const handleWasteClick = useCallback(() => {
    if (state.waste.length === 0) return

    if (selection?.type === 'waste') {
      // Try auto-move to foundation on second click (double-click behavior)
      const newState = autoMoveToFoundation(state)
      if (newState) {
        saveState()
        setState(newState)
        setSelection(null)
        return
      }
      // If can't auto-move, deselect
      setSelection(null)
      return
    }

    setSelection({ type: 'waste', cardCount: 1 })
  }, [state, selection, saveState])

  const handleTableauClick = useCallback(
    (columnIndex: number, cardIndex: number) => {
      const column = state.tableau[columnIndex]
      if (column.length === 0) {
        // Empty column - try to move selected cards here
        if (selection) {
          saveState()
          if (selection.type === 'waste') {
            setState(prev => moveWasteToTableau(prev, columnIndex))
          } else if (selection.type === 'tableau' && selection.columnIndex !== undefined) {
            setState(prev =>
              moveTableauToTableau(prev, selection.columnIndex!, columnIndex, selection.cardCount)
            )
          }
          setSelection(null)
        }
        return
      }

      const clickedCard = column[cardIndex]
      if (!clickedCard.faceUp) return

      const cardCount = column.length - cardIndex

      if (selection) {
        // If clicking the same top card selection, try auto-move to foundation
        if (
          selection.type === 'tableau' &&
          selection.columnIndex === columnIndex &&
          selection.cardCount === cardCount &&
          cardCount === 1
        ) {
          // Try to auto-move to foundation
          for (let i = 0; i < 4; i++) {
            const testState = moveTableauToFoundation(state, columnIndex, i)
            if (testState.moves > state.moves) {
              saveState()
              setState(testState)
              setSelection(null)
              return
            }
          }
          // Can't move to foundation, just deselect
          setSelection(null)
          return
        }

        // If clicking the same multi-card selection, deselect
        if (
          selection.type === 'tableau' &&
          selection.columnIndex === columnIndex &&
          selection.cardCount === cardCount
        ) {
          setSelection(null)
          return
        }

        // Try to place selected cards
        if (selection.type === 'waste') {
          saveState()
          setState(prev => moveWasteToTableau(prev, columnIndex))
          setSelection(null)
        } else if (selection.type === 'tableau' && selection.columnIndex !== undefined) {
          if (selection.columnIndex !== columnIndex) {
            saveState()
            setState(prev =>
              moveTableauToTableau(prev, selection.columnIndex!, columnIndex, selection.cardCount)
            )
          }
          setSelection(null)
        }
      } else {
        // Select cards
        setSelection({ type: 'tableau', columnIndex, cardCount })
      }
    },
    [state, selection, saveState]
  )

  const handleFoundationClick = useCallback(
    (foundationIndex: number) => {
      if (!selection) return

      if (selection.type === 'waste') {
        saveState()
        setState(prev => moveWasteToFoundation(prev, foundationIndex))
      } else if (selection.type === 'tableau' && selection.columnIndex !== undefined) {
        // Only move single cards to foundation, not multiple
        if (selection.cardCount === 1) {
          saveState()
          setState(prev => moveTableauToFoundation(prev, selection.columnIndex!, foundationIndex))
        }
      }
      setSelection(null)
    },
    [selection, saveState]
  )

  const handleDoubleClick = useCallback(() => {
      const result = autoMoveToFoundation(state)
      if (result) {
        saveState()
        setState(result)
        setSelection(null)
      }
    },
    [state, saveState]
  )

  return {
    state,
    selection,
    canUndo: history.length > 0,
    newGame,
    undo,
    handleDraw,
    handleWasteClick,
    handleTableauClick,
    handleFoundationClick,
    handleDoubleClick,
  }
}
