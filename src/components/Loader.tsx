import React from 'react';
import { RiveAnimation } from './RiveAnimation';

interface LoaderProps {
  width?: number;
  height?: number;
}

export const Loader: React.FC<LoaderProps> = ({ width, height }) => {
  return (
    <RiveAnimation animationName="loading" width={width} height={height} />
  );
};
