#  Bodymoji

Draws an emoji on your face! Powered by [Nuxt.js](https://nuxtjs.org), [Tensorflow.js](https://tensorflow.org/js) and [Posenet](https://github.com/tensorflow/tfjs-models/tree/master/posenet).

## Useful files

- [lib/camera.js](./lib/camera.js): A singleton class for working with camera
- [lib/posenet.js](./lib/posenet.js): A singleton class around posenet to detect face and render stream on a canvas
- [components/camera.vue](./components/camera.vue): Standalone component that renders camera input

## Development

- Fork this repo
- Install dependencies with `yarn install`
- Run dev server with `yarn dev`
- Generate static files for deployment with `yarn generate`

## License

[No License](https://choosealicense.com/no-permission/)
