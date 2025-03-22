<script setup>
import { ref, computed, onMounted } from 'vue';
import InfoPanel from './InfoPanel.vue';
import { useBookmarks } from '../composables/useBookmarks';
import { useSearchHelper } from '../composables/useSearchHelper';
import { useFormatter } from '../composables/useFormatter';

 
const props = defineProps({
  surahs: {
    type: Array,
    required: true
  }
});

 
const emit = defineEmits(['selectSurah']);

 
const showSearchDialog = ref(false);
const showInfo = ref(false);
const showBookmarks = ref(false);
 
const { bookmarks, loadBookmarks, removeBookmark } = useBookmarks();
const { searchQuery, filteredSurahs, clearSearch, normalizeArabicText } = useSearchHelper(props.surahs);
const { toArabicNumeral } = useFormatter();

 
const displayItems = computed(() => {
  if (showBookmarks.value) {
    return bookmarks.value;
  }
  
  if (searchQuery.value.trim()) {
    return filteredSurahs.value;
  }
  
  return props.surahs;
});
 
const selectSurah = (surah) => {
  emit('selectSurah', surah);
};

 
const selectBookmark = (bookmark) => {
 
  const surah = props.surahs.find(s => s.number === bookmark.surahNumber);
  
  if (surah) {
    emit('selectSurah', surah);
    
 
    localStorage.setItem('jump-to-verse', bookmark.verseNumber.toString());
  }
};

 
const toggleSearchDialog = () => {
  showSearchDialog.value = !showSearchDialog.value;
  if (showSearchDialog.value) {
  
    searchQuery.value = '';
   
    setTimeout(() => {
      document.getElementById('searchInput')?.focus();
    }, 100);
  }
};

 
const toggleInfo = () => {
  showInfo.value = !showInfo.value;
};

 
const toggleBookmarks = () => {
  showBookmarks.value = !showBookmarks.value;
  if (showBookmarks.value) {
    searchQuery.value = ''; 
  }
};

 
const onSearchKeydown = (event) => {
 
  if (event.key === 'Escape') {
    showSearchDialog.value = false;
  }
};
 
onMounted(() => {
  loadBookmarks();
});
</script>

<template>
  <div class="surah-list-wrapper">
    
    <div class="control-bar">
    
      <button 
        class="control-button search-button" 
        @click="toggleSearchDialog" 
        aria-label="البحث عن سورة">
        <i class="fas fa-search"></i>
      </button>
      
   
      <button 
        class="control-button bookmark-button" 
        @click="toggleBookmarks" 
        :class="{ 'active': showBookmarks }"
        aria-label="الإشارات المرجعية">
        <i class="fas fa-bookmark"></i>
      </button>
      
      
      <button 
        class="control-button info-button" 
        @click="toggleInfo" 
        aria-label="عن التطبيق">
        <i class="fas fa-info-circle"></i>
      </button>
    </div>
    
 
    <div v-if="showSearchDialog" class="dialog-backdrop" @click.self="showSearchDialog = false">
      <div class="search-dialog">
        <div class="dialog-header">
          <h3 class="dialog-title">البحث عن سورة</h3>
          <button class="dialog-close" @click="showSearchDialog = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="dialog-body">
          <div class="search-input-group">
            <input
              id="searchInput"
              type="text"
              class="search-input cairo-font"
              v-model="searchQuery"
              @keydown="onSearchKeydown"
              placeholder="أدخل اسم أو رقم السورة"
              aria-label="البحث عن سورة"
            />
            <button 
              v-if="searchQuery" 
              class="clear-button" 
              type="button"
              @click="clearSearch"
              aria-label="مسح البحث">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div v-if="searchQuery && filteredSurahs.length > 0" class="search-results">
            <div class="results-count cairo-font">{{ filteredSurahs.length }} نتائج البحث</div>
            <div class="results-list">
              <div 
                v-for="surah in filteredSurahs" 
                :key="surah.number"
                class="search-result-item"
                @click="selectSurah(surah); showSearchDialog = false;"
              >
                <span class="result-number">{{ toArabicNumeral(surah.number) }}</span>
                <span class="result-name">{{ surah.name }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="searchQuery && filteredSurahs.length === 0" class="no-search-results">
            <i class="fas fa-search-minus"></i>
            <p>لا توجد نتائج للبحث</p>
          </div>
        </div>
      </div>
    </div>
    
 
    <InfoPanel 
      :show="showInfo" 
      @close="toggleInfo" 
    />

  
    <div class="mushaf-container">
   
      <div class="surah-frame">
        <div class="page-header">
          <div class="ornament-left"></div>
          <div v-if="showBookmarks" class="list-title cairo-font">الإشارات المرجعية</div>
          <div v-else class="list-title cairo-font">فهرس السور</div>
          <div class="ornament-right"></div>
        </div>
      </div>
      
  
      <div v-if="showBookmarks" class="bookmarks-grid">
        <div 
          v-for="bookmark in bookmarks" 
          :key="bookmark.id"
          class="bookmark-card"
          @click="selectBookmark(bookmark)"
          tabindex="0"
          @keydown.enter="selectBookmark(bookmark)"
          role="button"
          :aria-label="`سورة ${bookmark.surahName}, الآية ${bookmark.verseNumber}`"
        >
          <div class="bookmark-header">
            <h3 class="bookmark-surah-name">{{ bookmark.surahName }}</h3>
            <button 
              class="bookmark-remove-btn" 
              @click="removeBookmark(bookmark.id, $event)"
              aria-label="حذف الإشارة المرجعية"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="bookmark-info cairo-font">
            <div class="verse-number">
              <span class="verse-label">الآية:</span>
              <span class="verse-value">{{ toArabicNumeral(bookmark.verseNumber) }}</span>
            </div>
          </div>
          <div class="bookmark-excerpt">
            {{ bookmark.verseText }}
          </div>
        </div>
        
    
        <div v-if="bookmarks.length === 0" class="no-results cairo-font">
          <i class="fas fa-bookmark no-results-icon"></i>
          <p>لا توجد إشارات مرجعية محفوظة</p>
          <button class="back-to-surahs-btn" @click="showBookmarks = false">العودة إلى فهرس السور</button>
        </div>
      </div>
      
    
      <div v-else class="surahs-grid">
        <div 
          v-for="surah in displayItems" 
          :key="surah.number"
          class="surah-card"
          @click="selectSurah(surah)"
          tabindex="0"
          @keydown.enter="selectSurah(surah)"
          role="button"
          :aria-label="`سورة ${surah.name}, ${surah.numberOfAyahs} آيات, ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`"
        >
          <div class="surah-number">{{ toArabicNumeral(surah.number) }}</div>
          <div class="surah-content">
            <h3 class="surah-name">{{ surah.name }}</h3>
            <div class="surah-info cairo-font">
              <div class="ayah-count">
                <span class="count-label">عدد الآيات:</span>
                <span class="count-number">{{ toArabicNumeral(surah.numberOfAyahs) }}</span>
              </div>
              <div class="revelation-type" :class="surah.revelationType === 'Meccan' ? 'meccan' : 'medinan'">
                {{ surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية' }}
              </div>
            </div>
          </div>
        </div>
      </div>
 
      <div v-if="!showBookmarks && filteredSurahs.length === 0 && searchQuery" class="no-results cairo-font">
        <i class="fas fa-search-minus no-results-icon"></i>
        <p>لا توجد نتائج للبحث</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/css/surahList.css';
</style>