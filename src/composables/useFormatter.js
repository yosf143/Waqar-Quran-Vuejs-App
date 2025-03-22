export function useFormatter() {

  const toArabicNumeral = (num) => {
    if (num === undefined || num === null) return '';
    return num.toLocaleString('en-US');
  };

  const convertArabicToEnglishNumbers = (str) => {
    if (!str) return '';

    return str
      .replace(/[٠]/g, '0')
      .replace(/[١]/g, '1')
      .replace(/[٢]/g, '2')
      .replace(/[٣]/g, '3')
      .replace(/[٤]/g, '4')
      .replace(/[٥]/g, '5')
      .replace(/[٦]/g, '6')
      .replace(/[٧]/g, '7')
      .replace(/[٨]/g, '8')
      .replace(/[٩]/g, '9');
  };

  return {
    toArabicNumeral,
    convertArabicToEnglishNumbers
  };
}