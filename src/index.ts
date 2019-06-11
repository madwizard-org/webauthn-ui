/*!
    webauthn-ui library

    MIT License

    Copyright (c) 2018 Thomas Bleeker

 */
import {ready} from './ready';
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
        this.config = Object.assign(
            {
                postUnsupported: false,
            },
            config
        );
    }

    public static isSupported() : boolean
    {
        if (this.supported === undefined) {
            this.supported = typeof window['PublicKeyCredential'] !== 'undefined';
        }
        return this.supported;
    }

    public async start() : Promise<PublicKeyCredential>
    {
        let c = this.config;
        try {
            await ready();

            if (!WebAuthnUI.isSupported() && c.postUnsupported) {
                throw new WebAuthnError("unsupported");
            }  // TODO: else
            if (c.request === undefined) {
                throw new WebAuthnError("badrequest");
            }

            let credential: PublicKeyCredential;
            let credentialJson : JsonPublicKeyCredential;

            if (c.type === 'create') {
                let request : CredentialCreationOptions = {
                    publicKey: Converter.convertCreationOptions(<JsonPublicKeyCredentialCreationOptions>c.request)
                };
                credential = <PublicKeyCredential>await navigator.credentials.create(request);
                credentialJson = Converter.convertAttestationPublicKeyCredential(credential);

            } else if (c.type === 'get') {
                let request : CredentialRequestOptions = {
                    publicKey: Converter.convertRequestOptions(<JsonPublicKeyCredentialRequestOptions>c.request)
                };
                credential = <PublicKeyCredential>await navigator.credentials.get(request);
                credentialJson = Converter.convertAssertionPublicKeyCredential(credential);
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
                    postData.errorName = e.name;
                }
                if (e instanceof WebAuthnError) {
                    postData.errorName = e.message;
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

        for (let i = 0; i < data.length; i++) {
            let el = data.item(i);
            let text = el.textContent;

            let config : WebAuthnUIConfig = <WebAuthnUIConfig>JSON.parse(text );

            new WebAuthnUI(config).start();
        }
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
