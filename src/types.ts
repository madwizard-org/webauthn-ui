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
    userHandle: string|null;
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


