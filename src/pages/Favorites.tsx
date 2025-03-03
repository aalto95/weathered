import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import theme from 'styled-theming';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import SearchResults from '../components/SearchResults';
import { fetchMultipleCities } from '../features/app-slice';

interface FavoritesProps {}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: 16px 0;
`;

const noFavoritesColor = theme('mode', {
  light: '#1C1E21',
  dark: '#E3E3E3;'
});

const NoFavoritesText = styled.h1`
  color: ${noFavoritesColor};
  padding: 1rem;
`;

const Favorites: React.FC<FavoritesProps> = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.app.favorites);
  const favoritesIds = useAppSelector((state) => state.app.favoritesIds);
  const isFetching = useAppSelector((state) => state.app.isFetching);
  const fetchError = useAppSelector((state) => state.app.fetchError);

  const { t, i18n } = useTranslation();

  useEffect(() => {
    dispatch(fetchMultipleCities(favoritesIds));
  }, []);

  if (favorites.length) {
    return (
      <Container>
        {favorites.map((city: any, id: number) => {
          return (
            <SearchResults
              key={id}
              city={city}
              fetchError={fetchError}
              isFetching={isFetching}
              isFavorite={true}
            ></SearchResults>
          );
        })}
      </Container>
    );
  }

  return (
    <Container>
      <NoFavoritesText>{t('noFavorites')}</NoFavoritesText>
    </Container>
  );
};

export default Favorites;
