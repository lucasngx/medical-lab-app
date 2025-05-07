/**
 * Utility functions for formatting various types of data
 */

/**
 * Format a number to display as currency
 * @param value Number to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
};

/**
 * Format a number with thousands separators
 * @param value Number to format
 * @param decimals Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format a phone number to (XXX) XXX-XXXX format
 * @param phoneNumber Phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Check if the input is of correct length
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  // Return original if not matched
  return phoneNumber;
};

/**
 * Format test results with appropriate units
 * @param value The test result value
 * @param unit The unit of measurement
 * @returns Formatted result string
 */
export const formatTestResult = (
  value: string | number,
  unit: string
): string => {
  return `${value} ${unit}`;
};

/**
 * Format a name to title case
 * @param name The name to format
 * @returns Title-cased name
 */
export const formatName = (name: string): string => {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Truncate text with ellipsis if it exceeds maxLength
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Format a reference range for lab tests
 * @param min Minimum value
 * @param max Maximum value
 * @param unit Unit of measurement
 * @returns Formatted range string
 */
export const formatReferenceRange = (
  min: number,
  max: number,
  unit: string
): string => {
  return `${min} - ${max} ${unit}`;
};

/**
 * Format a medication dosage
 * @param dosage Dosage amount
 * @param frequency Frequency of administration
 * @param duration Duration of prescription
 * @returns Formatted dosage instruction
 */
export const formatMedicationDosage = (
  dosage: string,
  frequency: string,
  duration: string
): string => {
  return `${dosage}, ${frequency}, for ${duration}`;
};

/**
 * Convert bytes to human-readable file size
 * @param bytes Number of bytes
 * @returns Human-readable file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
