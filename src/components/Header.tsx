import darkModeIcon from '../assets/icons/dark-mode-icon.svg'
import lightModeIcon from '../assets/icons/light-mode-icon.svg'
import { HandySvg } from 'handy-svg'
import styled from 'styled-components'
import theme from 'styled-theming'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { toggleMode } from '../features/app-slice'
import React from 'react'

const headingColor = theme('mode', {
  light: '#1C1E21',
  dark: '#E3E3E3;'
})

const LightModeIcon = () => (
    <HandySvg
        src={lightModeIcon}
        className="icon"
        width="32"
        height="32"
        color="#000"
    />
)

const DarkModeIcon = () => (
    <HandySvg
        src={darkModeIcon}
        className="icon"
        width="32"
        height="32"
    />
)

const LogoImg = styled.img`
    width: 32px;
`

const sectionBackgroundColor = theme('mode', {
  light: '#FFF',
  dark: 'rgb(36, 37, 38)'
})

const StyledHeader = styled.header`
    background-color: ${sectionBackgroundColor};
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
    padding: 10px;
`

const ToggleButton = styled.button`
    border: none;
    background-color: transparent;
    cursor: pointer;
    color: #FFF;
    font-size: 16px;
`

const Heading = styled.h1`
    margin-left: 8px;
    font-size: 18px;
    color: ${headingColor};
`

const HeadingWrapper = styled.div`
    display: flex;
    align-items: center;
`

export const Header = () => {
  const dispatch = useAppDispatch()
  const mode = useAppSelector(state => state.app.mode)

  const toggleTheme = () => {
    dispatch(toggleMode(mode === 'light' ? 'dark' : 'light'))
  }

  return (
    <StyledHeader>
      <HeadingWrapper>
          <LogoImg src="/logo192.png" alt="logo" style={mode === 'light' ? { filter: 'invert(1)' } : { filter: 'invert(0)' }} />
          <Heading>Weathered</Heading>
      </HeadingWrapper>
      <ToggleButton onClick={toggleTheme}>
          {mode === 'light' ? <LightModeIcon /> : <DarkModeIcon /> }
      </ToggleButton>
    </StyledHeader>
  )
}
