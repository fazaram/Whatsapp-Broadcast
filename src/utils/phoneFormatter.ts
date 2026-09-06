/**
 * Normalizes phone numbers to Indonesian format (62...)
 * Removes all non-digit characters.
 * Replaces leading 0 with 62.
 * Ignores +62 as + is stripped, 62 remains.
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove non-digit characters
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0')) {
    digits = '62' + digits.substring(1);
  }

  return digits;
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const formatted = formatPhoneNumber(phone);
  // Indonesian numbers generally start with 628 and are between 10 to 14 digits
  return formatted.startsWith('62') && formatted.length >= 10 && formatted.length <= 15;
};

export const generateWhatsAppLink = (phone: string, text: string): string => {
  const formattedPhone = formatPhoneNumber(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
};

export const personalizeMessage = (template: string, name: string, phone: string): string => {
  return template
    .replace(/\{nama\}/g, name)
    .replace(/\{nomor\}/g, phone);
};
