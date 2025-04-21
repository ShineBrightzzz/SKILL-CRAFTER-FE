'use client';
import { PropsWithChildren } from 'react';
import { useAbility } from '@/hooks/useAbility';

interface Props extends PropsWithChildren {
  action: 'manage' | 'read' | 'create' | 'update' | 'delete';
  subject: string;
}

const PermissionGuard = ({ action, subject, children }: Props) => {
  const ability = useAbility();

  if (!ability.can(action, subject)) {
    return null;
  }

  return <>{children}</>;
};

export default PermissionGuard;
