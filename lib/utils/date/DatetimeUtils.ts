import { parse, isValid, format } from "date-fns";
type DateItem = {
  date: string;
  [key: string]: any;
};

type FormattedDateItem = {
  date: string;
  [key: string]: any;
};

export class DatetimeUtils {
  convertToUTC8(datetime: any) {
    // Create a Date object from the input string
    const date = new Date(datetime);

    // Get the UTC timestamp
    const utcTimestamp = date.getTime();

    // Add 8 hours to convert to UTC+8
    const utc8Timestamp = utcTimestamp + 8 * 60 * 60 * 1000;

    // Create a new Date object for UTC+8
    const utc8Date = new Date(utc8Timestamp);

    return utc8Date;
  }

  formatDateOnly(datetime: any) {
    // Create a new Date object for UTC+8
    const newDate = new Date(datetime);
    // Format the UTC+8 date as YYYY-MM-DD
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  formatDateTime(datetime: any) {
    // Create a Date object from the input string
    const date = new Date(datetime);

    // Extract UTC components
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    const formatHours = String(hours).padStart(2, "0");

    // Combine into the desired format
    return `${year}-${month}-${day} ${formatHours}:${minutes}:${seconds} ${period}`;
  }

  formatDateToSlash = (dateString: string): string | undefined => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return undefined; // Invalid date
    }

    return format(date, "MM/dd/yyyy");
  };

  getUnixTimestamp = () => {
    return Math.floor(Date.now() / 1000);
  };

  getCurrentDate = () => {
    return new Date();
  };

  isValidYMDFormat(dateStr: string): boolean {
    if (!dateStr) {
      return false;
    }
    const parsedDate = parse(dateStr, "yyyy-MM-dd", new Date());

    return isValid(parsedDate) && format(parsedDate, "yyyy-MM-dd") === dateStr;
  }
  formatDatesSmart(data: DateItem[]): FormattedDateItem[] {
    if (!data || data.length === 0) return [];

    const sample = data[0]?.date;
    if (!sample) return [];

    const separatorMatch = sample.match(/[/-]/);
    const separator = separatorMatch ? separatorMatch[0] : "/";
    const freq: Record<number, number> = {};

    data.forEach((item) => {
      const parts = item.date.split(separator).map(Number);
      if (parts.length !== 3) return;

      // Count only if values are numbers
      for (let i = 0; i < 2; i++) {
        if (!isNaN(parts[i])) {
          freq[parts[i]] = (freq[parts[i]] || 0) + 1;
        }
      }
    });

    const likelyMonthEntry = Object.entries(freq).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const likelyMonth = likelyMonthEntry ? parseInt(likelyMonthEntry[0]) : null;

    return data.map((item) => {
      const { date, ...rest } = item;
      const parts = date.split(separator).map(Number);
      const year = parts.find((p) => p > 999);
      if (parts.length !== 3 || year === undefined) {
        return { ...rest, date: "Invalid date" };
      }

      let day: number, month: number;

      if (parts[0] === likelyMonth) {
        month = parts[0];
        day = parts[1];
      } else if (parts[1] === likelyMonth) {
        day = parts[0];
        month = parts[1];
      } else {
        // fallback assumption
        month = parts[0];
        day = parts[1];
      }

      const formattedDay = String(day).padStart(2, "0");
      const formattedMonth = String(month).padStart(2, "0");

      return {
        ...rest,
        date: `${year}-${formattedMonth}-${formattedDay}`,
      };
    });
  }

  getDateRangeArray(start_date: string, end_date: string) {
    const dateArray = [];
    const currentDate = new Date(start_date);
    const finalDate = new Date(end_date);

    if (
      !this.isValidYMDFormat(start_date) ||
      !this.isValidYMDFormat(end_date)
    ) {
      throw new Error("Invalid date format. Please use YYYY-MM-DD.");
    }

    while (currentDate <= finalDate) {
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const dd = String(currentDate.getDate()).padStart(2, "0");
      dateArray.push(`${yyyy}-${mm}-${dd}`);

      currentDate.setDate(currentDate.getDate() + 1); // Increment date by 1 day
    }

    return dateArray;
  }
}
