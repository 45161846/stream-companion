import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Stream Companion',
    description: 'Рекап, моменты и контекст рядом с Twitch. Локальный прототип на записи Recrent.',
    version: '0.1.0',
    permissions: [],
    icons: {16:'icons/16.png',32:'icons/32.png',48:'icons/48.png',128:'icons/128.png'},
  },
});
