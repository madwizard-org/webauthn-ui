import * as fixtures from '../fixtures';
import Converter from '../../src/converter';

test('Assertion mininal response converter', () => {
  const credential : PublicKeyCredential = {
    id: fixtures.urlCredentialId,
    type: 'public-key',
    rawId: fixtures.rawCredentialId,
    response: {
      clientDataJSON: fixtures.rawClientDataJson,
      authenticatorData: fixtures.rawAuthenticatorData,
      signature: fixtures.rawSignature,
      userHandle: null,
    } as AuthenticatorAssertionResponse,
    getClientExtensionResults() {
      return {};
    },
  };

  const converted = {
    id: fixtures.urlCredentialId,
    type: 'public-key',
    rawId: fixtures.urlCredentialId,
    response: {
      clientDataJSON: fixtures.urlClientDataJson,
      authenticatorData: fixtures.urlAuthenticatorData,
      signature: fixtures.urlSignature,
      userHandle: null,
    },
  };

  expect(Converter.convertRequestResponse(credential)).toEqual(converted);
});

test('Assertion full response converter', () => {
  const credential : PublicKeyCredential = {
    id: fixtures.urlCredentialId,
    type: 'public-key',
    rawId: fixtures.rawCredentialId,
    response: {
      clientDataJSON: fixtures.rawClientDataJson,
      authenticatorData: fixtures.rawAuthenticatorData,
      signature: fixtures.rawSignature,
      userHandle: fixtures.rawUserId,
    } as AuthenticatorAssertionResponse,
    getClientExtensionResults() {
      return {
        appid: true,
      };
    },
  };

  const converted = {
    id: fixtures.urlCredentialId,
    type: 'public-key',
    rawId: fixtures.urlCredentialId,
    response: {
      clientDataJSON: fixtures.urlClientDataJson,
      authenticatorData: fixtures.urlAuthenticatorData,
      signature: fixtures.urlSignature,
      userHandle: fixtures.urlUserId,
    },
    clientExtensionResults: {
      appid: true,
    },
  };

  expect(Converter.convertRequestResponse(credential)).toEqual(converted);
});
