import WebAuthnUI from '../src';
import * as fixtures from './fixtures';

beforeEach(() => {
  (navigator as any).credentials = undefined;
});

test('Create credential unsupported', async () => {
  await expect(WebAuthnUI.createCredential(fixtures.jsonCreateOptions)).rejects.toThrow('unsupported');
});

test('Create credential DOM error', async () => {
  (navigator as any).credentials = {
    create: jest.fn().mockImplementation(() => {
      throw new DOMException('Security Error', 'SecurityError');
    }),
  };
  (window as any).PublicKeyCredential = () => {};
  await expect(WebAuthnUI.createCredential(fixtures.jsonCreateOptions)).rejects.toThrow('WebAuthnUI error: dom-security');
});

test('Create credential', async () => {
  const create = jest.fn().mockReturnValue(Promise.resolve(fixtures.rawCreateResponse));
  (navigator as any).credentials = {
    create,
  };
  (window as any).PublicKeyCredential = () => {};

  await expect(WebAuthnUI.createCredential(fixtures.jsonCreateOptions)).resolves.toEqual(fixtures.jsonCreateResponse);
  expect(create).toBeCalledTimes(1);
  expect(create).toBeCalledWith({ publicKey: fixtures.rawCreateOptions });
});
