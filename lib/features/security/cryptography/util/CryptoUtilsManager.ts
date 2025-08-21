import {
  CryptoArrayStringProps,
  CryptoObjectProps,
  CryptoUtilsManagerProps,
} from "./type/CryptoUtilsManagerProps";

export class CryptoUtilsManager {
  constructor(private service: CryptoUtilsManagerProps) {
    this.service = service;
  }

  async cryptoArrayString(params: CryptoArrayStringProps) {
    return this.service.cryptoArrayString(params);
  }
  async cryptoObject(params: CryptoObjectProps) {
    return this.service.cryptoObject(params);
  }
}
