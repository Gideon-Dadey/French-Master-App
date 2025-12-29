import React from 'react';
import { render } from '@testing-library/react-native';
import CustomTabBar from '../CustomTabBar';

// Mock dependencies
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 20, left: 0, right: 0 }),
}));

jest.mock('../../context/ThemeContext', () => ({
    useTheme: () => ({
        isDarkMode: false,
        theme: {
            surface: '#FFFFFF',
            textMuted: '#8A94A6',
            border: '#E5E1DB',
        },
    }),
}));

jest.mock('../../utils/organicTheme', () => ({
    getThemeColors: () => ({
        surface: '#FFFFFF',
        textMuted: '#8A94A6',
        border: '#E5E1DB',
    }),
}));

describe('CustomTabBar', () => {
    const mockState = {
        index: 0,
        routes: [
            { key: 'home-1', name: 'Home' },
            { key: 'Learn', name: 'Learn' },
            { key: 'Practice', name: 'Practice' },
            { key: 'Community', name: 'Community' },
            { key: 'Profile', name: 'Profile' },
        ],
    };

    const mockDescriptors = {};
    const mockNavigation = {
        emit: jest.fn(),
        navigate: jest.fn(),
    };

    it('renders correctly with default labels', () => {
        const { getByText } = render(
            <CustomTabBar
                state={mockState}
                descriptors={mockDescriptors}
                navigation={mockNavigation}
            />
        );

        expect(getByText('Home')).toBeTruthy();
        expect(getByText('Learn')).toBeTruthy();
        expect(getByText('Practice')).toBeTruthy();
        expect(getByText('Chats')).toBeTruthy(); // CustomTabBar maps 'Community' route to 'Chats' label
        expect(getByText('Profile')).toBeTruthy();
    });
});
