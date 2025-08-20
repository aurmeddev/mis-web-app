type CryptoTypeModeProps = {
  isEncrypt?: boolean;
};
type CryptoArrayStringProps = CryptoTypeModeProps & {
  data: string | string[];
};
type CryptoObjectProps = CryptoTypeModeProps & {
  data: { [key: string]: string };
};

type CryptoUtilsManagerProps = {
  cryptoArrayString: (params: CryptoArrayStringProps) => Promise<any>;
  cryptoObject: (params: CryptoObjectProps) => Promise<any>;
};

export type {
  CryptoUtilsManagerProps,
  CryptoArrayStringProps,
  CryptoObjectProps,
};
