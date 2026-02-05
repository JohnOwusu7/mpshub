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
      }
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