import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAppDispatch } from '../app/hooks';
import { fetchWeatherByCityName } from '../features/app-slice';

const Container = styled.section`
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Form = styled.form`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2rem 0 2rem 0;
  background-color: #fff;
  border-radius: 15px;
  padding: 5px;
  @media (max-width: 480px) {
    width: 90%;
  }
  @media (min-width: 480px) {
    width: 300px;
  }
  height: 60px;
`;

const Input = styled.input`
  padding: 1rem 0 1rem 0;
  outline: none;
  border: none;
  border-radius: 20px;
  font-family: inherit;
  font-size: inherit;
  padding-left: 10px;
`;

const Span = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PurgeButton = styled.button`
  min-width: 32px;
  height: 32px;
`;

export const SearchBar: React.FC = () => {
  const dispatch = useAppDispatch();

  const commenceSearch = () => {
    dispatch(fetchWeatherByCityName(inputField));
  };

  const clearInputField = () => {
    setInputField('');
  };

  const [inputField, setInputField] = useState('');

  const { t, i18n } = useTranslation();

  return (
    <Container>
      <Form onSubmit={commenceSearch}>
        <Span>
          <MagnifyingGlassIcon style={{ width: '32px' }} color="black" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={inputField}
            onChange={(e: React.FormEvent<HTMLInputElement>) =>
              setInputField(e.currentTarget.value)
            }
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                commenceSearch();
              }
            }}
          />
        </Span>
        {inputField && (
          <PurgeButton onClick={clearInputField}>
            <XMarkIcon color="black" />
          </PurgeButton>
        )}
      </Form>
    </Container>
  );
};
