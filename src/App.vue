<script setup>
import { ref, onMounted } from 'vue';
import SurahList from './components/SurahList.vue';
import SurahDetail from './components/SurahDetail.vue';
import { quranAPI } from './services/quranAPI';
import { scrollToTop } from './utils/scrollHelper';

const surahs = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedSurah = ref(null);

const fetchSurahs = async () => {
  loading.value = true;
  const result = await quranAPI.getAllSurahs();
  
  if (result.success) {
    surahs.value = result.data;
    error.value = null;
  } else {
    error.value = result.error;
  }
  
  loading.value = false;
};

 
const handleSurahSelect = (surah) => {
  selectedSurah.value = surah;
  scrollToTop();
};
 
const goBack = () => {
  selectedSurah.value = null;
  scrollToTop();
};

onMounted(() => {
  fetchSurahs();
});
</script>

<template>
  <div class="container arabic-container">
    <div v-if="loading" class="loading-container">
      <div class="spinner-border loading-spinner" role="status">
        <span class="visually-hidden"></span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger arabic-text text-center" role="alert">
      {{ error }}
    </div>

    <template v-else>
 
      <SurahList 
        v-if="!selectedSurah" 
        :surahs="surahs" 
        @select-surah="handleSurahSelect" 
      />
      
      <SurahDetail 
        v-else 
        :surah="selectedSurah" 
        @go-back="goBack" 
      />
    </template>

    <footer class="mt-5 pt-4 text-center text-muted">
      <small class="arabic-text">إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ</small>
    </footer>
  </div>
</template>

<style scoped>
@import './assets/css/surahList.css';
</style>