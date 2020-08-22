import WebAuthnUI from "../src";
import * as fixtures from "./fixtures";
import type {
    JsonAuthenticatorAttestationResponse,
    JsonPublicKeyCredential,
    JsonPublicKeyCredentialCreationOptions,

} from "../src/types";
import {WebAuthnError} from "../src/error";

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

test("Create credential unsupported", async () =>
{
    await expect(WebAuthnUI.createCredential(options)).rejects.toThrow('unsupported');
});



test("Create credential DOM error", async () =>
{
    (navigator as any).credentials = {
        create: jest.fn().mockImplementation(() => {
            throw new DOMException("Security Error", "SecurityError");
        })
    };
    (window as any).PublicKeyCredential = function () {}
    await expect(WebAuthnUI.createCredential(options)).rejects.toThrow('WebAuthnUI error: dom-security');
});



const jsonCreateOptions : JsonPublicKeyCredentialCreationOptions = {
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

const rawCreateOptions : PublicKeyCredentialCreationOptions = {
    rp: {
        "name": "WebAuthn demo"
    },
    user: {
        name: "freddy",
        "id": fixtures.rawUserId,
        "displayName": "Freddy fruitcake"
    },
    challenge: fixtures.rawChallenge,
    pubKeyCredParams: [
        {
            "type": "public-key",
            "alg": -7
        }
    ]
};

const jsonCreateResponse : JsonPublicKeyCredential<JsonAuthenticatorAttestationResponse>= {
    id: fixtures.urlCredentialId,
    type: 'public-key',
    rawId: fixtures.urlCredentialId,
    response: {
        clientDataJSON: fixtures.urlClientDataJson,
        attestationObject: fixtures.urlAttestationObject
    }
};


const rawCreateResponse : PublicKeyCredential= {
    id: fixtures.urlCredentialId,
    type: 'public-key',
    rawId: fixtures.rawCredentialId,
    response: {
        clientDataJSON: fixtures.rawClientDataJson,
        attestationObject: fixtures.rawAttestationObject
    } as AuthenticatorAttestationResponse,
    getClientExtensionResults() {
        return {};
    }
};


test("Create credential", async () => {
    const create = jest.fn().mockReturnValue(Promise.resolve(rawCreateResponse));
    (navigator as any).credentials = {
        create
    };
    (window as any).PublicKeyCredential = function () {}

    await expect(WebAuthnUI.createCredential(jsonCreateOptions)).resolves.toEqual(jsonCreateResponse);
    expect(create).toBeCalledTimes(1);
    expect(create).toBeCalledWith({ publicKey: rawCreateOptions });
});

