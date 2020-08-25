import * as base64 from './base64';
import {
  JsonAssertionPublicKeyCredential, JsonAttestationPublicKeyCredential,
  JsonAuthenticatorResponse,
  JsonPublicKeyCredentialCreationOptions,
  JsonPublicKeyCredentialRequestOptions,
} from './types';

const enum MapAction
{
  Copy = 0,
  Base64Decode = 1,
  Base64Encode = 2
}

type Mapper<D, S> =
{
    [K in keyof D & keyof S]: ((val: Exclude<S[K], undefined>) => D[K]) | Mapper<D[K], S[K]> | MapAction;
};

function map<D, S>(src: S, mapper: Mapper<D, S>): D {
  const dest : D = {} as D;
  const keys = Object.keys(mapper);
  for (let i = 0; i < keys.length; i++) {
    const k : keyof D & keyof S = keys[i] as keyof D & keyof S;
    const action = mapper[k];
    const val = src[k] as any;

    if (val !== undefined) {
      if (action === MapAction.Copy) {
        dest[k] = val as any;
      } else if (action === MapAction.Base64Decode) {
        dest[k] = val === null ? null : base64.decode(val as unknown as string) as any;
      } else if (action === MapAction.Base64Encode) {
        dest[k] = val === null ? null : base64.encode(val as unknown as ArrayBuffer) as any;
      } else if (typeof action === 'object') {
        dest[k] = map(val, action as any) as any;
      } else {
        dest[k] = (action as (v: any) => any)(val);
      }
    }
  }
  return dest;
}

function arrayMap<D, S>(mapper: Mapper<D, S>): (src: S[]) => D[] {
  return (src: S[]) => {
    const dest: D[] = [];
    for (let i = 0; i < src.length; i++) {
      dest[i] = map(src[i], mapper);
    }
    return dest;
  };
}

function getCredentialDescListMap() {
  return arrayMap({
    type: MapAction.Copy,
    id: MapAction.Base64Decode,
    transports: MapAction.Copy,
  });
}

export default class Converter {
  public static convertCreationOptions(options: JsonPublicKeyCredentialCreationOptions): PublicKeyCredentialCreationOptions {
    return map(options, {
      rp: MapAction.Copy,
      user: {
        id: MapAction.Base64Decode,
        name: MapAction.Copy,
        displayName: MapAction.Copy,
        icon: MapAction.Copy,
      },
      challenge: MapAction.Base64Decode,
      pubKeyCredParams: MapAction.Copy,
      timeout: MapAction.Copy,
      excludeCredentials: getCredentialDescListMap(),
      authenticatorSelection: MapAction.Copy,
      attestation: MapAction.Copy,
      extensions: {
        appid: MapAction.Copy,
      },
    });
  }

  public static convertCreationResponse(pkc: PublicKeyCredential): JsonAttestationPublicKeyCredential {
    return map(pkc, {
      type: MapAction.Copy,
      id: MapAction.Copy,
      rawId: MapAction.Base64Encode,
      response: {
        clientDataJSON: MapAction.Base64Encode,
        attestationObject: MapAction.Base64Encode,
      } as Mapper<JsonAuthenticatorResponse, AuthenticatorResponse>,
    });
  }

  public static convertRequestOptions(options: JsonPublicKeyCredentialRequestOptions): PublicKeyCredentialRequestOptions {
    return map(options, {
      challenge: MapAction.Base64Decode,
      timeout: MapAction.Copy,
      rpId: MapAction.Copy,
      allowCredentials: getCredentialDescListMap(),
      userVerification: MapAction.Copy,
      extensions: {
        appid: MapAction.Copy,
      },
    });
  }

  public static convertRequestResponse(pkc: PublicKeyCredential): JsonAssertionPublicKeyCredential {
    // TODO extensions
    return map(pkc, {
      type: MapAction.Copy,
      id: MapAction.Copy,
      rawId: MapAction.Base64Encode,
      response: {
        clientDataJSON: MapAction.Base64Encode,
        authenticatorData: MapAction.Base64Encode,
        signature: MapAction.Base64Encode,
        userHandle: MapAction.Base64Encode,
      } as Mapper<JsonAuthenticatorResponse, AuthenticatorResponse>,
    });
  }
}
