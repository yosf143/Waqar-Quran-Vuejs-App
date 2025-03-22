<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import SettingsPanel from './SettingsPanel.vue';
import { useBookmarks } from '../composables/useBookmarks';
import { useFormatter } from '../composables/useFormatter';
import { useVerseNavigation } from '../composables/useVerseNavigation';
import { useAudioPlayer } from '../composables/useAudioPlayer';
import { usePlatformDetection } from '../composables/usePlatformDetection';

 
const props = defineProps({
  surah: {
    type: Object,
    required: true
  }
});

 
const emit = defineEmits(['goBack']);
 
const verses = ref([]);
const loading = ref(true);
const error = ref(null);
const showJumpDialog = ref(false);
const jumpVerseNumber = ref('');
const jumpError = ref('');
const showSettings = ref(false);
const settings = ref({
  fontSizeLevel: 3,
  repeatCount: 1,
  repeatDelay: 1,
  autoPlayNext: false
});

 
const { bookmarks, loadBookmarks, isBookmarked, toggleBookmark } = useBookmarks();
const { toArabicNumeral, convertArabicToEnglishNumbers } = useFormatter();
const { isIOS, hadUserInteraction, markUserInteraction } = usePlatformDetection();
const { 
  versesPerPage, 
  currentPageIndex, 
  pages, 
  currentPage, 
  totalPages, 
  hasPreviousPage, 
  hasNextPage,
  previousPage,
  nextPage,
  scrollToVerse
} = useVerseNavigation(verses);

const { 
  currentPlayingAyah,
  audioBlockedMessage,
  currentRepeatCounter,
  stopAudio,
  playAudio,
  isCurrentVerseBookmarked,
  showAutoplayBlockedMessage,
  canAutoPlay
} = useAudioPlayer(verses, props.surah, settings, isIOS, hadUserInteraction, bookmarks);

 
const fontSizeMap = {
  1: '1rem',
  2: '1.25rem',
  3: '1.5rem',
  4: '1.75rem',
  5: '2rem'
};

 
const currentFontSize = computed(() => {
  return fontSizeMap[settings.value.fontSizeLevel];
});

 
const surahInfo = computed(() => {
  return {
    number: props.surah.number,
    name: props.surah.name,
    englishName: props.surah.englishName,
    numberOfAyahs: props.surah.numberOfAyahs,
    revelationType: props.surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'
  };
});

 
const goBack = () => {
 
  stopAudio();
  emit('goBack');
};

 
const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

 
const updateSettings = (newSettings) => {
  settings.value = newSettings;
};
 
const toggleJumpDialog = () => {
  showJumpDialog.value = !showJumpDialog.value;
  if (showJumpDialog.value) {
    jumpVerseNumber.value = '';
    jumpError.value = '';
 
    setTimeout(() => {
      document.getElementById('jumpVerseInput')?.focus();
    }, 100);
  }
};

 
const jumpToVerse = () => {
  jumpError.value = '';
  
  if (!jumpVerseNumber.value) {
    jumpError.value = 'الرجاء إدخال رقم الآية';
    return;
  }
   
  const normalizedNumber = convertArabicToEnglishNumbers(jumpVerseNumber.value);
  const verseNum = parseInt(normalizedNumber);
  
  if (isNaN(verseNum) || verseNum <= 0) {
    jumpError.value = 'الرجاء إدخال رقم صحيح';
    return;
  }
  
  if (verseNum > surahInfo.value.numberOfAyahs) {
    jumpError.value = `رقم الآية يجب أن يكون أقل من أو يساوي ${surahInfo.value.numberOfAyahs}`;
    return;
  }
  
 
  const targetVerse = verses.value.find(v => v.numberInSurah === verseNum);
  if (!targetVerse) {
    jumpError.value = 'لم يتم العثور على الآية';
    return;
  }
  
 
  stopAudio();
  
  
  showJumpDialog.value = false;
  
 
  scrollToVerse(verseNum);
};
 
