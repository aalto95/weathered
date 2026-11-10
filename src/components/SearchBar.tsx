import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  accentColor,
  borderColor,
  cardShadow,
  focusRingColor,
  hoverColor,
  mutedTextColor,
  surfaceColor,
  surfaceMutedColor,
  textColor
} from '../constants/theme';
import { fetchWeatherByCityName } from '../features/app-slice';

const Container = styled.section`
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: clamp(8px, 4vw, 32px);
`;

const Form = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(100%, 480px);
  height: 58px;
  padding: 6px 6px 6px 20px;
  background-color: ${surfaceColor};
  border: 1px solid ${borderColor};
  border-radius: 999px;
  box-shadow: ${cardShadow};
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus-within {
    border-color: ${accentColor};
    box-shadow: 0 0 0 4px ${focusRingColor};
  }
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: ${textColor};
  font-family: inherit;
  font-size: 1rem;

  &::placeholder {
    color: ${mutedTextColor};
  }
`;

const ClearButton = styled.button`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: ${mutedTextColor};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${hoverColor};
  }
`;

const SubmitButton = styled.button`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: ${accentColor};
  color: #fff;
  transition:
    opacity 0.2s ease,
    transform 0.15s ease;

  &:hover:not(:disabled) {
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.96);
  }

  &:disabled {
    background-color: ${surfaceMutedColor};
    color: ${mutedTextColor};
    cursor: default;
  }
`;

export const SearchBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isFetching = useAppSelector((state) => state.app.isFetching);
  const [inputField, setInputField] = useState('');
  const { t } = useTranslation();

  const commenceSearch = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const city = inputField.trim();
    if (!city || isFetching) {
      return;
    }
    dispatch(fetchWeatherByCityName(city));
  };

  const clearInputField = () => {
    setInputField('');
  };

  return (
    <Container>
      <Form onSubmit={commenceSearch} role="search">
        <Input
          type="text"
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          value={inputField}
          onChange={(e: React.FormEvent<HTMLInputElement>) =>
            setInputField(e.currentTarget.value)
          }
        />
        {inputField && (
          <ClearButton
            type="button"
            onClick={clearInputField}
            aria-label={t('clearSearch')}
          >
            <XMarkIcon width={18} />
          </ClearButton>
        )}
        <SubmitButton
          type="submit"
          disabled={isFetching || !inputField.trim()}
          aria-label={t('searchPlaceholder')}
        >
          <MagnifyingGlassIcon width={20} />
        </SubmitButton>
      </Form>
    </Container>
  );
};
