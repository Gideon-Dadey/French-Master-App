import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { usersAPI } from '../services/api';

const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    xp: 0,
    level: 1,
    streak: 0,
    points: 0,
    achievements: [],
    recentAchievements: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadGamificationData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadGamificationData = async () => {
    try {

      const mockStats = {
        xp: 1250,
        level: 5,
        streak: 7,
        points: 3400,
        achievements: [
          { id: 1, name: 'First Lesson', icon: 'book', color: '#6366F1' },
          { id: 2, name: 'Week Warrior', icon: 'calendar', color: '#10B981' },
          { id: 3, name: 'Perfect Score', icon: 'star', color: '#F59E0B' },
        ],
        recentAchievements: [
          { id: 1, name: 'Perfect Score', icon: 'star', color: '#F59E0B' },
        ],
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const awardXP = async (amount, reason) => {
    try {
      const newXP = stats.xp + amount;
      const newLevel = calculateLevel(newXP);

      setStats((prev) => ({
        ...prev,
        xp: newXP,
        level: newLevel,
      }));

      if (newLevel > stats.level) {

        return { leveledUp: true, newLevel };
      }

      return { leveledUp: false };
    } catch (error) {
      console.error('Failed to award XP:', error);
    }
  };

  const updateStreak = async () => {
    try {

      setStats((prev) => ({
        ...prev,
        streak: prev.streak + 1,
      }));
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  };

  const unlockAchievement = async (achievement) => {
    try {
      setStats((prev) => ({
        ...prev,
        achievements: [...prev.achievements, achievement],
        recentAchievements: [achievement, ...prev.recentAchievements.slice(0, 2)],
      }));

      await awardXP(achievement.xpReward || 50, `Achievement: ${achievement.name}`);

      return achievement;
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
    }
  };

  const calculateLevel = (xp) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  const value = {
    stats,
    loading,
    awardXP,
    updateStreak,
    unlockAchievement,
    calculateLevel,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

