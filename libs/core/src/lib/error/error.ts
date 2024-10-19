export class ValidationError extends Error {
  constructor(public readonly message: string, public readonly field?: string) {
    super(message);
  }
}

export class DatabaseError extends Error {
  constructor(public readonly message: string, public readonly query?: string) {
    super(message);
  }
}

export class NotFoundError extends Error {
  constructor(public readonly message: string) {
    super(message);
  }
}

export class AuthorizationError extends Error {
  constructor(public readonly message: string) {
    super(message);
  }
}
