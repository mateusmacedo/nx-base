import { AuthorizationError, DatabaseError, NotFoundError, ValidationError } from './error';

describe('Error Classes', () => {
  describe('ValidationError', () => {
    it('should create an instance of ValidationError', () => {
      const error = new ValidationError('Invalid input', 'username');
      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Invalid input');
      expect(error.field).toBe('username');
    });

    it('should create an instance of ValidationError without field', () => {
      const error = new ValidationError('Invalid input');
      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Invalid input');
      expect(error.field).toBeUndefined();
    });
  });

  describe('DatabaseError', () => {
    it('should create an instance of DatabaseError', () => {
      const error = new DatabaseError('Query failed', 'SELECT * FROM users');
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Query failed');
      expect(error.query).toBe('SELECT * FROM users');
    });

    it('should create an instance of DatabaseError without query', () => {
      const error = new DatabaseError('Query failed');
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Query failed');
      expect(error.query).toBeUndefined();
    });
  });

  describe('NotFoundError', () => {
    it('should create an instance of NotFoundError', () => {
      const error = new NotFoundError('Resource not found');
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('AuthorizationError', () => {
    it('should create an instance of AuthorizationError', () => {
      const error = new AuthorizationError('Unauthorized access');
      expect(error).toBeInstanceOf(AuthorizationError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Unauthorized access');
    });
  });
});
