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

const testHtml = `<script type="application/json" data-webauthn>
            {
                "type": "create",
                "trigger": {
                    "event": "click",
                    "element": "#trigger-btn"
                },
                "formField": "#webauthn-response",             
                "request": {
                    "rp": { "name": "WebAuthn demo" },
                    "user": {
                        "name": "freddy",
                        "id": "cGJ6WVlzRXNF",
                        "displayName": "Freddy fruitcake"
                    },
                    "challenge": "7b1m6n2KgMAuTp-FbOAl6sb0gD_5HZITqDF7ld8tl28",
                    "pubKeyCredParams": [{"type": "public-key","alg": -7}]
                }
            }
        </script>
        <button id="trigger-btn">start</button>
        <input type="hidden" id="webauthn-response">`;

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

  document.body.innerHTML = testHtml;

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

  document.body.innerHTML = testHtml;

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
