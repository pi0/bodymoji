import * as posenet from '@tensorflow-models/posenet'

export function detectPoseInRealTime(video, canvas, {
  videoWidth,
  videoHeight,
  flipImage = true,
  imageScaleFactor = 0.5,
  outputStride = 16, // 8, 16, 32 (higher=faster)
  minPoseConfidence = 0.1,
  minPartConfidence = 0.5,
  mobileNetArchitecture = 0.75 // 1.01, 1.00, 0.75, 0.50
} = {}) {
  let net, error

  posenet.load(mobileNetArchitecture).then((_net) => {
    net = _net
  }).catch((_error) => {
    error = _error
    console.error('[posenet]', _error) // eslint-disable-line no-console
  })

  const ctx = canvas.getContext('2d')

  async function poseDetectionFrame() {
    let pose
    if (net) {
      pose = await net.estimateSinglePose(video, imageScaleFactor, flipImage, outputStride).catch(() => {})
    }

    ctx.clearRect(0, 0, videoWidth, videoHeight)
    ctx.save()
    ctx.scale(-1, 1)
    ctx.translate(-videoWidth, 0)
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight)
    ctx.restore()

    if (net) {
      if (pose.score >= minPoseConfidence) {
        const getPosition = part => pose.keypoints.find(p => p.part === part).position
        const leftEye = getPosition('leftEye')
        const rightEye = getPosition('rightEye')
        const nose = getPosition('nose')
        const d = parseInt(Math.sqrt((leftEye.x - rightEye.x) ** 2, (leftEye.y - rightEye.y) ** 2))
        ctx.font = `${d * 2}px Arial`
        ctx.fillText('😊', nose.x - d, nose.y)
      }
    } else {
      ctx.font = '20px Arial'
      ctx.fillText(error ? '❌' : '⌛', 20, 50)
    }

    requestAnimationFrame(poseDetectionFrame)
  }

  poseDetectionFrame()

  return {
    dispose: () => {
      if (net) {
        net.dispose()
      }
    }
  }
}
