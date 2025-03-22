import { ref, computed } from 'vue';

export function useSearchHelper(items) {
  const searchQuery = ref('');

  const normalizeArabicText = (text) => {
    if (!text) return '';

    return text
      .replace(/[\u064B-\u065F\u0670]/g, '') // Remove fatha, kasra, damma, sukun, etc.
      .replace(/\u0623/g, '\u0627')          // Replace alef with hamza above with alef
      .replace(/\u0625/g, '\u0627')          // Replace alef with hamza below with alef
      .replace(/\u0622/g, '\u0627')          // Replace alef madda with alef
      .normalize('NFKD');                    // Normalize to canonical decomposition
  };

  const filteredSurahs = computed(() => {
    if (!searchQuery.value.trim()) return items;

    const query = searchQuery.value.toLowerCase().trim();
    const normalizedQuery = normalizeArabicText(query);

    return items.filter(surah => {

      if (surah.number?.toString() === query) {
        return true;
      }

      const normalizedName = normalizeArabicText(surah.name?.toLowerCase() || '');
      if (normalizedName.includes(normalizedQuery)) {
        return true;
      }

      return false;
    });
  });

  const clearSearch = () => {
    searchQuery.value = '';
  };

  return {
    searchQuery,
    filteredSurahs,
    clearSearch,
    normalizeArabicText
  };
}