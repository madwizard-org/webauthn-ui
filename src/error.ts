
export enum ErrorType
{
    Unknown = "unknown",
    Unsupported = "unsupported",
    ParseError = "parseerror",
    BadConfig = "badconfig",
    DomNotAllowed = 'dom-not-allowed',
    DomSecurity = 'dom-security',
    DomNotSupported = 'dom-not-supported',
    DomAbort = 'dom-abort',
    DomInvalidState = 'dom-invalid-state',
    DomUnknown = 'dom-unknown',
};



export class WebAuthnError extends Error {
    public readonly innerError?: Error;
    public readonly name: ErrorType;

    constructor(name: ErrorType, message?: string, innerError?: Error) {
        super( `WebAuthnUI error: ${message !== undefined ? message : name}`); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = name;
        this.innerError = innerError;
    }

    public static fromError(error: any): WebAuthnError {

        let type : ErrorType = ErrorType.Unknown;
        let message = 'WebAuthnUI error: ';
        if (error instanceof DOMException) {
            const map = {
                NotAllowedError: ErrorType.DomNotAllowed,
                SecurityError: ErrorType.DomSecurity,
                NotSupportedError: ErrorType.DomNotSupported,
                AbortError: ErrorType.DomAbort,
                InvalidStateError: ErrorType.DomInvalidState,
            };
            type = map[error.name as keyof typeof map] || ErrorType.DomUnknown;
            message += type;
        } else {
            message += `unknown (${error.toString()})`;
        }

        return new WebAuthnError(type, message, error instanceof Error ? error : undefined);
    }
}