<template>
  <div class="container">
    <video v-show="false" ref="video" />
    <canvas v-show="!error" ref="output" />
    <span v-if="error" class="error">
      An error occured while initializing camera:
      <br>
      {{ error }}
    </span>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.error {
  color: white;
  padding: 10%;
}

video, canvas {
  width: 100%;
  height: 100%;
}
</style>

<script>
import camera from '~/lib/camera'
import posenet from '~/lib/posenet'

export default {
  props: {
    deviceId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      error: null
    }
  },
  watch: {
    deviceId: 'setupCamera'
  },
  mounted() {
    this.setupCamera()
  },
  methods: {
    async setupCamera() {
      try {
        this.error = null
        await this._setupCamera()
      } catch (error) {
        console.error('[camera]', error) // eslint-disable-line no-console
        this.error = error
      }
    },
    async _setupCamera() {
      if (!this.deviceId) {
        this.error = 'No Camera Selected!'
        return
      }

      if (!camera.userMediaSupported) {
        throw new Error('Camera is not supported!')
      }

      // Start video stream
      await camera.start(this.$refs.video, this.deviceId)

      // Start drawing on canvas
      await posenet.start(this.$refs.video, this.$refs.output)
    }
  }
}
</script>
