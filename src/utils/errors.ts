export type AppErrorKind =
  'authentication' | 'validation' | 'authorization' | 'firestore' | 'network' | 'unexpected';

export class AppError extends Error {
  public constructor(
    message: string,
    public readonly kind: AppErrorKind,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'AppError';
  }
}

export function authenticationErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists for this email.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'The email or password is incorrect.';
    case 'auth/weak-password':
      return 'Choose a password with at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Unable to connect. Check your internet connection and try again.';
    default:
      return 'Authentication failed. Please try again.';
  }
}
