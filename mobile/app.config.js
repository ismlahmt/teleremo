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
        backgroundColor: IS_PREVIEW ? "#4B5563" : "#0F172A", // Test uygulamasının arka planı gri olsun karışmasın
        foregroundImage: "./assets/adaptive-icon.png"
      },
      predictiveBackGestureEnabled: false
    },
    web: {
      favicon: "./assets/icon.png"
    },
    runtimeVersion: "1.0.0"
  }
};
