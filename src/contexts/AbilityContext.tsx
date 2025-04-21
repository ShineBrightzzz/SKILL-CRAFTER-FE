'use client'

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { PureAbility } from '@casl/ability';
import { createAbility } from '@/utils/ability';
import { useAppSelector } from '@/store/hooks';

interface AbilityContextType {
  ability: PureAbility;
}

const AbilityContext = createContext<AbilityContextType | undefined>(undefined);

export const AbilityProvider = ({ children }: { children: ReactNode }) => {
  const role = useAppSelector((state) => state.ability.permissions || []);

  const ability = useMemo(() => createAbility(role), [role]);

  return (
    <AbilityContext.Provider value={{ ability }}>
      {children}
    </AbilityContext.Provider>
  );
};

export const useAbility = (): AbilityContextType => {
  const context = useContext(AbilityContext);
  if (!context) {
    throw new Error('useAbility must be used within a AbilityProvider');
  }
  return context;
};
