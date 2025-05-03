import { PureAbility, AbilityBuilder, AbilityClass } from '@casl/ability';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Register = 'register',
  Unregister = 'unregister',
  CheckIn = 'checkIn',
  CheckOut = 'checkOut',
  MarkRead = 'markRead',
  MarkAllRead = 'markAllRead',
  SendNotification = 'sendNotification',
}

export enum Subject {
  Account = 'Account',
  Role = 'Role',
  Permission = 'Permission',
  Student = 'Student',
  Event = 'Event',
  EventParticipation = 'EventParticipation',
  Score = 'Score',
  Club = 'Club',
  Form = 'Form',
  Semester = 'Semester',
  Notification = 'Notification',
  Auth = 'Auth',
  All = 'all',
  Unknown = 'unknown',
}

export enum Module {
  UserManagement = 'Quản lý người dùng',
  EventManagement = 'Quản lý sự kiện',
  EventParticipation = 'Tham gia sự kiện',
  StudentManagement = 'Quản lý sinh viên',
  SemesterManagement = 'Quản lý học kỳ',
  ScoreManagement = 'Quản lý điểm',
  RoleManagement = 'Quản lý vai trò',
  PermissionManagement = 'Quản lý quyền',
  NotificationManagement = 'Quản lý thông báo',
  FormManagement = 'Quản lý biểu mẫu',
  Authentication = 'Xác thực',
}

export type AppAbility = PureAbility<[Action, Subject]>;

export const defineRulesFor = (permissions: any[]) => {
  const builder = new AbilityBuilder<AppAbility>(PureAbility as AbilityClass<AppAbility>);
  const { can, build } = builder;

  permissions.forEach(permission => {
    const action = mapApiMethodToAction(permission.method, permission.apiPath);
    const subject = mapApiPathToSubject(permission.apiPath);
    if (action && subject) {
      can(action, subject);
    }
  });

  return build();
};

export const createAbility = defineRulesFor;

function mapApiMethodToAction(method: string, apiPath: string): Action | null {
  if (!method) return null;

  // Special cases based on endpoint purpose
  if (apiPath.includes('/participations') && method === 'POST' && apiPath.includes('/check-in')) {
    return Action.CheckIn;
  }
  if (apiPath.includes('/participations') && method === 'POST' && apiPath.includes('/check-out')) {
    return Action.CheckOut;
  }
  if (apiPath.includes('/participations') && method === 'POST' && !apiPath.includes('/check')) {
    return Action.Register;
  }
  if (apiPath.includes('/participations') && method === 'DELETE') {
    return Action.Unregister;
  }
  if (apiPath.includes('/mark-read') && method === 'PUT') {
    return Action.MarkRead;
  }
  if (apiPath.includes('/mark-all-read') && method === 'PUT') {
    return Action.MarkAllRead;
  }
  if (apiPath.includes('/notifications/admin') && method === 'POST') {
    return Action.SendNotification;
  }

  // Standard mappings
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
  if (!apiPath) return Subject.Unknown;
  const normalizedPath = apiPath.replace(/\{.*?\}/g, '').toLowerCase();

  if (apiPath === '/**') return Subject.All;
  if (normalizedPath.startsWith('/accounts')) return Subject.Account;
  if (normalizedPath.startsWith('/roles')) return Subject.Role;
  if (normalizedPath.startsWith('/permissions')) return Subject.Permission;
  if (normalizedPath.startsWith('/student')) return Subject.Student;
  if (normalizedPath.startsWith('/eventdetails')) return Subject.Event;
  if (normalizedPath.startsWith('/events/participations')) return Subject.EventParticipation;
  if (normalizedPath.startsWith('/events')) return Subject.Event;
  if (normalizedPath.startsWith('/score')) return Subject.Score;
  if (normalizedPath.startsWith('/clubs')) return Subject.Club;
  if (normalizedPath.startsWith('/form')) return Subject.Form;
  if (normalizedPath.startsWith('/semester')) return Subject.Semester;
  if (normalizedPath.startsWith('/api/notifications')) return Subject.Notification;
  if (normalizedPath.startsWith('/login') || normalizedPath.startsWith('/register')) return Subject.Auth;

  return Subject.Unknown;
}