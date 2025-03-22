import { ref, computed } from 'vue';
import { quranAudioService } from '../services/audioAPI';

export function useAudioPlayer(verses, surah, settings, isIOS, hadUserInteraction, bookmarks) {
  const currentPlayingAyah = ref(null);
  const currentRepeatCounter = ref(0);
  const audioBlockedMessage = ref(false);

  const isCurrentVerseBookmarked = computed(() => {
    if (!currentPlayingAyah.value) return false;

    const playingVerse = verses.value.find(v => v.number === currentPlayingAyah.value);
    if (!playingVerse) return false;

    return bookmarks.value.some(bookmark => 
      bookmark.surahNumber === surah.number && 
      bookmark.verseNumber === playingVerse.numberInSurah
    );
  });

  const showAutoplayBlockedMessage = () => {
    audioBlockedMessage.value = true;
    setTimeout(() => {
      audioBlockedMessage.value = false;
    }, 3000);
  };

  const canAutoPlay = () => {

    if (!settings.value.autoPlayNext) return false;

    if (isIOS.value && !hadUserInteraction.value) return false;

    return true;
  };

  const handleAudioError = (error) => {
    console.warn('Audio playback error:', error);
    currentPlayingAyah.value = null;
    currentRepeatCounter.value = 0;
    showAutoplayBlockedMessage();
  };

  const stopAudio = () => {
    quranAudioService.stopAudio();
    currentPlayingAyah.value = null;
    currentRepeatCounter.value = 0;
  };

  const findNextAyah = (currentAyah, currentPage) => {
    if (!currentPage) return null;

    const currentIndex = currentPage.findIndex(a => a.number === currentAyah);

    if (currentIndex < currentPage.length - 1) {

      return currentPage[currentIndex + 1];
    }

    return null;
  };

  const setupAudioEvents = (ayah, currentPage) => {
    quranAudioService.setupEventListeners({
      onEnded: () => {
        currentRepeatCounter.value++;

        if (currentRepeatCounter.value < settings.value.repeatCount) {

          setTimeout(() => {
            quranAudioService.resumePlayback(
              () => {}, 
              () => handleAudioError('Auto-repeat prevented')
            );
          }, settings.value.repeatDelay * 1000);
        } else {

          if (canAutoPlay()) {

            const nextAyah = findNextAyah(ayah.number, currentPage);
            if (nextAyah) {
              setTimeout(() => {
                playNextAyah(nextAyah, currentPage);
              }, settings.value.repeatDelay * 1000);
            } else {
              currentPlayingAyah.value = null;
              currentRepeatCounter.value = 0;
            }
          } else {
            currentPlayingAyah.value = null;
            currentRepeatCounter.value = 0;
          }
        }
      },
      onError: (e) => {
        console.error('Audio playback error:', e);
        currentPlayingAyah.value = null;
        currentRepeatCounter.value = 0;
      }
    });
  };

  const playNextAyah = (nextAyah, currentPage) => {

    currentPlayingAyah.value = nextAyah.number;
    currentRepeatCounter.value = 0;

    if (isIOS.value && !settings.value.autoPlayNext) {
      currentPlayingAyah.value = null;
      return;
    }

    setupAudioEvents(nextAyah, currentPage);

    quranAudioService.playAudio(
      nextAyah.number, 
      () => {}, 
      () => handleAudioError('Next ayah playback prevented')
    );
  };

  const playAudio = (ayah, currentPage) => {

    if (currentPlayingAyah.value === ayah.number) {
      stopAudio();
      return;
    }

    quranAudioService.stopAudio();

    currentRepeatCounter.value = 0;
    currentPlayingAyah.value = ayah.number;

    setupAudioEvents(ayah, currentPage);

    quranAudioService.playAudio(
      ayah.number, 
      () => {},  
      () => handleAudioError('Playback prevented')
    );
  };

  return {
    currentPlayingAyah,
    currentRepeatCounter,
    audioBlockedMessage,
    isCurrentVerseBookmarked,
    stopAudio,
    playAudio,
    playNextAyah,
    showAutoplayBlockedMessage,
    canAutoPlay
  };
}