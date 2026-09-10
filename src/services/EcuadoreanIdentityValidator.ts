/**
 * Ecuadorean Identity & Input Validation Service
 * Implements strict Ecuadorian DNI (Cédula) validation using Modulo 10 Algorithm,
 * email regex checks, numeric/alphabetic restrictions, and non-empty validations.
 */
export class EcuadoreanIdentityValidator {
  /**
   * Validates an Ecuadorian DNI (Cédula) using the official Modulo 10 algorithm.
   */
  public static validateCedula(cedula: string): boolean {
    if (!cedula || typeof cedula !== "string") return false;
    const cleanCedula = cedula.trim();

    // Must be exactly 10 digits
    if (!/^\d{10}$/.test(cleanCedula)) return false;

    const provinceCode = parseInt(cleanCedula.substring(0, 2), 10);
    if ((provinceCode < 1 || provinceCode > 24) && provinceCode !== 30) {
      return false; // Invalid province code
    }

    const thirdDigit = parseInt(cleanCedula.charAt(2), 10);
    if (thirdDigit >= 6) {
      // Third digit for natural person cédula must be less than 6
      return false;
    }

    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const verifierDigit = parseInt(cleanCedula.charAt(9), 10);
    let totalSum = 0;

    for (let i = 0; i < 9; i++) {
      let val = parseInt(cleanCedula.charAt(i), 10) * coefficients[i];
      if (val >= 10) {
        val -= 9;
      }
      totalSum += val;
    }

    const calculatedVerifier = (10 - (totalSum % 10)) % 10;
    return calculatedVerifier === verifierDigit;
  }

  /**
   * Validates standard email address format.
   */
  public static validateEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Validates string contains only alphabetic characters and spaces.
   */
  public static validateOnlyLetters(text: string): boolean {
    if (!text) return false;
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(text.trim());
  }

  /**
   * Validates string contains only numeric digits.
   */
  public static validateOnlyNumbers(text: string): boolean {
    if (!text) return false;
    return /^\d+$/.test(text.trim());
  }

  /**
   * Checks if string is non-empty after trimming.
   */
  public static validateNonEmpty(text: string): boolean {
    return typeof text === "string" && text.trim().length > 0;
  }
}
