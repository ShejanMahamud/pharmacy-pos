/**
 * Generates a unique barcode using EAN-13 format
 * @returns A 13-digit barcode string
 */
export const generateUniqueBarcode = (): string => {
  // Generate 12 random digits
  const timestamp = Date.now().toString().slice(-10) // Last 10 digits of timestamp
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0') // 2 random digits

  const first12 = timestamp + random

  // Calculate EAN-13 check digit
  const checkDigit = calculateEAN13CheckDigit(first12)

  return first12 + checkDigit
}

/**
 * Calculates the EAN-13 check digit
 * @param first12digits - The first 12 digits of the barcode
 * @returns The check digit as a string
 */
const calculateEAN13CheckDigit = (first12digits: string): string => {
  let sum = 0

  for (let i = 0; i < 12; i++) {
    const digit = parseInt(first12digits[i])
    if (i % 2 === 0) {
      sum += digit
    } else {
      sum += digit * 3
    }
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit.toString()
}

/**
 * Validates if a barcode is a valid EAN-13 format
 * @param barcode - The barcode to validate
 * @returns true if valid, false otherwise
 */
export const validateEAN13Barcode = (barcode: string): boolean => {
  if (!/^\d{13}$/.test(barcode)) {
    return false
  }

  const first12 = barcode.slice(0, 12)
  const checkDigit = barcode[12]
  const calculatedCheckDigit = calculateEAN13CheckDigit(first12)

  return checkDigit === calculatedCheckDigit
}
