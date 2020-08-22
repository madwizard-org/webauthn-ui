import {WebAuthnError} from "./error";

export function encode(arraybuffer: ArrayBuffer): string {

    let buffer = new Uint8Array(arraybuffer);
    let binary: string = '';
    for (let i = 0; i < buffer.length; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    let encoded = window.btoa(binary);

    let i = encoded.length - 1;
    while (i > 0 && encoded[i] === '=') {
        i--;
    }
    encoded = encoded.substr(0, i + 1);
    encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_');

    return encoded;
}

export function decode(base64: string): ArrayBuffer {

    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

    switch (base64.length % 4) {
        case 2:
            base64 += "==";
            break;
        case 3:
            base64 += "=";
            break;
        case 1:
            throw new WebAuthnError('parse-error');
    }

    let bin = window.atob(base64);

    let buffer = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        buffer[i] = bin.charCodeAt(i);
    }

    return buffer;
}

