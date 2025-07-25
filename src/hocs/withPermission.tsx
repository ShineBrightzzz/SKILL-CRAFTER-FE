import React from 'react';
import { useAbility } from '@/store/hooks/abilityHooks';
import { Action, Subject } from '@/utils/ability';
import ErrorHandler from '@/components/ErrorHandler';
import { useAuthSession } from '@/providers/AuthProvider';
import Loading from '@/components/Loading';

const withPermission = (WrappedComponent: React.ComponentType<any>, action: Action, subject: Subject) => {
  const ComponentWithPermission = (props: any) => {
    const ability = useAbility();
    const { isLoading } = useAuthSession();

    if (isLoading) {
      return <Loading message="Đang kiểm tra quyền truy cập..." />;
    }

    // Bypass permission check if NEXT_PUBLIC_ENABLE_PERMISSIONS is false
    if (process.env.NEXT_PUBLIC_ENABLE_PERMISSIONS === 'FALSE') {
      return <WrappedComponent {...props} />;
    }

    const isAllowed = ability.can(action, subject);
    
    if (!isAllowed) {
      return <ErrorHandler status={403} message="Bạn cần quyền quản trị để truy cập." />;
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithPermission;
};

export default withPermission;