/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        LeagueSpartan: ['LeagueSpartan-Regular', 'sans-serif'],
        "LeagueSpartan-Bold": ["LeagueSpartan-Bold", "sans-serif"],
        LaoSansPro: ['LaoSansPro-Regular', 'sans-serif'],
      },
      colors: {
        "bg": {
          light: '#EEEED0',
          medium: '#F6C49E',
          dark: '#003049',
          orange: '#FF6B35',
          black: '#272528',
        },
        "txt": {
          orange: '#FF6B35',
          blue:'#004E89',
          darkblue: '#003049',
          light: '#EEEED0',
          black: '#000000',
          medium: '#F6C49E',
          gray: '#545454',
          dark: '#272528',
        },
        "icon":{
          rad: "#F2FF00",    // yellow
          good: "#31AC54",   // green
          meh: "#828282",    // Gray
          bad: "#78A2FE",    // Blue
          awful: "#FF0000",  // Red
        }
      }
    },
  },
  plugins: [],
}