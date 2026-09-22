const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

module.exports = {
  expo: {
    name: IS_PREVIEW ? "Teleremo Test" : "Teleremo",
    slug: "teleremo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    ios: {
      supportsTablet: true
    },
    android: {
      package: IS_PREVIEW ? "com.jesuisapres.teleremo.test" : "com.jesuisapres.teleremo",
      adaptiveIcon: {
        backgroundColor: IS_PREVIEW ? "#4B5563" : "#000000", // Gerçek APK'da tam siyah
        foregroundImage: "./assets/adaptive-icon.png"
      },
      predictiveBackGestureEnabled: false
    },
    web: {
      favicon: "./assets/icon.png"
    },
    splash: {
      image: "./assets/icon.png",
      resizeMode: "contain",
      backgroundColor: IS_PREVIEW ? "#4B5563" : "#000000"
    },
    updates: {
      url: "https://u.expo.dev/ac7874c0-8b09-4fbf-a8bc-9b92e2783972"
    },
    extra: {
      eas: {
        projectId: "ac7874c0-8b09-4fbf-a8bc-9b92e2783972"
      }
    },
    plugins: [
      "expo-font",
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          }
        }
      ]
    ],
    runtimeVersion: "1.0.0"
  }
};
