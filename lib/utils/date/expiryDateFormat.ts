export const expiryDateFormat = (
  month: number | string,
  year: number | string
): string => {
  // Ensure month is a two-digit string
  const formattedMonth = String(month).padStart(2, "0");
  return `${formattedMonth}/${year}`;
};
