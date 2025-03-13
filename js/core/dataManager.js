/**
 * DataManager - Verantwortlich für die Datenverwaltung der Anwendung
 * 
 * Diese Klasse kapselt die gesamte Datenspeicherung und -verwaltung
 * und bietet eine saubere Schnittstelle für andere Teile der Anwendung.
 */
class DataManager {
    constructor() {
      this.storageKeys = {
        RESUME_DATA: 'resumeData',
        PROFILE_IMAGE: 'profileImage',
        FORM_PROGRESS: 'formProgress',
      };
    }
  
    /**
     * Lädt die gespeicherten Lebenslaufdaten
     * @returns {Object} Die gespeicherten Daten oder ein leeres Objekt
     */
    getResumeData() {
      try {
        const dataString = localStorage.getItem(this.storageKeys.RESUME_DATA);
        return dataString ? JSON.parse(dataString) : {};
      } catch (error) {
        console.error('Fehler beim Laden der Lebenslaufdaten:', error);
        return {};
      }
    }
  
    /**
     * Speichert Lebenslaufdaten im localStorage
     * @param {Object} data - Die zu speichernden Daten
     * @returns {boolean} Erfolgsstatus
     */
    saveResumeData(data) {
      try {
        const existingData = this.getResumeData();
        const updatedData = { ...existingData, ...data };
        localStorage.setItem(this.storageKeys.RESUME_DATA, JSON.stringify(updatedData));
        return true;
      } catch (error) {
        console.error('Fehler beim Speichern der Lebenslaufdaten:', error);
        
        // Bei Speicherüberschreitung versuchen wir, ohne Profilbild zu speichern
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          return this.handleStorageQuotaExceeded(data);
        }
        
        return false;
      }
    }
  
    /**
     * Behandelt Speicherüberschreitungsfehler durch Entfernen des Profilbilds
     * @param {Object} data - Die zu speichernden Daten
     * @returns {boolean} Erfolgsstatus
     */
    handleStorageQuotaExceeded(data) {
      try {
        // Profilbild entfernen
        this.removeProfileImage();
        
        // Erneuter Speicherversuch ohne Profilbild
        const existingData = this.getResumeData();
        const updatedData = { ...existingData, ...data };
        delete updatedData.profileImage;
        
        localStorage.setItem(this.storageKeys.RESUME_DATA, JSON.stringify(updatedData));
        return true;
      } catch (innerError) {
        console.error('Fehler beim Speichern ohne Profilbild:', innerError);
        return false;
      }
    }
  
    /**
     * Lädt das gespeicherte Profilbild
     * @returns {string|null} Das Profilbild als Data-URL oder null
     */
    getProfileImage() {
      return localStorage.getItem(this.storageKeys.PROFILE_IMAGE);
    }
  
    /**
     * Speichert ein Profilbild
     * @param {string} imageDataUrl - Das Bild als Data-URL
     * @returns {boolean} Erfolgsstatus
     */
    saveProfileImage(imageDataUrl) {
      try {
        localStorage.setItem(this.storageKeys.PROFILE_IMAGE, imageDataUrl);
        return true;
      } catch (error) {
        console.error('Fehler beim Speichern des Profilbilds:', error);
        return false;
      }
    }
  
    /**
     * Entfernt das gespeicherte Profilbild
     */
    removeProfileImage() {
      localStorage.removeItem(this.storageKeys.PROFILE_IMAGE);
    }
  
    /**
     * Lädt den gespeicherten Formularfortschritt
     * @returns {number} Der Fortschrittswert (25, 50, 75 oder 100)
     */
    getFormProgress() {
      const progress = localStorage.getItem(this.storageKeys.FORM_PROGRESS);
      return progress ? parseInt(progress) : 25; // 25% ist der Standardwert
    }
  
    /**
     * Speichert den Formularfortschritt
     * @param {number} progress - Der zu speichernde Fortschrittswert
     */
    saveFormProgress(progress) {
      localStorage.setItem(this.storageKeys.FORM_PROGRESS, progress);
    }
  
    /**
     * Setzt alle gespeicherten Daten zurück
     */
    clearAllData() {
      localStorage.removeItem(this.storageKeys.RESUME_DATA);
      localStorage.removeItem(this.storageKeys.PROFILE_IMAGE);
      localStorage.removeItem(this.storageKeys.FORM_PROGRESS);
    }
  }
  
  // Singleton-Instanz exportieren
  const dataManager = new DataManager();
  export default dataManager;