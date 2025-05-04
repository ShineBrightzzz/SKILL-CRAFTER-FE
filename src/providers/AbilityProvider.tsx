'use client';

import React, { createContext, useState, useEffect } from 'react';
import { createContextualCan } from '@casl/react';
import { AppAbility, defineRulesFor } from '@/utils/ability';
import { useSelector } from 'react-redux';
import { PureAbility } from '@casl/ability';

export const AbilityContext = createContext<AppAbility>(defineRulesFor([]));

export const Can = createContextualCan(AbilityContext.Consumer);

export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const [ability, setAbility] = useState<AppAbility>(defineRulesFor([]));
  const { permissions } = useSelector((state: any) => state.user);

  useEffect(() => {
    if (permissions && permissions.length > 0) {
      // Update ability when permissions change
      const updatedAbility = defineRulesFor(permissions);
      setAbility(updatedAbility);
    } else {
      // Reset ability if no permissions
      setAbility(defineRulesFor([]));
    }
  }, [permissions]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}