import { createAudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

let currentPlayer = null;

const getTTSUrl = (text, language = 'fr') => {

  const encodedText = encodeURIComponent(text);
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodedText}`;
};

export const speakText = async (text, language = 'fr-FR') => {
  try {

    await stopSpeech();

    if (Platform.OS !== 'web') {
      try {
        const ttsUrl = getTTSUrl(text, language === 'fr-FR' ? 'fr' : 'en');
        const player = createAudioPlayer(ttsUrl);
        currentPlayer = player;

        let playbackResolve = null;
        const onPlaybackStatusUpdate = (status) => {
          if (status?.isLoaded && status?.didJustFinish) {

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

        return new Promise((resolve) => {
          playbackResolve = resolve;

          const waitForLoad = setInterval(() => {
            if (player.isLoaded) {
              clearInterval(waitForLoad);
              player.play();

              const checkStatus = setInterval(() => {
                try {

                  if (player.isLoaded && !player.playing && player.currentTime > 0) {

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

                }
              }, 200);

              const estimatedDuration = Math.max(text.length * 100, 5000);
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

          setTimeout(() => {
            clearInterval(waitForLoad);
            if (!player.isLoaded) {

              player.play();
            }
          }, 3000);
        });
      } catch (error) {
        console.warn('TTS API error, using fallback:', error);
        currentPlayer = null;

        return new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } else {

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

    return new Promise((resolve) => setTimeout(resolve, 2000));
  }
};

export const stopSpeech = async () => {
  if (Platform.OS === 'web' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  } else if (currentPlayer) {
    try {
      await currentPlayer.pause();
      currentPlayer.remove();
    } catch (error) {

    }
    currentPlayer = null;
  }
};