const handleJumpKeydown = (event) => {
  if (event.key === 'Enter') {
    jumpToVerse();
  } else if (event.key === 'Escape') {
    showJumpDialog.value = false;
  }
};

 
const checkJumpToVerse = () => {
  const jumpToVerse = localStorage.getItem('jump-to-verse');
  if (jumpToVerse) {
 
    localStorage.removeItem('jump-to-verse');
    
 
    const verseNum = parseInt(jumpToVerse);
    
 
    if (!isNaN(verseNum) && verseNum > 0 && verseNum <= surahInfo.value.numberOfAyahs) {
      
      setTimeout(() => {
        scrollToVerse(verseNum);
      }, 300);
    }
  }
};

 
const fetchVerses = async () => {
  try {
    loading.value = true;
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${props.surah.number}`);
    const data = await response.json();
    
    if (data.code === 200 && data.status === 'OK') {
      verses.value = data.data.ayahs;
      
   
      checkJumpToVerse();
    } else {
      throw new Error('Failed to fetch verses');
    }
  } catch (err) {
    error.value = 'فشل في تحميل الآيات. يرجى المحاولة مرة أخرى.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};
 
const handleToggleBookmark = () => {
  if (!currentPlayingAyah.value) return;
  
  const playingVerse = verses.value.find(v => v.number === currentPlayingAyah.value);
  if (!playingVerse) return;
  
  toggleBookmark(
    props.surah.number,
    props.surah.name,
    playingVerse.numberInSurah,
    playingVerse.text
  );
};

 
const handlePlayAudio = (ayah) => {
  markUserInteraction();
  playAudio(ayah, currentPage.value);
};

 
watch(() => props.surah.number, (newSurahNumber) => {
 
  currentPageIndex.value = 0;
  currentPlayingAyah.value = null;
  stopAudio();
  
 
  fetchVerses();
});

onMounted(() => {
  fetchVerses();
  loadBookmarks();
  
  
  if (isIOS.value) {
    document.addEventListener('touchstart', markUserInteraction);
    document.addEventListener('click', markUserInteraction);
  }
});
</script>

<template>
  <div class="surah-detail-wrapper" @click="markUserInteraction" @touchstart="markUserInteraction">
 
    <div class="control-bar">
      <button class="control-button back-button" @click="goBack" aria-label="العودة للفهرس">
        <i class="fas fa-arrow-right"></i>
      </button>
      
    
      <button class="control-button jump-button" @click="toggleJumpDialog" aria-label="الانتقال إلى آية">
        <i class="fas fa-search"></i>
      </button>
      
    
      <button 
        v-if="currentPlayingAyah" 
        class="control-button bookmark-button" 
        @click="handleToggleBookmark" 
        :class="{ 'active': isCurrentVerseBookmarked }"
        aria-label="إضافة إشارة مرجعية">
        <i class="fas fa-bookmark"></i>
      </button>
      
      <button class="control-button settings-button" @click="toggleSettings" aria-label="الإعدادات">
        <i class="fas fa-cog"></i>
      </button>
    </div>
    
  
    <SettingsPanel
      :show="showSettings"
      :settings="settings"
      @close="toggleSettings"
      @update:settings="updateSettings"
    />
   
    <div v-if="showJumpDialog" class="jump-dialog-backdrop" @click.self="showJumpDialog = false">
      <div class="jump-dialog">
        <div class="jump-dialog-header">
          <h3 class="jump-dialog-title">الانتقال إلى آية</h3>
          <button class="jump-dialog-close" @click="showJumpDialog = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="jump-dialog-body">
          <div class="jump-input-group">
            <input
              id="jumpVerseInput"
              type="text"
              class="jump-input"
              v-model="jumpVerseNumber"
              @keydown="handleJumpKeydown"
              placeholder="أدخل رقم الآية"
              min="1"
              :max="surahInfo.numberOfAyahs"
            />
          </div>
          <div class="jump-max">
            عدد آيات السورة: {{ surahInfo.numberOfAyahs }}
          </div>
          <div v-if="jumpError" class="jump-error">
            {{ jumpError }}
          </div>
        </div>
        <div class="jump-dialog-footer">
          <button class="jump-btn jump-btn-secondary" @click="showJumpDialog = false">
            إلغاء
          </button>
          <button class="jump-btn jump-btn-primary" @click="jumpToVerse">
            انتقال
          </button>
        </div>
      </div>
    </div>
    
   
    <div v-if="loading" class="loading-container">
      <div class="spinner-border loading-spinner" role="status">
        <span class="visually-hidden"></span>
      </div>
    </div>
    
   
    <div v-else-if="error" class="alert alert-danger arabic-text text-center" role="alert">
      {{ error }}
    </div>
    
 
    <div v-else class="mushaf-container">
  
      <div class="surah-frame">
        <div class="page-header">
          <div class="ornament-left"></div>
          <div class="surah-name">{{ surahInfo.name }}</div>
          <div class="ornament-right"></div>
        </div>
      </div>
      
 
      <div class="page-navigation">
        <button 
          class="nav-button prev-button" 
          @click="previousPage" 
          :disabled="!hasPreviousPage"
          :class="{ 'disabled': !hasPreviousPage }"
          aria-label="الصفحة السابقة"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
        
        <div class="page-indicator">
          {{ currentPageIndex + 1 }} / {{ totalPages }}
        </div>
        
        <button 
          class="nav-button next-button" 
          @click="nextPage" 
          :disabled="!hasNextPage"
          :class="{ 'disabled': !hasNextPage }"
          aria-label="الصفحة التالية"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
      </div>
      
    
      <div class="quran-page">
        <div class="verses-flow" :style="{ fontSize: currentFontSize }">
          <span
            v-for="ayah in currentPage" 
            :key="ayah.number"
            class="ayah-text"
            :class="{ 
              'playing': currentPlayingAyah === ayah.number,
              'bookmarked': bookmarks.some(b => b.surahNumber === surahInfo.number && b.verseNumber === ayah.numberInSurah)
            }"
            :data-verse="ayah.numberInSurah"
            @click="handlePlayAudio(ayah)"
          >
            {{ ayah.text }}
            <span class="ayah-marker">{{ ayah.numberInSurah }}</span>
          </span>
        </div>
      </div>

     
      <div v-if="currentPlayingAyah" class="audio-indicator">
        <i class="fas fa-volume-up"></i>
        <span>
          جاري تشغيل الآية {{ verses.find(v => v.number === currentPlayingAyah)?.numberInSurah }}
          <span v-if="settings.repeatCount > 1">
            ({{ currentRepeatCounter + 1 }}/{{ settings.repeatCount }})
          </span>
        </span>
      </div>
      
    
      <div v-if="audioBlockedMessage" class="audio-blocked-message">
        <i class="fas fa-exclamation-circle"></i>
      تم منع التشغيل التلقائي من نظام جهازك, يرجى تشغيل إعادة تحميل الصفحة أو التشغيل اليدوي للآيات.
      </div>
      
  
      <div v-if="isIOS && settings.autoPlayNext && !hadUserInteraction" class="ios-instructions">
        انقر على أي مكان في الصفحة لتفعيل التشغيل التلقائي للآيات
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/css/surahDetail.css';
</style>