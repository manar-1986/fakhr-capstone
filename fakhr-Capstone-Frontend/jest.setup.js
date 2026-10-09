import '@testing-library/jest-native/extend-expect';

// Mock expo modules
jest.mock('expo-constants', () => ({
    default: {
        expoConfig: {},
    },
}));

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

jest.mock('expo-localization', () => ({
    getLocales: jest.fn(() => [{ languageCode: 'en', languageTag: 'en-US', regionCode: 'US', textDirection: 'ltr' }]),
    useLocales: jest.fn(() => [{ languageCode: 'en', languageTag: 'en-US', regionCode: 'US', textDirection: 'ltr' }]),
}));

jest.mock('i18next', () => ({
    __esModule: true,
    default: {
        use: jest.fn().mockReturnThis(),
        init: jest.fn(),
        t: (key: string) => key,
        changeLanguage: jest.fn(),
        language: 'en',
    },
}));

jest.mock('react-i18next', () => ({
    initReactI18next: { type: '3rdParty', init: jest.fn() },
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en', changeLanguage: jest.fn() },
    }),
}));

jest.mock('expo-updates', () => ({
    reloadAsync: jest.fn(),
}));

// Silence console warnings in tests
global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
};
