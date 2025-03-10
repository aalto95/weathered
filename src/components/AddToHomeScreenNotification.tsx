import { XMarkIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import theme from 'styled-theming';
import { useTimeout } from 'usehooks-ts';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  dismissA2HSButton,
  isA2HSButtonDismissedSet
} from '../features/app-slice';

const buttonColor = theme('mode', {
  light: '#F2F2F2',
  dark: '#242526;'
});

const buttonTextColor = theme('mode', {
  light: '#242526',
  dark: '#FFFFFF'
});

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 200px;
  padding: 10px;
  border-radius: 10px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  transform: translateY(100px);
  transition: transform 0.5s;
  background-color: ${buttonColor};
`;

const InstallButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;

  color: ${buttonTextColor};
`;

const DismissButton = styled.button`
  width: 32px;
  height: 32px;
`;

export const AddToHomeScreenNotification: React.FC = () => {
  const mode = useAppSelector((state) => state.app.mode);
  const dispatch = useAppDispatch();

  const dismissButton = () => {
    setVisible(false);
    setTimeout(() => {
      dispatch(dismissA2HSButton());
    }, 1000);
  };

  const { t, i18n } = useTranslation();

  const isA2HSButtonDismissed = useAppSelector(
    (state) => state.app.isA2HSButtonDismissed
  );

  const [visible, setVisible] = useState(false);

  const show = () => setVisible(true);

  useTimeout(show, 1000);

  useEffect(() => {
    dispatch(
      isA2HSButtonDismissedSet(
        localStorage.getItem('a2hsButtonDismissed') === 'true'
      )
    );
    if (!isA2HSButtonDismissed) {
      let deferredPrompt: any;
      const container = document.getElementById('a2hs-container');
      const addBtn = document.getElementById('add-button');

      container!.style.display = 'none';

      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI to notify the user they can add to home screen
        container!.style.display = 'flex';

        addBtn!.addEventListener('click', (e) => {
          // hide our user interface that shows our A2HS button
          container!.style.display = 'none';
          // Show the prompt
          deferredPrompt.prompt();
          // Wait for the user to respond to the prompt
          deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the A2HS prompt');
            } else {
              console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
          });
        });
      });
    }
  }, []);

  if (!isA2HSButtonDismissed) {
    return (
      <Container
        id="a2hs-container"
        style={
          visible
            ? { transform: 'translateY(-20px)' }
            : { transform: 'translateY(100px)' }
        }
      >
        <InstallButton id="add-button">{t('install')}</InstallButton>
        <DismissButton onClick={dismissButton}>
          <XMarkIcon color={mode === 'light' ? 'black' : 'white'} />
        </DismissButton>
      </Container>
    );
  }

  return null;
};
