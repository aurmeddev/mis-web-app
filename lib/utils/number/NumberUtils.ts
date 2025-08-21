export class NumberUtils {
  isNumber(value: any): boolean {
    if (!value) {
      return false;
    }
    return typeof value === "number" && !isNaN(value);
  }

  isNumberAndNoChars(value: any): boolean {
    if (value === null || value === undefined || value === "") {
      return false;
    }

    if (typeof value === "number" && !isNaN(value)) {
      return true;
    }

    if (typeof value === "string") {
      return /^[0-9]+$/.test(value.trim());
    }

    return false;
  }

  formatCurrency(balance: string | number, currency?: string) {
    const currencyOptions: Intl.NumberFormatOptions = currency
      ? {
          style: "currency",
          currency: currency,
        }
      : {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        };
    const formatted = new Intl.NumberFormat("en-US", currencyOptions).format(
      Number(balance)
    );
    return formatted;
  }

  formatUSD(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  getPercentage(queue: number, total: number) {
    return Math.floor((queue / total) * 100);
  }
}
