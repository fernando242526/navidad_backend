export class ValidationUtil {
  /**
   * Validate email format using a simple regex
   * @param email - Email to validate
   * @returns True if valid, false otherwise
   */
  static isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * Requirements: At least 8 characters, one uppercase, one lowercase, one number
   * @param password - Password to validate
   * @returns True if valid, false otherwise
   */
  static isValidPassword(password: string): boolean {
    if (!password || password.length < 8) return false;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumber;
  }

  /**
   * Sanitize string by trimming whitespace
   * @param value - String to sanitize
   * @returns Sanitized string
   */
  static sanitizeString(value: string): string {
    if (!value) return '';
    return value.trim();
  }

  /**
   * Validate UUID format
   * @param uuid - UUID to validate
   * @returns True if valid UUID, false otherwise
   */
  static isValidUUID(uuid: string): boolean {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}