import { ref, computed } from 'vue';

export function useVerseNavigation(verses) {
  const versesPerPage = ref(10); 
  const currentPageIndex = ref(0); 

  const pages = computed(() => {
    if (!verses.value || !verses.value.length) return [];

    const result = [];
    for (let i = 0; i < verses.value.length; i += versesPerPage.value) {
      result.push(verses.value.slice(i, i + versesPerPage.value));
    }
    return result;
  });

  const currentPage = computed(() => {
    if (pages.value.length === 0) return [];
    return pages.value[currentPageIndex.value];
  });

  const totalPages = computed(() => {
    return pages.value.length;
  });

  const hasPreviousPage = computed(() => {
    return currentPageIndex.value > 0;
  });

  const hasNextPage = computed(() => {
    return currentPageIndex.value < pages.value.length - 1;
  });

  const previousPage = () => {
    if (hasPreviousPage.value) {
      currentPageIndex.value--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextPage = () => {
    if (hasNextPage.value) {
      currentPageIndex.value++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToVerse = (verseNum) => {
    if (!verseNum || isNaN(verseNum) || verseNum <= 0 || !verses.value || !verses.value.length) {
      console.error('Invalid verse number for scrolling:', verseNum);
      return;
    }

    const pageIndex = Math.floor((verseNum - 1) / versesPerPage.value);

    currentPageIndex.value = pageIndex;

    setTimeout(() => {
      const verseElement = document.querySelector(`[data-verse="${verseNum}"]`);
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        verseElement.classList.add('highlight-verse');
        setTimeout(() => {
          verseElement.classList.remove('highlight-verse');
        }, 2000);
      } else {
        console.error('Could not find verse element:', verseNum);
      }
    }, 300);
  };

  return {
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
  };
}