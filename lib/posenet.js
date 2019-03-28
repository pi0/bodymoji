import * as posenet from '@tensorflow-models/posenet'

class Posenet {
  constructor(options = {}) {
    // Apply default options and assign to class
    Object.assign(this, {
      videoWidth: 500,
      videoHeight: 600,
      flipImage: true,
      imageScaleFactor: 0.5,
      outputStride: 16, // 8, 16, 32 (higher=faster)
      minPoseConfidence: 0.1,
      minPartConfidence: 0.5,
      mobileNetArchitecture: 0.75, // 1.01, 1.00, 0.75, 0.50
      ...options
    })

    // Bind methods to class instance once
    this.renderLoop = this.renderLoop.bind(this)
    this.renderFrame = this.renderFrame.bind(this)
    this.poseEstimate = this.poseEstimate.bind(this)

    // Net placeholders
    this.net = null
    this.netError = null

    // Other placeholders
    this.video = null
    this.canvas = null
    this.ctx = null

    // Pose detection
    this.pose = null

    // Stats
    this.resetStats()
  }

  start(video, canvas) {
    // Set video
    this.video = video

    // Initialize canvas
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')

    // Sync canvas size with video
    this.canvas.width = this.video.width
    this.canvas.height = this.video.height

    // Remove old detected pose
    this.pose = null

    // Reset stats
    this.resetStats()

    // Load net in background
    this.loadNet()

    // Start render loop once
    if (!this._renderLoop) {
      this._renderLoop = true
      this.renderLoop()
    }
  }

  async loadNet() {
    // Prevent loading same mobileNetArchitecture if already loaded
    if (this._mobileNetArchitecture === this.mobileNetArchitecture) {
      return
    }

    // Early set to prevent duplicate loadNet calls
    this._mobileNetArchitecture = this.mobileNetArchitecture

    // Dispose old net
    if (this.net) {
      this.net.dispose()
    }

    // Try to load
    try {
      this.net = await posenet.load(this.mobileNetArchitecture)
    } catch (error) {
      delete this._mobileNetArchitecture
      this.netError = error
      this.logError(error)
    }
  }

  async poseEstimate() {
    // Skip if net or video is not available
    if (!this.net || !this.video) {
      return
    }

    // Lock
    if (this._poseLock) {
      return
    }
    this._poseLock = true

    try {
      this.pose = await this.net.estimateSinglePose(
        this.video,
        this.imageScaleFactor,
        this.flipImage,
        this.outputStride
      )
    } catch (error) {
      this.logError(error)
    }

    this._poseLock = false
  }

  renderLoop() {
    if (!this._renderLoop) {
      return
    }

    try {
      this.renderFrame()
    } catch (error) {
      this.logError(error)
    }

    requestAnimationFrame(this.renderLoop)
  }

  renderFrame() {
    // Skip frame if video of ctx are not available
    if (!this.video || !this.ctx) {
      return
    }

    // Calculate FPS
    if (this._lastRender) {
      this.updateStats(Date.now() - this._lastRender)
    }

    // Keep FSP consistent by skipping estimate
    // if (this.fps >= this.avgFPS) {
    // requestAnimationFrame(this.poseEstimate)
    // }
    // Estimate in background
    this.poseEstimate()

    // Get current canvas size
    const { width, height } = this.canvas

    // Draw video frame
    this.ctx.save()
    if (this.flipImage) {
      this.ctx.scale(-1, 1)
      this.ctx.translate(-width, 0)
    }
    this.ctx.drawImage(this.video, 0, 0, width, height)
    this.ctx.restore()

    if (!this.net) {
      // Draw loading / error statis
      this.drawText(this.netError ? '❌' : '⌛', 20, 50, 20)
    } else {
      // Draw FPS
      this.drawText(`FPS: ${this.fps} (Average: ${this.avgFPS})`, 20, 50, 10)
    }

    if (this.pose && this.pose.score >= this.minPoseConfidence) {
      const getPosition = part => this.pose.keypoints.find(p => p.part === part).position
      const leftEye = getPosition('leftEye')
      const rightEye = getPosition('rightEye')
      const nose = getPosition('nose')
      const d = parseInt(Math.sqrt((leftEye.x - rightEye.x) ** 2, (leftEye.y - rightEye.y) ** 2))
      this.drawText('😊', nose.x - d, nose.y, d * 2)
    }

    this._lastRender = Date.now()
  }

  drawText(text, x, y, fontSize, fontName = 'Arial') {
    this.ctx.font = `${fontSize}px ${fontName}`
    this.ctx.fillText(text, x, y)
  }

  updateStats(diff) {
    if (diff < 10) {
      return
    }

    this.fps = Math.round(1000 / diff)

    this._renderCount++
    this._totalFPS += this.fps
    this.avgFPS = Math.round(this._totalFPS / this._renderCount)
  }

  resetStats() {
    this._lastRender = 0
    this._renderCount = 0
    this._totalFPS = 0
    this.fps = 0
    this.avgFPS = 0
  }

  logError(error) {
    console.error('[posenet]', error) // eslint-disable-line no-console
  }

  stop() {
    if (this.net) {
      this.net.dispose()
    }
    delete this.net
    delete this.netError
    delete this._mobileNetArchitecture

    delete this.video
    delete this.ctx

    delete this._renderLoop
  }
}

export default new Posenet()
