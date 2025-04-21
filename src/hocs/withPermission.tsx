import React from 'react';
import { useAbility } from '@/hooks/useAbility';
import { Action, Subject } from '@/utils/ability';

const withPermission = (WrappedComponent: React.ComponentType<any>, action: Action, subject: Subject) => {
  const ComponentWithPermission = (props: any) => {
    const ability = useAbility();

    const isAllowed = ability.can(action, subject);

    if (!isAllowed) {
      return <p style={{ color: 'red' }}>Bạn không có quyền truy cập chức năng này.</p>;
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithPermission;
};

export default withPermission;
