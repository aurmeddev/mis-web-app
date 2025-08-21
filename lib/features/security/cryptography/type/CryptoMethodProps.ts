type CryptoProps = {
  data: string;
};

type CryptoMethodProps = {
  encrypt: (params: CryptoProps) => Promise<any>;
  decrypt: (params: CryptoProps) => Promise<any>;
};

export type { CryptoProps, CryptoMethodProps };
