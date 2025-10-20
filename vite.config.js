import { defineConfig, loadEnv } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ command, mode }) => {
  return {
    build: {
      lib: {
        entry: 'src/planner.js',
        name: 'Planner',
        fileName: 'planner.js',
      },
      rollupOptions: {
        input: 'src/planner.js',
        output: [
          {
            dir: 'build/',
            entryFileNames: `planner.js`,
            format: 'es',
            name: 'Planner',
            sourcemap: false,
            inlineDynamicImports: true
          }
        ],
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        // для импорта glsl файлов как строк
        loader: {
          '.glsl': 'text',
        },
      },
    },
    server: {
      host: true, // expose to local network
      // port: 8080,
      https: true,
    },
    plugins: [
      basicSsl({
        name: 'planner',
        /** custom trust domains */
        domains: ['localhost'],
        /** custom certification directory */
        certDir: './certs/',
      })
    ]
  };
});
