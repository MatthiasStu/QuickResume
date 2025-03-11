/**
 * FormController - Zentrale Verwaltung für Formulare 
 */
class FormController {
    constructor(formId) {
      this.form = document.getElementById(formId);
      this.fields = {};
      this.validators = {};
      this.errorContainer = null;
    }
  
    // Feld zum Controller hinzufügen
    addField(fieldId, validationRules = {}) {
      const field = document.getElementById(fieldId);
      if (!field) return false;
      
      this.fields[fieldId] = field;
      this.validators[fieldId] = validationRules;
      
      // Event Listener für Live-Validierung
      if (validationRules.liveValidate) {
        field.addEventListener('input', () => {
          this.validateField(fieldId);
        });
      }
      
      return true;
    }
  
    // Fehlermeldung anzeigen
    showError(message) {
      if (this.errorContainer) {
        this.errorContainer.innerHTML = message;
        this.errorContainer.style.display = 'block';
      } else {
        alert(message);
      }
    }
  
    // Fehlermeldung verstecken
    hideError() {
      if (this.errorContainer) {
        this.errorContainer.style.display = 'none';
      }
    }
  
    // Einzelnes Feld validieren
    validateField(fieldId) {
        const field = this.fields[fieldId];
        const rules = this.validators[fieldId];
        
        if (!field || !rules) return true;
        
        // Finde das zugehörige Label
        const label = document.querySelector(`label[for="${fieldId}"]`);
        const labelText = label ? label.textContent.replace(':', '').trim() : (field.getAttribute('placeholder') || fieldId);
        
        // Leer-Prüfung
        if (rules.required && !field.value.trim()) {
          this.showError(`Das Feld "${labelText}" ist erforderlich.`);
          return false;
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
  
    // Alle Felder validieren
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
  
    // Daten aus dem Formular sammeln
    collectData() {
      const data = {};
      
      for (const fieldId in this.fields) {
        data[fieldId] = this.fields[fieldId].value;
      }
      
      return data;
    }
  
    // Formular absenden
    submit(callback) {
      if (this.validateAll()) {
        const data = this.collectData();
        
        if (callback && typeof callback === 'function') {
          callback(data);
        }
        
        return true;
      }
      
      return false;
    }
  
    // Fehler-Container setzen
    setErrorContainer(containerId) {
      this.errorContainer = document.getElementById(containerId);
    }
  
    // Formular mit Daten befüllen
    fillWithData(data) {
      for (const fieldId in this.fields) {
        if (data[fieldId] !== undefined) {
          this.fields[fieldId].value = data[fieldId];
        }
      }
    }
  }