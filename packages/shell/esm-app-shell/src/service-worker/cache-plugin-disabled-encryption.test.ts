import offlineEncryptionPlugin from "./routing-plugins";

jest.mock("@openmrs/esm-offline/src/encryption", () => ({
  encryption: false,
  decrypt: jest.fn(async (json) => { return { x: "y" }; }),
  encrypt: jest.fn(async (json) => { return { encryptedData: "someEncryptedData" }; }),
}));

describe("should not attempt encryption if disabled by configuration", () => {
  it("should not encrypt data to be cached if encryption is not enabled", async () => {
    const sampleHeaders = new Headers();
    sampleHeaders.append("testOnly", "testVal");
    sampleHeaders.append("encryption", "true");
    sampleHeaders.append("content-type", "application/fhir+json;charset=UTF-8");
    const sampleResponse = new Response(JSON.stringify({ body: "some body" }), {
      headers: sampleHeaders,
    });
    const result: Response = await offlineEncryptionPlugin.cacheWillUpdate({
      request: { url: "something.fhir" },
      response: sampleResponse,
      event: null,
      state: null,
    });
    const resultJson = await result.json();
    expect(resultJson["body"]).toBe("some body");
  });
});
