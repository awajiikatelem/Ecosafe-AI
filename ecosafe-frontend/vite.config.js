import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
     tailwindcss(),
  ],
  extend: {
  animation: {
    "spin-slow": "spin 15s linear infinite",
    "float": "float 3s ease-in-out infinite",
    "pulseSlow": "pulse 2.5s ease-in-out infinite",
  },
  keyframes: {
    float: {
      "0%, 100%": { transform: "translateY(0px)" },
      "50%": { transform: "translateY(-6px)" },
    },
  },
}
//   theme: {
//   extend: {
//     keyframes: {
//       fadeIn: {
//         "0%": { opacity: 0, transform: "scale(1.1)" },
//         "100%": { opacity: 1, transform: "scale(1)" },
//       },
//     },
//     animation: {
//       fadeIn: "fadeIn 0.5s ease-in-out",
//     },
//   },
// },
})
