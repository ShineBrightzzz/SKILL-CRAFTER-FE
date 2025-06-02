'use client';

import React, { useContext } from 'react';
import { usePermissionsEnabled } from '@/providers/AbilityProvider';
import { AbilityContext, Action, Subject } from '@/utils/ability';

interface PermissionGuardProps {
  children: React.ReactNode;
  action: Action | string;
  subject: Subject | string;
  field?: string;
  fallback?: React.ReactNode;
}

// Helper functions to ensure type safety
const ensureAction = (action: Action | string): Action => {
  if (typeof action === 'string') {
    // Convert string to enum if possible
    const matchingAction = Object.values(Action).find(a => a === action);
    if (matchingAction) {
      return matchingAction;
    }
    // Default to read if no match found
    console.warn(`Invalid action value: ${action}, defaulting to "read"`);
    return Action.Read;
  }
  return action;
};

const ensureSubject = (subject: Subject | string): Subject => {
  if (typeof subject === 'string') {
    // Convert string to enum if possible
    const matchingSubject = Object.values(Subject).find(s => s === subject);
    if (matchingSubject) {
      return matchingSubject;
    }
    // Default to "unknown" if no match found
    console.warn(`Invalid subject value: ${subject}, defaulting to "unknown"`);
    return Subject.Unknown;
  }
  return subject;
};

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  action,
  subject,
  field,
  fallback = null,
}) => {
  const permissionsEnabled = usePermissionsEnabled();
  const ability = useContext(AbilityContext);
  
  // If permissions are disabled, always render children
  if (!permissionsEnabled) {
    console.log(`Permissions disabled, allowing: ${action} on ${subject}`);
    return <>{children}</>;
  }
  
  // Safely convert action and subject
  try {
    const actionValue = ensureAction(action);
    const subjectValue = ensureSubject(subject);
    
    console.log(`Checking permission: ${actionValue} on ${subjectValue}${field ? `:${field}` : ''}`);
    const allowed = ability.can(actionValue, subjectValue, field);
    console.log(`Permission check result: ${allowed ? 'ALLOWED' : 'DENIED'}`);
    return allowed ? <>{children}</> : <>{fallback}</>;
  } catch (error) {
    console.error(`Error checking permission:`, error);
    // Default to denying access on error for security
    return <>{fallback}</>;
  }
};

export default PermissionGuard;
