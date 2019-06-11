# webauthn-ui

**Work in progress - Use for testing purposes only**

**webauthn-ui** is a browser JS library that functions as an translator between the *W3C Web Authentication API* that modern browsers support and a JSON compatible version that can be send through form posts or XHR calls.

It can also handle some auxilliary tasks such as initiating the WebAuthn requests, detecting support and posting the response in a hidden form field.
 
## Purpose

The WebAuthn API makes use of numerous JavaScript structures (such as PublicKeyCredential) for its inputs and outputs. For the most part these structures contain simple values that can directly be converted to JSON. However binary ArrayBuffers are used in several places and these need to be converted back and forth to another type (base64url encoded strings) when translating to and from JSON. 

This library will keep the types supported in JSON the same. ArrayBuffers are converter to base64url encoded strings. To convert JSON back to the JavaScript structures knowledge of the structure is needed because base64url encodedd strings are indistinguishable from normal strings. For this reason webauthn-ui only supports the fields that it knows of.


## Installation

Install the module with `npm install webauthn-ui`.

The library is available as ES and UMD modules. Both libraries are ES5 compatible. Although all browsers that support WebAuthn support ES modules as well, it is still useful to support ES5 browsers for graceful handling in case WebAuthn is not supported.

### ES module

You can use the ES module with the `import` statement in your main code.

```js
// When using automatic loading via JSON scripts (see below), just importing the library is enough:
import 'webauthn-ui';

// Or if you need access to the WebAuthnUI class:
import WebAuthnUI from 'webauthn-ui';
```

### UMD module

The UMD module can be used directly as a browser script (exposing WebAuthnUI as a global variable) or using CommonJS style `require`

As a script:
```html
<script type="application/javascript" src="webauthn-ui.min.js"></script>
```

Or using require:
```js
// When using automatic loading via JSON scripts (see below), just importing the library is enough:
require('webauthn-ui');

// Or if you need access to the WebAuthnUI class:
const WebAuthnUI = require('webauthn-ui');
```


## Use

The easiest way to use the library is to use the automatic initialization using a JSON script tag with a `data-webauthn` attribute. When the page is loaded it will automatically initiate the WebAuthn request specified in the JSON data without the need for any custom JavaScript.

Example WebAuthn registration:
```html
<script type="application/json" data-webauthn>
{
    "formField": "#webauthn-response",
    "type": "create",
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
    <input type="hidden" id="webauthn-response" name="response" />
</form>
```

Alternatively, you can manually initiate the request using the WebAuthnUI class:

```js
let config = { 
    "formField": "#webauthn-response",
    "type": "create",
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
};

let wa = new WebAuthnUI(config);
wa.start();
```





