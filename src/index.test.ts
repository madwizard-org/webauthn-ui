import WebAuthnUI from "./index";

beforeEach(() => {
    (window as any).PublicKeyCredential = undefined;
});

function mockWebAuthn()
{
    (window as any).PublicKeyCredential = function () {

    }
}


test('WebAuthn unsupported', () => {

    expect(WebAuthnUI.isSupported()).toBe(false);
});

test('WebAuthn supported', () => {
    mockWebAuthn();

    expect(WebAuthnUI.isSupported()).toBe(true);
});
