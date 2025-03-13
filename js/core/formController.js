/**
 * FormController - Zentrale Verwaltung für Formulare
 * 
 * Diese Klasse bietet eine sauberere, objektorientierte Version
 * des ursprünglichen FormControllers mit verbesserter Validierung
 * und besserer Kapselung.
 */
class FormController {
    /**
     * Erstellt eine neue FormController-Instanz
     * @param {string} formId - Die ID des zu verwaltenden Formulars
     */
    constructor(formId) {
      this.form = document.getElementById(formId);
      this.fields = {};
      this.validators = {};
      this.errorContainer = null;
      this.submitCallback = null;
    }
  
    /**
     * Fügt ein Feld zum Controller hinzu
     * @param {string} fieldId - Die ID des Feldes
     * @param {Object} validationRules - Regeln für die Validierung
     * @returns {boolean} Erfolg der Operation
     */
    addField(fieldId, validationRules = {}) {
      const field = document.getElementById(fieldId);
      if (!field) return false;
      
      this.fields[fieldId] = field;
      this.validators[fieldId] = validationRules;
      
      // Event-Listener für Validierung nur beim Eingeben hinzufügen,
      // aber nicht sofort validieren
      if (validationRules.liveValidate) {
        field.addEventListener('input', () => {
          this.validateField(fieldId);
        });
      }
      
      // Focus/Blur-Validierung aktivieren (validiert erst nach Verlassen des Feldes)
      field.addEventListener('blur', () => {
        if (field.value.trim() !== '') {
          this.validateField(fieldId);
        }
      });
      
      return true;
    }
  
    /**
     * Setzt den Container für Fehlermeldungen
     * @param {string} containerId - Die ID des Fehlercontainers
     */
    setErrorContainer(containerId) {
      this.errorContainer = document.getElementById(containerId);
    }
  
    /**
     * Zeigt eine Fehlermeldung an
     * @param {string} message - Die anzuzeigende Fehlermeldung
     */
    showError(message) {
      if (this.errorContainer) {
        this.errorContainer.innerHTML = message;
        this.errorContainer.style.display = 'block';
      } else {
        console.error('Fehler:', message);
        alert(message);
      }
    }
  
    /**
     * Versteckt die Fehlermeldung
     */
    hideError() {
      if (this.errorContainer) {
        this.errorContainer.style.display = 'none';
      }
    }
  
    /**
     * Validiert ein einzelnes Feld
     * @param {string} fieldId - Die ID des zu validierenden Feldes
     * @returns {boolean} Ob das Feld gültig ist
     */
    validateField(fieldId) {
      const field = this.fields[fieldId];
      const rules = this.validators[fieldId];
      
      if (!field || !rules) return true;
      
      // Finde das zugehörige Label für bessere Benutzerfeedback
      const label = document.querySelector(`label[for="${fieldId}"]`);
      const labelText = label 
        ? label.textContent.replace(':', '').trim() 
        : (field.getAttribute('placeholder') || fieldId);
      
      // Prüfe, ob das Feld optional ist
      const isOptional = label ? label.textContent.toLowerCase().includes('optional') : false;
      
      // Wenn Feld optional ist und leer, überspringe weitere Validierung
      if (isOptional && !field.value.trim()) {
        return true;
      }
      
      // Leer-Prüfung nur bei nicht-optionalen Feldern
      if (rules.required && !isOptional && !field.value.trim()) {
        this.showError(`Das Feld "${labelText}" ist erforderlich.`);
        return false;
      }
      
      // Wenn Feld leer ist und kein Wert erforderlich ist, überspringen
      if (!field.value.trim() && (!rules.required || isOptional)) {
        return true;
      }
      
      // Regex-Prüfung
      if (rules.pattern && !rules.pattern.test(field.value)) {
        this.showError(rules.errorMessage || `Das Feld "${labelText}" hat ein ungültiges Format.`);
        return false;
      }
      
      // Individuelle Validierungsfunktion
      if (rules.validator && typeof rules.validator === 'function') {
        const isValid = rules.validator(field.value);
        if (!isValid) {
          this.showError(rules.errorMessage || `Das Feld "${labelText}" ist ungültig.`);
          return false;
        }
      }
      
      return true;
    }
  
    /**
     * Validiert alle Felder im Formular
     * @returns {boolean} Ob alle Felder gültig sind
     */
    validateAll() {
      let isValid = true;
      
      for (const fieldId in this.fields) {
        if (!this.validateField(fieldId)) {
          isValid = false;
          break;
        }
      }
      
      if (isValid) {
        this.hideError();
      }
      
      return isValid;
    }
  
    /**
     * Sammelt Daten aus dem Formular
     * @returns {Object} Die gesammelten Daten
     */
    collectData() {
      const data = {};
      
      for (const fieldId in this.fields) {
        data[fieldId] = this.fields[fieldId].value;
      }
      
      return data;
    }
  
    /**
     * Füllt das Formular mit Daten
     * @param {Object} data - Die einzufüllenden Daten
     */
    fillWithData(data) {
      for (const fieldId in this.fields) {
        // Datei-Eingabefelder können aus Sicherheitsgründen nicht programmatisch gesetzt werden
        if (this.fields[fieldId].type === 'file') continue;
        
        if (data[fieldId] !== undefined) {
          this.fields[fieldId].value = data[fieldId];
        }
      }
    }
  
    /**
     * Setzt den Callback für die Formularübermittlung
     * @param {Function} callback - Der Callback bei erfolgreicher Übermittlung
     */
    onSubmit(callback) {
      this.submitCallback = callback;
    }
  
    /**
     * Versucht, das Formular zu übermitteln
     * @returns {boolean} Ob die Übermittlung erfolgreich war
     */
    submit() {
      if (this.validateAll()) {
        const data = this.collectData();
        
        if (this.submitCallback && typeof this.submitCallback === 'function') {
          this.submitCallback(data);
        }
        
        return true;
      }
      
      return false;
    }
  }
  
  export default FormController;