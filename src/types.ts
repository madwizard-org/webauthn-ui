import * as base64 from './base64';

export interface WebAuthnUIConfig
{
    formField?: string,
    type: 'create' | 'get';
    request : JsonPublicKeyCredentialCreationOptions|JsonPublicKeyCredentialRequestOptions;
}


// JSON variants of WebAuthn structures with binary buffers replaced by strings (base64url encoded).
// based on @types/webappsec-credential-management types

export interface JsonAuthenticatorResponse {
    clientDataJSON : string;
}

export interface JsonAuthenticatorAttestationResponse extends JsonAuthenticatorResponse {
    attestationObject: string;
}

export interface JsonAuthenticatorAssertionResponse extends JsonAuthenticatorResponse {
    authenticatorData: string;
    signature: string;
    userHandle: string;
}

export interface JsonPublicKeyCredential {
    type: string;
    id: string;
    rawId: string;
    response: JsonAuthenticatorResponse;
}

export interface JsonPublicKeyCredentialRequestOptions {
    challenge: string;
    timeout: number;
    rpId?: string;
    allowCredentials?: JsonPublicKeyCredentialDescriptor[];
    userVerification?: UserVerificationRequirement;
    extensions?: any;
}

export interface JsonPublicKeyCredentialRpEntity {
    id: string;
    name: string;
}

export interface JsonPublicKeyCredentialUserEntity {
    id: string;
    name: string;
    displayName: string;
}

export interface JsonPublicKeyCredentialParameters {
    type: PublicKeyCredentialType;
    alg: number;
}

export interface JsonPublicKeyCredentialDescriptor {
    type: PublicKeyCredentialType;
    id: string;
    transports?: AuthenticatorTransport[];
}

export interface JsonAuthenticatorSelectionCriteria {
    authenticatorAttachment?: AuthenticatorAttachment;
    requireResidentKey?: boolean;
    requireUserVerification?: UserVerificationRequirement;
}

export interface JsonPublicKeyCredentialCreationOptions {
    rp: JsonPublicKeyCredentialRpEntity;
    user: JsonPublicKeyCredentialUserEntity;

    challenge: string;
    pubKeyCredParams: JsonPublicKeyCredentialParameters[];

    timeout?: number;
    excludeCredentials?: JsonPublicKeyCredentialDescriptor[];
    authenticatorSelection?: JsonAuthenticatorSelectionCriteria;
    attestation?: AttestationConveyancePreference;
    extensions?: any;
}


export class Converter
{
    public static convertCreationOptions(options : JsonPublicKeyCredentialCreationOptions ) : PublicKeyCredentialCreationOptions
    {
        let output : PublicKeyCredentialCreationOptions = {
            rp: options.rp,
            user: Converter.convertUser(options.user),
            challenge: base64.decode(options.challenge),
            pubKeyCredParams : options.pubKeyCredParams,
        };

        if (options.timeout !== undefined) {
            output.timeout = options.timeout;
        }

        if (options.authenticatorSelection !== undefined) {
            output.authenticatorSelection = options.authenticatorSelection;
        }

        if (options.attestation !== undefined) {
            output.attestation = options.attestation;
        }
        // TODO options.extensions
        if (options.extensions) {
            throw new Error("Extensions not supported yet.");
        }

        if (options.excludeCredentials !== undefined) {
            output.excludeCredentials = Converter.convertCredentialDescriptors(options.excludeCredentials);
        }

        return output;
    }

    public static convertRequestOptions(options : JsonPublicKeyCredentialRequestOptions ) : PublicKeyCredentialRequestOptions
    {
        let output : PublicKeyCredentialRequestOptions = {
            challenge: base64.decode(options.challenge)
        };

        if (options.timeout !== undefined) {
            output.timeout = options.timeout;
        }

        if (options.rpId !== undefined) {
            output.rpId = options.rpId;
        }

        if (options.allowCredentials !== undefined) {
            output.allowCredentials = this.convertCredentialDescriptors(options.allowCredentials);
        }

        if (options.userVerification !== undefined) {
            output.userVerification = options.userVerification;
        }

        // TODO options.extensions
        if (options.extensions) {
            throw new Error("Extensions not supported yet.");
        }

        return output;
    }

    public static convertAttestationResponse(res : AuthenticatorAttestationResponse) : JsonAuthenticatorAttestationResponse
    {
       return  {
           clientDataJSON: base64.encode(res.clientDataJSON),
           attestationObject: base64.encode(res.attestationObject),
       };
    }

    public static convertAssertionResponse(res : AuthenticatorAssertionResponse) : JsonAuthenticatorAssertionResponse
    {
        return {
            clientDataJSON: base64.encode(res.clientDataJSON),
            authenticatorData: base64.encode(res.authenticatorData),
            signature: base64.encode(res.signature),
            userHandle: (res.userHandle === null ? null : base64.encode(res.userHandle)),
        };
    }

    public static convertAttestationPublicKeyCredential(pkc : PublicKeyCredential) : JsonPublicKeyCredential
    {
        return {
            type: pkc.type,
            id : base64.encode(pkc.rawId),
            rawId : base64.encode(pkc.rawId),
            response: Converter.convertAttestationResponse(pkc.response as AuthenticatorAttestationResponse),
        };
    }

    public static convertAssertionPublicKeyCredential(pkc : PublicKeyCredential) : JsonPublicKeyCredential
    {
        return {
            type: pkc.type,
            id : base64.encode(pkc.rawId),
            rawId : base64.encode(pkc.rawId),
            response: Converter.convertAssertionResponse(pkc.response as AuthenticatorAssertionResponse),
        };
    }

    private static convertCredentialDescriptors(excludeCredentials: JsonPublicKeyCredentialDescriptor[]) : PublicKeyCredentialDescriptor[]
    {
        let list = [];
        excludeCredentials.forEach((value) => {
            list.push(Converter.convertCredentialDescriptor(value));
        })
        return list;
    }

    private static convertUser(user: JsonPublicKeyCredentialUserEntity) : PublicKeyCredentialUserEntity
    {
        return {
            id: base64.decode(user.id),
            name: user.name,
            displayName: user.displayName,
        };
    }

    private static convertCredentialDescriptor(value: JsonPublicKeyCredentialDescriptor) : PublicKeyCredentialDescriptor
    {
        let desc : PublicKeyCredentialDescriptor = {
            type: value.type,
            id: base64.decode(value.id),
        };
        if (value.transports !== undefined) {
            desc.transports = value.transports;
        }
        return desc;
    }
}