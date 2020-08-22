import * as base64 from "./base64";
import {
    JsonAuthenticatorAssertionResponse,
    JsonAuthenticatorAttestationResponse,
    JsonPublicKeyCredential,
    JsonPublicKeyCredentialCreationOptions,
    JsonPublicKeyCredentialDescriptor,
    JsonPublicKeyCredentialRequestOptions,
    JsonPublicKeyCredentialUserEntity
} from "./types";

export class Converter {

    private static copyProps<T>(dest: any, src: T, names: (keyof T)[]) {
        let k: keyof T;

        for (k of names) {
            if (src[k] !== undefined) {
                dest[k] = src[k];
            }
        }
    }

    public static convertCreationOptions(options: JsonPublicKeyCredentialCreationOptions): PublicKeyCredentialCreationOptions {
        let output: PublicKeyCredentialCreationOptions = {
            rp: options.rp,
            user: Converter.convertUser(options.user),
            challenge: base64.decode(options.challenge),
            pubKeyCredParams: options.pubKeyCredParams,
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

    public static convertRequestOptions(options: JsonPublicKeyCredentialRequestOptions): PublicKeyCredentialRequestOptions {
        let output: PublicKeyCredentialRequestOptions = {
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

    public static convertAttestationResponse(res: AuthenticatorAttestationResponse): JsonAuthenticatorAttestationResponse {
        return {
            clientDataJSON: base64.encode(res.clientDataJSON),
            attestationObject: base64.encode(res.attestationObject),
        };
    }

    public static convertAssertionResponse(res: AuthenticatorAssertionResponse): JsonAuthenticatorAssertionResponse {
        return {
            clientDataJSON: base64.encode(res.clientDataJSON),
            authenticatorData: base64.encode(res.authenticatorData),
            signature: base64.encode(res.signature),
            userHandle: (res.userHandle === null ? null : base64.encode(res.userHandle)),
        };
    }

    public static convertAttestationPublicKeyCredential(pkc: PublicKeyCredential): JsonPublicKeyCredential<JsonAuthenticatorAttestationResponse> {
        return {
            type: pkc.type,
            id: base64.encode(pkc.rawId),
            rawId: base64.encode(pkc.rawId),
            response: Converter.convertAttestationResponse(pkc.response as AuthenticatorAttestationResponse),
        };
    }

    public static convertAssertionPublicKeyCredential(pkc: PublicKeyCredential): JsonPublicKeyCredential<JsonAuthenticatorAssertionResponse> {
        return {
            type: pkc.type,
            id: base64.encode(pkc.rawId),
            rawId: base64.encode(pkc.rawId),
            response: Converter.convertAssertionResponse(pkc.response as AuthenticatorAssertionResponse),
        };
    }

    private static convertCredentialDescriptors(excludeCredentials: JsonPublicKeyCredentialDescriptor[]): PublicKeyCredentialDescriptor[] {
        return excludeCredentials.map((value) => {
            return Converter.convertCredentialDescriptor(value);
        });
    }

    private static convertUser(user: JsonPublicKeyCredentialUserEntity): PublicKeyCredentialUserEntity {
        let convertedUser: PublicKeyCredentialUserEntity = {
            id: base64.decode(user.id),
            name: user.name,
            displayName: user.displayName,
        };
        if (user.icon !== undefined) {
            convertedUser.icon = user.icon;
        }
        return convertedUser;
    }

    private static convertCredentialDescriptor(value: JsonPublicKeyCredentialDescriptor): PublicKeyCredentialDescriptor {
        let desc: PublicKeyCredentialDescriptor = {
            type: value.type,
            id: base64.decode(value.id),
        };
        if (value.transports !== undefined) {
            desc.transports = value.transports;
        }
        return desc;
    }
}