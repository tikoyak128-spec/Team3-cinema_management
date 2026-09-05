import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { translate } from "../i18n/translations";

const PrefsContext = createContext(null);
const PREFS_KEY = "khmer_cinema_prefs";

const DEFAULT_PREFS = { theme: "dark", language: "en" };

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFS,
      ...parsed,
      theme: parsed.theme === "light" ? "light" : "dark",
      language: parsed.language === "km" ? "km" : "en",
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function PrefsProvider({ children }) {
  const [prefs, setPrefs] = useState(loadPrefs);

  const updatePrefs = useCallback((partial) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const setTheme = useCallback(
    (theme) => updatePrefs({ theme: theme === "light" ? "light" : "dark" }),
    [updatePrefs]
  );
  const setLanguage = useCallback(
    (language) => updatePrefs({ language: language === "km" ? "km" : "en" }),
    [updatePrefs]
  );
  const resetPrefs = useCallback(() => {
    setPrefs(DEFAULT_PREFS);
    try {
      localStorage.removeItem(PREFS_KEY);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key, params) => translate(prefs.language, key, params),
    [prefs.language]
  );

  const value = useMemo(
    () => ({
      prefs,
      theme: prefs.theme,
      language: prefs.language,
      t,
      setTheme,
      setLanguage,
      updatePrefs,
      resetPrefs,
    }),
    [prefs, t, setTheme, setLanguage, updatePrefs, resetPrefs]
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used within PrefsProvider");
  return ctx;
}