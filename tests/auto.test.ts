import {
  importModule,
  mockWebAuthn,
  ReadyStateMocker,
  setCredentials,
  setPublicKeyCredential,
} from './mock';
import * as fixtures from './fixtures';
import { AutoConfig, Trigger } from '../src/types';
import { beforeEach, test, expect, jest } from '@jest/globals';

const stateMocker = new ReadyStateMocker();

beforeEach(() => {
  document.body.innerHTML = '';
  jest.resetModules();
  stateMocker.resetLoading();

  setCredentials(undefined);
  setPublicKeyCredential(undefined);
});

function createTestHtml({
  type,
  mode,
  field,
  form,
}: {
  type: 'create' | 'get';
  mode: 'script' | 'attr';
  field: 'textarea' | 'input';
  form?: boolean;
}) {
  let config: AutoConfig;
  if (type === 'create') {
    config = {
      type: 'create',
      trigger: {
        event: 'click',
        element: '#trigger-btn',
      },
      request: fixtures.jsonCreateOptions,
    };
  } else {
    config = {
      type: 'get',
      trigger: {
        event: 'click',
        element: '#trigger-btn',
      },
      request: {
        challenge: fixtures.urlChallenge,
      },
    };
  }

  let script = '';

  const inputEl = document.createElement(field);
  inputEl.setAttribute('id', 'webauthn-response');
  if (mode === 'script') {
    config.formField = '#webauthn-response';

    // Note: JSON.stringify is unsafe with user defined content in a script tag - do not use this in your own code
    // this is only unit test code so it doesn't matter here.
    script = `<script type="application/json" data-webauthn>${JSON.stringify(config)}</script>`;
  } else {
    inputEl.setAttribute('data-webauthn', JSON.stringify(config));
  }

  const formStart = form ? '<form id="form" method="post">' : '';
  const formEnd = form ? '</form>' : '';

  return `${script}
          ${formStart}
          <button id="trigger-btn">start</button>
          ${inputEl.outerHTML}</${field}>
          ${formEnd}`;
}

function triggerButton() {
  document.getElementById('trigger-btn')!.dispatchEvent(new Event('click'));
}

test('Automatic css classes', async () => {
  document.body.innerHTML = '<div id="test" class="webauthn-detect"></div>';

  // Import module
  const mod = await import('../src/index');

  mod.autoWebAuthn();

  // No auto code run yet
  expect(document.getElementById('test')!.classList.value).toBe(
    'webauthn-detect',
  );

  // Document loaded
  await stateMocker.enterInteractive();

  /// Auto code run
  expect(document.getElementById('test')!.classList.value).toBe(
    'webauthn-detect webauthn-unsupported webauthn-uvpa-unsupported',
  );
});

test('Create request via JSON script (unsupported case)', async () => {
  stateMocker.resetLoading();

  document.body.innerHTML = createTestHtml({
    type: 'create',
    mode: 'script',
    field: 'input',
  });

  const input = document.getElementById(
    'webauthn-response',
  ) as HTMLInputElement;
  const mod = await importModule();

  expect(mod.autoSucceeded).toBe(null);
  expect(input.value).toBe('');

  await stateMocker.enterInteractive();
  expect(input.value).toBe('');
  await stateMocker.enterComplete();

  expect(input.value).toBe('');

  triggerButton();
  /// Auto code run, ensure complete
  await mod.autoPromise;

  expect(
    (document.getElementById('webauthn-response') as HTMLInputElement).value,
  ).toBe('{"status":"failed","error":"unsupported"}');
});

test('Create request via JSON script (success case)', async () => {
  const create = jest
    .fn<CredentialsContainer['create']>()
    .mockReturnValue(Promise.resolve(fixtures.rawCreateResponse));
  setCredentials({
    create,
  });
  mockWebAuthn();

  document.body.innerHTML = createTestHtml({
    type: 'create',
    mode: 'script',
    field: 'input',
  });

  const input = document.getElementById(
    'webauthn-response',
  ) as HTMLInputElement;
  const mod = await importModule();

  expect(mod.autoSucceeded).toBe(null);
  expect(input.value).toBe('');

  await stateMocker.enterInteractive();

  // No auto code run yet
  expect(mod.autoSucceeded).toBe(null);
  expect(input.value).toBe('');

  await stateMocker.enterComplete();

  triggerButton();

  /// Auto code run, ensure complete
  await mod.autoPromise;

  const val = (document.getElementById('webauthn-response') as HTMLInputElement)
    .value;
  const parsed = JSON.parse(val);

  expect(parsed).toEqual({
    credential: fixtures.jsonCreateResponse,
    status: 'ok',
  });
});

test('postUnsupportedImmediately true', async () => {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.value = '';
  input.setAttribute(
    'data-webauthn',
    JSON.stringify({
      type: 'create',
      trigger: {
        event: 'click',
        element: '#trigger-btn',
      },
      request: fixtures.jsonCreateOptions,
      postUnsupportedImmediately: true,
    } as AutoConfig),
  );
  document.body.append(input);
  const mod = await importModule();
  await stateMocker.enterComplete();
  await mod.autoPromise;

  expect(input.value).toBe('{"status":"failed","error":"unsupported"}');
});

