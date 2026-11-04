# webauthn-ui

![CI Status](https://github.com/madwizard-org/webauthn-ui/workflows/CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/madwizard-org/webauthn-ui/badge.svg)](https://coveralls.io/github/madwizard-org/webauthn-ui)
[![Version](https://img.shields.io/npm/v/webauthn-ui.svg)](https://www.npmjs.com/package/webauthn-ui)
[![License](https://img.shields.io/npm/l/webauthn-ui.svg)](https://www.npmjs.com/package/webauthn-ui)

> :warning: **This library is largely obsolete**
>
> The main goal of this library was conversion between JSON and the WebAuthn structures containing binary data.
> The WebAuthn API now has native support for this conversion (`PublicKeyCredential.parseCreationOptionsFromJSON()`,
> `parseRequestOptionsFromJSON()` and `toJSON()`). Version 3 of this library uses the native functionality instead of
> its own conversion, but maintains most of the same API for backwards compatibility. You may consider dropping this
> library and calling the native API yourself instead.
>
> See the [changelog](CHANGELOG.md) for the breaking changes when upgrading from version 2.

**webauthn-ui** is a browser JS library that makes it easy to use the _W3C Web Authentication API_ with json that can be sent through form posts or XHR calls.

It can also handle some auxilliary tasks such as initiating the WebAuthn requests, detecting support and posting the response in a hidden form field.

## Features

- API for creating and requesting credentials using json options and responses.
- Automatically initiating a WebAuthn request from a button click and posting the response as json in a hidden form field without the need for custom javascript.
- Detection of WebAuthn support with graceful error handling.
- Adding CSS classes indicating WebAuthn feature support.

## Purpose

The WebAuthn API makes use of numerous JavaScript structures (such as PublicKeyCredential) for its inputs and outputs. Binary ArrayBuffers are used in several places, and these need to be converted to and from base64url encoded strings when translating to and from json. This library uses the browser's native conversion functions for this, so all options and extensions supported by the browser can be used.

For convenience a custom html5 data attribute can be used to automatically initiate a WebAuthn request on a given event and post the response to a hidden form input element. Using this method no custom javascript is needed besides a call to `autoWebAuthn()`, which looks for a json configuration in either a `data-webauthn` attribute on an input field or a `<script type='application/json' data-webauthn>` block containing the configuration.

## Installation

Install the module with `npm install webauthn-ui`.

The library is available as an ES module only. It requires a browser with native WebAuthn JSON support
(`PublicKeyCredential.parseCreationOptionsFromJSON()` etc.); in other browsers it gracefully reports WebAuthn as unsupported.

```js
import { autoWebAuthn, WebAuthnUI } from 'webauthn-ui';

// When using automatic mode (data-webauthn attributes or json scripts) and/or the CSS support classes (see below):
autoWebAuthn();

// Or use the WebAuthnUI class directly (see manual mode below).
```

Without a bundler, the module can be loaded directly in the browser:

```html
<script type="module">
  import { autoWebAuthn } from './webauthn-ui.min.js';
  autoWebAuthn();
</script>
```

## Use

### Automatic mode

The easiest way to use the library is to add a `data-webauthn` to an input element with a json configuration as the attribute's value. After calling `autoWebAuthn()` it will setup an event handler (once the DOM is ready) for a specified element (e.g. a button to click) to initiate the WebAuthn request specified in the json data without the need for any custom JavaScript. The response will be put in the field's value and the form submitted automatically (by default).

Example WebAuthn registration:

```html
<form method="post">
  <!-- other form data -->

  <!-- trigger button -->
  <button type="button" id="register-btn">Register</button>

  <input
    type="hidden"
    name="response"
    data-webauthn='{"type":"create","trigger":{"event":"click","element":"#register-btn"},"request":{"rp":{"name":"WebAuthn demo"},"user":{"name":"freddy","id":"cGJ6WVlzRXNF","displayName":"Freddy fruitcake"},"challenge":"7b1m6n2KgMAuTp-FbOAl6sb0gD_5HZITqDF7ld8tl28","pubKeyCredParams":[{"type":"public-key","alg":-7}]}}'
  />
</form>
```

As an alternative you can also add the `data-webauthn` to a json script tag. Specify a form field to contain the response using a CSS selector in the `formField` property.

Example WebAuthn registration:

> :warning: **Warning**
> While using json inside a `<script>` tag does not require HTML escaping of characters like '<',
> you will need to make sure the content cannot break out the script using `</script>` in the content
> and that user input is safely encoded in the json data (no escaping the string values when it contains `"`
> for example).
> Use a proper json encoding function or library and make sure it escapes `/` characters as `\/` to make
> it impossible for the json to contain a `</script>` closing tag. \
> Note that for example `json.stringify` in does **not** do this by default and is unsafe to use for this purpose.
> Use a library like `serialize-javascript` for example. PHP's `json_encode` does safely encode content by
> default.

```html
<script type="application/json" data-webauthn>
  {
    "formField": "#webauthn-response",
    "type": "create",
    "trigger": {
      "event": "click",
      "element": "#register-btn"
    },
    "request": {
      "rp": {
        "name": "WebAuthn demo"
      },
      "user": {
        "name": "freddy",
        "id": "cGJ6WVlzRXNF",
        "displayName": "Freddy fruitcake"
      },
      "challenge": "7b1m6n2KgMAuTp-FbOAl6sb0gD_5HZITqDF7ld8tl28",
      "pubKeyCredParams": [
        {
          "type": "public-key",
          "alg": -7
        }
      ]
    }
  }
</script>

<form method="post">
  <!-- other form data -->
  <button type="button" id="register-btn">Register</button>
  <input type="hidden" id="webauthn-response" name="response" />
</form>
```

Both methods will wait until the user clicks the button, ask the client to create a new credential and posts the result
(both on success and failure) as a serialized json string in the hidden form input.

On success, the json structure will be an object with a `status` field set to the string `"ok"`, and a `"credential"` field
set to the json version of the [PublicKeyCredential](https://www.w3.org/TR/webauthn/#publickeycredential) result of the
WebAuthn request, as returned by the browser's `PublicKeyCredential.toJSON()` (`RegistrationResponseJSON` or
`AuthenticationResponseJSON`). An example of a successful response looks like this (values are shortened for display purposes):

```json
{
  "status": "ok",
  "credential": {
    "type": "public-key",
    "id": "HlmkAY_zkPN0_ZWdlvOKjrJsYrBC-WeqV2vQayJQRVD4JvA7ttK4Zv4ivRMM3B8273Gt_bOcDTCIY_HIHdXQ_Q",
    "rawId": "HlmkAY_zkPN0_ZWdlvOKjrJsYrBC-WeqV2vQayJQRVD4JvA7ttK4Zv4ivRMM3B8273Gt_bOcDTCIY_HIHdXQ_Q",
    "response": {
      "clientDataJSON": "eyJjaGFsbGVuZ2UiOiI3YjFtNm4yS2dNQ......IsInR5cGUiOiJ3ZWJhdXRobi5jcmVhdGUifQ",
      "authenticatorData": "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NFAAAAAA...",
      "transports": ["internal"],
      "publicKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...",
      "publicKeyAlgorithm": -7,
      "attestationObject": "o2NmbXRmcGFja2VkZ2F0dFN0...DvLFRA5Bn3dGgzy"
    },
    "authenticatorAttachment": "platform",
    "clientExtensionResults": {}
  }
}
```

In case of failure, the result will be an object with the `status` field set to the string `"failed"` and an `error`
field set to a string indicating the type of error. For example:

```json
{
  "status": "failed",
  "error": "dom-not-allowed"
}
```

#### Options for automatic mode

| Field                      | Type                           | Required | Meaning                                                                                                                                                                                      |
| -------------------------- | ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type                       | 'create'\|'get'                | Yes      | The type of credential request to perform: create or get a credential.                                                                                                                       |
| request                    | object                         | Yes      | The request options for create/get credential in the standard json format (`PublicKeyCredentialCreationOptionsJSON` / `PublicKeyCredentialRequestOptionsJSON`).                              |
| trigger                    | trigger object (see below)     | Yes/No   | Specify trigger to initiate the request. Either `trigger` or `triggers` (or both) is required.                                                                                               |
| triggers                   | array of trigger objects       | Yes/No   | Specify multiple triggers to initiate the request. Can be combined with `trigger`.                                                                                                           |
| formField                  | string selector or DOM element | Yes/No   | The input field to set save the result in. Not required if data-webauthn attribute is set on an input element. Can also be a textarea for debugging (in combination with submitForm = false) |
| postUnsupportedImmediately | boolean (default false)        | No       | When WebAuthn is unsupported by the client, post an 'unsupported' error response immediately without user interaction                                                                        |
| submitForm                 | boolean (default true)         | No       | Submit form after setting the input field to the response. When false, only the input field is set but the form is not submitted.                                                            |

#### Triggers

| Trigger                                            | Meaning                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| `{"event": "click", "element": selector\|Element}` | Initiate the request when the element(s) matching the CSS selector are clicked. |
| `{"event": "load"}`                                | Initiate the request when the page has fully loaded (window `load` event).      |

Triggers are ignored while a request started by another trigger is still in progress. Note that browsers may restrict
WebAuthn requests that are not initiated by a user action. For example, Safari allows only one such request without a
user gesture; further requests first show an extra confirmation prompt. If a `load` triggered request fails or is
cancelled, combining it with a click trigger lets the user retry:

```json
"triggers": [
    { "event": "load" },
    { "event": "click", "element": "#login-btn" }
]
```

### Manual mode

Automatic mode is useful if you want to write minimal code and a form post with the response is suitable for your setup.
If you want more flexibility, have a single page web application or want to post the response using javascript you can
manually call the library.

Use `WebAuthnUI.createCredential` to create a credential. It works similar to `navigator.credentials.create`, but takes
json options and returns a json response. On error, a `WebAuthnError` is thrown (see below).

```js
import { WebAuthnUI } from 'webauthn-ui';

let request = {
  rp: {
    name: 'WebAuthn demo',
  },
  user: {
    name: 'freddy',
    id: 'cGJ6WVlzRXNF',
    displayName: 'Freddy fruitcake',
  },
  challenge: '7b1m6n2KgMAuTp-FbOAl6sb0gD_5HZITqDF7ld8tl28',
  pubKeyCredParams: [
    {
      type: 'public-key',
      alg: -7,
    },
  ],
};

try {
  let result = await WebAuthnUI.createCredential(request);
  // Success
  console.log(result);
} catch (error) {
  // Failure
  console.error(error);
}
```

To request a credential assertion, use `WebAuthnUI.getCredential` in the same manner.

### WebAuthnError

In case of failure the functions throw an error of type WebAuthnError (this class is exported by the module as well).
The `name` field in this error indicates the error type. The possible error values are (might be extended in the future):

| Error value       | Type of error                       |
| ----------------- | ----------------------------------- |
| unsupported       | WebAuthn is not supported by client |
| bad-config        | Configuration is incorrect          |
| dom-not-allowed   | DOM NotAllowedError                 |
| dom-security      | DOM SecurityError                   |
| dom-not-supported | DOM NotSupportedError               |
| dom-abort         | DOM AbortError                      |
| dom-invalid-state | DOM InvalidStateError               |
| dom-constraint    | DOM ConstraintError                 |
| dom-not-readable  | DOM NotReadableError                |
| dom-timeout       | DOM TimeoutError                    |
| dom-unknown       | Other DOM error                     |
| unknown           | Unknown error                       |

The `unsupported` error is returned by webauthn-ui if the client does not support WebAuthn or its native json
conversion functions. This allows graceful handling of older browsers.

The `innerError` field is set to the original error throw, if any.

### WebAuthn support detection CSS classes

When the CSS class `webauthn-detect` is added to an element and `autoWebAuthn()` is called, this library will add additional classes to this element
indicating the degree of WebAuthn support:

General WebAuthn support:

- `webauthn-supported`
- `webauthn-unsupported`

User verifying platform authentiator support:

- `webauthn-uvpa-supported`
- `webauthn-uvpa-unsupported`

Example:

```html
<div class="webauthn-detect">...</div>
```

After `autoWebAuthn()` is called and the DOM is loaded:

```html
<div class="webauthn-detect webauthn-supported webauthn-uvpa-supported">
  ...
</div>
```
