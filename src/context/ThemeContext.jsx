import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { paletteForMode } from '../data/theme';
import { createStyles, seasonThemes } from '../styles/styles';

const STORAGE_KEY = 'farm-planner/theme-mode';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && (saved === 'light' || saved === 'dark')) {
          setModeState(saved);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback(async next => {
    const value = next === 'dark' ? 'dark' : 'light';
    setModeState(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const palette = useMemo(() => paletteForMode(mode), [mode]);
  const st = useMemo(() => createStyles(palette), [palette]);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      ready,
      palette,
      st,
      seasonThemes,
      setMode,
      toggleMode,
    }),
    [mode, ready, palette, st, setMode, toggleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
