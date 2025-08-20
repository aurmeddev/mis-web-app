import { isEnvProduction } from "../env/isEnvProduction";
export const appBaseUrl = isEnvProduction
  ? process.env.NEXT_PUBLIC_PROD_BASE_URL
  : process.env.NEXT_PUBLIC_DEV_BASE_URL;
