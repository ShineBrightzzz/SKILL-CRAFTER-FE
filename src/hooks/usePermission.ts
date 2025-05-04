'use client';

import { useContext, useCallback } from 'react';
import { AbilityContext } from '@/providers/AbilityProvider';
import { Action, Subject } from '@/types/ability.types'; // Ensure the unified Subject type is used

export const usePermission = () => {
  const ability = useContext(AbilityContext);

  const hasPermission = useCallback((action: Action, subject: Subject): boolean => {
    if (!ability) return false;
    return ability.can(action, subject);
  }, [ability]);

  const hasPermissions = useCallback((permissions: string[] = []): boolean => {
    if (!ability || !permissions.length) return true;

    return permissions.every(permission => {
      if (permission.includes(':')) {
        const [action, subject] = permission.split(':');
        return ability.can(action.toLowerCase() as Action, subject as Subject);
      }
      return false;
    });
  }, [ability]);

  return { hasPermission, hasPermissions, ability };
};