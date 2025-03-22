import { ref, watch } from 'vue';

const MIN_FONT_SIZE_LEVEL = 1;
const MAX_FONT_SIZE_LEVEL = 5;

export function useSettings(initialSettings, updateParent) {

  const fontSizeLevel = ref(initialSettings.fontSizeLevel || 3);
  const repeatCount = ref(initialSettings.repeatCount || 1);
  const repeatDelay = ref(initialSettings.repeatDelay || 1);
  const autoPlayNext = ref(initialSettings.autoPlayNext || false);

  const increaseFontSize = () => {
    if (fontSizeLevel.value < MAX_FONT_SIZE_LEVEL) {
      fontSizeLevel.value++;
    }
  };

  const decreaseFontSize = () => {
    if (fontSizeLevel.value > MIN_FONT_SIZE_LEVEL) {
      fontSizeLevel.value--;
    }
  };

  const getSettingsObject = () => {
    return {
      fontSizeLevel: fontSizeLevel.value,
      repeatCount: repeatCount.value,
      repeatDelay: repeatDelay.value,
      autoPlayNext: autoPlayNext.value
    };
  };

  const updateSettings = () => {
    if (typeof updateParent === 'function') {
      updateParent(getSettingsObject());
    }
  };

  const saveSettings = () => {
    localStorage.setItem('quranAppSettings', JSON.stringify(getSettingsObject()));
  };

  const loadSettings = () => {
    const settingsJson = localStorage.getItem('quranAppSettings');
    if (settingsJson) {
      try {
        const settings = JSON.parse(settingsJson);
        fontSizeLevel.value = settings.fontSizeLevel || 3;
        repeatCount.value = settings.repeatCount || 1;
        repeatDelay.value = settings.repeatDelay || 1;
        autoPlayNext.value = settings.autoPlayNext || false;

        updateSettings();
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  };

  watch([fontSizeLevel, repeatCount, repeatDelay, autoPlayNext], () => {
    saveSettings();
    updateSettings();
  }, { deep: true });

  const updateFromExternalSettings = (newSettings) => {
    if (!newSettings) return;

    fontSizeLevel.value = newSettings.fontSizeLevel;
    repeatCount.value = newSettings.repeatCount;
    repeatDelay.value = newSettings.repeatDelay;
    autoPlayNext.value = newSettings.autoPlayNext;
  };

  return {
    MIN_FONT_SIZE_LEVEL,
    MAX_FONT_SIZE_LEVEL,
    fontSizeLevel,
    repeatCount,
    repeatDelay,
    autoPlayNext,
    increaseFontSize,
    decreaseFontSize,
    getSettingsObject,
    loadSettings,
    saveSettings,
    updateSettings,
    updateFromExternalSettings
  };
}