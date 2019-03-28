<template>
  <div v-show="devices.length > 1" class="switch-btn" @click="next">
    {{ index + 1 }}
  </div>
</template>

<style scoped>
.switch-btn {
  display: inline-block;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: black;
  border-radius: 100px;
  cursor: pointer;
}
</style>

<script>
import camera from '~/lib/camera'

export default {
  data() {
    return {
      devices: [],
      index: 0
    }
  },
  mounted() {
    this.getDevices()
  },
  methods: {
    async getDevices() {
      // Get devices
      this.devices = await camera.getDevices()

      // Emit id of active device
      this.emitId()
    },
    next() {
      this.index += 1
      if (this.index >= this.devices.length) {
        this.index = 0
      }
      this.emitId()
    },
    emitId() {
      this.$emit('input', this.devices[this.index].deviceId)
    }
  }
}
</script>
