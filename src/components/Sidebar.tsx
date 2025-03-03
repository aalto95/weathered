import { XMarkIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import theme from 'styled-theming';
import { useOnClickOutside } from 'usehooks-ts';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchWeatherByCityName, sidebarToggled } from '../features/app-slice';

const sidebarColor = theme('mode', {
  light: '#FFFFFF',
  dark: '#242526;'
});

const sidebarTextColor = theme('mode', {
  light: '#242526',
  dark: '#FFFFFF'
});

const Container = styled.div`
  position: absolute;
  height: 100vh;
  top: 0;
  background-color: ${sidebarColor};
  @media (max-width: 480px) {
    width: 100%;
  }
  @media (min-width: 480px) {
    width: 300px;
  }
  translatex: -100%;
  transition: transform 0.3s;
  z-index: 2;
`;

const SidebarBackdrop = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
`;

const Heading = styled.h1`
  font-size: 18px;
  color: ${sidebarTextColor};
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
`;

const List = styled.ul`
  margin-top: 10px;
  padding: 10px;
`;

const ListItem = styled.li`
  list-style: none;
  line-height: 2;
  color: ${sidebarTextColor};
  text-decoration: none;
  cursor: pointer;
`;

const Icon = styled.img`
  width: 32px;
  height: 32px;
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
`;

const HeadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const city = useAppSelector((state) => state.app.city);
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.app.mode);
  const isSidebarOpen = useAppSelector((state) => state.app.isSidebarOpen);
  const location = useLocation();
  const ref = useRef(null);
  const closeSidebar = () => {
    dispatch(sidebarToggled(false));
  };

  useOnClickOutside(ref, closeSidebar);

  const { t, i18n } = useTranslation();

  const handleLanguageChange = () => {
    if (i18n.language === 'en') {
      i18n.changeLanguage('ru');
      localStorage.setItem('lang', 'ru');
    } else {
      i18n.changeLanguage('en');
      localStorage.setItem('lang', 'en');
    }
    closeSidebar();
    dispatch(fetchWeatherByCityName(city!.name));
  };

  const goToFavorites = () => {
    navigate('/favorites');
    closeSidebar();
  };

  const goToHome = () => {
    navigate('/');
    closeSidebar();
  };

  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const [mouseLeft, setMouseLeft] = React.useState(false);

  useEffect(() => {
    if (mouseLeft && isMouseDown) {
      dispatch(sidebarToggled(false));
      setIsMouseDown(false);
      setMouseLeft(false);
    }
  }, [mouseLeft]);

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
            <XMarkIcon color={mode === 'light' ? 'black' : 'white'} />
          </IconButton>
        </SidebarHeader>
        <List>
          {location.pathname === '/' && (
            <ListItem onClick={goToFavorites}>{t('favorites')}</ListItem>
          )}
          {location.pathname === '/favorites' && (
            <ListItem onClick={goToHome}>{t('home')}</ListItem>
          )}
          <ListItem onClick={handleLanguageChange}>{t('switch')}</ListItem>
        </List>
      </Container>
      {isSidebarOpen && <SidebarBackdrop></SidebarBackdrop>}
    </>
  );
};
