import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const CACHE_PREFIX = '@fm_cache_';
const DOWNLOAD_DIRECTORY = `${FileSystem.documentDirectory}downloads/`;

export const offlineService = {

  saveToCache: async (key, data) => {
    try {
      const cacheData = {
        timestamp: Date.now(),
        data: data,
      };
      await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  },

  getFromCache: async (key, maxAge = 24 * 60 * 60 * 1000) => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const { timestamp, data } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > maxAge) {
        return { data, expired: true };
      }

      return { data, expired: false };
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  },

  downloadAsset: async (url, fileName) => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(DOWNLOAD_DIRECTORY, { intermediates: true });
      }

      const fileUri = `${DOWNLOAD_DIRECTORY}${fileName}`;
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (downloadProgress) => {

        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      return uri;
    } catch (error) {
      console.error('Error downloading asset:', error);
      return null;
    }
  },

  getLocalUri: async (fileName) => {
    const fileUri = `${DOWNLOAD_DIRECTORY}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo.exists ? fileUri : null;
  },

  clearCache: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
};
