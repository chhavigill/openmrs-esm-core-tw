import offlineEncryptionPlugin from "./routing-plugins";

const mockDecryptFunction = jest.fn();

jest.mock("@openmrs/esm-offline/src/encryption", () => ({
  encryption: true,
  decrypt: jest.fn(async (json) => { return { x: "y" }; }),
  encrypt: jest.fn(async (json) => { return { encryptedData: "someEncryptedData" }; }),
}));

describe("should attempt to encrypt or decrypt if enabled by configuration", () => {
  it("should use response in cache as is", async () => {
    const sampleHeaders = new Headers();
    sampleHeaders.append("testOnly", "testVal");
    const sampleResponse = new Response("some body", {
      headers: sampleHeaders,
    });

    const result: Response =
      await offlineEncryptionPlugin.cachedResponseWillBeUsed({
        cacheName: "someCache",
        request: null,
        matchOptions: null,
        cachedResponse: sampleResponse,
        event: null,
        state: null,
      });

    expect(await result.text()).toBe("some body");
  });

  it("should decrypt response in cache when encrypted", async () => {
    const sampleHeaders = new Headers();
    sampleHeaders.append("testOnly", "testVal");
    sampleHeaders.append("encryption", "true");
    const sampleResponse = new Response(JSON.stringify({ body: "some body" }), {
      headers: sampleHeaders,
    });

    const result: Response =
      await offlineEncryptionPlugin.cachedResponseWillBeUsed({
        cacheName: "someCache",
        request: null,
        matchOptions: null,
        cachedResponse: sampleResponse,
        event: null,
        state: null,
      });

    const jsonResult: JSON = await result.json();
    expect(jsonResult["x"]).toBe("y");
  });

  it("should encrypt data to be cached", async () => {
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
    expect(resultJson["encryptedData"]).toBe("someEncryptedData");
  });

  it("should not encrypt data to be cached if content type does not match", async () => {
    const sampleHeaders = new Headers();
    sampleHeaders.append("testOnly", "testVal");
    sampleHeaders.append("encryption", "true");
    sampleHeaders.append("content-type", "someOtherContentType");
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

  it("should not encrypt data to be cached if URL pattern does not match", async () => {
    const sampleHeaders = new Headers();
    sampleHeaders.append("testOnly", "testVal");
    sampleHeaders.append("encryption", "true");
    sampleHeaders.append("content-type", "someOtherContentType");
    const sampleResponse = new Response(JSON.stringify({ body: "some body" }), {
      headers: sampleHeaders,
    });
    const result: Response = await offlineEncryptionPlugin.cacheWillUpdate({
      request: { url: "somethingNotSupported" },
      response: sampleResponse,
      event: null,
      state: null,
    });
    const resultJson = await result.json();
    expect(resultJson["body"]).toBe("some body");
  });
});
