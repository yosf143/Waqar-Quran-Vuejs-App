export const quranAudioService = {
  audioPlayer: null,
  
  getAudioUrl(verseNumber, reciter = 'ar.husary', quality = 128) {
    return `https://cdn.islamic.network/quran/audio/${quality}/${reciter}/${verseNumber}.mp3`;
  },
  
  getAudioPlayer() {
    if (!this.audioPlayer) {
      this.audioPlayer = new Audio();
    }
    return this.audioPlayer;
  },
  
  loadAudio(verseNumber) {
    const player = this.getAudioPlayer();
    player.src = this.getAudioUrl(verseNumber);
    player.load();
    return player;
  },
  
  playAudio(verseNumber, onSuccess, onError) {
    const player = this.getAudioPlayer();
    player.src = this.getAudioUrl(verseNumber);
    
    const playPromise = player.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (typeof onSuccess === 'function') {
            onSuccess();
          }
        })
        .catch((error) => {
          console.warn('Audio playback prevented:', error);
          if (typeof onError === 'function') {
            onError(error);
          }
        });
    }
    
    return playPromise;
  },
  
  stopAudio() {
    const player = this.getAudioPlayer();
    if (player) {
      player.pause();
      player.currentTime = 0;
    }
  },
  
  setupEventListeners(events = {}) {
    const player = this.getAudioPlayer();
    
    player.onended = null;
    player.onerror = null;
    player.ontimeupdate = null;
    player.onplay = null;
    player.onpause = null;
    
    if (events.onEnded) player.onended = events.onEnded;
    if (events.onError) player.onerror = events.onError;
    if (events.onTimeUpdate) player.ontimeupdate = events.onTimeUpdate;
    if (events.onPlay) player.onplay = events.onPlay;
    if (events.onPause) player.onpause = events.onPause;
  },
  
  resumePlayback(onSuccess, onError) {
    const player = this.getAudioPlayer();
    const playPromise = player.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (typeof onSuccess === 'function') {
            onSuccess();
          }
        })
        .catch((error) => {
          console.warn('Audio resumption prevented:', error);
          if (typeof onError === 'function') {
            onError(error);
          }
        });
    }
  }
};