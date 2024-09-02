import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    },
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://d2mpatx37cqexb.cloudfront.net https://platform.twitter.com https://connect.facebook.net https://cdn.syndication.twimg.com;
        style-src 'self' 'unsafe-inline' https://d2mpatx37cqexb.cloudfront.net https://platform.twitter.com;
        img-src 'self' data: https: http: https://pbs.twimg.com https://abs.twimg.com;
        connect-src 'self' https://api.footballeliminator.com https://d2mpatx37cqexb.cloudfront.net https: http: https://api.twitter.com;
        frame-src 'self' https://www.facebook.com https://platform.twitter.com https://syndication.twitter.com;
        frame-ancestors 'self' https://footballeliminator.com https://www.footballeliminator.com;
      `.replace(/\s{2,}/g, ' ').trim(),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: '',
  }
})