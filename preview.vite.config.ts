import { defineConfig } from 'vite';
export default defineConfig({root:'tests/fixture',server:{host:'127.0.0.1',port:5173,strictPort:true,fs:{allow:[decodeURIComponent(new URL('.',import.meta.url).pathname)]}},oxc:{jsx:{runtime:'automatic'}}});
