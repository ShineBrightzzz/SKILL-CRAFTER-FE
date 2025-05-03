import React from 'react';
import { useAbility } from '@/hooks/useAbility';
import { Action, Subject } from '@/utils/ability';
import ErrorHandler from '@/components/ErrorHandler';
const withPermission = (WrappedComponent: React.ComponentType<any>, action: Action, subject: Subject) => {
  const ComponentWithPermission = (props: any) => {
    const ability = useAbility();

    const isAllowed = ability.can(action, subject);
    console.log(ability)
    if (!isAllowed) {
      return <ErrorHandler status={403} message="Bạn cần quyền quản trị để truy cập." />
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithPermission;
};

export default withPermission;
