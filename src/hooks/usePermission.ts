'use client';

import { useContext, useCallback } from 'react';
import { AbilityContext } from '@/providers/AbilityProvider';

export const usePermission = () => {
  const ability = useContext(AbilityContext);

  const hasPermission = useCallback((action: string, subject: string): boolean => {
    if (!ability) return false;
    return ability.can(action, subject);
  }, [ability]);

  const hasPermissions = useCallback((permissions: string[] = []): boolean => {
    if (!ability || !permissions.length) return true;
    
    return permissions.every(permission => {
      if (permission.includes(':')) {
        const [action, subject] = permission.split(':');
        return ability.can(action.toLowerCase(), subject);
      }
      return false;
    });
  }, [ability]);

  return { hasPermission, hasPermissions, ability };
};