export class NetworkRequestUtils {
  batchAllSettled = async (tasks: (() => Promise<any>)[], batchSize = 50) => {
    const results: any[] = [];

    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize).map((fn) => fn());
      const settled = await Promise.allSettled(batch);
      results.push(...settled);
    }

    return results;
  };
}
