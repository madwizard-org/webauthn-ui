/*!
    webauthn-ui library

    MIT License

    Copyright (c) 2018 - 2020 Thomas Bleeker

 */
import { loaded, ready } from './ready';

import type {
  AutoConfig,
  Config, FailureResponse,
  JsonAssertionPublicKeyCredential,
  JsonAttestationPublicKeyCredential,
  JsonPublicKeyCredentialCreationOptions,
  JsonPublicKeyCredentialRequestOptions,
  StatusResponse,
  SuccessResponse,
} from './types';

import { WebAuthnError } from './error';
import Converter from './converter';

export { WebAuthnError };

export const loadEvents = { loaded, ready };

type ElementList = NodeListOf<HTMLElement>|Element[];

function elementSelector(selector : string|Element): ElementList {
  let items: NodeListOf<HTMLElement>|Element[];
  if (typeof selector === 'string') {
    items = document.querySelectorAll(selector);
  } else {
    items = [selector];
  }
  return items;
}

export class WebAuthnUI {
  private static inProgress = false;

  public static isSupported() : boolean {
    return typeof window.PublicKeyCredential !== 'undefined';
  }

  public static async isUVPASupported() : Promise<boolean> {
    if (this.isSupported()) {
      return window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return false;
  }

  private static checkSupport() {
    if (!WebAuthnUI.isSupported()) {
      throw new WebAuthnError('unsupported');
    }
  }

  public static async createCredential(options: JsonPublicKeyCredentialCreationOptions): Promise<JsonAttestationPublicKeyCredential> {
    WebAuthnUI.checkSupport();
    const request : CredentialCreationOptions = {
      publicKey: Converter.convertCreationOptions(options),
    };

    let credential;
    try {
      credential = await navigator.credentials.create(request) as PublicKeyCredential;
    } catch (e) {
      throw WebAuthnError.fromError(e);
    }
    return Converter.convertCreationResponse(credential);
  }

  public static async getCredential(options: JsonPublicKeyCredentialRequestOptions): Promise<JsonAssertionPublicKeyCredential> {
    WebAuthnUI.checkSupport();
    const request : CredentialRequestOptions = {
      publicKey: Converter.convertRequestOptions(options),
    };
    let credential;
    try {
      credential = await navigator.credentials.get(request) as PublicKeyCredential;
    } catch (e) {
      throw WebAuthnError.fromError(e);
    }
    return Converter.convertRequestResponse(credential);
  }

  public static async setFeatureCssClasses(selector: string|Element): Promise<void> {
    const items = elementSelector(selector);
    const applyClass = (cls: string) => {
      for (let i = 0; i < items.length; i++) {
        items[i].classList.add(cls);
      }
    };
    applyClass(`webauthn-${WebAuthnUI.isSupported() ? '' : 'un'}supported`);
    return WebAuthnUI.isUVPASupported().then((available: boolean) => {
      applyClass(`webauthn-uvpa-${available ? '' : 'un'}supported`);
    });
  }

  private static async loadConfig(config : AutoConfig): Promise<StatusResponse> {
    // Wait for DOM ready
    await ready();
    let field = config.formField;
    if (typeof field === 'string') {
      const el = document.querySelector(field);
      if (el === null) {
        throw new WebAuthnError('bad-config', 'Could not find formField.');
      }
      field = el as HTMLTextAreaElement | HTMLInputElement;
    }

    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
      throw new WebAuthnError('bad-config', 'formField does not refer to an input element.');
    }

    const submit = config.submitForm !== false;
    if (!this.isSupported() && config.postUnsupportedImmediately === true) {
      const response : FailureResponse = { status: 'failed', error: 'unsupported' };
      this.setForm(field, response, submit);
      return response;
    }
    const newField = field;

    return new Promise<StatusResponse>((resolve) => {
      const { trigger } = config;
      let resolved = false;
      if (trigger.event === 'click') {
        const targets = elementSelector(config.trigger.element);
        const handler = async () => {
          const response = await this.runAutoConfig(config);
          this.setForm(newField, response, submit);
          if (!resolved) {
            resolved = true;
            resolve(response);
          }
        };
        for (let i = 0; i < targets.length; i++) {
          targets[i].addEventListener('click', handler);
        }
      } else {
        throw new WebAuthnError('bad-config');
      }
    });
  }

  private static async startConfig(config: Config): Promise<SuccessResponse> {
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
      credential,
    };
  }

  private static async runAutoConfig(config : AutoConfig): Promise<StatusResponse> {
    let response : StatusResponse;

    try {
      response = await this.startConfig(config);
    } catch (e) {
      const waError = (e instanceof WebAuthnError);
      if (config.debug === true) {
        console.error(e);// eslint-disable-line no-console
        if (waError && e.innerError) {
          console.error(e.innerError);// eslint-disable-line no-console
        }
      }
      response = {
        status: 'failed',
        error: (waError ? e.name : WebAuthnError.fromError(e).name),
      };
    }

    return response;
  }

  private static setForm(field: HTMLTextAreaElement|HTMLInputElement, response : StatusResponse, submit: boolean): void {
    field.value = JSON.stringify(response);
    if (submit && field.form) {
      field.form.submit();
    }
  }

  public static async autoConfig(): Promise<void> {
    const promises: Promise<StatusResponse>[] = [];
    const list = document.querySelectorAll('input[data-webauthn],textarea[data-webauthn],script[data-webauthn]');
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
      let json : AutoConfig;
      try {
        json = JSON.parse(rawJson) as AutoConfig;
      } catch (e) {
        throw new WebAuthnError('bad-config', 'invalid JSON in data-webauthn on element');
      }
      if (!isScript && json.formField === undefined) {
        json.formField = el as HTMLInputElement | HTMLTextAreaElement;
      }
      promises.push(this.loadConfig(json));
    }

    await Promise.all(promises);
  }
}

async function auto() : Promise<void> {
  await ready();
  const list = document.querySelectorAll('.webauthn-detect');
  for (let i = 0; i < list.length; i++) {
    WebAuthnUI.setFeatureCssClasses(list[i]);
  }
  return WebAuthnUI.autoConfig();
}

export const autoPromise = auto().catch(
  (e) => {
    if (console && console.error) { // eslint-disable-line no-console
      console.error(e); // eslint-disable-line no-console
    }
  },
);
