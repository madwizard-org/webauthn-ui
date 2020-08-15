import {Converter} from '../../src/types';

import * as fixtures from '../fixtures';



test('Attestation mininal response converter', () => {

    let credential : PublicKeyCredential = {
        id: fixtures.urlCredentialId,
        type: 'public-key',
        rawId: fixtures.rawCredentialId,
        response: {
            clientDataJSON: fixtures.rawClientDataJson,
            authenticatorData: fixtures.rawAuthenticatorData,
            signature: fixtures.rawSignature,
            userHandle: null
        } as AuthenticatorAssertionResponse,
        getClientExtensionResults() {
            return {};
        }
    };

    let converted = {
        id: fixtures.urlCredentialId,
        type: 'public-key',
        rawId: fixtures.urlCredentialId,
        response: {
            clientDataJSON: fixtures.urlClientDataJson,
            authenticatorData: fixtures.urlAuthenticatorData,
            signature: fixtures.urlSignature,
            userHandle: null
        }
    }

    expect(Converter.convertAssertionPublicKeyCredential(credential)).toEqual(converted);


});



test('Attestation full response converter', () => {

    let credential : PublicKeyCredential = {
        id: fixtures.urlCredentialId,
        type: 'public-key',
        rawId: fixtures.rawCredentialId,
        response: {
            clientDataJSON: fixtures.rawClientDataJson,
            authenticatorData: fixtures.rawAuthenticatorData,
            signature: fixtures.rawSignature,
            userHandle: fixtures.rawUserId
        } as AuthenticatorAssertionResponse,
        getClientExtensionResults() {
            return {};
        }
    };

    let converted = {
        id: fixtures.urlCredentialId,
        type: 'public-key',
        rawId: fixtures.urlCredentialId,
        response: {
            clientDataJSON: fixtures.urlClientDataJson,
            authenticatorData: fixtures.urlAuthenticatorData,
            signature: fixtures.urlSignature,
            userHandle: fixtures.urlUserId
        }
    }

    expect(Converter.convertAssertionPublicKeyCredential(credential)).toEqual(converted);

});
