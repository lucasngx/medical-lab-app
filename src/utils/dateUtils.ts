/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Format date to YYYY-MM-DD
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDateToYMD = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
};

/**
 * Format date to locale string (e.g., Jan 1, 2025)
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDateToLocale = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "N/A";

  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format date to include time (e.g., Jan 1, 2025, 12:00 PM)
 * @param date Date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Calculate age based on date of birth
 * @param dob Date of birth
 * @returns Age in years
 */
export const calculateAge = (dob: string | Date): number => {
  const birthDate = typeof dob === "string" ? new Date(dob) : dob;
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Add days to a date
 * @param date Starting date
 * @param days Number of days to add
 * @returns New date
 */
export const addDays = (date: Date | string, days: number): Date => {
  const result = typeof date === "string" ? new Date(date) : new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Check if a date is in the past
 * @param date Date to check
 * @returns True if date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  const checkDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 * @param date Date to get relative time for
 * @returns Relative time string
 */
export const getRelativeTimeString = (date: Date | string): string => {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  const diffInMs = targetDate.getTime() - now.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays < -30) {
    return formatDateToLocale(targetDate);
  } else if (diffInDays < -1) {
    return `${Math.abs(diffInDays)} days ago`;
  } else if (diffInDays === -1) {
    return "Yesterday";
  } else if (diffInDays === 0) {
    if (diffInHours < -1) {
      return `${Math.abs(diffInHours)} hours ago`;
    } else if (diffInHours === -1) {
      return "1 hour ago";
    } else if (diffInMins < -1) {
      return `${Math.abs(diffInMins)} minutes ago`;
    } else if (diffInMins === -1) {
      return "a minute ago";
    } else if (diffInSecs < 0) {
      return "just now";
    } else if (diffInSecs < 60) {
      return "just now";
    } else if (diffInMins === 1) {
      return "in a minute";
    } else if (diffInMins < 60) {
      return `in ${diffInMins} minutes`;
    } else if (diffInHours === 1) {
      return "in 1 hour";
    } else {
      return `in ${diffInHours} hours`;
    }
  } else if (diffInDays === 1) {
    return "Tomorrow";
  } else if (diffInDays < 30) {
    return `in ${diffInDays} days`;
  } else {
    return formatDateToLocale(targetDate);
  }
};
