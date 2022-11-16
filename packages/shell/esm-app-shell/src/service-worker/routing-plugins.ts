import {
    encrypt,
    decrypt,
    encryption
} from "@openmrs/esm-offline/src/encryption";



const offlineEncryptionPlugin = {
    cachedResponseWillBeUsed: async ({
        cacheName,
        request,
        matchOptions,
        cachedResponse,
        event,
        state,
    }) => {
        var responseClone = cachedResponse.clone();
        var resHeaders = responseClone.headers;
        var isEncrypted = resHeaders.has("encryption");
        if (isEncrypted) {
            var resJson = await responseClone.json().then((json) => json);
            var decryptedJson = await decrypt(resJson);

            return new Response(JSON.stringify(decryptedJson), {
                headers: resHeaders,
            });
        }
        return cachedResponse;
    },
    cacheWillUpdate: async ({ request, response, event, state }) => {
        if (!encryption) {
            return response;
        }
        if (request.url.includes("fhir")) {
            var responseClone = response.clone();
            var contentType;
            var resHeaders = new Headers(responseClone.headers);
            contentType = resHeaders.get("content-type");
            if (contentType == "application/fhir+json;charset=UTF-8") {
                resHeaders.append("encryption", encryption.toString());
                var resJson = await responseClone.json();
                var encryptedJson = await encrypt(resJson);
                return new Response(JSON.stringify(encryptedJson), {
                    headers: resHeaders,
                });
            }
        }
        return response;
    },
};

export default offlineEncryptionPlugin