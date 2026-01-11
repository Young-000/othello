import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'classic-games',
  brand: {
    displayName: '클래식 게임',
    primaryColor: '#3182F6',
    icon: 'https://static.toss.im/icons/game-icon.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --port 5173',
      build: 'vite build',
    },
  },
  webViewProps: {
    type: 'game',
    bounces: false,
    pullToRefreshEnabled: false,
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
  permissions: [],
  outdir: 'dist',
});
