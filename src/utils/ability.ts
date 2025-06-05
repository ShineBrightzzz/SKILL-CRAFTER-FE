import { PureAbility, AbilityBuilder, AbilityClass } from '@casl/ability';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Register = 'register',
  Unregister = 'unregister',
  Enroll = 'enroll',
  Unenroll = 'unenroll',
  Submit = 'submit',
  RunCode = 'runCode',
  VerifyEmail = 'verifyEmail',
  Purchase = 'purchase',
  AddToCart = 'addToCart',
  RemoveFromCart = 'removeFromCart',
}

export enum Subject {
  Account = 'Account',
  Role = 'Role',
  Permission = 'Permission',
  Course = 'Course',
  Chapter = 'Chapter',
  Lesson = 'Lesson',
  Enrollment = 'Enrollment',
  Category = 'Category',
  Cart = 'Cart',
  TestCase = 'TestCase',
  CodeSubmit = 'CodeSubmit',
  Comment = 'Comment',
  Payment = 'Payment',
  Email = 'Email',
  Auth = 'Auth',
  All = 'all',
  Unknown = 'unknown',
}

export enum Module {
  UserManagement = 'User Management',
  RoleManagement = 'Role Management',
  PermissionManagement = 'Permission Management',
  CourseManagement = 'Course Management',
  ChapterManagement = 'Chapter Management',
  LessonManagement = 'Lesson Management',
  CategoryManagement = 'Category Management',
  CartManagement = 'Cart Management',
  CodeSubmitManagement = 'Code Submit Management',
  CommentManagement = 'Comment Management',
  PaymentManagement = 'Payment Management',
  EmailManagement = 'Email Management',
  Authentication = 'Authentication',
}

export type AppAbility = PureAbility<[Action, Subject]>;

export const createAbility = (permissions: any[] | null | undefined) => {
  const builder = new AbilityBuilder<AppAbility>(PureAbility as AbilityClass<AppAbility>);
  const { can, build } = builder;

  // Give a default ability to read auth-related subjects
  can(Action.Read, Subject.Auth);

  // Ensure permissions is an array before using forEach
  if (Array.isArray(permissions)) {
    permissions.forEach(permission => {
      if (!permission?.apiPath || !permission?.method) return;
      
      const action = mapApiMethodToAction(permission.method, permission.apiPath);
      const subject = mapApiPathToSubject(permission.apiPath);
      if (action && subject) {
        can(action, subject);
      }
    });
  }

  return build();
};

function mapApiMethodToAction(method: string, apiPath: string): Action | null {
  if (!method) return null;

  // Specific actions for code submission
  if (apiPath.includes('/api/code/submit') && method === 'POST') {
    return Action.Create;
  }
  if (apiPath.includes('/api/code/run') && method === 'POST') {
    return Action.Create;
  }

  // Enrollment related actions
  if (apiPath.includes('/api/enrollments') && method === 'POST') {
    return Action.Register;
  }
  if (apiPath.includes('/api/enrollments') && method === 'DELETE') {
    return Action.Unregister;
  }

  // Email verification actions
  if (apiPath.includes('/verify-email') && method === 'GET') {
    return Action.Read;
  }

  // Cart actions
  if (apiPath.includes('/api/cart') && method === 'POST') {
    return Action.Create;
  }
  if (apiPath.includes('/api/cart') && method === 'DELETE') {
    return Action.Delete;
  }

  // Payment actions
  if (apiPath.includes('/api/payments') && method === 'POST') {
    return Action.Create;
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
  if (normalizedPath.includes('/api/accounts') || normalizedPath.includes('/accounts')) return Subject.Account;
  if (normalizedPath.includes('/api/roles') || normalizedPath.includes('/roles')) return Subject.Role;
  if (normalizedPath.includes('/api/permissions') || normalizedPath.includes('/permissions')) return Subject.Permission;
  if (normalizedPath.includes('/api/courses') || normalizedPath.includes('/courses')) return Subject.Course;
  if (normalizedPath.includes('/api/chapters') || normalizedPath.includes('/chapters')) return Subject.Chapter;
  if (normalizedPath.includes('/api/lessons') || normalizedPath.includes('/lessons')) return Subject.Lesson;
  if (normalizedPath.includes('/api/enrollments') || normalizedPath.includes('/enrollments')) return Subject.Enrollment;
  if (normalizedPath.includes('/api/categories') || normalizedPath.includes('/categories')) return Subject.Category;
  if (normalizedPath.includes('/api/cart') || normalizedPath.includes('/cart')) return Subject.Cart;
  if (normalizedPath.includes('/api/test-cases') || normalizedPath.includes('/test-cases')) return Subject.TestCase;
  if (normalizedPath.includes('/api/code') || normalizedPath.includes('/code')) return Subject.CodeSubmit;
  if (normalizedPath.includes('/api/comments') || normalizedPath.includes('/comments')) return Subject.Comment;
  if (normalizedPath.includes('/api/payments') || normalizedPath.includes('/payments')) return Subject.Payment;
  if (normalizedPath.includes('/api/email') || normalizedPath.includes('/email')) return Subject.Email;
  if (normalizedPath.includes('/api/auth') || 
      normalizedPath.includes('/login') || normalizedPath.includes('/register') || 
      normalizedPath.includes('/verify-email')) return Subject.Auth;

  return Subject.Unknown;
}