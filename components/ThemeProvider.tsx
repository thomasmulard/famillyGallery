"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: string;
  setTheme: (theme: string) => void;
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "gallery-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState(initialState.theme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const storedTheme = localStorage.getItem(storageKey)
      if (storedTheme) {
        setTheme(storedTheme)
      } else {
        setTheme(defaultTheme)
      }
    } catch (e) {
      // localStorage is not available
      setTheme(defaultTheme)
    }
  }, [defaultTheme, storageKey])

  const applyTheme = useCallback((currentTheme: string) => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    let effectiveTheme = currentTheme
    if (effectiveTheme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }
    
    root.classList.add(effectiveTheme)
    root.style.colorScheme = effectiveTheme
  }, [])

  useEffect(() => {
    if (mounted) {
      applyTheme(theme)
    }
  }, [theme, mounted, applyTheme])


  const handleSetTheme = (newTheme: string) => {
    try {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
      applyTheme(newTheme)
    } catch (e) {
       // localStorage is not available
       setTheme(newTheme)
    }
  }

  const value = {
    theme,
    setTheme: handleSetTheme,
  }

  // Prevent UI that depends on the theme from flashing
  if (!mounted) {
    // On the server, or before hydration, we render a placeholder or nothing.
    // Wrapping children in a div that is hidden until mounted can be a strategy.
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
