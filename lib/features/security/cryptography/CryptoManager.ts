import { CryptoMethodProps, CryptoProps } from "./type/CryptoMethodProps";

export class CryptoManager {
  constructor(private service: CryptoMethodProps) {
    this.service = service;
  }
  async encrypt(params: CryptoProps) {
    return this.service.encrypt(params);
  }

  async decrypt(params: CryptoProps) {
    return this.service.decrypt(params);
  }
}
