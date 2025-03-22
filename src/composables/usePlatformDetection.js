import { ref, computed } from 'vue';

export function usePlatformDetection() {

  const hadUserInteraction = ref(false);

  const isIOS = computed(() => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  });

  const markUserInteraction = () => {
    hadUserInteraction.value = true;
  };

  return {
    isIOS,
    hadUserInteraction,
    markUserInteraction
  };
}