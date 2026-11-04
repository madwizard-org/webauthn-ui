# Changelog

## 3.0.0 

The main goal of this library was conversion between JSON and the WebAuthn structures containing binary data. The WebAuthn API now has native support for this conversion (`PublicKeyCredential.parseCreationOptionsFromJSON()`, `parseRequestOptionsFromJSON()` and `toJSON()`) making this library largely obsolete. Version 3 of this library uses the native functionality instead of its own conversion, but maintains most of the same API for backwards compatibility. You may consider dropping this library and calling the native API yourself instead.

### Breaking changes

- Browsers without native WebAuthn JSON support (`PublicKeyCredential.parseRequestOptionsFromJSON`) are now reported as unsupported: `isSupported()` returns `false`, `createCredential()`/`getCredential()` throw `unsupported` and automatic configuration reports `{"status":"failed","error":"unsupported"}`.
- Credential responses are now the browser's standard `toJSON()` output (`RegistrationResponseJSON` / `AuthenticationResponseJSON`). Compared to 2.x, `clientExtensionResults` is always present, registration responses contain additional fields (`authenticatorData`, `transports`, `publicKeyAlgorithm`, `publicKey`, `authenticatorAttachment`) and `userHandle` is omitted instead of `null` when absent. Server-side parsing may need updating.
- Options are passed to the browser as-is, using the standard `PublicKeyCredentialCreationOptionsJSON` / `PublicKeyCredentialRequestOptionsJSON` format. Invalid options are now rejected by the browser instead of the library, so they result in a `dom-*` or `unknown` error rather than `parse-error`.
- Removed the `Json*` TypeScript types (`JsonPublicKeyCredentialCreationOptions`, `JsonAttestationPublicKeyCredential`, etc.); use the standard DOM types listed above instead.
- Automatic initialisation no longer runs on import, and the `autoPromise` export has been removed. Call the new `autoWebAuthn()` export to detect support (CSS classes) and set up `data-webauthn` elements. Its returned promise rejects on configuration errors instead of logging them to the console.
- The UMD build has been removed; the package is now ES module only (`"type": "module"`). Build output moved from `dist/es/` and `dist/umd/` to `dist/webauthn-ui.js` and `dist/webauthn-ui.min.js`, and the `module` field was removed from `package.json`.
- The build now targets ES2020 instead of ES5.

### Changes

- Added a `load` trigger (`{"event": "load"}`) for automatic mode, which initiates the request when the page has loaded.
- Added a `triggers` option for automatic mode to specify multiple triggers. It can be combined with the existing `trigger` option.
- Triggers in automatic mode are now ignored while a request is still in progress, instead of starting a second request.
- All WebAuthn options and extensions supported by the browser can now be used; previously only a fixed subset (and the `appid` extension) was passed on.
- Added error types `dom-constraint` (`ConstraintError`), `dom-not-readable` (`NotReadableError`) and `dom-timeout` (`TimeoutError`). `UnknownError` now maps explicitly to `dom-unknown`.
- Errors thrown while parsing options are now wrapped in a `WebAuthnError`, like errors from the credential request itself.
- `WebAuthnError.fromError()` accepts any thrown value, including non-`Error` values.
- Updated tooling to current versions: TypeScript 6, Rollup 4, Jest 30 and ESLint 10.

## 2.0.0 (2020-11-29)

Changed automatically initiated WebAuthn ceremonies on page load to trigger on user initiated events (click) instead. This because WebKit has this as a requirement for platform authenticators.   

## 1.0.0 (2020-09-15)

First stable release

