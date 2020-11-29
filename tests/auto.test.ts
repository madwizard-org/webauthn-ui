import { importModule, ReadyStateMocker } from './mock';
import * as fixtures from './fixtures';
import { AutoConfig } from '../src/types';

const stateMocker = new ReadyStateMocker();

beforeEach(() => {
  document.body.innerHTML = '';
  jest.resetModules();
  stateMocker.resetLoading();

  (navigator as any).credentials = undefined;
  (window as any).PublicKeyCredential = undefined;
});

function createTestHtml({
  type, mode, field, form,
}: { type: 'create' | 'get', mode: 'script' | 'attr', field: 'textarea' | 'input', form?: boolean }) {
  let config : AutoConfig;
  if (type === 'create') {
    config = {
      type: 'create',
      trigger: {
        event: 'click',
        element: '#trigger-btn',
      },
      request: {
        rp: { name: 'WebAuthn demo' },
        user: {
          name: 'freddy',
          id: 'cGJ6WVlzRXNF',
          displayName: 'Freddy fruitcake',
        },
        challenge: '7b1m6n2KgMAuTp-FbOAl6sb0gD_5HZITqDF7ld8tl28',
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      },
    };
  } else {
    config = {
      type: 'get',
      trigger: {
        event: 'click',
        element: '#trigger-btn',
      },
      request: {
        challenge: '7b1m6n2KgMAuTp-FbOAl6sb0gD_5HZITqDF7ld8tl28',
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
  await import('../src/index');

  // No auto code run yet
  expect(document.getElementById('test')!.classList.value).toBe('webauthn-detect');

  // Document loaded
  await stateMocker.enterInteractive();

  /// Auto code run
  expect(document.getElementById('test')!.classList.value).toBe('webauthn-detect webauthn-unsupported webauthn-uvpa-unsupported');
});

test('Create request via JSON script (unsupported case)', async () => {
  stateMocker.resetLoading();

  document.body.innerHTML = createTestHtml({ type: 'create', mode: 'script', field: 'input' });

  const input = document.getElementById('webauthn-response') as HTMLInputElement;
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

  expect((document.getElementById('webauthn-response') as HTMLInputElement).value).toBe('{"status":"failed","error":"unsupported"}');
});

test('Create request via JSON script (success case)', async () => {
  const create = jest.fn().mockReturnValue(Promise.resolve(fixtures.rawCreateResponse));
  (navigator as any).credentials = {
    create,
  };
  (window as any).PublicKeyCredential = () => {};

  document.body.innerHTML = createTestHtml({ type: 'create', mode: 'script', field: 'input' });

  const input = document.getElementById('webauthn-response') as HTMLInputElement;
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

  expect((document.getElementById('webauthn-response') as HTMLInputElement).value).toBe(
    '{"status":"ok","credential":{"type":"public-key","id":"mTt0zCJUFozcNOBRcjWFMBcTfBKEzfg_QxnU8bM8-5Q",'
        + '"rawId":"mTt0zCJUFozcNOBRcjWFMBcTfBKEzfg_QxnU8bM8-5Q","response":{"clientDataJSON":"eyJ0ZXN0IjoiZGF0YSJ9",'
        + '"attestationObject":"MiNbx5u7qFgnfMV3-GcemtZP-NmMnrhFQN0QFXeHwfs"}}}',
  );
});

test('postUnsupportedImmediately true', async () => {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.value = '';
  input.setAttribute('data-webauthn', JSON.stringify({
    type: 'create',
    trigger: {
      event: 'click',
      element: '#trigger-btn',
    },
    request: fixtures.jsonCreateOptions,
    postUnsupportedImmediately: true,
  } as AutoConfig));
  document.body.append(input);
  const mod = await importModule();
  await stateMocker.enterComplete();
  await mod.autoPromise;

  expect(input.value).toBe('{"status":"failed","error":"unsupported"}');
});

test('Get request via data attribute textarea', async () => {
  stateMocker.resetLoading();

  const get = jest.fn().mockReturnValue(Promise.resolve(fixtures.rawRequestResponse));
  (navigator as any).credentials = {
    get,
  };
  (window as any).PublicKeyCredential = () => {};

  document.body.innerHTML = createTestHtml({
    type: 'get', mode: 'attr', field: 'textarea', form: false,
  });

  const input = document.getElementById('webauthn-response') as HTMLTextAreaElement;
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

  expect((document.getElementById('webauthn-response') as HTMLInputElement).value).toBe(
    '{"status":"ok","credential":{"type":"public-key","id":"mTt0zCJUFozcNOBRcjWFMBcTfBKEzfg_QxnU8bM8-5Q",'
    + '"rawId":"mTt0zCJUFozcNOBRcjWFMBcTfBKEzfg_QxnU8bM8-5Q","response":{"clientDataJSON":"eyJ0ZXN0IjoiZGF0YSJ9"'
    + ',"authenticatorData":"e2zN0cBX8nYCQYP_yPhU3dXSuhVpbE2hc3TajPuco2EUOK2Wqg",'
    + '"signature":"tkbIGwoeqhwQ-EoCOhR9zCEqR8HHis9Gcpa_YSfPvQw","userHandle":null}}}',
  );
});

test('Get form submit via data attribute input', async () => {
  stateMocker.resetLoading();

  const get = jest.fn().mockReturnValue(Promise.resolve(fixtures.rawRequestResponse));
  (navigator as any).credentials = {
    get,
  };
  (window as any).PublicKeyCredential = () => {};

  document.body.innerHTML = createTestHtml({
    type: 'get', mode: 'attr', field: 'input', form: true,
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

  expect((document.getElementById('webauthn-response') as HTMLInputElement).value).toBe(
    '{"status":"ok","credential":{"type":"public-key","id":"mTt0zCJUFozcNOBRcjWFMBcTfBKEzfg_QxnU8bM8-5Q",'
    + '"rawId":"mTt0zCJUFozcNOBRcjWFMBcTfBKEzfg_QxnU8bM8-5Q","response":{"clientDataJSON":"eyJ0ZXN0IjoiZGF0YSJ9"'
    + ',"authenticatorData":"e2zN0cBX8nYCQYP_yPhU3dXSuhVpbE2hc3TajPuco2EUOK2Wqg",'
    + '"signature":"tkbIGwoeqhwQ-EoCOhR9zCEqR8HHis9Gcpa_YSfPvQw","userHandle":null}}}',
  );
});
