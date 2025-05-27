import { User } from '@/store/slices/authSlice';

export function isValidUser(obj: any): obj is User {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    (!obj.name || typeof obj.name === 'string') &&
    (!obj.role || typeof obj.role === 'string')
  );
}

export function getSafeUserFromStorage(): User | null {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const parsedUser = JSON.parse(userStr);
    if (!isValidUser(parsedUser)) {
      console.warn('Invalid user data in localStorage');
      localStorage.removeItem('user'); // Clean up invalid data
      return null;
    }
    
    return parsedUser;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user'); // Clean up invalid data
    return null;
  }
}
