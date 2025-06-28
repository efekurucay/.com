'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Icon } from '@/once-ui/components'

export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      aria-label="Toggle theme"
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="l" />
    </button>
  )
} 