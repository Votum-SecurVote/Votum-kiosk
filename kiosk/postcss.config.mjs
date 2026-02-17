/**
 * PostCSS configuration file.
 * Configures TailwindCSS via PostCSS.
 */
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
