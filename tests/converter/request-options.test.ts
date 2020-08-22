import {JsonPublicKeyCredentialDescriptor} from '../../src/types';
import * as fixtures from '../fixtures';
import {Converter} from "../../src/converter";

test('Minimal request converter', () => {
    expect(Converter.convertRequestOptions({
            challenge: fixtures.urlChallenge
        })).toEqual({
            challenge: fixtures.rawChallenge,
        }
    );
});


test('Full request converter', () => {

    // TODO extensions
    expect(Converter.convertRequestOptions({

            challenge: fixtures.urlChallenge,
            timeout: 123,
            rpId: "demo",
            allowCredentials: [
                {
                    type: 'public-key',
                    id: fixtures.urlCredentialId,
                    transports: ['usb', 'nfc']
                }
             ],
            userVerification: 'required'
        }
    )).toEqual({

            challenge:  fixtures.rawChallenge,
            timeout: 123,
            rpId: "demo",
            allowCredentials: [
                {
                    type: 'public-key',
                    id: fixtures.rawCredentialId,
                    transports: ['usb', 'nfc']
                }
            ],
            userVerification: 'required'
        }
    );
});
