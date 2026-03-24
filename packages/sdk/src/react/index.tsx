import React, { createContext, useContext, useEffect, useMemo } from 'react';
import inflow, { Inflow } from '../index';
import { InflowConfig } from '../types';

interface InflowContextValue {
  inflow: Inflow;
}

const InflowContext = createContext<InflowContextValue | undefined>(undefined);

export interface InflowProviderProps {
  config: InflowConfig;
  children: React.ReactNode;
}

export const InflowProvider: React.FC<InflowProviderProps> = ({ config, children }) => {
  useEffect(() => {
    inflow.init(config);
  }, [config]);

  const value = useMemo(() => ({ inflow }), []);

  return (
    <InflowContext.Provider value={value}>
      {children}
    </InflowContext.Provider>
  );
};

export const useInflow = () => {
  const context = useContext(InflowContext);
  if (context === undefined) {
    throw new Error('useInflow must be used within an InflowProvider');
  }
  return context.inflow;
};
