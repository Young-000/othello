import { useEffect, useCallback, useState } from 'react'
import { GameHelp, Language, getHelp } from '../../data/gameHelp'
import styles from './HelpModal.module.css'

interface HelpModalProps {
  gameId: string
  isOpen: boolean
  onClose: () => void
}

const languageLabels: Record<Language, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇺🇸' },
  ko: { label: '한국어', flag: '🇰🇷' },
}

export default function HelpModal({ gameId, isOpen, onClose }: HelpModalProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('preferred-language')
    return (saved as Language) || 'ko'
  })

  const help: GameHelp = getHelp(gameId, language)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'ko' : 'en'
    setLanguage(newLang)
    localStorage.setItem('preferred-language', newLang)
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
      >
        <div className={styles.header}>
          <h2 id="help-title" className={styles.title}>{help.title}</h2>
          <div className={styles.headerButtons}>
            <button
              className={styles.langButton}
              onClick={toggleLanguage}
              aria-label={`Switch to ${language === 'en' ? 'Korean' : 'English'}`}
              title={`Switch to ${language === 'en' ? '한국어' : 'English'}`}
            >
              {languageLabels[language === 'en' ? 'ko' : 'en'].flag}
            </button>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close help"
            >
              ×
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h3>{language === 'ko' ? '목표' : 'Objective'}</h3>
            <p>{help.objective}</p>
          </section>

          <section className={styles.section}>
            <h3>{language === 'ko' ? '게임 방법' : 'How to Play'}</h3>
            <ul>
              {help.rules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h3>{language === 'ko' ? '팁' : 'Tips'}</h3>
            <ul>
              {help.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </section>

          {help.scoring && (
            <section className={styles.section}>
              <h3>{language === 'ko' ? '점수' : 'Scoring'}</h3>
              <p>{help.scoring}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
