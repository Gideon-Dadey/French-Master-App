import { createAudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

// Track current audio player instance for stopping
let currentPlayer = null;

// Text-to-Speech using Google Translate TTS API (free)
const getTTSUrl = (text, language = 'fr') => {
  // Google Translate TTS API (free, no API key needed for basic use)
  const encodedText = encodeURIComponent(text);
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodedText}`;
};

// Alternative: Use Web Speech API via injected JavaScript
export const speakText = async (text, language = 'fr-FR') => {
  try {
    // Stop any existing audio first
    await stopSpeech();
    
    // For iOS/Android, use expo-audio with TTS URL
    if (Platform.OS !== 'web') {
      try {
        const ttsUrl = getTTSUrl(text, language === 'fr-FR' ? 'fr' : 'en');
        const player = createAudioPlayer(ttsUrl);
        currentPlayer = player;
        
        // Set up event listener for playback completion
        let playbackResolve = null;
        const onPlaybackStatusUpdate = (status) => {
          if (status?.isLoaded && status?.didJustFinish) {
            // Playback finished
            player.removeListener('playbackStatusUpdate', onPlaybackStatusUpdate);
            if (currentPlayer === player) {
              currentPlayer = null;
            }
            if (playbackResolve) {
              playbackResolve();
              playbackResolve = null;
            }
          }
        };
        
        player.addListener('playbackStatusUpdate', onPlaybackStatusUpdate);
        
        // Wait for player to load, then play
        return new Promise((resolve) => {
          playbackResolve = resolve;
          
          // Wait for player to be loaded
          const waitForLoad = setInterval(() => {
            if (player.isLoaded) {
              clearInterval(waitForLoad);
              player.play();
              
              // Check status periodically for completion
              const checkStatus = setInterval(() => {
                try {
                  // Check if player finished playing
                  if (player.isLoaded && !player.playing && player.currentTime > 0) {
                    // Check if we're at or near the end
                    if (player.duration > 0 && player.currentTime >= player.duration - 0.2) {
                      clearInterval(checkStatus);
                      player.removeListener('playbackStatusUpdate', onPlaybackStatusUpdate);
                      if (currentPlayer === player) {
                        currentPlayer = null;
                      }
                      if (playbackResolve) {
                        playbackResolve();
                        playbackResolve = null;
                      }
                    }
                  }
                } catch (error) {
                  // Ignore errors
                }
              }, 200);
              
              // Fallback timeout (estimate based on text length or use default)
              const estimatedDuration = Math.max(text.length * 100, 5000); // Rough estimate
              setTimeout(() => {
                clearInterval(checkStatus);
                player.removeListener('playbackStatusUpdate', onPlaybackStatusUpdate);
                if (currentPlayer === player) {
                  currentPlayer = null;
                }
                if (playbackResolve) {
                  playbackResolve();
                  playbackResolve = null;
                }
              }, estimatedDuration);
            }
          }, 100);
          
          // Timeout if loading takes too long
          setTimeout(() => {
            clearInterval(waitForLoad);
            if (!player.isLoaded) {
              // Try playing anyway
              player.play();
            }
          }, 3000);
        });
      } catch (error) {
        console.warn('TTS API error, using fallback:', error);
        currentPlayer = null;
        // Fallback: just resolve after a delay
        return new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } else {
      // For web, use Web Speech API
      if ('speechSynthesis' in window) {
        return new Promise((resolve) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = language;
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          window.speechSynthesis.speak(utterance);
        });
      }
    }
  } catch (error) {
    console.error('Text-to-speech error:', error);
    currentPlayer = null;
    // Fallback: return a promise that resolves after delay
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }
};

// Stop any ongoing speech
export const stopSpeech = async () => {
  if (Platform.OS === 'web' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  } else if (currentPlayer) {
    try {
      await currentPlayer.pause();
      currentPlayer.remove();
    } catch (error) {
      // Ignore errors when stopping
    }
    currentPlayer = null;
  }
};

