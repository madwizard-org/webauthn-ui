import { WebAuthnUI, WebAuthnError } from '../src';
import * as fixtures from './fixtures';
import { mockWebAuthn, setCredentials } from './mock';
import { beforeEach, test, expect, jest } from '@jest/globals';

beforeEach(() => {
  setCredentials(undefined);
});

test('Get credential unsupported', async () => {
  await expect(
    WebAuthnUI.getCredential(fixtures.jsonRequestOptions),
  ).rejects.toThrow(new WebAuthnError('unsupported'));
});

test('Get credential DOM error', async () => {
  mockWebAuthn();
  setCredentials({
    get: jest.fn<CredentialsContainer['get']>().mockImplementation(() => {
      throw new DOMException('Security Error', 'SecurityError');
    }),
  });
  mockWebAuthn();
  await expect(
    WebAuthnUI.getCredential(fixtures.jsonRequestOptions),
  ).rejects.toThrow('WebAuthnUI error: dom-security');
});

test('Get credential', async () => {
  mockWebAuthn();
  const get = jest
    .fn<(options?: unknown) => Promise<Credential | null>>()
    .mockReturnValue(Promise.resolve(fixtures.rawRequestResponse));
  setCredentials({
    get,
  });
  mockWebAuthn();

  await expect(
    WebAuthnUI.getCredential(fixtures.jsonRequestOptions),
  ).resolves.toEqual(fixtures.jsonRequestResponse);
  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith({
    publicKey: { dummyRequestOptions: true },
  });
});
