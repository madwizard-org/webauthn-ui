export type ErrorType =
    'unknown' |
    'unsupported' |
    'parse-error' |
    'bad-config' |
    'dom-not-allowed' |
    'dom-security' |
    'dom-not-supported' |
    'dom-abort' |
    'dom-invalid-state' |
    'dom-constraint' |
    'dom-not-readable' |
    'dom-timeout' |
    'dom-unknown';

export class WebAuthnError extends Error {
  public readonly innerError?: Error;

  public readonly name: ErrorType;

  constructor(name: ErrorType, message?: string, innerError?: Error) {
    super(`WebAuthnUI error: ${message !== undefined ? message : name}`); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.name = name;
    this.innerError = innerError;
  }

  public static fromError(error: unknown): WebAuthnError {
    let type : ErrorType = 'unknown';
    let message;
    if (error instanceof DOMException) {
      const map : { [key : string]: ErrorType } = {
       NotAllowedError: 'dom-not-allowed',
        SecurityError: 'dom-security',
        NotSupportedError: 'dom-not-supported',
        AbortError: 'dom-abort',
        InvalidStateError: 'dom-invalid-state',
        ConstraintError: 'dom-constraint',
        NotReadableError: 'dom-not-readable',
        UnknownError: 'dom-unknown',
        TimeoutError: 'dom-timeout',

      };
      type = map[error.name as keyof typeof map] || 'dom-unknown';
      message = type;
    } else {
      message = `unknown (${String(error)})`;
    }

    return new WebAuthnError(type, message, error instanceof Error ? error : undefined);
  }
}
