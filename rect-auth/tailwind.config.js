// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'noto-serif': ['Noto Serif JP', 'serif'],
      },
    },
    fontFamily: {
      'sans': ['Noto Serif JP', 'serif'],
      'serif': ['Noto Serif JP', 'serif'],
      'mono': ['Noto Serif JP', 'serif'],
    },
  },
  plugins: [],
}