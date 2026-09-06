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
  // Allow international numbers, just check digit length (typically 8 to 15 digits)
  return formatted.length >= 8 && formatted.length <= 15;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateWhatsAppLink = (phone: string, text: string): string => {
  const formattedPhone = formatPhoneNumber(phone);
  // Menggunakan api.whatsapp.com lebih stabil untuk menangani encoding karakter khusus/emoji dibandingkan wa.me
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
};

export const personalizeMessage = (template: string, name: string, phone: string): string => {
  return template
    .replace(/\{nama\}/g, name)
    .replace(/\{nomor\}/g, phone);
};
