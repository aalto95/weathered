import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas'
import { styled } from 'styled-components'

export const RiveAnimation: React.FC<{
  width?: number
  height?: number
  animationName:
    | '404'
    | 'clear'
    | 'clouds'
    | 'loading'
    | 'rain'
    | 'snow'
    | 'thunderstorm'
}> = ({ width, height, animationName }) => {
  const { RiveComponent } = useRive({
    // Load a local riv `clean_the_car.riv` or upload your own!
    src: `/animations/${animationName}.riv`,
    // Be sure to specify the correct state machine (or animation) name
    stateMachines: 'State Machine 1',
    // This is optional.Provides additional layout control.
    layout: new Layout({
      fit: Fit.FitWidth, // Change to: rive.Fit.Contain, or Cover
      alignment: Alignment.Center
    }),
    autoplay: true
  })

  return (
    <div
      style={{
        width: width ? `${width}px` : '300px',
        height: height ? `${height}px` : '300px'
      }}
    >
      <RiveComponent />
    </div>
  )
}
