import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
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
    return Math.floor(this.getDatesInTimezone().getTime() / 1000);
  };

  getCurrentDate = () => {
    return this.getDatesInTimezone();
  };

  isValidYMDFormat(dateString: string): boolean {
    if (!dateString) {
      return false;
    }
    // Check if the string matches the yyyy-MM-dd format using a regular expression.
    // The pattern matches four digits, a hyphen, two digits, a hyphen, and two digits.
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(dateString)) {
      return false;
    }

    // Parse the date string into its components.
    const parts = dateString.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript's Date object.
    const day = parseInt(parts[2], 10);

    // Create a new Date object. The Date constructor handles invalid dates gracefully
    // (e.g., month 13, day 32, etc.) by rolling over.
    const date = new Date(year, month, day);

    // Check if the date object's values match the original input. This is the key to
    // validating the date's existence (e.g., prevents "2023-02-30").
    // The getFullYear() method gets the year from the date object, and we
    // check if it matches the year we passed in. We do the same for the month and day.
    return (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    );
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
      (a, b) => b[1] - a[1],
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

  // Returns the current date and time in the specified timezone
  getDatesInTimezone = () => {
    const TARGET_TIMEZONE = "Asia/Manila"; // GMT+8 for the Philippines
    // Convert the current UTC date to the target time zone's date.
    // This creates a date object that correctly represents "today" at 00:00:00
    // in the target timezone, regardless of the server's time.
    return toZonedTime(new Date(), TARGET_TIMEZONE);
  };

  getMinuteDifference = (unixTimestampInSeconds: any) => {
    // Convert the input timestamp from seconds to milliseconds (required by Date).
    const targetTimeMs = unixTimestampInSeconds * 1000;

    // Get the current time in milliseconds.
    const currentTimeMs = this.getDatesInTimezone().getTime();

    // Calculate the absolute difference in milliseconds.
    const differenceMs = Math.abs(currentTimeMs - targetTimeMs);

    // Convert milliseconds to minutes.
    // 1 minute = 60 seconds * 1000 milliseconds = 60,000 milliseconds.
    const differenceMinutes = differenceMs / 60000;

    return Math.floor(differenceMinutes);
  };

  plusOneDay = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  getUnixTimestampSeconds() {
    return Math.floor(Date.now() / 1000);
  }

  getUnixTimestampMilliseconds() {
    return Date.now();
  }
}
