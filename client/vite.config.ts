import { nodePolyfills } from 'vite-plugin-node-polyfills'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'node:path'
import wyw from '@wyw-in-js/vite'
import svgr from 'vite-plugin-svgr'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      include: ['fs', 'path', 'crypto', 'stream', 'util', 'http', 'https'],
    }),
    react(),
    tailwindcss(),
    vanillaExtractPlugin(),
    viteTsconfigPaths({
      //
      root: resolve(__dirname),
    }),
    svgr(),
    wyw({
      include: ['**/*.{ts,tsx}'],
      babelOptions: {
        presets: ['@babel/preset-typescript', '@babel/preset-react'],
      },
    }),
  ],
})
