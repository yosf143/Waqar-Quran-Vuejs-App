import { ref } from 'vue';

export function useBookmarks() {
  const bookmarks = ref([]);

  const loadBookmarks = () => {
    const storedBookmarks = localStorage.getItem('quran-bookmarks');
    if (storedBookmarks) {
      try {
        bookmarks.value = JSON.parse(storedBookmarks);
      } catch (e) {
        console.error('Error loading bookmarks', e);
        bookmarks.value = [];
      }
    }
  };

  const saveBookmarks = () => {
    localStorage.setItem('quran-bookmarks', JSON.stringify(bookmarks.value));
  };

  const addBookmark = (surahNumber, surahName, verseNumber, verseText) => {
    const newBookmark = {
      id: Date.now(),
      surahNumber,
      surahName,
      verseNumber,
      verseText: verseText.substring(0, 50) + (verseText.length > 50 ? '...' : '')
    };

    bookmarks.value.push(newBookmark);
    saveBookmarks();
    return newBookmark;
  };

  const removeBookmark = (bookmarkId, event) => {
    if (event) {
      event.stopPropagation(); 
    }

    const index = bookmarks.value.findIndex(b => b.id === bookmarkId);
    if (index !== -1) {
      bookmarks.value.splice(index, 1);
      saveBookmarks();
      return true;
    }
    return false;
  };

  const isBookmarked = (surahNumber, verseNumber) => {
    return bookmarks.value.some(bookmark => 
      bookmark.surahNumber === surahNumber && 
      bookmark.verseNumber === verseNumber
    );
  };

  const toggleBookmark = (surahNumber, surahName, verseNumber, verseText) => {
    const existingBookmark = bookmarks.value.find(bookmark => 
      bookmark.surahNumber === surahNumber && 
      bookmark.verseNumber === verseNumber
    );

    if (existingBookmark) {
      removeBookmark(existingBookmark.id);
      return false; 
    } else {
      addBookmark(surahNumber, surahName, verseNumber, verseText);
      return true; 
    }
  };

  return {
    bookmarks,
    loadBookmarks,
    saveBookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark
  };
}