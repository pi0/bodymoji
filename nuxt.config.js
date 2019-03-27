export default {
  mode: 'spa',

  build: {
    extractCSS: true
  },

  modules: [
    '@nuxtjs/pwa'
  ],

  manifest: {
    name: 'Bodymoji'
  },

  css: [
    '~/assets/app.css'
  ]
}
