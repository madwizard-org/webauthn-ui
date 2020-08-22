/*!
    webauthn-ui library

    MIT License

    Copyright (c) 2018 - 2020 Thomas Bleeker

 */
import {ready, loaded } from './ready';
import {
    JsonAuthenticatorAssertionResponse, JsonAuthenticatorAttestationResponse,
     JsonPublicKeyCredential,
    JsonPublicKeyCredentialCreationOptions,
    JsonPublicKeyCredentialRequestOptions
} from "./types";
import {WebAuthnError} from "./error";
import {Converter} from "./converter";

export default class WebAuthnUI
{
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

    public static async createCredential(options: JsonPublicKeyCredentialCreationOptions): Promise<JsonPublicKeyCredential<JsonAuthenticatorAttestationResponse>>
    {
        WebAuthnUI.checkSupport();
        let request : CredentialCreationOptions = {
            publicKey: Converter.convertCreationOptions(options)
        };

        let credential;
        try {
            credential = await navigator.credentials.create(request) as PublicKeyCredential;
        } catch(e) {
            throw WebAuthnError.fromError(e);
        }
        return Converter.convertAttestationPublicKeyCredential(credential);
    }

    public static async getCredential(options: JsonPublicKeyCredentialRequestOptions): Promise<JsonPublicKeyCredential<JsonAuthenticatorAssertionResponse>>
    {
        WebAuthnUI.checkSupport();
        let request : CredentialRequestOptions = {
            publicKey: Converter.convertRequestOptions(options)
        };
        let credential;
        try {
            credential = await navigator.credentials.get(request) as PublicKeyCredential;
        } catch(e) {
            throw WebAuthnError.fromError(e);
        }
        return Converter.convertAssertionPublicKeyCredential(credential);
    }

    public static async setFeatureCssClasses(selector: string|Element): Promise<void>
    {
        let items: NodeListOf<HTMLElement>|Element[];
        if (typeof selector === "string" ) {
            items = document.querySelectorAll(selector);
        } else {
            items = [selector];
        }
        let applyClass = (cls: string) => {
            for (let i = 0; i < items.length; i++) {
                items[i].classList.add(cls);
            }
        };
        applyClass('webauthn-' + (WebAuthnUI.isSupported() ? '' : 'un') + 'supported');
        return WebAuthnUI.isUVPASupported().then((available: boolean) => {
            applyClass('webauthn-uvpa-' + (available ? '' : 'un') + 'supported');
        });
    }
    //
    //
    // private async start() : Promise<ReturnTypeMap[T]>
    // {
    //     let c = this.config;
    //     try {
    //         await ready();
    //
    //         let isSupported : boolean = WebAuthnUI.isSupported();
    //
    //         let credential: PublicKeyCredential;
    //         let credentialJson : JsonPublicKeyCredential;
    //
    //         if (c.featureSelector) {
    //             let items = document.querySelectorAll(c.featureSelector);
    //             if (isSupported) {
    //                 for (let i = 0; i < items.length; i++) {
    //                     items[i].classList.add('webauthn-supported');
    //                 }
    //             } else {
    //                 for (let i = 0; i < items.length; i++) {
    //                     items[i].classList.add('webauthn-unsupported');
    //                 }
    //             }
    //
    //         }
    //
    //         if (!isSupported && c.postUnsupported) {
    //             throw new WebAuthnError("unsupported");
    //         }
    //
    //         if (this.config.trigger !== 'domready') {
    //             await loaded();
    //         }
    //
    //         if (c.type !== 'static' && this.config.delay !== undefined) {
    //             await new Promise((x) => setTimeout(x, this.config.delay));
    //         }
    //
    //         if (c.type === 'create') {
    //             if (c.request === undefined) {
    //                 throw new WebAuthnError("badrequest");
    //             }
    //
    //
    //         } else if (c.type === 'get') {
    //             if (c.request === undefined) {
    //                 throw new WebAuthnError("badrequest");
    //             }
    //
    //         } else if (c.type === 'static') {
    //             return null;
    //         } else {
    //             throw new WebAuthnError("badrequest");
    //         }
    //
    //         if (c.formField !== undefined) {
    //             let postData : any = {'status' : 'ok',  ...credentialJson};
    //             this.postForm(postData);
    //         }
    //         return credential;
    //     }
    //     catch(e)
    //     {
    //         if (c.formField !== undefined) {
    //             let postData : any = {'status' : 'failed'};
    //             if (e instanceof DOMException) {
    //                 const map = {
    //                     NotAllowedError : 'dom-not-allowed',
    //                     SecurityError : 'dom-security',
    //                     NotSupportedError : 'dom-not-supported',
    //                     AbortError : 'dom-aborted',
    //                     InvalidStateError : 'dom-invalid-state',
    //                 };
    //                 postData.errorName = (map[e.name] ? map[e.name] : 'dom-unknown');
    //                 postData.domErrorName = e.name;
    //             }
    //             else if (e instanceof WebAuthnError) {
    //                 postData.errorName = e.name;
    //             } else {
    //                 postData.errorName = 'unknown';
    //             }
    //             this.postForm(postData);
    //         } else {
    //             throw e;
    //         }
    //     }
    // }
    //
    // private postForm(data : any)
    // {
    //     let element = document.querySelector(this.config.formField);
    //     if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    //         throw new Error("formField is not an input element")
    //     }
    //
    //     element.value = JSON.stringify(data);
    //     if (element.form) {
    //         element.form.submit();
    //     }
    // }
    //
    //
    // public static async registerOnReady()
    // {
    //     await ready();
    //     let data = document.querySelectorAll("script[data-webauthn]");
    //
    //     if (!data) return;
    //
    //     let promises : Promise<any>[] = [];
    //     for (let i = 0; i < data.length; i++) {
    //         let el = data.item(i);
    //         let text = el.textContent;
    //         let config : WebAuthnUIConfig = <WebAuthnUIConfig>JSON.parse(text );
    //         promises.push(new WebAuthnUI(config).start());
    //     }
    //     await Promise.all(promises);
    // }
}

async function auto()
{
    await ready();
    document.querySelectorAll('.webauthn-detect').forEach(WebAuthnUI.setFeatureCssClasses);
    let data = document.querySelectorAll("script[data-webauthn]");
    if (data) {

    }
}

auto().catch(
        (e) => {
            if(console && console.error) {
                console.error(e);
            }
        }
    );

