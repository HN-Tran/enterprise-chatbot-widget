import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    // Bake API URL into bundle at build time
    // Set via: VITE_API_URL=https://your-api.com npm run build
    '__API_URL__': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8080'),
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'EnterpriseChat',
      fileName: () => 'chatbot-widget.js',
      formats: ['iife'],
    },
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
