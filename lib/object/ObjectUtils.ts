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

  removeInvalidKeys(obj: any) {
    let newObj: any = {};
    for (const key in obj) {
      const value = obj[key];
      if (value) {
        newObj[key] = value;
      }
    }
    return newObj;
  }
}
