import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    optimizeDeps: {
        exclude: [
          'nanoid'
        ]
    },
    build: {
        // Raise limit so large vendor chunks (e.g. react-apexcharts) don't warn; no change to output
        chunkSizeWarningLimit: 600,
    },
});


// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// // https://vitejs.dev/config/
// export default defineConfig({
//     plugins: [
//         react(),
//     ],
//     resolve: {
//         alias: {
//             '@': path.resolve(__dirname, './src'),
//         },
//     },
//     optimizeDeps: {
//         exclude: [
//           'nanoid'
//         ]
//     },
//     define: {
//         'process.env': process.env // Pass environment variables to the frontend
//     }
// });