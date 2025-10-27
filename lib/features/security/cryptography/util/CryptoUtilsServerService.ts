import { CryptoManager } from "../CryptoManager";
import { CryptoServerService } from "../CryptoServerService";
import {
  CryptoArrayStringProps,
  CryptoObjectProps,
} from "./type/CryptoUtilsManagerProps";

export class CryptoUtilsServerService {
  async cryptoArrayString(params: CryptoArrayStringProps) {
    const security = new CryptoManager(new CryptoServerService());
    const result: string[] = [];
    if (Array.isArray(params.data)) {
      for (let i = 0; i < params.data.length; i++) {
        const value = String(params.data[i]);
        if (params.isEncrypt) {
          const { encryptedData, isSuccess, message } = await security.encrypt({
            data: value,
          });
          result.push(isSuccess ? encryptedData : message);
        } else {
          const { decryptedData, isSuccess, message } = await security.decrypt({
            data: value,
          });
          result.push(isSuccess ? decryptedData : message);
        }
      }
    } else if (params.data && params.data.includes(",")) {
      const splittedBrand = params.data.split(",").map((item) => item.trim());
      for (let i = 0; i < splittedBrand.length; i++) {
        const value = String(splittedBrand[i]);
        if (params.isEncrypt) {
          const { encryptedData, isSuccess, message } = await security.encrypt({
            data: value,
          });
          result.push(isSuccess ? encryptedData : message);
        } else {
          const { decryptedData, isSuccess, message } = await security.decrypt({
            data: value,
          });
          result.push(isSuccess ? decryptedData : message);
        }
      }
    }
    // If it's a single value, decrypt it directly
    else {
      const value = String(params.data);
      if (params.isEncrypt) {
        const { encryptedData, isSuccess, message } = await security.encrypt({
          data: value,
        });
        result.push(isSuccess ? encryptedData : message);
      } else {
        const { decryptedData, isSuccess, message } = await security.decrypt({
          data: value,
        });
        result.push(isSuccess ? decryptedData : message);
      }
    }

    return {
      array: () => result,
      string: () => result.join(","),
    };
  }
  async cryptoObject(params: CryptoObjectProps) {
    const security = new CryptoManager(new CryptoServerService());
    const cryptoResult: any = {};
    for (const key in params.data) {
      if (params.data.hasOwnProperty(key)) {
        let value = String(params.data[key]);
        if (params.isEncrypt) {
          const { encryptedData, isSuccess, message } = await security.encrypt({
            data: value,
          });
          value = isSuccess ? encryptedData : message; // Return the error message if encryption fails
        } else {
          const { decryptedData, isSuccess, message } = await security.decrypt({
            data: value,
          });
          value = isSuccess ? decryptedData : message; // Return the error message if decryption fails
        }
        cryptoResult[key] = value;
      }
    }
    return cryptoResult;
  }
}
