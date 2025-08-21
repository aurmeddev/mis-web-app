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
          const { encryptedData, isSuccess } = await security.encrypt({
            data: value,
          });
          result.push(isSuccess ? encryptedData : value);
        } else {
          const { decryptedData, isSuccess } = await security.decrypt({
            data: value,
          });
          result.push(isSuccess ? decryptedData : value);
        }
      }
    } else if (params.data && params.data.includes(",")) {
      const splittedBrand = params.data.split(",").map((item) => item.trim());
      for (let i = 0; i < splittedBrand.length; i++) {
        const value = String(splittedBrand[i]);
        if (params.isEncrypt) {
          const { encryptedData, isSuccess } = await security.encrypt({
            data: value,
          });
          result.push(isSuccess ? encryptedData : value);
        } else {
          const { decryptedData, isSuccess } = await security.decrypt({
            data: value,
          });
          result.push(isSuccess ? decryptedData : value);
        }
      }
    }
    // If it's a single value, decrypt it directly
    else {
      const value = String(params.data);
      if (params.isEncrypt) {
        const { encryptedData, isSuccess } = await security.encrypt({
          data: value,
        });
        result.push(isSuccess ? encryptedData : value);
      } else {
        const { decryptedData, isSuccess } = await security.decrypt({
          data: value,
        });
        result.push(isSuccess ? decryptedData : value);
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
          const { encryptedData, isSuccess } = await security.encrypt({
            data: value,
          });
          value = isSuccess ? encryptedData : value; // Return the original value if encryption fails
        } else {
          const { decryptedData, isSuccess } = await security.decrypt({
            data: value,
          });
          value = isSuccess ? decryptedData : value; // Return the original value if decryption fails
        }
        cryptoResult[key] = value;
      }
    }
    return cryptoResult;
  }
}
