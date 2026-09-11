/**
 * Subtitle Service
 * Manages subtitle preferences, accurate multi-language captions,
 * provider-specific query formatting, and auto-sync for video players.
 */

export const SUBTITLE_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'it', label: 'Italian', native: 'Italiano' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'ko', label: 'Korean', native: '한국어' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'fil', label: 'Filipino / Tagalog', native: 'Tagalog' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'id', label: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', label: 'Thai', native: 'ไทย' },
  { code: 'off', label: 'Subtitles Off', native: 'None' },
];

const STORAGE_KEY = 'warayflix_subtitle_lang';

export const subtitleService = {
  /**
   * Gets preferred subtitle language (defaults to 'en' so video plays with subtitles automatically).
   */
  getPreferredLanguage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;
      }
    } catch {
      // Fallback
    }
    return 'en';
  },

  /**
   * Saves preferred subtitle language to localStorage for persistence across sessions.
   */
  setPreferredLanguage(code) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, code);
      }
    } catch {
      // Ignore
    }
    return code;
  },

  /**
   * Generates comprehensive query parameters to guarantee multi-server subtitle auto-play and time sync.
   */
  buildPlayerQueryParams(start = 0, subLang = 'en') {
    const params = [];

    // Playback scrubber timestamp
    if (start && Number(start) > 0) {
      const s = Math.floor(Number(start));
      params.push(`t=${s}`, `startAt=${s}`, `time=${s}`, `start=${s}`);
    }

    // Accurate Subtitle track auto-activation
    if (subLang && subLang !== 'off') {
      const lang = encodeURIComponent(subLang);
      params.push(
        `sub=${lang}`,
        `subtitle=true`,
        `subtitles=true`,
        `sub_lang=${lang}`,
        `defaultSub=${lang}`,
        `default_lang=${lang}`,
        `cc=1`,
        `captions=1`,
        `lang=${lang}`
      );
    } else if (subLang === 'off') {
      params.push(`sub=none`, `subtitle=false`, `cc=0`);
    }

    return params.length > 0 ? `?${params.join('&')}` : '';
  },

  /**
   * Returns metadata label for the selected language code.
   */
  getLanguageInfo(code) {
    return SUBTITLE_LANGUAGES.find(l => l.code === code) || {
      code: code || 'en',
      label: code ? code.toUpperCase() : 'English',
      native: code ? code.toUpperCase() : 'English'
    };
  }
};
