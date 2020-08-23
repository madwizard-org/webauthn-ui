import WebAuthnUI from "../src";
import * as fixtures from "./fixtures";
import type {
    JsonAuthenticatorAssertionResponse,
    JsonPublicKeyCredential,
    JsonPublicKeyCredentialCreationOptions,
    JsonPublicKeyCredentialRequestOptions,
} from "../src/types";
import {ErrorType, WebAuthnError} from "../src/error";

beforeEach(() => {
    (navigator as any).credentials = undefined;
});

const options : JsonPublicKeyCredentialCreationOptions= {
    rp: {
        name: "WebAuthn demo"
    },
    user: {
        name: "freddy",
        id: fixtures.urlUserId,
        displayName: "Freddy fruitcake"
    },
    challenge: fixtures.urlChallenge,
    pubKeyCredParams: [
        {
            "type": "public-key",
            "alg": -7
        }
    ]
};

test("Get credential unsupported", async () =>
{
    await expect(WebAuthnUI.getCredential(options)).rejects.toThrow(new WebAuthnError(ErrorType.Unsupported));
});

test("Get credential DOM error", async () =>
{
    (navigator as any).credentials = {
        get: jest.fn().mockImplementation(() => {
            throw new DOMException("Security Error", "SecurityError");
        })
    };
    (window as any).PublicKeyCredential = function () {}
    await expect(WebAuthnUI.getCredential(options)).rejects.toThrow('WebAuthnUI error: dom-security');
});



const jsonRequestOptions : JsonPublicKeyCredentialRequestOptions = {
    challenge: fixtures.urlChallenge
};

const rawRequestOptions : PublicKeyCredentialRequestOptions = {
    challenge: fixtures.rawChallenge
};

const jsonRequestResponse : JsonPublicKeyCredential<JsonAuthenticatorAssertionResponse>= {
    id: fixtures.urlCredentialId,
    type: 'public-key',
    rawId: fixtures.urlCredentialId,
    response: {
        clientDataJSON: fixtures.urlClientDataJson,
        authenticatorData: fixtures.urlAuthenticatorData,
        signature: fixtures.urlSignature,
        userHandle: null
    }
};

const rawRequestResponse : PublicKeyCredential = {
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



test("Get credential", async () => {
    const get = jest.fn().mockReturnValue(Promise.resolve(rawRequestResponse));
    (navigator as any).credentials = {
        get
    };
    (window as any).PublicKeyCredential = function () {}

    await expect(WebAuthnUI.getCredential(jsonRequestOptions)).resolves.toEqual(jsonRequestResponse);
    expect(get).toBeCalledTimes(1);
    expect(get).toBeCalledWith({ publicKey: rawRequestOptions });
});

