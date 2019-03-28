class Camera {
  constructor() {
    this.video = null
    this.stream = null
    this.deviceId = null
  }

  get userMediaSupported() {
    return navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  }

  async getDevices() {
    let devices = await navigator.mediaDevices.enumerateDevices()
    devices = devices.filter(deviceInfo => deviceInfo.kind === 'videoinput')
    return devices
  }

  async start(video, deviceId) {
    // Stop any old stream
    this.stop()

    // Set new references
    this.video = video
    this.deviceId = deviceId

    // Request a new stream
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: {
            exact: deviceId
          }
        }
      })
    } catch (error) {
      throw new Error(error) // Fix error message
    }

    // Attach to video element
    this.video.srcObject = this.stream
    this.video.play()

    // Wait to recieve first meta-data
    await new Promise((resolve) => {
      this.video.onloadedmetadata = () => resolve()
    })

    // Sync video element size with actual stream
    this.video.width = this.video.videoWidth
    this.video.height = this.video.videoHeight
  }

  stop() {
    // Pause video
    if (this.video) {
      this.video.pause()
      this.video.srcObject = null
    }
    delete this.video

    // Stop all stream tracks
    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop()
      }
    }
    delete this.stream
  }
}

export default new Camera()
