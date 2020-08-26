# webauthn-ui

![CI Status](https://github.com/madwizard-org/webauthn-ui/workflows/CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/madwizard-org/webauthn-ui/badge.svg)](https://coveralls.io/github/madwizard-org/webauthn-ui)
[![Version](https://img.shields.io/npm/v/webauthn-ui.svg)](https://www.npmjs.com/package/webauthn-ui)
[![License](https://img.shields.io/npm/l/webauthn-ui.svg)](https://www.npmjs.com/package/webauthn-ui)

*Beta version: library is functional but documentation not yet complete*

**webauthn-ui** is a browser JS library that functions as a translator between the *W3C Web Authentication API* that modern browsers support and a json compatible version that can be send through form posts or XHR calls.

It can also handle some auxilliary tasks such as initiating the WebAuthn requests, detecting support and posting the response in a hidden form field.

## Features

- API for translating between the WebAuthn API structures and pure json structures.
- Automatically initiating a WebAuthn request and posting the response as json in a hidden form field without the need for custom javascript.
- Detection of WebAuthn support with graceful error handling.
- Adding CSS classes indicating WebAuthn feature support.
 
## Purpose

The WebAuthn API makes use of numerous JavaScript structures (such as PublicKeyCredential) for its inputs and outputs. For the most part these structures contain simple values that can directly be converted to json. However, binary ArrayBuffers are used in several places and these need to be converted back and forth to another type (base64url encoded strings) when translating to and from json. 

This library will keep the types supported in json the same. ArrayBuffers are converter to base64url encoded strings. To convert json back to the JavaScript structures knowledge of the structure is needed because base64url encoded strings are indistinguishable from normal strings. For this reason webauthn-ui only supports the fields that it knows of.

For convenience a custom html5 data attribute can be used to automatically initiate a WebAuthn request on page load and posting the response to a hidden form input element. Using this method no custom javascript is needed, the webauthn-ui library can be included and it will automatically look for a json configuration in either a `data-webauthn` attribute on an input field or a `<script type='application/json' data-webauthn>` block containing the configuration.


## Installation

Install the module with `npm install webauthn-ui`.

The library is available as ES and UMD modules. Both libraries are ES5 compatible, but do require a Promise implementation. For IE11 this means you need to use a polyfill such as [es6-promise](https://github.com/stefanpenner/es6-promise). Although all browsers that support WebAuthn support ES modules as well, it is still useful to support ES5 browsers for graceful handling in case WebAuthn is not supported.

### ES module

You can use the ES module with the `import` statement in your main code.

```js
// When using automatic loading via json scripts (see below), just importing the library is enough:
import 'webauthn-ui';

// Or if you need access to the WebAuthnUI class:
import WebAuthnUI from 'webauthn-ui';
```

### UMD module

The UMD module can be used directly as a browser script (exposing WebAuthnUI as a global variable) or using CommonJS style `require`

As a script:
```html
<script type="application/javascript" src="es6-promise.auto.min.js"></script> <!-- For old and crappy browsers -->
<script type="application/javascript" src="webauthn-ui.min.js"></script>
```

Or using require:
```js

require('es6-promise')

// When using automatic loading via json scripts/html attributes (see below), just importing the library is enough:
require('webauthn-ui');

// Or if you need access to the WebAuthnUI class:
const WebAuthnUI = require('webauthn-ui');
```


## Use


### Automatic 

The easiest way to use the library is to add a `data-webauthn` to an input element with a json configuration as the attribute's value.  When the page is loaded it will automatically initiate the WebAuthn request specified in the json data without the need for any custom JavaScript. The response will be put in the field's value and the form submitted automatically (by default).

Example WebAuthn registration:
```html
<input type="hidden" name="response" data-webauthn="{{&quot;type&quot;:&quot;create&quot;,&quot;request&quot;:{&quot;rp&quot;:{&quot;name&quot;:&quot;WebAuthn demo&quot;},&quot;user&quot;:{&quot;name&quot;:&quot;freddy&quot;,&quot;id&quot;:&quot;cGJ6WVlzRXNF&quot;,&quot;displayName&quot;:&quot;Freddy fruitcake&quot;},&quot;challenge&quot;:&quot;7b1m6n2KgMAuTp-FbOAl6sb0gD_5HZITqDF7ld8tl28&quot;,&quot;pubKeyCredParams&quot;:[{&quot;type&quot;:&quot;public-key&quot;,&quot;alg&quot;:-7}]}}" />
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


