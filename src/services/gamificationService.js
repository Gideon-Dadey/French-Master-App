import { usersAPI } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = '@fm_streak_info';

export const gamificationService = {

  checkAndUpdateStreak: async (user) => {
    if (!user) return null;

    try {
      const today = new Date().toDateString();
      const lastActiveDate = user.streak?.lastActiveDate
        ? new Date(user.streak.lastActiveDate).toDateString()
        : null;

      if (lastActiveDate === today) {
        return user.streak;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      let newStreak = 1;
      if (lastActiveDate === yesterdayStr) {
        newStreak = (user.streak?.current || 0) + 1;
      }

      const response = await usersAPI.updateProfile({
        streak: {
          current: newStreak,
          longest: Math.max(newStreak, user.streak?.longest || 0),
          lastActiveDate: new Date()
        }
      });

      return response.data.data.streak;
    } catch (error) {
      console.error('Error updating streak:', error);
      return user.streak;
    }
  },

  getXPForNextLevel: (level) => {
    return Math.floor(level * 100 * 1.5);
  },

  addXP: async (user, amount) => {
    if (!user) return;

    try {
      let newXP = (user.xp || 0) + amount;
      let newLevel = user.level || 1;
      let xpNeeded = gamificationService.getXPForNextLevel(newLevel);

      while (newXP >= xpNeeded) {
        newXP -= xpNeeded;
        newLevel += 1;
        xpNeeded = gamificationService.getXPForNextLevel(newLevel);

      }

      await usersAPI.updateProfile({
        xp: newXP,
        level: newLevel
      });

      return { xp: newXP, level: newLevel };
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  },

  checkBadges: async (user) => {

  }
};

