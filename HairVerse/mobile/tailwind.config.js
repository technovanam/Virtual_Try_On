/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        card: '#FFFFFF',
        primary: '#0F172A',
        secondary: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        surface: '#F3F4F6',
        accent: '#EEF2FF',
        ink: '#000000',
      },
      fontFamily: {
        display: ['Georgia'],
        regular: ['System'],
        medium: ['System'],
        bold: ['System'],
      },
      fontSize: {
        display: ['28px', '34px'],
        title: ['22px', '28px'],
        subtitle: ['16px', '22px'],
        body: ['14px', '20px'],
        caption: ['12px', '16px'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
        xxxl: '32px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
      }
    },
  },
  plugins: [],
}
