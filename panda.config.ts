import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use CSS reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          primary: { value: '#3B82F6' },
          secondary: { value: '#6B7280' },
          success: { value: '#10B981' },
          warning: { value: '#F59E0B' },
          error: { value: '#EF4444' },
        },
        spacing: {
          'xs': { value: '0.25rem' },
          'sm': { value: '0.5rem' },
          'md': { value: '1rem' },
          'lg': { value: '1.5rem' },
          'xl': { value: '2rem' },
          '2xl': { value: '3rem' },
        },
        fontSizes: {
          'xs': { value: '0.75rem' },
          'sm': { value: '0.875rem' },
          'md': { value: '1rem' },
          'lg': { value: '1.125rem' },
          'xl': { value: '1.25rem' },
          '2xl': { value: '1.5rem' },
          '3xl': { value: '1.875rem' },
          '4xl': { value: '2.25rem' },
          '5xl': { value: '3rem' },
        },
      },
      semanticTokens: {
        colors: {
          'bg-primary': { value: '{colors.blue.50}' },
          'bg-secondary': { value: '{colors.white}' },
          'text-primary': { value: '{colors.gray.900}' },
          'text-secondary': { value: '{colors.gray.700}' },
          'border-primary': { value: '{colors.blue.200}' },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",

  // Enable JSX style props
  jsxFramework: "react",

  // Enable CSS layers
  layers: {
    reset: "reset",
    base: "base",
    tokens: "tokens",
    recipes: "recipes",
    utilities: "utilities",
  },

  // Recipes for reusable component styles
  recipes: {
    card: {
      className: 'card',
      base: {
        display: 'block',
        borderRadius: 'lg',
        backgroundColor: 'white',
        boxShadow: 'md',
        transition: 'all 0.2s ease-in-out',
      },
      variants: {
        variant: {
          default: {
            border: '1px solid',
            borderColor: 'gray.200',
          },
          elevated: {
            boxShadow: 'lg',
            border: 'none',
          },
          outlined: {
            border: '2px solid',
            borderColor: 'gray.300',
            boxShadow: 'none',
          },
        },
        size: {
          sm: { padding: '4' },
          md: { padding: '6' },
          lg: { padding: '8' },
        },
      },
      defaultVariants: {
        variant: 'default',
        size: 'md',
      },
    },
  },
});
