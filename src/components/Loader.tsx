import React from 'react'
import { useLottie } from 'lottie-react'
import loadingAnimation from '../assets/animations/loading.json'

const LottieAnimation = () => {
  const options = {
    animationData: loadingAnimation,
    style: { width: '100px', height: '100px' },
    loop: true,
    autoPlay: true
  }

  const { View } = useLottie(options)
  return View
}

const Loader = () => {
  return (
      <LottieAnimation />
  )
}

export default Loader
