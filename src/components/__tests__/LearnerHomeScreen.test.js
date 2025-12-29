import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import LearnerHomeScreen from '../../../screens/LearnerHomeScreen';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthProvider } from '../../context/AuthContext';
import { GamificationProvider } from '../../context/GamificationContext';

// Mock dependencies
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 20, left: 0, right: 0 }),
}));

jest.mock('../../services/api', () => ({
    coursesAPI: {
        getFeatured: jest.fn().mockResolvedValue({ data: { data: [] } }),
        getAll: jest.fn().mockResolvedValue({ data: { data: [], total: 0 } }),
    },
    blogAPI: {
        getAll: jest.fn().mockResolvedValue({ data: { data: [] } }),
    },
}));

jest.mock('../../services/gamificationService', () => ({
    gamificationService: {
        checkAndUpdateStreak: jest.fn().mockResolvedValue(true),
    },
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

jest.mock('react-native-svg', () => ({
    Svg: 'Svg',
    Path: 'Path',
    Defs: 'Defs',
    RadialGradient: 'RadialGradient',
    Stop: 'Stop',
}));

// Mock secure store
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn().mockResolvedValue(null),
    setItemAsync: jest.fn().mockResolvedValue(null),
}));

describe('LearnerHomeScreen', () => {
    const mockNavigation = {
        setOptions: jest.fn(),
        navigate: jest.fn(),
    };

    it('renders greeting and hero sections', async () => {
        const { getByText, getAllByText } = render(
            <AuthProvider>
                <ThemeProvider>
                    <GamificationProvider>
                        <LearnerHomeScreen navigation={mockNavigation} />
                    </GamificationProvider>
                </ThemeProvider>
            </AuthProvider>
        );

        await waitFor(() => {
            // Check for app name
            const appNameElements = getAllByText("L'Alliance");
            expect(appNameElements.length).toBeGreaterThan(0);

            // Check for a greeting (default 'Learner')
            expect(getByText(/Learner/i)).toBeTruthy();
        });
    });
});
