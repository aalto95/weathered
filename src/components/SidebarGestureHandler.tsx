import React, { MouseEvent, TouchEvent, useEffect } from 'react'
import styled from 'styled-components'
import { useAppDispatch } from '../app/hooks'
import { sidebarToggled } from '../features/app-slice'

const Container = styled.button`
  width: 30px;
  height: 100%;
  position: absolute;
  background-color: transparent;
  border: none;
  cursor: pointer;
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
`

export const SidebarGestureHandler = () => {
  const [isMouseDown, setIsMouseDown] = React.useState(false)
  const [mouseLeft, setMouseLeft] = React.useState(false)

  const dispatch = useAppDispatch()

  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    setIsMouseDown(true)
  }

  const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
    if (e.clientX >= 30 && isMouseDown) {
      setMouseLeft(true)
    }
  }

  const handleMouseUp = (e: MouseEvent<HTMLButtonElement>) => {
    setIsMouseDown(false)
  }

  const handleTouchStart = (e: TouchEvent<HTMLButtonElement>) => {
    setIsMouseDown(true)
  }

  const handleTouchEnd = (e: TouchEvent<HTMLButtonElement>) => {
    setIsMouseDown(false)
  }

  const handleTouchMove = (e: TouchEvent<HTMLButtonElement>) => {
    if (e.changedTouches[0].clientX >= 30 && isMouseDown) {
      setMouseLeft(true)
    }
  }

  useEffect(() => {
    if (mouseLeft && isMouseDown) {
      dispatch(sidebarToggled(true))
      setIsMouseDown(false)
      setMouseLeft(false)
    }
  }, [mouseLeft])

  return (
    <Container
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    ></Container>
  )
}
