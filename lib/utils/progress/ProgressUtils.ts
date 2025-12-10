export class ProgressUtils {
  static getPositionFromPercentage = (percentage: number, total: number) => {
    if (percentage <= 0) return 0;
    if (percentage >= 100) return total;
    return Math.round((percentage / 100) * total);
  };
}
