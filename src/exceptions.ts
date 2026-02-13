/**
 * Exception classes for the Instaparser SDK.
 */

export class InstaparserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InstaparserError';
    Object.setPrototypeOf(this, InstaparserError.prototype);
  }
}

export class InstaparserAPIError extends InstaparserError {
  public readonly statusCode?: number;
  public readonly response?: any;

  constructor(message: string, statusCode?: number, response?: any) {
    super(message);
    this.name = 'InstaparserAPIError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, InstaparserAPIError.prototype);
  }
}

export class InstaparserAuthenticationError extends InstaparserAPIError {
  constructor(message: string = 'Invalid API key', statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'InstaparserAuthenticationError';
    Object.setPrototypeOf(this, InstaparserAuthenticationError.prototype);
  }
}

export class InstaparserRateLimitError extends InstaparserAPIError {
  constructor(message: string = 'Rate limit exceeded', statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'InstaparserRateLimitError';
    Object.setPrototypeOf(this, InstaparserRateLimitError.prototype);
  }
}

export class InstaparserValidationError extends InstaparserAPIError {
  constructor(message: string = 'Invalid request', statusCode?: number, response?: any) {
    super(message, statusCode, response);
    this.name = 'InstaparserValidationError';
    Object.setPrototypeOf(this, InstaparserValidationError.prototype);
  }
}

