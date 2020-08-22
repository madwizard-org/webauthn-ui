export class WebAuthnError extends Error {
    public readonly innerError?: any;

    constructor(name: string, message?: string, innerError?: any) {
        super(message || `WebAuthnUI error: ${name}`); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = name;
        this.innerError = innerError;
    }

    public static fromError(error: any): WebAuthnError {

        let type = 'unknown';
        let message = 'WebAuthnUI error: ';
        if (error instanceof DOMException) {
            const map = {
                NotAllowedError: 'dom-not-allowed',
                SecurityError: 'dom-security',
                NotSupportedError: 'dom-not-supported',
                AbortError: 'dom-aborted',
                InvalidStateError: 'dom-invalid-state',
            };
            type = map[error.name as keyof typeof map] || 'dom-unknown';
            message += type;
        } else {
            message += `unknown (${error.toString()})`;
        }

        return new WebAuthnError(type, message, error);
    }
}