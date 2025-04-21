import { PureAbility, AbilityBuilder, AbilityClass } from '@casl/ability';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export enum Subject {
  Account = 'Account',
  Role = 'Role',
  Permission = 'Permission',
  Student = 'Student',
  Event = 'Event',
  Score = 'Score',
  Club = 'Club',
  Form = 'Form',
  Semester = 'Semester',
  Auth = 'Auth',
  All = 'all',
  Unknown = 'unknown',
}

export type AppAbility = PureAbility<[Action, Subject]>;

export const createAbility = (permissions: any[]) => {
  const builder = new AbilityBuilder<AppAbility>(PureAbility as AbilityClass<AppAbility>);
  const { can, build } = builder;

  permissions.forEach(permission => {
    const action = mapApiMethodToAction(permission.method);
    const subject = mapApiPathToSubject(permission.apiPath);
    if (action && subject) {
      can(action, subject);
    }
  });

  return build();
};

function mapApiMethodToAction(method: string): Action | null {
  if(!method) return null

  switch (method.toUpperCase()) {
    case 'GET':
      return Action.Read;
    case 'POST':
      return Action.Create;
    case 'PUT':
    case 'PATCH':
      return Action.Update;
    case 'DELETE':
      return Action.Delete;
    case '*':
      return Action.Manage;
    default:
      return null;
  }
}

function mapApiPathToSubject(apiPath: string): Subject {
  if(!apiPath) return Subject.Unknown;
  const normalizedPath = apiPath.replace(/\{.*?\}/g, '').toLowerCase();

  if (apiPath === '/**') return Subject.All;
  if (normalizedPath.startsWith('/accounts')) return Subject.Account;
  if (normalizedPath.startsWith('/roles')) return Subject.Role;
  if (normalizedPath.startsWith('/permissions')) return Subject.Permission;
  if (normalizedPath.startsWith('/students')) return Subject.Student;
  if (normalizedPath.startsWith('/eventDetails') || (normalizedPath.startsWith('/events'))) return Subject.Event;
  if (normalizedPath.startsWith('/score')) return Subject.Score;
  if (normalizedPath.startsWith('/clubs')) return Subject.Club;
  if (normalizedPath.startsWith('/form')) return Subject.Form;
  if (normalizedPath.startsWith('/semester')) return Subject.Semester;
  if (normalizedPath.startsWith('/login') || normalizedPath.startsWith('/register')) return Subject.Auth;

  return Subject.Unknown;
}
