
import { PureAbility, AbilityBuilder, Ability, AbilityClass, Subject as CaslSubject } from '@casl/ability';

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
  All = 'all', 
}

export interface AppAbilityAction {
  action: Action;
  subject: Subject;
}

export type AppAbility = PureAbility<[Action, Subject]>;

export function createAbilityFactory(permissions: any[]) {
  const builder = new AbilityBuilder<AppAbility>(Ability as AbilityClass<AppAbility>);
  const { can, build } = builder;

  permissions.forEach(permission => {
    console.log(permission.method)
    const action = mapApiMethodToAction(permission.method);
    const subject = mapApiPathToSubject(permission.apiPath);
    
    if (action && subject) {
      can(action, subject);
    }


  });

  return build();
}

function mapApiMethodToAction(method: string): Action {
  console.log(method)
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
      return Action.Read;
  }
}

function mapApiPathToSubject(path: string): Subject {
  if (path === '/**') return Subject.All;
  
  if (path.includes('/accounts')) return Subject.Account;
  if (path.includes('/roles')) return Subject.Role;
  if (path.includes('/permissions')) return Subject.Permission;
  if (path.includes('/students')) return Subject.Student;
  if (path.includes('/events')) return Subject.Event;
  if (path.includes('/score')) return Subject.Score;
  if (path.includes('/clubs')) return Subject.Club;
  if (path.includes('/form')) return Subject.Form;
  
  return Subject.All;
}