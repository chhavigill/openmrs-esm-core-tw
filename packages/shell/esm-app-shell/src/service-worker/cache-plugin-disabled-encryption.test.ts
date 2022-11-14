import offlineEncryptionPlugin from "./routing-plugins";

const mockDecryptFunction = jest.fn()

jest.mock("@openmrs/esm-offline/src/encryption", () => {
    const encryptionModule = jest.requireActual("@openmrs/esm-offline/src/encryption");
    return {
        _esModule: true,
        ...encryptionModule,
        encryption: false,
        decrypt: (json: JSON) => { return { x: 'y' } },
        encrypt: (json: JSON) => { return { encryptedData: 'someEncryptedData' } }
    }
})


describe("should not attempt encryption if disabled by configuration", () => {

    it("should not encrypt data to be cached if encryption is not enabled", async () => {
        const sampleHeaders = new Headers();
        sampleHeaders.append('testOnly', 'testVal');
        sampleHeaders.append('encryption', "true");
        sampleHeaders.append('content-type', 'application/fhir+json;charset=UTF-8')
        const sampleResponse = new Response(JSON.stringify({ body: 'some body' }), {
            headers: sampleHeaders
        });
        const result: Response = await offlineEncryptionPlugin.cacheWillUpdate(
            {
                request: { url: 'something.fhir' },
                response: sampleResponse,
                event: null,
                state: null
            }
        )
        const resultJson = await result.json()
        expect(resultJson['body']).toBe('some body')
    })
})