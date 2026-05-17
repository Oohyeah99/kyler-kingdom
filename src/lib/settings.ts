const SETTINGS_KEY = 'kyler_settings'

interface Settings {
  globalFontSize: number // offset from default in px
}

export function loadSettings(): Settings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return { globalFontSize: 0 }
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch { /* ignore */ }
}

export function applySettingsOnMount() {
  const settings = loadSettings()
  const base = 16 + settings.globalFontSize // 16px is tailwind default
  document.documentElement.style.fontSize = `${base}px`
}
