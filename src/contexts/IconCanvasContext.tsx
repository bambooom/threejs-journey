import { createContext, useContext, FC, ReactNode } from 'react';
import {IconScene, IconCanvasContextType} from '../types';

const IconCanvasContext = createContext<IconCanvasContextType | null>(null);

export const useIconCanvas = () => {
  const context = useContext(IconCanvasContext);
  if (!context) {
    throw new Error('useIconCanvas must be used within an IconCanvasProvider');
  }
  return context;
};

interface IconCanvasProviderProps {
  children: ReactNode;
  value: IconCanvasContextType;
}

export const IconCanvasProvider: FC<IconCanvasProviderProps> = ({ children, value }) => {
  return (
    <IconCanvasContext.Provider value={value}>
      {children}
    </IconCanvasContext.Provider>
  );
};

export type { IconScene };
