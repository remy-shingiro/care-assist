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
