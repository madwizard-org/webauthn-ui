/*!
    webauthn-ui library

    MIT License

    Copyright (c) 2018 Thomas Bleeker

 */
import {ready, loaded } from './ready';
import {
    Converter,
    JsonAuthenticatorResponse,
    JsonPublicKeyCredential,
    JsonPublicKeyCredentialCreationOptions,
    JsonPublicKeyCredentialRequestOptions, 
    WebAuthnError,
    WebAuthnUIConfig
} from "./types";

class WebAuthnUI
{
    private static supported : boolean;
    private config: WebAuthnUIConfig;
    constructor(config : WebAuthnUIConfig)
    {
        this.config = config;
    }

    public static isSupported() : boolean
    {
        if (this.supported === undefined) {
            this.supported = typeof window['PublicKeyCredential'] !== 'undefined';
        }
        return this.supported;
    }

    private static async isUserVerifyingPlatformAuthenticatorSupported() : Promise<boolean>
    {
        return this.isSupported() && await window['PublicKeyCredential'].isUserVerifyingPlatformAuthenticatorAvailable();
    }

    private async start() : Promise<any>
    {
        let c = this.config;
        try {
            await ready();

            let isSupported : boolean = WebAuthnUI.isSupported();

            let credential: PublicKeyCredential;
            let credentialJson : JsonPublicKeyCredential;

            if (c.featureSelector) {
                let items = document.querySelectorAll(c.featureSelector);
                if (isSupported) {
                    for (let i = 0; i < items.length; i++) {
                        items[i].classList.add('webauthn-supported');
                    }
                } else {
                    for (let i = 0; i < items.length; i++) {
                        items[i].classList.add('webauthn-unsupported');
                    }
                }
                WebAuthnUI.isUserVerifyingPlatformAuthenticatorSupported().then((available: boolean) => {
                    for (let i = 0; i < items.length; i++) {
                        items[i].classList.add(available ? 'webauthn-uvpa-suppported' : 'webauthn-uvpa-unsupported');
                    }
                });
            }

            if (!isSupported && c.postUnsupported) {
                throw new WebAuthnError("unsupported");
            }

            if (this.config.trigger !== 'domready') {
                await loaded();
            }

            if (c.type === 'create') {
                if (c.request === undefined) {
                    throw new WebAuthnError("badrequest");
                }
                let request : CredentialCreationOptions = {
                    publicKey: Converter.convertCreationOptions(<JsonPublicKeyCredentialCreationOptions>c.request)
                };
                credential = <PublicKeyCredential>await navigator.credentials.create(request);
                credentialJson = Converter.convertAttestationPublicKeyCredential(credential);

            } else if (c.type === 'get') {
                if (c.request === undefined) {
                    throw new WebAuthnError("badrequest");
                }
                let request : CredentialRequestOptions = {
                    publicKey: Converter.convertRequestOptions(<JsonPublicKeyCredentialRequestOptions>c.request)
                };
                credential = <PublicKeyCredential>await navigator.credentials.get(request);
                credentialJson = Converter.convertAssertionPublicKeyCredential(credential);
            } else if (c.type === 'static') {
                return null;
            } else {
                throw new WebAuthnError("badrequest");
            }

            if (c.formField !== undefined) {
                let postData : any = {'status' : 'ok',  ...credentialJson};
                this.postForm(postData);
            }
            return credential;
        }
        catch(e)
        {
            if (c.formField !== undefined) {
                let postData : any = {'status' : 'failed'};
                if (e instanceof DOMException) {
                    const map = {
                        NotAllowedError : 'dom-not-allowed',
                        SecurityError : 'dom-security',
                        NotSupportedError : 'dom-not-supported',
                        AbortError : 'dom-aborted',
                        InvalidStateError : 'dom-invalid-state',
                    };
                    postData.errorName = (map[e.name] ? map[e.name] : 'dom-unknown');
                    postData.domErrorName = e.name;
                }
                else if (e instanceof WebAuthnError) {
                    postData.errorName = e.name;
                } else {
                    postData.errorName = 'unknown';
                }
                this.postForm(postData);
            } else {
                throw e;
            }
        }
    }

    private postForm(data : any)
    {
        let element = document.querySelector(this.config.formField);
        if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
            throw new Error("formField is not an input element")
        }

        element.value = JSON.stringify(data);
        if (element.form) {
            element.form.submit();
        }
    }


    public static async registerOnReady()
    {
        await ready();
        let data = document.querySelectorAll("script[data-webauthn]");

        if (!data) return;

        let promises : Promise<any>[] = [];
        for (let i = 0; i < data.length; i++) {
            let el = data.item(i);
            let text = el.textContent;
            let config : WebAuthnUIConfig = <WebAuthnUIConfig>JSON.parse(text );
            promises.push(new WebAuthnUI(config).start());
        }
        await Promise.all(promises);
    }
}

WebAuthnUI
    .registerOnReady()
    .catch(
        (e) => {
            if(console && console.error) {
                console.error(e);
            }
        }
    );

export default WebAuthnUI;
