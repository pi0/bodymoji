<template>
  <div v-show="devices.length > 1" class="switch-btn" @click="next">
    {{ index + 1 }}
  </div>
</template>

<style>
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
export default {
  data() {
    return {
      devices: [],
      index: 0
    }
  },
  async mounted() {
    await this.getDevices()
  },
  methods: {
    next() {
      this.index += 1
      if (this.index >= this.devices.length) {
        this.index = 0
      }
      this.emitId()
    },
    emitId() {
      this.$emit('input', this.devices[this.index].deviceId)
    },
    async getDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices()
        .then(devices => devices.filter(deviceInfo => deviceInfo.kind === 'videoinput'))

      this.devices = devices
      this.emitId()
    }
  }
}
</script>
