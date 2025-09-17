export class VoluumApiConfig {
  baseUrl = `${process.env.NEXT_VOLUUM_API_BASE_URL}`;
  auth = {
    accessId: `${process.env.NEXT_VOLUUM_API_ACCESSID}`,
    accessKey: `${process.env.NEXT_VOLUUM_API_ACCESSKEY}`,
  };
}
