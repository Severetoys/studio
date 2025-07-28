const { textShadow } = require('tailwindcss-textshadow');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        body: ['var(--font-sans)', 'sans-serif'],
        headline: ['var(--font-sans)', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        'accent-shadow': 'hsla(var(--accent) / 0.5)',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      boxShadow: {
        'neon-red-light': '0 0 5px hsl(var(--primary)), 0 0 10px hsl(var(--primary) / 0.5)',
        'neon-red-strong': '0 0 15px hsl(var(--primary)), 0 0 25px hsl(var(--primary) / 0.7)',
        'neon-green-strong': '0 0 15px #22c55e, 0 0 25px #22c55e',
      },
      textShadow: {
        'neon-red-light': '0 0 5px hsl(var(--primary) / 0.8)',
        'neon-red': '0 0 8px hsl(var(--primary))',
        'neon-gold': '0 0 5px #ffd700, 0 0 10px #fde047, 0 0 15px #fef9c3',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '1',
            textShadow: '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary)), 0 0 30px hsl(var(--primary))'
          },
          '50%': { 
            opacity: '0.8',
            textShadow: '0 0 20px hsl(var(--primary)), 0 0 30px hsl(var(--primary)), 0 0 40px hsl(var(--primary))'
          },
        },
        'pulse-green-glow': {
          '0%, 100%': {
            boxShadow: '0 0 15px #22c55e, 0 0 25px #22c55e'
          },
          '50%': {
            boxShadow: '0 0 25px #22c55e, 0 0 40px #22c55e'
          }
        },
        'pulse-red-glow': {
            '0%, 100%': {
              boxShadow: '0 0 15px hsl(var(--primary)), 0 0 25px hsl(var(--primary))'
            },
            '50%': {
              boxShadow: '0 0 25px hsl(var(--primary)), 0 0 40px hsl(var(--primary))'
            }
        },
        'pulse-gold-glow': {
          '0%, 100%': {
            textShadow: '0 0 7px #fde047, 0 0 15px #fde047, 0 0 20px #fef9c3',
            color: '#fef08a',
            opacity: '1',
          },
          '50%': {
            textShadow: '0 0 10px #fde047, 0 0 20px #fde047, 0 0 30px #fef9c3',
            color: '#fef9c3',
            opacity: '0.9',
          },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-green-glow': 'pulse-green-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-red-glow': 'pulse-red-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-gold-glow': 'pulse-gold-glow 2.5s ease-in-out infinite',
        'marquee': 'marquee 25s linear infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addUtilities, theme }) {
      const newUtilities = {
        '.text-shadow-neon-red-light': {
          textShadow: theme('textShadow.neon-red-light'),
        },
        '.text-shadow-neon-red': {
          textShadow: theme('textShadow.neon-red'),
        },
         '.text-shadow-neon-gold': {
          textShadow: theme('textShadow.neon-gold'),
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
};
