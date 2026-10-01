// Behaviour that only applies inside the Android app (Capacitor shell).
// Imported by every page entry; does nothing in a normal browser.
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add('is-native-app');

  // Hardware back: step back through pages and in-page (#hash) views, exit at the start.
  void App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      void App.exitApp();
    }
  });
}
