import { getContext, setContext, onMount } from 'svelte';
import inflow, { Inflow } from '../index';
import { InflowConfig } from '../types';

const INFLOW_KEY = 'inflow';

export const initInflow = (config: InflowConfig) => {
  onMount(() => {
    inflow.init(config);
  });
  
  setContext(INFLOW_KEY, inflow);
  return inflow;
};

export const useInflow = (): Inflow => {
  const inflow = getContext<Inflow>(INFLOW_KEY);
  if (!inflow) {
    throw new Error('useInflow must be used after initInflow in parent component');
  }
  return inflow;
};
