/*!
    webauthn-ui library

    MIT License

    Copyright (c) 2018 - 2020 Thomas Bleeker

 */
import {loaded, ready} from './ready';

import type {
    AutoConfig,
    Config, FailureResponse,
    JsonAssertionPublicKeyCredential,
    JsonAttestationPublicKeyCredential,
    JsonPublicKeyCredentialCreationOptions,
    JsonPublicKeyCredentialRequestOptions,
    StatusResponse,
    SuccessResponse
} from "./types";

import {WebAuthnError} from "./error";
import {Converter} from "./converter";

export default class WebAuthnUI
{
    public static autoPromise : Promise<void>;

    public static isSupported() : boolean
    {
        return typeof window['PublicKeyCredential'] !== 'undefined';
    }

    public static async isUVPASupported() : Promise<boolean>
    {
        return this.isSupported() && await window['PublicKeyCredential'].isUserVerifyingPlatformAuthenticatorAvailable();
    }

    private static checkSupport()
    {
        if (!WebAuthnUI.isSupported()) {
            throw new WebAuthnError('unsupported');
        }
    }

    public static async createCredential(options: JsonPublicKeyCredentialCreationOptions): Promise<JsonAttestationPublicKeyCredential>
    {
        WebAuthnUI.checkSupport();
        const request : CredentialCreationOptions = {
            publicKey: Converter.convertCreationOptions(options)
        };

        let credential;
        try {
            credential = await navigator.credentials.create(request) as PublicKeyCredential;
        } catch(e) {
            throw WebAuthnError.fromError(e);
        }
        return Converter.convertCreationResponse(credential);
    }

    public static async getCredential(options: JsonPublicKeyCredentialRequestOptions): Promise<JsonAssertionPublicKeyCredential>
    {
        WebAuthnUI.checkSupport();
        const request : CredentialRequestOptions = {
            publicKey: Converter.convertRequestOptions(options)
        };
        let credential;
        try {
            credential = await navigator.credentials.get(request) as PublicKeyCredential;
        } catch(e) {
            throw WebAuthnError.fromError(e);
        }
        return Converter.convertRequestResponse(credential);
    }

    public static async setFeatureCssClasses(selector: string|Element): Promise<void>
    {
        let items: NodeListOf<HTMLElement>|Element[];
        if (typeof selector === "string" ) {
            items = document.querySelectorAll(selector);
        } else {
            items = [selector];
        }
        const applyClass = (cls: string) => {
            for (let i = 0; i < items.length; i++) {
                items[i].classList.add(cls);
            }
        };
        applyClass('webauthn-' + (WebAuthnUI.isSupported() ? '' : 'un') + 'supported');
        return WebAuthnUI.isUVPASupported().then((available: boolean) => {
            applyClass('webauthn-uvpa-' + (available ? '' : 'un') + 'supported');
        });
    }

    private static async waitConfig(config : Config): Promise<void>
    {
        await ready();
        if (config.trigger !== 'domready') {
            await loaded();
        }
        if (config.delay !== undefined) {
            await new Promise((x) => setTimeout(x, config.delay));
        }
    }

    private static async runConfig(config: Config): Promise<SuccessResponse>
    {
        await this.waitConfig(config);

        let credential : JsonAttestationPublicKeyCredential|JsonAssertionPublicKeyCredential;

        if (config.type === 'get') {
            credential = await this.getCredential(config.request);
        } else if (config.type === 'create') {
            credential = await this.createCredential(config.request);
        } else {
            throw new WebAuthnError('bad-config', `Invalid config.type ${(config as any).type}`);
        }

        return {
            status: 'ok',
            credential
        };
    }

    public static async startConfig(config : Config): Promise<SuccessResponse> {
        let response: SuccessResponse;
        try {
            response = await this.runConfig(config);
        } catch (e) {
            throw {
                status: 'failed',
                error: (e instanceof WebAuthnError ? e : WebAuthnError.fromError(e)).name
            }
        }
        return response;
    }

    private static async runAutoConfig(config : AutoConfig): Promise<StatusResponse|null>
    {
        if (!this.isSupported() && config.postUnsupported === false) {
            return null;
        }

        let field = config.formField;
        if (typeof field === 'string') {
            const el = document.querySelector(field);
            if (el === null) {
                throw new WebAuthnError('bad-config', 'Could not find formField.')
            }
            field = el as HTMLTextAreaElement|HTMLInputElement;
        }

        if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
            throw new WebAuthnError('bad-config', 'formField does not refer to an input element.')
        }

        let response : StatusResponse;

        try {
            response = await this.startConfig(config);
        } catch(e) {
            response = e as FailureResponse;
        }
        field.value = JSON.stringify(response);
        if (config.submitForm !== false && field.form) {
            field.form.submit();
        }
        return response;
    }

    public static async autoConfig(): Promise<void> {
        const promises: Promise<StatusResponse|null>[] = [];
        const list = document.querySelectorAll("input[data-webauthn],textarea[data-webauthn],script[data-webauthn]");
        for (let i = 0; i < list.length; i++) {
            const el = list[i];
            const isScript = el.tagName === 'SCRIPT';
            if (isScript && (el as HTMLScriptElement).type !== 'application/json') {
                throw new WebAuthnError('bad-config', 'Expecting application/json script with data-webauthn');
            }
            const rawJson: string | null = isScript ? el.textContent : (el).getAttribute('data-webauthn');
            if (rawJson === null) {
                throw new WebAuthnError('bad-config', 'Missing JSON in data-webauthn');
            }
            const json = JSON.parse(rawJson) as AutoConfig;
            if (!json) {
                throw new WebAuthnError('bad-config', 'invalid JSON in data-webauthn on element');
            }
            if (!isScript && json.formField === undefined) {
                json.formField = el as HTMLInputElement | HTMLTextAreaElement;
            }
            promises.push(this.runAutoConfig(json));
        }

        await Promise.all(promises);
    }
}

async function auto()
{
    await ready();
    const list = document.querySelectorAll('.webauthn-detect');
    for (let i = 0; i < list.length; i++) {
        WebAuthnUI.setFeatureCssClasses(list[i]);
    }
    await WebAuthnUI.autoConfig();

}

WebAuthnUI.autoPromise = auto().catch(
    (e) => {
        if(console && console.error) {
            console.error(e);
        }
    }
);

