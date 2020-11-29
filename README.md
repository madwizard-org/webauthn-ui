# webauthn-ui

![CI Status](https://github.com/madwizard-org/webauthn-ui/workflows/CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/madwizard-org/webauthn-ui/badge.svg)](https://coveralls.io/github/madwizard-org/webauthn-ui)
[![Version](https://img.shields.io/npm/v/webauthn-ui.svg)](https://www.npmjs.com/package/webauthn-ui)
[![License](https://img.shields.io/npm/l/webauthn-ui.svg)](https://www.npmjs.com/package/webauthn-ui)

**webauthn-ui** is a browser JS library that functions as a translator between the *W3C Web Authentication API* that modern browsers support and a json compatible version that can be send through form posts or XHR calls.

It can also handle some auxilliary tasks such as initiating the WebAuthn requests, detecting support and posting the response in a hidden form field.

## Features

- API for translating between the WebAuthn API structures and pure json structures.
- Automatically initiating a WebAuthn request from a button click and posting the response as json in a hidden form field without the need for custom javascript.
- Detection of WebAuthn support with graceful error handling.
- Adding CSS classes indicating WebAuthn feature support.
 
## Purpose

The WebAuthn API makes use of numerous JavaScript structures (such as PublicKeyCredential) for its inputs and outputs. For the most part these structures contain simple values that can directly be converted to json. However, binary ArrayBuffers are used in several places and these need to be converted back and forth to another type (base64url encoded strings) when translating to and from json. 

This library will keep the types supported in json the same. ArrayBuffers are converter to base64url encoded strings. To convert json back to the JavaScript structures knowledge of the structure is needed because base64url encoded strings are indistinguishable from normal strings. For this reason webauthn-ui only supports the fields that it knows of.

For convenience a custom html5 data attribute can be used to automatically initiate a WebAuthn request on a given event and posting the response to a hidden form input element. Using this method no custom javascript is needed, the webauthn-ui library can be included and it will automatically look for a json configuration in either a `data-webauthn` attribute on an input field or a `<script type='application/json' data-webauthn>` block containing the configuration.


## Installation

Install the module with `npm install webauthn-ui`.

The library is available as ES and UMD modules. Both libraries are ES5 compatible, but do require a Promise implementation. For IE11 this means you need to use a polyfill such as [es6-promise](https://github.com/stefanpenner/es6-promise). Although all browsers that support WebAuthn support ES modules as well, it is still useful to support ES5 browsers for graceful handling in case WebAuthn is not supported.

### ES module

You can use the ES module with the `import` statement in your main code.

```js
// When using automatic loading via json scripts (see below), just importing the library is enough:
import 'webauthn-ui';

// Or if you need access to the WebAuthnUI class:
import { WebAuthnUI } from 'webauthn-ui';
```

### UMD module

The UMD module can be used directly as a browser script (exposing WebAuthnUI as a global variable) or using CommonJS style `require`

As a script:
```html
<!-- es6-promise for old and crappy browsers -->
<script type="application/javascript" src="es6-promise.auto.min.js"></script> 
<script type="application/javascript" src="webauthn-ui.min.js"></script>
```

Or using require:
```js

// For old and crappy browsers
require('es6-promise')

// When using automatic loading via json scripts/html attributes (see below), just importing the library is enough:
require('webauthn-ui');

// Or if you need access to the WebAuthnUI class:
const WebAuthnUI = require('webauthn-ui').WebAuthnUI;


```


## Use

### Automatic mode 

The easiest way to use the library is to add a `data-webauthn` to an input element with a json configuration as the attribute's value. When the page is loaded it will automatically setup an event handler for a specified element (e.g. a button to click) to initiate the WebAuthn request specified in the json data without the need for any custom JavaScript. The response will be put in the field's value and the form submitted automatically (by default).

Example WebAuthn registration:
```html
<form method="post">
    <!-- other form data -->

    <!-- trigger button -->
    <button type="button" id="register-btn">Register</button>

    <input type="hidden" name="response" 
        data-webauthn="{&quot;type&quot;:&quot;create&quot;,&quot;trigger&quot;:{&quot;event&quot;:&quot;click&quot;,&quot;element&quot;:&quot;#register-btn&quot;},&quot;request&quot;:{&quot;rp&quot;:{&quot;name&quot;:&quot;WebAuthn demo&quot;},&quot;user&quot;:{&quot;name&quot;:&quot;freddy&quot;,&quot;id&quot;:&quot;cGJ6WVlzRXNF&quot;,&quot;displayName&quot;:&quot;Freddy fruitcake&quot;},&quot;challenge&quot;:&quot;7b1m6n2KgMAuTp-FbOAl6sb0gD_5HZITqDF7ld8tl28&quot;,&quot;pubKeyCredParams&quot;:[{&quot;type&quot;:&quot;public-key&quot;,&quot;alg&quot;:-7}]}}" 
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
> Use a library like `serialize-javascript` for example.  PHP's `json_encode` does safely encode content by 
> default.
>
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
set to the [PublicKeyCredential](https://www.w3.org/TR/webauthn/#publickeycredential) result of the WebAuthn request. The structure
of this object is the same as defined in the WebAuthn standard, but with all binary ArrayBuffers converted to base64url
encoded strings. An example of a successful response looks like this (values are shortened for display purposes):
```json
{
    "status": "ok",
    "credential": {
        "type": "public-key",
        "id": "HlmkAY_zkPN0_ZWdlvOKjrJsYrBC-WeqV2vQayJQRVD4JvA7ttK4Zv4ivRMM3B8273Gt_bOcDTCIY_HIHdXQ_Q",
        "rawId": "HlmkAY_zkPN0_ZWdlvOKjrJsYrBC-WeqV2vQayJQRVD4JvA7ttK4Zv4ivRMM3B8273Gt_bOcDTCIY_HIHdXQ_Q",
        "response": {
            "clientDataJSON": "eyJjaGFsbGVuZ2UiOiI3YjFtNm4yS2dNQ......IsInR5cGUiOiJ3ZWJhdXRobi5jcmVhdGUifQ",
            "attestationObject": "o2NmbXRmcGFja2VkZ2F0dFN0...DvLFRA5Bn3dGgzy"
        }
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

| Field            | Type                           | Required | Meaning  |
|------------------|--------------------------------|----------|-----------------------------------------------------------------------------|
| type             | 'create'\|'get'                 | Yes      | The type of credential request to perform: create or get a credential. |
| request          | object                         | Yes      | The request options for create/get credential as specified in the WebAuthn standard but with ArrayBuffers converted to base64url strings. |
| trigger          | {type:'click', element: 'selector'\|Element} |  Yes       | Specify trigger to initiate the request. |
| formField        | string selector or DOM element | Yes/No   | The input field to set save the result in. Not required if data-webauthn attribute is set on an input element. Can also be a textarea for debugging (in combination with submitForm = false) |
| postUnsupportedImmediately  | boolean (default false)         | No       | When WebAuthn is unsupported by the client, post an 'unsupported' error response immediately without user interaction |
| submitForm       | boolean (default true)         | No       | Submit form after setting the input field to the response. When false, only the input field is set but the form is not submitted. |

### Manual mode

Automatic mode is useful if you want to write minimal code and a form post with the response is suitable for your setup.
If you want more flexibility, have a single page web application or want to post the response using javascript you can
manually call the library. It will stil take care of the ArrayBuffer <-> base64url conversion for you.

Use `WebAuthnUI.createCredential` to create a credential, it works similar to `navigator.credentials.create`. On error,
a WebAuthnUI 
```js

import { WebAuthnUI } from 'webauthn-ui';

let request = {
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
};

try {
    let result = await WebAuthnUI.createCredential(request);
    // Success
    console.log(result);
} catch(error) {
    // Failure
    console.error(error);
}
```

To request a credential assertion, use `WebAuthnUI.getCredential` in the same manner.

### WebAuthnError

In case of failure the functions throw an error of type WebAuthnError (this class is exported by the module as well).
The `name` field in this error indicates the error type. The possible error values are (might be extended in the future):

| Error value        | Type of error                          |
| ------------------ | -------------------------------------- |
| unsupported        | WebAuthn is not supported by client    |
| parse-error        | Parse error (e.g. wrong base64url)     |
| bad-config         | Configuration is incorrect             |
| dom-not-allowed    | DOM NotAllowedError                    |
| dom-security       | DOM SecurityError                      |
| dom-not-supported  | DOM NotSupportedError                  |
| dom-abort          | DOM AbortError                         |
| dom-invalid-state  | DOM InvalidStateError                  |
| dom-unknown        | Other DOM error                        |
| unknown            | Unknown error                          |

The `unsupported` error is returned by webauthn-ui if the client does not support WebAuthn. This allows graceful handling
of older browsers such as IE. 

The `innerError` field is set to the original error throw, if any.

 
### WebAuthn support detection CSS classes

When the CSS class `webauthn-detect` is added to an element, this library will add additional classes to this element
indicating the degree of WebAuthn support:

General WebAuthn support:
- `webauthn-supported`
- `webauthn-unsupported` 

User verifying platform authentiator support:
- `webauthn-uvpa-supported`
- `webauthn-uvpa-unsupported`

Example:
```html
<div class='webauthn-detect'>...</div>
```
After library and DOM is loaded:
```html
<div class='webauthn-detect webauthn-supported webauthn-uvpa-supported'>...</div>
``` 

 