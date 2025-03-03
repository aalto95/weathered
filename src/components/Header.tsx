import { SunIcon } from '@heroicons/react/24/outline';
import { Bars3Icon, MoonIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import theme from 'styled-theming';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { sidebarToggled, toggleMode } from '../features/app-slice';

const headingColor = theme('mode', {
  light: '#1C1E21',
  dark: '#E3E3E3;'
});

const LogoImg = styled.img`
  width: 32px;
`;

const sectionBackgroundColor = theme('mode', {
  light: '#FFF',
  dark: 'rgb(36, 37, 38)'
});

const Container = styled.header`
  background-color: ${sectionBackgroundColor};
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
  padding: 10px;
  z-index: 1;
`;

const ToggleButton = styled.button`
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: #fff;
  font-size: 16px;
  height: 32px;
`;

const Heading = styled.h1`
  font-size: 18px;
  color: ${headingColor};
`;

const HeadingWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoButton = styled.button`
  height: 32px;
`;

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.app.mode);

  const toggleTheme = () => {
    dispatch(toggleMode(mode === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    dispatch(sidebarToggled(true));
  };

  return (
    <Container>
      <HeadingWrapper>
        <LogoButton onClick={toggleSidebar}>
          {mode === 'light' && <Bars3Icon width="32" color="#1C1E21" />}
          {mode === 'dark' && <Bars3Icon width="32" color="#E3E3E3" />}
        </LogoButton>
        <Link
          to="/"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none'
          }}
        >
          <LogoImg
            src="/icons/manifest/192x192.png"
            alt="logo"
            style={
              mode === 'light'
                ? { filter: 'invert(1)' }
                : { filter: 'invert(0)' }
            }
          />
          <Heading>Weathered</Heading>
        </Link>
      </HeadingWrapper>
      <ToggleButton onClick={toggleTheme}>
        {mode === 'light' && (
          <MoonIcon color="#1C1E21" style={{ width: '32px' }} />
        )}
        {mode === 'dark' && (
          <SunIcon color="#E3E3E3" style={{ width: '32px' }} />
        )}
      </ToggleButton>
    </Container>
  );
};