test('Get request via data attribute textarea', async () => {
  stateMocker.resetLoading();

  const get = jest
    .fn<CredentialsContainer['get']>()
    .mockReturnValue(Promise.resolve(fixtures.rawRequestResponse));
  setCredentials({
    get,
  });
  mockWebAuthn();

  document.body.innerHTML = createTestHtml({
    type: 'get',
    mode: 'attr',
    field: 'textarea',
    form: false,
  });

  const input = document.getElementById(
    'webauthn-response',
  ) as HTMLTextAreaElement;
  const mod = await importModule();

  expect(mod.autoSucceeded).toBe(null);
  expect(input.value).toBe('');

  await stateMocker.enterInteractive();

  // No auto code run yet
  expect(mod.autoSucceeded).toBe(null);
  expect(input.value).toBe('');

  await stateMocker.enterComplete();

  triggerButton();

  /// Auto code run, ensure complete
  await mod.autoPromise;

  const val = (document.getElementById('webauthn-response') as HTMLInputElement)
    .value;
  const parsed = JSON.parse(val);

  expect(parsed).toEqual({
    credential: fixtures.jsonRequestResponse,
    status: 'ok',
  });
});

test('Get form submit via data attribute input', async () => {
  stateMocker.resetLoading();

  const get = jest
    .fn<CredentialsContainer['get']>()
    .mockReturnValue(Promise.resolve(fixtures.rawRequestResponse));
  setCredentials({
    get,
  });
  mockWebAuthn();

  document.body.innerHTML = createTestHtml({
    type: 'get',
    mode: 'attr',
    field: 'input',
    form: true,
  });

  let formSubmitted = false;
  const form = document.getElementById('form') as HTMLFormElement;
  form.submit = () => {
    formSubmitted = true;
  };
  const mod = await importModule();

  expect(formSubmitted).toBe(false);

  await stateMocker.enterInteractive();
  await stateMocker.enterComplete();

  expect(formSubmitted).toBe(false);
  triggerButton();

  // Auto code run, ensure complete
  await mod.autoPromise;

  expect(formSubmitted).toBe(true);

  const val = (document.getElementById('webauthn-response') as HTMLInputElement)
    .value;
  const parsed = JSON.parse(val);

  expect(parsed).toEqual({
    credential: fixtures.jsonRequestResponse,
    status: 'ok',
  });
});

function createAttrInput(config: Partial<AutoConfig>) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.setAttribute(
    'data-webauthn',
    JSON.stringify({
      type: 'get',
      request: fixtures.jsonRequestOptions,
      submitForm: false,
      ...config,
    }),
  );
  document.body.innerHTML = '<button id="trigger-btn">start</button>';
  document.body.append(input);
  return input;
}

function mockGet() {
  const get = jest
    .fn<CredentialsContainer['get']>()
    .mockReturnValue(Promise.resolve(fixtures.rawRequestResponse));
  setCredentials({ get });
  mockWebAuthn();
  return get;
}

test('Load trigger', async () => {
  const get = mockGet();
  const input = createAttrInput({ trigger: { event: 'load' } });

  const mod = await importModule();
  await stateMocker.enterInteractive();
  expect(get).not.toHaveBeenCalled();

  await stateMocker.enterComplete();
  await mod.autoPromise;

  expect(get).toHaveBeenCalledTimes(1);
  expect(JSON.parse(input.value)).toEqual({
    credential: fixtures.jsonRequestResponse,
    status: 'ok',
  });
});

test('Triggers array', async () => {
  const get = mockGet();
  const input = createAttrInput({
    triggers: [{ event: 'click', element: '#trigger-btn' }],
  });

  const mod = await importModule();
  await stateMocker.enterComplete();
  expect(get).not.toHaveBeenCalled();

  triggerButton();
  await mod.autoPromise;

  expect(get).toHaveBeenCalledTimes(1);
  expect(JSON.parse(input.value)).toEqual({
    credential: fixtures.jsonRequestResponse,
    status: 'ok',
  });
});

test('Trigger and triggers combined', async () => {
  const get = mockGet();
  createAttrInput({
    trigger: { event: 'load' },
    triggers: [{ event: 'click', element: '#trigger-btn' }],
  });

  const mod = await importModule();
  await stateMocker.enterComplete();
  await mod.autoPromise;
  expect(get).toHaveBeenCalledTimes(1);

  // Click trigger still works after the load trigger completed
  triggerButton();
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
  expect(get).toHaveBeenCalledTimes(2);
});

test('Triggers ignored while request in progress', async () => {
  let finish: (value: Credential) => void = () => {};
  const get = jest.fn<CredentialsContainer['get']>().mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  setCredentials({ get });
  mockWebAuthn();
  createAttrInput({ trigger: { event: 'click', element: '#trigger-btn' } });

  const mod = await importModule();
  await stateMocker.enterComplete();

  triggerButton();
  triggerButton();
  finish(fixtures.rawRequestResponse);
  await mod.autoPromise;

  expect(get).toHaveBeenCalledTimes(1);
});

test('Missing trigger', async () => {
  mockGet();
  createAttrInput({});

  const mod = await importModule();
  await stateMocker.enterComplete();

  await expect(mod.autoPromise).rejects.toThrow('No trigger specified.');
});

test('Invalid trigger event', async () => {
  mockGet();
  createAttrInput({ triggers: [{ event: 'hover' } as unknown as Trigger] });

  const mod = await importModule();
  await stateMocker.enterComplete();

  await expect(mod.autoPromise).rejects.toThrow('Invalid trigger event hover.');
});
