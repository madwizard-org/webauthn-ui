import WebAuthnUI from '../src';
import * as fixtures from './fixtures';
import { WebAuthnError } from '../src/error';

beforeEach(() => {
  (navigator as any).credentials = undefined;
});

test('Get credential unsupported', async () => {
  await expect(WebAuthnUI.getCredential(fixtures.jsonRequestOptions)).rejects.toThrow(new WebAuthnError('unsupported'));
});

test('Get credential DOM error', async () => {
  (navigator as any).credentials = {
    get: jest.fn().mockImplementation(() => {
      throw new DOMException('Security Error', 'SecurityError');
    }),
  };
  (window as any).PublicKeyCredential = () => {};
  await expect(WebAuthnUI.getCredential(fixtures.jsonRequestOptions)).rejects.toThrow('WebAuthnUI error: dom-security');
});

test('Get credential', async () => {
  const get = jest.fn().mockReturnValue(Promise.resolve(fixtures.rawRequestResponse));
  (navigator as any).credentials = {
    get,
  };
  (window as any).PublicKeyCredential = () => {};

  await expect(WebAuthnUI.getCredential(fixtures.jsonRequestOptions)).resolves.toEqual(fixtures.jsonRequestResponse);
  expect(get).toBeCalledTimes(1);
  expect(get).toBeCalledWith({ publicKey: fixtures.rawRequestOptions });
});
