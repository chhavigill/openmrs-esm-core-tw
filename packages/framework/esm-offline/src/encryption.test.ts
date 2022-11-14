import { 
    setCryptoKey, 
    clearPasswordData, 
    isPasswordExpired, 
    encryptData, 
    isPasswordCorrect, 
    encrypt, 
    decrypt, 
    unsetCryptoKey 
} from '@openmrs/esm-offline/src/encryption';
import { setPasswordData } from "./encryption";

const crypto = require('crypto');
Object.defineProperty(self, 'crypto', {
  value: {
    subtle: crypto.webcrypto.subtle,
    getRandomValues: (arr) => crypto.randomBytes(arr.length)
  }
});

describe("setPasswordData", () => {
    it("sets encryption reference and time in local storage", async () => {
        let localStorageSet = jest.spyOn(window.localStorage.__proto__, 'setItem');
        let key = await setCryptoKey("password");
        await setPasswordData(key);
        expect(localStorageSet).toHaveBeenCalledWith("encryptedReferenceContent", expect.anything());
        expect(localStorageSet).toHaveBeenCalledWith("encryptedReferenceNonce", expect.anything());
        expect(localStorageSet).toHaveBeenCalledWith("encryptedKeyCreationTime", expect.anything());
        expect(localStorageSet).toHaveBeenCalledTimes(3);
        localStorageSet.mockRestore();
    })
})

describe("clearPasswordData", () => {
    it("clears encryption reference and time in local storage", async () => {
        let localStorageRemove = jest.spyOn(window.localStorage.__proto__, 'removeItem');
        clearPasswordData();
        expect(localStorageRemove).toHaveBeenCalledWith("encryptedReferenceContent");
        expect(localStorageRemove).toHaveBeenCalledWith("encryptedReferenceNonce");
        expect(localStorageRemove).toHaveBeenCalledWith("encryptedKeyCreationTime");
        expect(localStorageRemove).toHaveBeenCalledTimes(3);
    })
})

describe("isPasswordExpired", () => {
    it("returns true if password expiry time is not set", async () => {
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValueOnce(null);
        let result = isPasswordExpired();
        expect(result).toBe(true);
    })

    it("returns false if password expiry time has not passed", async () => {
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValueOnce(Date.now().toString());
        let result = isPasswordExpired();
        expect(result).toBe(false);
    })

    it("returns true if password expiry time has passed", async () => {
        let expiredDate = new Date(Date.now() - 3600000 * 9);
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValueOnce(expiredDate.getTime());
        let result = isPasswordExpired();
        expect(result).toBe(true);
    })
})

describe("isPasswordCorrect", () => {
    it("returns true if the password is correct", async () => {
        let key = await setCryptoKey("password");
        let data = await encryptData("OpenMRS",key)
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValueOnce(data[0]);
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValueOnce(data[1]);

        let result = await isPasswordCorrect("password");
        expect(result).toBe(true);
    })

    it("returns false if the password is incorrect", async () => {
        let key = await setCryptoKey("password");
        let data = await encryptData("OpenMRS",key)
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValueOnce(data[0]);
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValueOnce(data[1]);

        let result = await isPasswordCorrect("password2");
        expect(result).toBe(false);
    })
})

let data = { data: "content" }
let stringifiedData = JSON.stringify(data);
let jsonData = JSON.parse(stringifiedData);

describe("encrypt and decrypt", () => {
    beforeEach(async () => {
        unsetCryptoKey();
    })

    it("encrypts and decrypts data where correct nonce is provided", async () => {
        await setCryptoKey("password");
        const encryptionResult = await encrypt(jsonData);
        expect(encryptionResult).not.toHaveProperty("data");
        expect(encryptionResult).toHaveProperty("content");
        expect(encryptionResult).toHaveProperty("nonce");


        const encryptedJsonData = JSON.parse(JSON.stringify(encryptionResult));
        const decryptionResult = await decrypt(encryptedJsonData);
        expect(decryptionResult).toHaveProperty("data", "content");
        expect(decryptionResult).not.toHaveProperty("content");
        expect(decryptionResult).not.toHaveProperty("nonce");
    })

    it("does not decrypt data where incorrect nonce is provided", async () => {
        await setCryptoKey("password");
        const encryptionResult = await encrypt(jsonData);
        expect(encryptionResult).not.toHaveProperty("data");
        expect(encryptionResult).toHaveProperty("content");
        expect(encryptionResult).toHaveProperty("nonce");

        encryptionResult.nonce = "incorrect nonce";
        const encryptedJsonData = JSON.parse(JSON.stringify(encryptionResult));
        const decryptionResult = await decrypt(encryptedJsonData);
        expect(decryptionResult).not.toHaveProperty("data");
    })

    it("does not decrypt data where incorrect key is provided", async () => {
        await setCryptoKey("password");
        const encryptionResult = await encrypt(jsonData);
        expect(encryptionResult).not.toHaveProperty("data");
        expect(encryptionResult).toHaveProperty("content");
        expect(encryptionResult).toHaveProperty("nonce");

        await setCryptoKey("password2");
        const encryptedJsonData = JSON.parse(JSON.stringify(encryptionResult));
        const decryptionResult = await decrypt(encryptedJsonData);
        expect(decryptionResult).not.toHaveProperty("data");
    })

    it("encrypt throws error when key is not set", async () => {
        await expect(encrypt(jsonData)).rejects.toThrow(Error("Encryption password not set. Offline features are disabled."));
    })

    it("decrypt throws error when key is not set", async () => {
        await expect(decrypt(jsonData)).rejects.toThrow(Error("Encryption password not set. Offline features are disabled."));
    })
})