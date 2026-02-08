import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'lib/index.js',
      name: 'AgentAvatars',
      formats: ['es', 'iife'],
      fileName: (format) => format === 'es' ? 'agent-avatars.js' : 'agent-avatars.iife.js',
    },
    outDir: 'dist',
    minify: 'esbuild',
  },
});
