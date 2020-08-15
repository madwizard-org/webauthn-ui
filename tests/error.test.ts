import {WebAuthnError} from "../src/types";


test("WebAuthnEror", () => {
    expect(new WebAuthnError("unsupported")).toHaveProperty('name', 'unsupported');
    let inner = new DOMException('Not allowed', 'NotAllowedError');
    let domError = WebAuthnError.fromError(inner);
    expect(domError).toHaveProperty('name', 'dom-not-allowed');
    expect(domError.innerError).toBe(inner);
});