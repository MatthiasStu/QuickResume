/**
 * Validation - Wiederverwendbare Validierungsfunktionen
 * 
 * Diese Datei enthält Hilfsfunktionen für die Validierung von Formulareingaben,
 * die von verschiedenen Teilen der Anwendung verwendet werden können.
 */

/**
 * Prüft, ob ein Wert leer ist
 * @param {string} value - Der zu prüfende Wert
 * @returns {boolean} Ob der Wert leer ist
 */
export function isEmpty(value) {
    return value === null || value === undefined || value.trim() === '';
  }
  
  /**
   * Validiert eine E-Mail-Adresse
   * @param {string} email - Die zu validierende E-Mail-Adresse
   * @returns {boolean} Ob die E-Mail-Adresse gültig ist
   */
  export function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }
  
  /**
   * Validiert eine Telefonnummer
   * @param {string} phone - Die zu validierende Telefonnummer
   * @returns {boolean} Ob die Telefonnummer gültig ist
   */
  export function isValidPhone(phone) {
    // Mindestens 6 Zahlen
    const phonePattern = /^[0-9]{6,}$/;
    return phonePattern.test(phone);
  }
  
  /**
   * Validiert ein Jahr (zwischen 1900 und dem aktuellen Jahr + 10)
   * @param {string} year - Das zu validierende Jahr
   * @returns {boolean} Ob das Jahr gültig ist
   */
  export function isValidYear(year) {
    const currentYear = new Date().getFullYear();
    const yearValue = parseInt(year, 10);
    
    if (isNaN(yearValue)) return false;
    
    return yearValue >= 1900 && yearValue <= currentYear + 10;
  }
  
  /**
   * Prüft, ob ein Wert die Mindestlänge hat
   * @param {string} value - Der zu prüfende Wert
   * @param {number} minLength - Die minimale Länge
   * @returns {boolean} Ob der Wert die Mindestlänge hat
   */
  export function hasMinLength(value, minLength) {
    return value.length >= minLength;
  }
  
  /**
   * Erzeugt eine Fehlermeldung für ein Feld
   * @param {string} fieldLabel - Die Bezeichnung des Feldes
   * @param {string} errorType - Der Fehlertyp (z.B. 'required', 'invalid')
   * @returns {string} Die formatierte Fehlermeldung
   */
  export function getErrorMessage(fieldLabel, errorType) {
    switch (errorType) {
      case 'required':
        return `Das Feld "${fieldLabel}" ist erforderlich.`;
      case 'invalid':
        return `Das Feld "${fieldLabel}" hat ein ungültiges Format.`;
      case 'minLength':
        return `Das Feld "${fieldLabel}" ist zu kurz.`;
      case 'invalidYear':
        return `Bitte gib ein gültiges Jahr ein (z.B. 2020).`;
      case 'invalidEmail':
        return `Bitte gib eine gültige E-Mail-Adresse ein.`;
      case 'invalidPhone':
        return `Bitte gib eine gültige Telefonnummer ein (nur Zahlen, mindestens 6 Ziffern).`;
      default:
        return `Das Feld "${fieldLabel}" ist ungültig.`;
    }
  }
  
  /**
   * Erzeugt Validierungsregeln für verschiedene Feldtypen
   * @param {string} fieldType - Der Typ des Feldes
   * @param {boolean} isOptional - Ob das Feld optional ist
   * @returns {Object} Die Validierungsregeln
   */
  export function getValidationRules(fieldType, isOptional = false) {
    const rules = { required: !isOptional };
    
    switch (fieldType) {
      case 'email':
        rules.pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        rules.errorMessage = 'Bitte gib eine gültige E-Mail-Adresse ein.';
        rules.liveValidate = true;
        break;
        
      case 'phone':
        rules.pattern = /^[0-9]{6,}$/;
        rules.errorMessage = 'Bitte gib eine gültige Telefonnummer ein (nur Zahlen, mindestens 6 Ziffern).';
        rules.liveValidate = true;
        break;
        
      case 'year':
        rules.pattern = /^(19|20)\d{2}$/;
        rules.errorMessage = 'Bitte gib ein gültiges Jahr ein (z.B. 2020).';
        rules.liveValidate = true;
        rules.required = false; // Jahre sind in der Regel optional
        break;
    }
    
    return rules;
  }