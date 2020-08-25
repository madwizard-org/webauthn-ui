import * as fixtures from '../fixtures';
import Converter from '../../src/converter';

test('Attestation response converter', () => {
  expect(Converter.convertCreationResponse(
    {
      id: fixtures.urlCredentialId,
      type: 'public-key',
      rawId: fixtures.rawCredentialId,
      response: {
        clientDataJSON: fixtures.rawClientDataJson,
        attestationObject: fixtures.rawAttestationObject,
      } as AuthenticatorAttestationResponse,
      getClientExtensionResults() {
        return {};
      },
    },
  )).toEqual(
    {
      id: fixtures.urlCredentialId,
      type: 'public-key',
      rawId: fixtures.urlCredentialId,
      response: {
        clientDataJSON: fixtures.urlClientDataJson,
        attestationObject: fixtures.urlAttestationObject,
      },
    },
  );
});
