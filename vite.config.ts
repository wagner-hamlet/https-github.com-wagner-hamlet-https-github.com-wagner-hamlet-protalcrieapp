import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          strategies: 'generateSW', // Mudamos aqui para o Vite criar o SW sozinho
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}'] // Arquivos para cache
          },
          manifest: {
            name: 'Portal Crie App',
            short_name: 'CrieApp',
            description: 'Meu app gerado pelo AI Studio',
            theme_color: '#0F0F0F',
            background_color: '#0F0F0F',
            display: 'standalone',
            icons: [
              {
                src: 'icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
