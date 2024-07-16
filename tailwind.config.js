
module.exports = {
  content: ["./views/*.ejs", "./src/**/*.{ts, tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    {
      tailwindcss: {},
      autoprefixer: {},
    },
  ]
}
