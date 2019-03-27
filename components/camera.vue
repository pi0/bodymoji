<template>
  <div class="container">
    <video
      v-show="false"
      ref="video"
      :width="width"
      :height="height"
    />
    <canvas
      v-show="!error"
      ref="output"
      class="video"
      :width="width"
      :height="height"
    />
    <span
      v-if="error"
      class="error"
    >
      {{ error }}
    </span>
  </div>
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
import { detectPoseInRealTime } from '~/lib/posenet'

export default {
  props: {
    deviceId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      error: null,
      width: 500,
      height: 600
    }
  },
  computed: {
    video() {
      return this.$refs.video
    },
    output() {
      return this.$refs.output
    },
    userMediaSupported() {
      return navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    }
  },
  watch: {
    deviceId: 'setupCamera'
  },
  async mounted() {
    if (!this.userMediaSupported) {
      this.error = 'Camera is not supported!'
      return
    }

    await this.setupCamera()
  },
  methods: {
    async setupCamera() {
      try {
        this.error = null
        this.stop()
        await this._setupCamera()
      } catch (error) {
        this.error = error + ''
      }
    },
    async _setupCamera() {
      if (!this.deviceId) {
        return this.setError('No Camera Selected!')
      }

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            deviceId: {
              exact: this.deviceId
            }
          }
        })
      } catch (error) {
        throw new Error(error) // Fix error message
      }

      this.video.srcObject = this.stream
      this.video.play()
      await new Promise((resolve) => {
        this.video.onloadedmetadata = () => resolve()
      })

      this.width = this.video.videoWidth
      this.height = this.video.videoWidth

      this.net = await detectPoseInRealTime(this.video, this.output, {
        videoWidth: this.width,
        videoHeight: this.height
      })
    },
    stop() {
      if (this.net) {
        this.net.dispose()
      }

      this.video.pause()
      this.video.srcObject = null

      if (this.stream) {
        for (const track of this.stream.getTracks()) {
          track.stop()
        }
      }
    }
  }
}
</script>
