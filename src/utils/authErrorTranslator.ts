// utils/authErrorTranslator.ts
/**
 * Утилита для перевода ошибок Supabase Auth на русский/английский язык
 */
export const translateAuthError = (errorMessage: string, t: (key: string) => string): string => {
  if (!errorMessage) return t('auth.errors.genericError');
  
  const errorLower = errorMessage.toLowerCase();
  
  // Ошибки входа
  if (errorLower.includes('invalid login credentials') || 
      errorLower.includes('invalid authentication credentials')) {
    return t('auth.errors.invalidCredentials');
  }
  
  if (errorLower.includes('email not confirmed')) {
    return t('auth.errors.emailNotConfirmed');
  }
  
  if (errorLower.includes('too many requests')) {
    return t('auth.errors.tooManyRequests');
  }
  
  if (errorLower.includes('user not found')) {
    return t('auth.errors.userNotFound');
  }
  
  // Ошибки регистрации
  if (errorLower.includes('password should be at least') || 
      errorLower.includes('password must be at least')) {
    return t('auth.errors.weakPassword');
  }
  
  if (errorLower.includes('user already registered') || 
      errorLower.includes('email already exists') ||
      errorLower.includes('user already exists')) {
    return t('auth.errors.emailAlreadyExists');
  }
  
  if (errorLower.includes('invalid email')) {
    return t('auth.errors.invalidEmail');
  }
  
  // Сетевые ошибки
  if (errorLower.includes('fetch failed') || 
      errorLower.includes('network error') ||
      errorLower.includes('failed to fetch')) {
    return t('auth.errors.networkError');
  }
  
  // Истекшая сессия
  if (errorLower.includes('session expired') || 
      errorLower.includes('jwt expired')) {
    return t('auth.errors.sessionExpired');
  }
  
  // Для неизвестных ошибок возвращаем оригинальное сообщение
  console.warn('Unhandled auth error:', errorMessage);
  return errorMessage;
};