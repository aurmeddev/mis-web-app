type RemoveInvalidKeysProps = {
  data: any;
  isStrictMode: boolean;
};
export class ObjectUtils {
  isValidObject(obj: Record<string, any>): boolean {
    // Check object is not empty
    if (!obj || Object.keys(obj).length === 0) {
      return false;
    }

    // Check each value
    return Object.entries(obj).every(([_, value]) => {
      if (typeof value === "string") {
        return value.trim() !== "";
      }
      return value !== null && value !== undefined;
    });
  }

  removeInvalidKeys(params: RemoveInvalidKeysProps) {
    const { data, isStrictMode } = params;
    if (!isStrictMode) {
      return data;
    }

    const newObj: any = {};
    for (const key in data) {
      const value = data[key];
      if (value) {
        newObj[key] = value;
      }
    }
    return newObj;
  }
}
