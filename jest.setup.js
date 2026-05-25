// mock react-native-google-mobile-ads
jest.mock('react-native-google-mobile-ads', () => {
  const React = require('react');
  const { View } = require('react-native');
  const BannerAd = (props) => React.createElement(View, props);
  return {
    __esModule: true,
    default: () => ({
      initialize: jest.fn().mockResolvedValue({}),
    }),
    InterstitialAd: {
      createForAdRequest: jest.fn().mockReturnValue({
        load: jest.fn(),
        show: jest.fn(),
        addAdEventListener: jest.fn().mockReturnValue(jest.fn()),
      }),
    },
    RewardedAd: {
      createForAdRequest: jest.fn().mockReturnValue({
        load: jest.fn(),
        show: jest.fn(),
        addAdEventListener: jest.fn().mockReturnValue(jest.fn()),
      }),
    },
    AppOpenAd: {
      createForAdRequest: jest.fn().mockReturnValue({
        load: jest.fn(),
        show: jest.fn(),
        addAdEventListener: jest.fn().mockReturnValue(jest.fn()),
      }),
    },
    BannerAd,
    BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: 'BANNER' },
    TestIds: { BANNER: 'test', INTERSTITIAL: 'test', REWARDED: 'test', APP_OPEN: 'test' },
    AdEventType: { LOADED: 'loaded', ERROR: 'error', CLOSED: 'closed' },
    RewardedAdEventType: { EARNED_REWARD: 'earned_reward' },
  };
});

// mock react-native-firebase
jest.mock('@react-native-firebase/app', () => ({}));
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(),
}));
jest.mock('@react-native-firebase/crashlytics', () => () => ({
  recordError: jest.fn(),
  log: jest.fn(),
  setAttribute: jest.fn(),
  setUserId: jest.fn(),
}));
jest.mock('@react-native-firebase/remote-config', () => () => ({
  settings: {
    minimumFetchIntervalMillis: 0,
  },
  setDefaults: jest.fn(),
  fetchAndActivate: jest.fn(),
  getBoolean: jest.fn().mockReturnValue(true),
  getNumber: jest.fn().mockReturnValue(1),
  getString: jest.fn().mockReturnValue(''),
}));

// mock expo packages that use import statements
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
  isAvailableAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));
