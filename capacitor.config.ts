import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mentora.app',
  appName: 'Mentora IAS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Students land on "My Courses"; it shows a login prompt when signed out.
    appStartPath: '/videos.html',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
  },
};

export default config;
