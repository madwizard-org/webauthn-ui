import * as base64 from './base64';

type BaseConfig = {
    featureSelector?: string;
    trigger?: 'domready' | 'load';
    delay?: number;
};

type PostConfig =  {
    formField?: string,
    postUnsupported?: boolean;
};

type CreateConfig = {
    type: 'create';
    request: JsonPublicKeyCredentialCreationOptions;
} & PostConfig & BaseConfig;

type GetConfig = {
    type: 'get';
    request : JsonPublicKeyCredentialRequestOptions;
} & PostConfig & BaseConfig;

type StaticConfig = {
    type: 'static';
} & BaseConfig;

export type WebAuthnUIConfig = CreateConfig | GetConfig | StaticConfig;


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

export interface JsonPublicKeyCredential<T extends JsonAuthenticatorResponse> {
    type: string;
    id: string;
    rawId: string;
    response: T;
}

export interface JsonPublicKeyCredentialRequestOptions {
    challenge: string;
    timeout?: number;
    rpId?: string;
    allowCredentials?: JsonPublicKeyCredentialDescriptor[];
    userVerification?: string;
    extensions?: any;
}

export interface JsonPublicKeyCredentialRpEntity {
    id?: string;
    name: string;
}

export interface JsonPublicKeyCredentialUserEntity {
    id: string;
    name: string;
    displayName: string;
    icon?: string;
}

export interface JsonPublicKeyCredentialParameters {
    type: "public-key";
    alg: number;
}

export interface JsonPublicKeyCredentialDescriptor {
    type: "public-key";
    id: string;
    transports?: Array<"usb" | "nfc" | "ble" | "internal">;  // TODO: in newer spec this is a string, not an enum.
}

export interface JsonAuthenticatorSelectionCriteria {
    authenticatorAttachment?: "platform" | "cross-platform";
    requireResidentKey?: boolean;
    userVerification?: "required" | "preferred" | "discouraged";
}

export interface JsonPublicKeyCredentialCreationOptions {
    rp: JsonPublicKeyCredentialRpEntity;
    user: JsonPublicKeyCredentialUserEntity;

    challenge: string;
    pubKeyCredParams: JsonPublicKeyCredentialParameters[];

    timeout?: number;
    excludeCredentials?: JsonPublicKeyCredentialDescriptor[];
    authenticatorSelection?: JsonAuthenticatorSelectionCriteria;
    attestation?: "none" | "indirect" | "direct";
    extensions?: any;
}


export class Converter
{

    private static copyProps<T>(dest : any, src : T, names: (keyof T)[])
    {
        let k: keyof T;

        for (k of names) {
            if (src[k] !== undefined) {
                dest[k] = src[k];
            }
        }
    }

    public static convertCreationOptions(options : JsonPublicKeyCredentialCreationOptions) : PublicKeyCredentialCreationOptions
    {
        let output : PublicKeyCredentialCreationOptions = {
            rp: options.rp,
            user: Converter.convertUser(options.user),
            challenge: base64.decode(options.challenge),
            pubKeyCredParams : options.pubKeyCredParams,
        };

        this.copyProps(output, options, ['timeout', 'authenticatorSelection', 'attestation']);

        if (options.excludeCredentials) {
            output.excludeCredentials = this.convertCredentialDescriptors(options.excludeCredentials);
        }

        // TODO options.extensions
        if (options.extensions) {
            throw new Error("Extensions not supported yet.");
        }
        return output;
    }

    public static convertRequestOptions(options : JsonPublicKeyCredentialRequestOptions ) : PublicKeyCredentialRequestOptions
    {
        let output : PublicKeyCredentialRequestOptions = {
            challenge: base64.decode(options.challenge)
        };

        this.copyProps(output, options, ['timeout', 'rpId', 'userVerification']);

        if (options.allowCredentials !== undefined) {
            output.allowCredentials = this.convertCredentialDescriptors(options.allowCredentials);
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

    public static convertAttestationPublicKeyCredential(pkc : PublicKeyCredential) : JsonPublicKeyCredential<JsonAuthenticatorAttestationResponse>
    {
        return {
            type: pkc.type,
            id : base64.encode(pkc.rawId),
            rawId : base64.encode(pkc.rawId),
            response: Converter.convertAttestationResponse(pkc.response as AuthenticatorAttestationResponse),
        };
    }

    public static convertAssertionPublicKeyCredential(pkc : PublicKeyCredential) : JsonPublicKeyCredential<JsonAuthenticatorAssertionResponse>
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
        return excludeCredentials.map((value) => {
            return Converter.convertCredentialDescriptor(value);
        });
    }

    private static convertUser(user: JsonPublicKeyCredentialUserEntity) : PublicKeyCredentialUserEntity
    {
        let convertedUser : PublicKeyCredentialUserEntity = {
            id: base64.decode(user.id),
            name: user.name,
            displayName: user.displayName,
        };
        if (user.icon !== undefined) {
            convertedUser.icon = user.icon;
        }
        return convertedUser;
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

// Note: dot not extend Error, this will break instanceof
// See https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
export class WebAuthnError
{
    public readonly name : string;
    public readonly innerError?: any;

    constructor(name : string, innerError?: any) {
        this.name = name;
        this.innerError = innerError;
    }

    public static fromError(error: any) : WebAuthnError {

        let type = 'unknown';
        if (error instanceof DOMException) {
            const map = {
                NotAllowedError: 'dom-not-allowed',
                SecurityError: 'dom-security',
                NotSupportedError: 'dom-not-supported',
                AbortError: 'dom-aborted',
                InvalidStateError: 'dom-invalid-state',
            };
            type = map[error.name] || 'dom-unknown';
        }
        return new WebAuthnError(type, error);
    }
}