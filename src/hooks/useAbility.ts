import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { createAbility } from '@/utils/ability';

export const useAbility = () => {
  const permissions = useAppSelector((state) => state.ability.permissions); 
  const ability = useMemo(() => createAbility(permissions), [permissions]);
  return ability;
};
