// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     VitePWA({
//       registerType: 'autoUpdate',
//       // This will generate the manifest.json file for you
//       manifest: {
//         name: 'BiteCount',
//         short_name: 'BiteCount',
//         description: 'A simple app to track calorie intake and weight.',
//         theme_color: '#007bff',
//         background_color: '#f4f7f9',
//         display: 'standalone',
//         scope: '/',
//         start_url: '/',
//         icons: [
//           {
//             src: 'logo192.png',
//             sizes: '192x192',
//             type: 'image/png',
//           },
//           {
//             src: 'logo512.png',
//             sizes: '512x512',
//             type: 'image/png',
//           },
//         ],
//       },
//     }),
//   ],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        // The name of your app, as it will appear in the app store or app list.
        name: 'BiteCount: Calorie & Weight Tracker',
        // A shorter name for the home screen icon label.
        short_name: 'BiteCount', 
        // A more engaging description.
        description: 'Your friendly companion for tracking calories, meals, and weight. Take a bite out of your health goals!',
        
        // --- THEME & COLOR UPDATES BASED ON THE ICON ---

        // This is the most important color. It tints the UI of the browser and OS (e.g., address bar, task switcher).
        // We're using the deep indigo from the icon's outline for a modern, high-contrast look.
        theme_color: '#4A3F6B', 
        
        // This is the background color of the splash screen shown when the app launches.
        // We're using a warm, off-white color that complements the cookie theme.
        background_color: '#FAF8F5',

        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'cookie_x48.png', // Renamed for clarity
            sizes: '48x48',
            type: 'image/png',
          },
          {
            src: 'cookie_x72.png', // Renamed for clarity
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: 'cookie_x96.png', // Renamed for clarity
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: 'cookie_x128.png', // Renamed for clarity
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'cookie_x192.png', // Renamed for clarity
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'cookie_x384.png', // Renamed for clarity
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'cookie_x512.png', // Renamed for clarity
            sizes: '512x512',
            type: 'image/png',
          },
          // --- IMPORTANT: ADD A MASKABLE ICON ---
          // This ensures your icon looks great on all Android devices by filling the entire shape
          // (circle, squircle, etc.) without being shrunk inside a white box.
          {
            src: 'cookie_x512.png',
            sizes: '512x512',
            type: 'image/png',
            // purpose: 'maskable', // Uncomment if you create a maskable version of your icon
          },
        ],
      },
    }),
  ],
})