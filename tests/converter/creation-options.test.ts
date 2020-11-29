import * as fixtures from '../fixtures';
import Converter from '../../src/converter';

test('Minimal creation converter', () => {
  expect(Converter.convertCreationOptions({
    rp: {
      name: 'WebAuthn demo',
    },
    user: {
      name: 'freddy',
      id: fixtures.urlUserId,
      displayName: 'Freddy fruitcake',
    },
    challenge: fixtures.urlChallenge,
    pubKeyCredParams: [
      {
        type: 'public-key',
        alg: -7,
      },
    ],
  })).toEqual(
    {
      rp: {
        name: 'WebAuthn demo',
      },
      user: {
        name: 'freddy',
        id: fixtures.rawUserId,
        displayName: 'Freddy fruitcake',
      },
      challenge: fixtures.rawChallenge,
      pubKeyCredParams: [
        {
          type: 'public-key',
          alg: -7,
        },
      ],
    },
  );
});

test('Full creation converter', () => {
  expect(Converter.convertCreationOptions({
    rp: {
      id: 'demo',
      name: 'WebAuthn demo',
    },
    user: {
      name: 'freddy',
      id: fixtures.urlUserId,
      displayName: 'Freddy fruitcake',
      icon: fixtures.iconUrl,
    },
    challenge: fixtures.urlChallenge,

    pubKeyCredParams: [{
      type: 'public-key',
      alg: -7,
    }, {
      type: 'public-key',
      alg: -8,
    }],
    timeout: 123,
    excludeCredentials: [
      {
        type: 'public-key',
        id: fixtures.urlCredentialId,
        transports: ['usb', 'nfc'],
      },
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      requireResidentKey: true,
      userVerification: 'required',
    },
    attestation: 'direct',
  })).toEqual(
    {
      rp: {
        id: 'demo',
        name: 'WebAuthn demo',
      },
      user: {
        name: 'freddy',
        id: fixtures.rawUserId,
        displayName: 'Freddy fruitcake',
        icon: fixtures.iconUrl,
      },
      challenge: fixtures.rawChallenge,

      pubKeyCredParams: [{
        type: 'public-key',
        alg: -7,
      }, {
        type: 'public-key',
        alg: -8,
      }],
      timeout: 123,
      excludeCredentials: [
        {
          type: 'public-key',
          id: fixtures.rawCredentialId,
          transports: ['usb', 'nfc'],
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: true,
        userVerification: 'required',
      },
      attestation: 'direct',
    },
  );
});
