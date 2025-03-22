<script setup>
import { ref, watch } from 'vue';

 
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
});

 
const emit = defineEmits(['close']);

 
const closeInfo = () => {
  emit('close');
};
 
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeInfo();
  }
};

 
watch(() => props.show, (isVisible) => {
  if (isVisible) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
});
</script>

<template>
  <div v-if="show" class="info-dialog-backdrop" @click.self="closeInfo">
    <div class="info-panel cairo-font">
      <div class="info-header">
        <h2 class="info-title">عن التطبيق</h2>
        <button class="close-info" @click="closeInfo" aria-label="إغلاق">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="info-content"> 
      
        <div class="logo-container">
          <img src="../assets/logo.png" alt="وقار" class="info-logo">
        </div>
        
         
        <div class="app-description">
          <p>تم تطوير تطبيق وقار بشكل مبسط و عدة مزايا لتسهيل حفظ القرآن الكريم من خلال الإستماع إلى النطق ومخارج الحروف الصحيحة بصوت الشيخ محمود خليل الحصري رحمه الله.</p>
 
        </div>
        
        <!-- Donation link  
        <div class="donation-section">
          <a href="https://yosf143.com/donate" class="donation-link" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-heart"></i> تبرع الآن
          </a>
        </div>-->
        
       
        <div class="developer-info">
          <p>تم التطوير بكل حب بواسطة <a href="https://yosf143.com" target="_blank" rel="noopener noreferrer">yosf143.com</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/css/info.css';
</style>