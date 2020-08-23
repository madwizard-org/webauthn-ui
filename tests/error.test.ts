import { WebAuthnError} from "../src/error";


test("WebAuthnEror", () => {
    expect(new WebAuthnError('unsupported')).toHaveProperty('name', 'unsupported');
    let inner = new DOMException('Not allowed', 'NotAllowedError');
    let domError = WebAuthnError.fromError(inner);
    expect(domError).toHaveProperty('name', 'dom-not-allowed');
    expect(domError.innerError).toBe(inner);
});


test("Check instanceof", () => {
    // Because of:
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
    let error = new WebAuthnError('parse-error');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(WebAuthnError);
})