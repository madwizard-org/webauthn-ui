import {importModule, ReadyStateMocker} from "./mock";
import WebAuthnUI from "../src";
import * as fixtures from "./fixtures";
import {jsonCreateResponse} from "./fixtures";
import {Config} from "../src/types";

const stateMocker = new ReadyStateMocker();

beforeEach(() => {
    jest.resetModules();
    stateMocker.resetLoading();

    (navigator as any).credentials = undefined;
    (window as any).PublicKeyCredential = undefined;
});

const testHtml =
    `<script type="application/json" data-webauthn>
            {
                "formField": "#webauthn-response",
                "type": "create",
                "delay": 10,
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
        <input type="hidden" id="webauthn-response">`;

test('Automatic css classes', async () => {

    document.body.innerHTML =`<div id="test" class="webauthn-detect"></div>`

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

    // No auto code run yet
    expect(mod.autoSucceeded).toBe(null);
    expect(input.value).toBe('');

    await stateMocker.enterComplete();

    /// Auto code run, ensure complete (wait for timers etc.):
    await mod.autoPromise;

    expect((document.getElementById('webauthn-response') as HTMLInputElement).value).toBe('{"status":"failed","error":"unsupported"}');
});

test('Create request via JSON script (success case)', async () => {

    const create = jest.fn().mockReturnValue(Promise.resolve(fixtures.rawCreateResponse));
    (navigator as any).credentials = {
        create
    };
    (window as any).PublicKeyCredential = function () {}



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

    /// Auto code run, ensure complete (wait for timers etc.):
    await mod.autoPromise;

    expect((document.getElementById('webauthn-response') as HTMLInputElement).value).toBe(
        '{"status":"ok","credential":{"type":"public-key","id":"mTt0zCJUFozcNOBRcjWFMBcTfBKEzfg_QxnU8bM8-5Q",' +
        '"rawId":"mTt0zCJUFozcNOBRcjWFMBcTfBKEzfg_QxnU8bM8-5Q","response":{"clientDataJSON":"eyJ0ZXN0IjoiZGF0YSJ9",' +
        '"attestationObject":"MiNbx5u7qFgnfMV3-GcemtZP-NmMnrhFQN0QFXeHwfs"}}}'
    );
});


test('postUnsupported false', async () => {

    let input = document.createElement('input');
    input.type = 'hidden';
    input.value = '';
    input.setAttribute('data-webauthn', JSON.stringify({
        type: 'create',
        request: fixtures.jsonCreateOptions,
        postUnsupported: false
    } as Config));
    document.body.append(input);
    await stateMocker.enterComplete();

    const mod = await importModule();
    await mod.autoPromise;

    expect(input.value).toBe('');

})