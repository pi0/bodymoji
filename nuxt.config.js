export default {
  mode: 'spa',

  build: {
    extractCSS: true
  },

  modules: [
    '@nuxtjs/pwa'
  ],

  css: [
    '~/assets/app.css'
  ]
}
