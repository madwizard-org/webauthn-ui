import { ErrorType } from './error';

interface ClickTrigger {
  event: 'click';
  element: string | HTMLElement;
}

interface LoadTrigger {
  event: 'load';
}

export type Trigger = ClickTrigger | LoadTrigger;

type BaseConfig = {
  // At least one trigger is required, using trigger and/or triggers
  trigger?: Trigger;
  triggers?: Trigger[];
  debug?: boolean;
};

interface CreateConfig extends BaseConfig {
  type: 'create';
  request: PublicKeyCredentialCreationOptionsJSON;
}

interface RequestConfig extends BaseConfig {
  type: 'get';
  request: PublicKeyCredentialRequestOptionsJSON;
}

export type Config = CreateConfig | RequestConfig;

export type AutoConfig = {
  formField?: string | HTMLInputElement | HTMLTextAreaElement;
  postUnsupportedImmediately?: boolean;
  submitForm?: boolean;
} & Config;

export interface SuccessResponse {
  status: 'ok';
  credential: RegistrationResponseJSON | AuthenticationResponseJSON;
}

export interface FailureResponse {
  status: 'failed';
  error: ErrorType;
}

export type StatusResponse = SuccessResponse | FailureResponse;
