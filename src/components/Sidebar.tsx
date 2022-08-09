import React, { useRef } from 'react'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { useOnClickOutside } from 'usehooks-ts'
import { sidebarToggled } from '../features/app-slice'
import theme from 'styled-theming'
import closeIcon from '../assets/icons/close-icon.svg'

const sidebarColor = theme('mode', {
  light: '#FFFFFF',
  dark: '#242526;'
})

const sidebarTextColor = theme('mode', {
  light: '#242526',
  dark: '#FFFFFF'
})

const Container = styled.div`
  position: absolute;
  height: 100vh;
  top: 0;
  background-color: ${sidebarColor};
  width: 80%;
  translatex: -100%;
  transition: transform 0.3s;
  z-index: 1;
`

const SidebarBackdrop = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
`

const Heading = styled.h1`
  font-size: 18px;
  color: ${sidebarTextColor};
`

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
`

const Icon = styled.img`
  width: 32px;
  height: 32px;
`

const IconButton = styled.button`
  border: none;
  background-color: transparent;
  cursor: pointer;
  width: 32px;
  height: 32px;
`

const HeadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
`

export const Sidebar = () => {
  const dispatch = useAppDispatch()
  const mode = useAppSelector((state) => state.app.mode)
  const isSidebarOpen = useAppSelector((state) => state.app.isSidebarOpen)
  const ref = useRef(null)
  const closeSidebar = () => {
    dispatch(sidebarToggled(false))
  }

  useOnClickOutside(ref, closeSidebar)

  return (
    <>
      <Container
        ref={ref}
        style={
          isSidebarOpen
            ? { transform: 'translateX(-0%)' }
            : { transform: 'translateX(-100%)' }
        }
      >
        <SidebarHeader>
          <HeadingWrapper>
            <Icon
              src="/logo192.png"
              alt="logo"
              style={
                mode === 'light'
                  ? { filter: 'invert(1)' }
                  : { filter: 'invert(0)' }
              }
            />
            <Heading>Weathered</Heading>
          </HeadingWrapper>
          <IconButton onClick={closeSidebar}>
            <Icon src={closeIcon} alt="close" />
          </IconButton>
        </SidebarHeader>
      </Container>
      {isSidebarOpen && <SidebarBackdrop></SidebarBackdrop>}
    </>
  )
}
