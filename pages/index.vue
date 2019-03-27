<template>
  <div>
    <Camera
      class="camera"
      :device-id="deviceId"
    />
    <div class="overlay">
      <CameraSwitch
        v-model="deviceId"
      />
    </div>
  </div>
</template>

<style>
.camera {
  width: 100vw;
  height: 100vh;
}

.overlay {
  position: absolute;
  top: 20px;
  right: 20px;
}
</style>

<script>
import Camera from '~/components/camera'
import CameraSwitch from '~/components/camera-switch'

export default {
  components: {
    Camera,
    CameraSwitch
  },
  data() {
    return {
      deviceId: null
    }
  }
}
</script>
