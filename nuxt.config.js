/**
 * This file for the nuxt to generate the Github pages
 */
const config = {
  srcDir: 'src/docs',
  generate: {
    dir: 'docs',
  },
  router: {
    base: '/simple-extension/',
  },
  server: {
    port: 8000, // default: 3000
    host: '0.0.0.0', // default: localhost,
  },
}

if (process.env.NODE_ENV === 'development') {
  delete config.router
}

export default config