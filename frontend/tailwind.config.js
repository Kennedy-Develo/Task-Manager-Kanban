export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  safelist: [
    // Cores de status (vindas dinamicamente do banco de dados)
    'bg-yellow-400',
    'bg-blue-400',
    'bg-green-400',
    'bg-red-400',
    'bg-purple-400',
    'bg-pink-400',
    'bg-indigo-400',
    'bg-orange-400',
    'bg-teal-400',
    'bg-cyan-400',
    'bg-gray-400',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
