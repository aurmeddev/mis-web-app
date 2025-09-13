const CryptoJS = require("crypto-js");
import { CryptoProps } from "./type/CryptoMethodProps";
export class CryptoServerService {
  private secretKey = `${process.env.NEXT_CRYPTOGRAPHY_SECRET_KEY}`;
  async encrypt(params: CryptoProps) {
    try {
      const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes = 128 bits
      // Encrypt the data using AES-256-CBC
      const encrypted = CryptoJS.AES.encrypt(
        params.data,
        CryptoJS.SHA256(this.secretKey),
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      // Combine IV and encrypted data
      const ivAndEncrypted = CryptoJS.lib.WordArray.create()
        .concat(iv)
        .concat(encrypted.ciphertext);

      const encryptedData = CryptoJS.enc.Base64.stringify(ivAndEncrypted); // Return as Base64 string

      return {
        isSuccess: encryptedData ? true : false,
        encryptedData: encryptedData,
        message: encryptedData
          ? "Data has been encryted."
          : "Data encryption error.",
      };
    } catch (error: any) {
      console.log(error);
      return {
        isSuccess: false,
        encryptedData: "",
        message: "Data encryption error.",
      };
    }
  }

  async decrypt(params: CryptoProps) {
    try {
      const ivAndEncrypted = CryptoJS.enc.Base64.parse(params.data);
      const iv = CryptoJS.lib.WordArray.create(
        ivAndEncrypted.words.slice(0, 4)
      );
      const encryptedCiphertext = CryptoJS.lib.WordArray.create(
        ivAndEncrypted.words.slice(4)
      );

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encryptedCiphertext },
        CryptoJS.SHA256(this.secretKey),
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      const decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
      return {
        isSuccess: decryptedData ? true : false,
        decryptedData: decryptedData,
        message: decryptedData
          ? "Data has been decrypted."
          : "Data decryption error.",
      };
    } catch (error: any) {
      console.log(error);
      return {
        isSuccess: false,
        decryptedData: "",
        message: "Data decryption error.",
      };
    }
  }

  async encryptObjectData<T>(params: { [key: string]: T }) {
    const result: Record<string, any> = {};
    for (const prop of Object.keys(params)) {
      const value = params[prop];
      if (value) {
        const { isSuccess, encryptedData, message } = await this.encrypt({
          data: String(value),
        });
        result[prop] = isSuccess ? encryptedData : message;
      }
    }

    return result;
  }

  async decryptObjectData<T>(params: { [key: string]: T }) {
    const result: Record<string, any> = {};
    for (const prop of Object.keys(params)) {
      const value = params[prop];
      if (value) {
        const { isSuccess, decryptedData, message } = await this.decrypt({
          data: String(value),
        });
        result[prop] = isSuccess ? decryptedData : message;
      }
    }

    return result;
  }
}
