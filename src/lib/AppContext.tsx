import React, { createContext, useContext, useState, ReactNode } from 'react';

type ODSData = any;

interface AppContextType {
  isFileLoaded: boolean;
  odsData: ODSData | null;
  loadODSData: (data: ODSData) => void;
  updateODSData: (data: ODSData) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const [odsData, setOdsData] = useState<ODSData | null>(null);

  const loadODSData = (data: ODSData) => {
    setOdsData(data);
    setIsFileLoaded(true);
  };

  const updateODSData = (data: ODSData) => {
    setOdsData(data);
  };

  return (
    <AppContext.Provider value={{ isFileLoaded, odsData, loadODSData, updateODSData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
