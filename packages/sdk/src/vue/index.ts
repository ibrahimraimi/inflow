import { inject, onMounted, App } from 'vue';
import inflow, { Inflow } from '../index';
import { InflowConfig } from '../types';

const InflowSymbol = Symbol('inflow');

export const createInflow = (config: InflowConfig) => {
  return {
    install: (app: App) => {
      inflow.init(config);
      app.provide(InflowSymbol, inflow);
      app.config.globalProperties.$inflow = inflow;
    }
  };
};

export const useInflow = (): Inflow => {
  const inflow = inject<Inflow>(InflowSymbol);
  if (!inflow) {
    throw new Error('useInflow must be used with Inflow plugin');
  }
  return inflow;
};
