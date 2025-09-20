/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pretendard': ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'sans-serif'],
      },
      colors: {
        // Primary Colors (브랜드 메인 컬러)
        primary: {
          10: '#FFF9F3',
          25: '#FFF6EE',
          50: '#FFF1E5',
          100: '#FFE3CC',
          200: '#FFC799',
          300: '#FFAA66',
          400: '#FF8E33',
          500: '#FF7200', // 메인 컬러
          600: '#CC5B00',
          700: '#994400',
          800: '#662E00',
          900: '#331700',
          950: '#1A0B00',
        },
        // Neutral Colors (중성 컬러)
        neutral: {
          50: '#FAFAFA',
          100: '#F6F6F6',
          200: '#F1F1F1',
          300: '#ECECEC',
          400: '#E2E2E2',
          500: '#CCCCCC',
          600: '#A0A0A0',
          700: '#7B7B7B',
          800: '#4C4C4C',
          900: '#141414',
        },
        // Base Colors (기본 컬러)
        base: {
          white: '#FFFFFF',
          black: '#101010',
          shadow: '#484A4C',
        },
        // Semantic Colors (의미적 컬러)
        semantic: {
          error: '#FF434B',
          info: '#648EF8',
          success: '#5BC566',
          warning: '#FFB421',
          sun: '#FFE3CC',
          moon: '#4E6384',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}