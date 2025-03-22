<script setup>
import { watch, onMounted } from 'vue';
import { useSettings } from '../composables/useSettings';

 
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  settings: {
    type: Object,
    required: true
  }
});

 
const emit = defineEmits(['close', 'update:settings']);
 
const updateParentSettings = (newSettings) => {
  emit('update:settings', newSettings);
};

 
const {
  MIN_FONT_SIZE_LEVEL,
  MAX_FONT_SIZE_LEVEL,
  fontSizeLevel,
  repeatCount,
  repeatDelay,
  autoPlayNext,
  increaseFontSize,
  decreaseFontSize,
  loadSettings,
  updateFromExternalSettings
} = useSettings(props.settings, updateParentSettings);

 
const closeSettings = () => {
  emit('close');
};

 
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeSettings();
  }
};

 
watch(() => props.show, (isVisible) => {
  if (isVisible) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
});
 
watch(() => props.settings, (newSettings) => {
  updateFromExternalSettings(newSettings);
}, { deep: true });

onMounted(() => {
  loadSettings();
});
</script>

<template>
 
  <div v-if="show" class="settings-dialog-backdrop" @click.self="closeSettings">
    <div class="settings-dialog cairo-font">
      <div class="settings-dialog-header">
        <h3 class="settings-dialog-title">الإعدادات</h3>
        <button class="settings-dialog-close" @click="closeSettings">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="settings-dialog-body cairo-font">
      
        <div class="settings-item">
          <label>حجم الخط</label>
          <div class="setting-controls">
            <button 
              class="setting-btn" 
              @click="decreaseFontSize" 
              :disabled="fontSizeLevel <= MIN_FONT_SIZE_LEVEL"
            >
              <i class="fas fa-minus"></i>
            </button>
            <span class="setting-value">{{ fontSizeLevel }}</span>
            <button 
              class="setting-btn" 
              @click="increaseFontSize" 
              :disabled="fontSizeLevel >= MAX_FONT_SIZE_LEVEL"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        
        
        <div class="settings-item">
          <label>عدد التكرار</label>
          <div class="setting-controls">
            <button 
              class="setting-btn" 
              @click="repeatCount > 1 ? repeatCount-- : null"
              :disabled="repeatCount <= 1"
            >
              <i class="fas fa-minus"></i>
            </button>
            <span class="setting-value">{{ repeatCount }}</span>
            <button 
              class="setting-btn" 
              @click="repeatCount++"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        
      
        <div class="settings-item">
          <label>مدة الانتظار بين التكرار (ثواني)</label>
          <div class="setting-controls">
            <button 
              class="setting-btn" 
              @click="repeatDelay > 0.5 ? repeatDelay -= 0.5 : null"
              :disabled="repeatDelay <= 0.5"
            >
              <i class="fas fa-minus"></i>
            </button>
            <span class="setting-value">{{ repeatDelay }}</span>
            <button 
              class="setting-btn" 
              @click="repeatDelay += 0.5"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        
     
        <div class="settings-item checkbox-setting">
          <input 
            type="checkbox" 
            id="autoPlayNext" 
            v-model="autoPlayNext"
          >
          <label for="autoPlayNext">تشغيل الآية التالية تلقائياً</label>
        </div>
      </div>
      
      <div class="settings-dialog-footer">
        <button class="settings-btn settings-btn-primary" @click="closeSettings">
          إغلاق
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/css/settings.css';
</style>