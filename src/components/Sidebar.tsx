import React, { useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { useOnClickOutside } from 'usehooks-ts'
import { fetchWeatherByCityName, sidebarToggled } from '../features/app-slice'
import theme from 'styled-theming'
import closeIconDark from '../assets/icons/close-icon-dark.svg'
import closeIconLight from '../assets/icons/close-icon-light.svg'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

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
  z-index: 2;
`

const SidebarBackdrop = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
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
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
`

const List = styled.ul`
  margin-top: 10px;
  padding: 10px;
`

const ListItem = styled.li`
  list-style: none;
`

const Icon = styled.img`
  width: 32px;
  height: 32px;
`

const IconButton = styled.button`
  width: 32px;
  height: 32px;
`

const HeadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
`

const LanguageTogglerText = styled.p`
  color: ${sidebarTextColor};
  font-size: 16px;
  font-family: inherit;
`

export const Sidebar: React.FC = () => {
  const city = useAppSelector((state) => state.app.city)
  const dispatch = useAppDispatch()
  const mode = useAppSelector((state) => state.app.mode)
  const isSidebarOpen = useAppSelector((state) => state.app.isSidebarOpen)
  const ref = useRef(null)
  const closeSidebar = () => {
    dispatch(sidebarToggled(false))
  }

  useOnClickOutside(ref, closeSidebar)

  const { t, i18n } = useTranslation()

  const handleLanguageChange = () => {
    if (i18n.language === 'en') {
      i18n.changeLanguage('ru')
      localStorage.setItem('lang', 'ru')
    } else {
      i18n.changeLanguage('en')
      localStorage.setItem('lang', 'en')
    }
    closeSidebar()
    dispatch(fetchWeatherByCityName(city!.name))
  }

  const [isMouseDown, setIsMouseDown] = React.useState(false)
  const [mouseLeft, setMouseLeft] = React.useState(false)

  useEffect(() => {
    if (mouseLeft && isMouseDown) {
      dispatch(sidebarToggled(false))
      setIsMouseDown(false)
      setMouseLeft(false)
    }
  }, [mouseLeft])

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
            <Icon
              src={mode === 'light' ? closeIconDark : closeIconLight}
              alt="close"
            />
          </IconButton>
        </SidebarHeader>
        <List>
          <ListItem>
            <button onClick={handleLanguageChange}>
              <LanguageTogglerText>{t('switch')}</LanguageTogglerText>
            </button>
          </ListItem>
          <ListItem>
            <Link to="/favorites" onClick={closeSidebar}>
              {t('favorites')}
            </Link>
          </ListItem>
        </List>
      </Container>
      {isSidebarOpen && <SidebarBackdrop></SidebarBackdrop>}
    </>
  )
}
