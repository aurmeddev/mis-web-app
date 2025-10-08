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
    const newObj: any = {};
    for (const key in data) {
      const value = data[key];
      if (!isStrictMode) {
        if (typeof value !== "undefined") {
          newObj[key] = value;
        }
      } else {
        if (value) {
          newObj[key] = value;
        }
      }
    }
    return newObj;
  }

  removeDuplicateObjects(params: {
    array: Record<string, any>[];
  }): Record<string, any>[] {
    const { array } = params;
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    // 1. Map all objects to their unique JSON string representation.
    const stringifiedObjects = array.map((obj) => JSON.stringify(obj));

    // 2. Use a Set on the array of strings. The Set automatically filters out duplicates.
    const uniqueStringsSet = new Set(stringifiedObjects);

    // 3. Convert the Set back to an array of strings, and then parse each string
    // back into a JavaScript object.
    return Array.from(uniqueStringsSet).map((str) => JSON.parse(str));
  }
}
