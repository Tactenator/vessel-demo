const PHONE_DIGIT_COUNT = 10

export function getPhoneNumberDigits(value: string): string {
  return (value || '').replace(/\D/g, '')
}

/**
 * Progressively formats digits as (XXX) XXX-XXXX while typing.
 * Truncates to 10 digits so a phone number can't grow past US-length.
 */
export function formatPhoneNumberInput(rawValue: string): string {
  const digits = getPhoneNumberDigits(rawValue).slice(0, PHONE_DIGIT_COUNT)

  if (digits.length === 0) return ''
  if (digits.length < 4) return `(${digits}`
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function isValidPhoneNumber(value: string): boolean {
  return getPhoneNumberDigits(value).length === PHONE_DIGIT_COUNT
}
