import { describe, it, expect } from 'vitest'
import {
  createCard,
  flipCard,
  isRed,
  isBlack,
  getRankValue,
  areOppositeColors,
  isOneRankLower,
  isOneRankHigher,
  getCardId,
} from './Card'

describe('Card Domain', () => {
  describe('createCard', () => {
    it('should create a card with given suit and rank', () => {
      const card = createCard('hearts', 'A')
      expect(card.suit).toBe('hearts')
      expect(card.rank).toBe('A')
      expect(card.faceUp).toBe(false)
    })

    it('should create a face-up card when specified', () => {
      const card = createCard('spades', 'K', true)
      expect(card.faceUp).toBe(true)
    })
  })

  describe('flipCard', () => {
    it('should flip a face-down card to face-up', () => {
      const card = createCard('hearts', '5')
      const flipped = flipCard(card)
      expect(flipped.faceUp).toBe(true)
    })

    it('should flip a face-up card to face-down', () => {
      const card = createCard('hearts', '5', true)
      const flipped = flipCard(card)
      expect(flipped.faceUp).toBe(false)
    })

    it('should not mutate the original card', () => {
      const card = createCard('hearts', '5')
      flipCard(card)
      expect(card.faceUp).toBe(false)
    })
  })

  describe('isRed / isBlack', () => {
    it('hearts should be red', () => {
      expect(isRed(createCard('hearts', 'A'))).toBe(true)
      expect(isBlack(createCard('hearts', 'A'))).toBe(false)
    })

    it('diamonds should be red', () => {
      expect(isRed(createCard('diamonds', 'K'))).toBe(true)
      expect(isBlack(createCard('diamonds', 'K'))).toBe(false)
    })

    it('clubs should be black', () => {
      expect(isRed(createCard('clubs', '7'))).toBe(false)
      expect(isBlack(createCard('clubs', '7'))).toBe(true)
    })

    it('spades should be black', () => {
      expect(isRed(createCard('spades', 'Q'))).toBe(false)
      expect(isBlack(createCard('spades', 'Q'))).toBe(true)
    })
  })

  describe('getRankValue', () => {
    it('Ace should have value 1', () => {
      expect(getRankValue(createCard('hearts', 'A'))).toBe(1)
    })

    it('King should have value 13', () => {
      expect(getRankValue(createCard('hearts', 'K'))).toBe(13)
    })

    it('number cards should have their face value', () => {
      expect(getRankValue(createCard('hearts', '5'))).toBe(5)
      expect(getRankValue(createCard('hearts', '10'))).toBe(10)
    })
  })

  describe('areOppositeColors', () => {
    it('red and black should be opposite', () => {
      const red = createCard('hearts', 'A')
      const black = createCard('spades', 'K')
      expect(areOppositeColors(red, black)).toBe(true)
    })

    it('same colors should not be opposite', () => {
      const red1 = createCard('hearts', 'A')
      const red2 = createCard('diamonds', 'K')
      expect(areOppositeColors(red1, red2)).toBe(false)
    })
  })

  describe('isOneRankLower / isOneRankHigher', () => {
    it('should correctly identify sequential ranks', () => {
      const five = createCard('hearts', '5')
      const six = createCard('spades', '6')
      expect(isOneRankLower(five, six)).toBe(true)
      expect(isOneRankHigher(six, five)).toBe(true)
    })

    it('should return false for non-sequential ranks', () => {
      const five = createCard('hearts', '5')
      const seven = createCard('spades', '7')
      expect(isOneRankLower(five, seven)).toBe(false)
    })
  })

  describe('getCardId', () => {
    it('should return unique identifier', () => {
      const card = createCard('hearts', 'A')
      expect(getCardId(card)).toBe('hearts-A')
    })
  })
})
