const API_BASE_URL = 'https://api.alquran.cloud/v1';

export const quranAPI = {
  async getAllSurahs() {
    try {
      const response = await fetch(`${API_BASE_URL}/surah`);
      const data = await response.json();
      
      if (data.code === 200 && data.status === 'OK') {
        return { success: true, data: data.data };
      } else {
        throw new Error('Failed to fetch Surahs');
      }
    } catch (error) {
      console.error('Error fetching surahs:', error);
      return { 
        success: false, 
        error: 'فشل في تحميل السور. يرجى المحاولة مرة أخرى.' 
      };
    }
  },
  
  async getSurahById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/surah/${id}`);
      const data = await response.json();
      
      if (data.code === 200 && data.status === 'OK') {
        return { success: true, data: data.data };
      } else {
        throw new Error(`Failed to fetch Surah ${id}`);
      }
    } catch (error) {
      console.error(`Error fetching surah ${id}:`, error);
      return { 
        success: false, 
        error: 'فشل في تحميل السورة. يرجى المحاولة مرة أخرى.' 
      };
    }
  }
};