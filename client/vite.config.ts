import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    },
    proxy: {
      '/proxy-image': {
        // The external server origin
        target: 'https://img.freepik.com',
        changeOrigin: true,
        // Rewrite the path to match the image path on the target
        rewrite: (path) =>
          path.replace(
            /^\/proxy-image/,
            '/free-vector/businessman-character-avatar-isolated_24877-60111.jpg'
          ),
        configure: (proxy) => {
          // Add header to the proxied response
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['Cross-Origin-Resource-Policy'] = 'cross-origin';
          });
        }
      }
    }
  }
});
