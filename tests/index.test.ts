import { WebAuthnUI } from '../src';

beforeEach(() => {
  (window as any).PublicKeyCredential = undefined;
});

function mockWebAuthn() {
  const pkc : any = () => {};
  (window as any).PublicKeyCredential = pkc;
  pkc.isUserVerifyingPlatformAuthenticatorAvailable = async (): Promise<boolean> => false;
}

test('WebAuthn unsupported', () => {
  expect(WebAuthnUI.isSupported()).toBe(false);
});

test('WebAuthn supported', () => {
  mockWebAuthn();

  expect(WebAuthnUI.isSupported()).toBe(true);
});

test('UVPA supported', async () => {
  mockWebAuthn();

  await expect(WebAuthnUI.isUVPASupported()).resolves.toBe(false);
});

test('Test setFeatureCssClasses', async () => {
  mockWebAuthn();

  document.body.innerHTML = '<div id="test" class="webauthn-detect"></div>';

  await WebAuthnUI.setFeatureCssClasses('#test');

  expect(document.querySelector('#test')!.classList.value).toBe('webauthn-detect webauthn-supported webauthn-uvpa-unsupported');
});
