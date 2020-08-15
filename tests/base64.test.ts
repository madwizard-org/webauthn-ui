import {decode, encode} from "../src/base64";
import {WebAuthnError} from "../src/types";


test('base64url encode', () => {
    expect(encode(new Uint8Array())).toBe('');
    expect(encode(new Uint8Array([0x61]))).toBe('YQ');
    expect(encode(new Uint8Array([0x61, 0x62]))).toBe('YWI');
    expect(encode(new Uint8Array([0x61, 0x62, 0x63]))).toBe('YWJj');
    expect(encode(new Uint8Array([0x61, 0x62, 0x63, 0x64]))).toBe('YWJjZA');
    expect(encode(new Uint8Array([0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A]))).toBe('YWJjZGVmZ2hpag');
    expect(encode(new Uint8Array([0x3c, 0x4f, 0xbf, 0x08]))).toBe('PE-_CA');
});

test('base64url decode', () => {
    expect(decode('')).toEqual(new Uint8Array());
    expect(decode('YQ')).toEqual(new Uint8Array([0x61]));
    expect(decode('YWI')).toEqual(new Uint8Array([0x61, 0x62]));
    expect(decode('YWJj')).toEqual(new Uint8Array([0x61, 0x62, 0x63]));
    expect(decode('YWJjZA')).toEqual(new Uint8Array([0x61, 0x62, 0x63, 0x64]));
    expect(decode('YWJjZGVmZ2hpag')).toEqual(new Uint8Array([0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A]));
    expect(decode('PE-_CA')).toEqual(new Uint8Array([0x3c, 0x4f, 0xbf, 0x08]));
});

test('base64url decode failure', () => {
    expect(() => decode('#')).toThrow(WebAuthnError);
});
