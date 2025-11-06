export class ArrayUtils {
  /**
   * Finds the values unique to each array, removes common values, and merges the rest.
   *
   * @param arr1 The first array of strings.
   * @param arr2 The second array of strings.
   * @returns A new array containing only the strings unique to either arr1 or arr2.
   */
  public getUniqueMerged(arr1: string[], arr2: string[]): string[] {
    // 1. Create a Set from the first array for efficient O(1) average lookup time.
    const set1: Set<string> = new Set(arr1);

    // 2. Create a Set from the second array for efficient O(1) average lookup time.
    const set2: Set<string> = new Set(arr2);

    // 3. Filter arr1: Keep only items NOT present in set2 (unique to arr1).
    const uniqueToArr1: string[] = arr1.filter(
      (item: string) => !set2.has(item)
    );

    // 4. Filter arr2: Keep only items NOT present in set1 (unique to arr2).
    const uniqueToArr2: string[] = arr2.filter(
      (item: string) => !set1.has(item)
    );

    // 5. Merge the two arrays of unique values.
    return [...uniqueToArr1, ...uniqueToArr2];
  }
}

// --- Usage Example ---
// const arrayUtils = new ArrayUtils();
// const original = ['IBC22', 'MB8'];
// const current = ['IBC22', 'BP9'];
// const result = arrayUtils.getUniqueMerged(original, current);

// Output: ['MB8', 'BP9', 'X1']
