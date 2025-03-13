/**
 * FormRenderer - Zuständig für die Darstellung von Formularen
 * 
 * Diese Klasse rendert verschiedene Formulartypen in der Anwendung
 * und fügt die nötige Interaktivität hinzu.
 */
import FormController from '../core/formController.js';
import dataManager from '../core/dataManager.js';
import imageHandler from '../core/imageHandler.js';
import navigation from '../core/navigation.js';
import { personalInfoTemplate, educationTemplate, resumeTemplate } from './templates.js';

class FormRenderer {
  constructor() {
    this.formContainer = null;
    this.formController = null;
  }

  /**
   * Initialisiert den FormRenderer
   */
  init() {
    this.formContainer = document.getElementById('formContainer');
    if (!this.formContainer) return;

    // Initialen Formulartyp basierend auf dem gespeicherten Fortschritt rendern
    const currentProgress = dataManager.getFormProgress();
    
    switch (currentProgress) {
      case 25:
        this.renderPersonalInfoForm();
        break;
      case 50:
        this.renderEducationForm();
        break;
      case 75:
        this.renderResumeForm();
        break;
      case 100:
        // Fortschritt ist abgeschlossen, zur Vorschau navigieren
        window.location.href = navigation.pages.PREVIEW;
        break;
    }
  }

  /**
   * Richtet den FormController für das aktuelle Formular ein
   */
  setupFormController() {
    this.formController = new FormController('userForm');
    this.formController.setErrorContainer('errorMessage');
    
    // Event-Listener für den Weiter-Button
    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
      // Alle alten Event-Listener entfernen
      const newButton = nextButton.cloneNode(true);
      nextButton.parentNode.replaceChild(newButton, nextButton);
      
      // Neuen Event-Listener hinzufügen
      newButton.addEventListener('click', () => {
        this.formController.onSubmit(data => navigation.nextStep(data));
        this.formController.submit();
      });
    }

    return this.formController;
  }

  /**
   * Fügt alle Eingabefelder zum FormController hinzu und richtet Validierung ein
   */
  addFieldsToController() {
    const inputs = document.querySelectorAll('#userForm input:not([type="file"]), #userForm textarea');
    
    inputs.forEach(input => {
      const fieldId = input.id;
      
      // Prüfe, ob das Feld optional ist
      const label = document.querySelector(`label[for="${fieldId}"]`);
      const isOptional = label ? label.textContent.toLowerCase().includes('optional') : false;
      
      // Validierungsregeln basierend auf Feldtyp und Optionalität
      let validationRules = { required: !isOptional };
      
      // Spezifische Validierungsregeln je nach Feldtyp
      switch (fieldId) {
        case 'phone':
          validationRules.pattern = /^[0-9]{6,}$/;
          validationRules.errorMessage = 'Bitte gib eine gültige Telefonnummer ein (nur Zahlen, mindestens 6 Ziffern).';
          // Live-Validierung erst aktivieren, wenn Benutzer mit dem Feld interagiert hat
          // validationRules.liveValidate = true;
          break;
          
        case 'mail':
          validationRules.pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          validationRules.errorMessage = 'Bitte gib eine gültige E-Mail-Adresse ein.';
          // Live-Validierung erst aktivieren, wenn Benutzer mit dem Feld interagiert hat
          // validationRules.liveValidate = true;
          break;
          
        case 'graduationYear':
          validationRules.pattern = /^(19|20)\d{2}$/;
          validationRules.errorMessage = 'Bitte gib ein gültiges Jahr ein (z.B. 2020).';
          // validationRules.liveValidate = true;
          validationRules.required = false; // Explizit als optional markieren
          break;
      }
      
      // Bildungs- und Berufserfahrungsfelder sind immer optional
      if (['school', 'degree', 'graduationYear', 'company', 'position', 'workPeriod', 'description'].includes(fieldId)) {
        validationRules.required = false;
      }
      
      this.formController.addField(fieldId, validationRules);
    });
    
    // Vorhandene Daten laden und in Felder einfüllen
    const savedData = dataManager.getResumeData();
    if (Object.keys(savedData).length > 0) {
      this.formController.fillWithData(savedData);
    }
  }

  /**
   * Rendert das Formular für persönliche Informationen
   */
  renderPersonalInfoForm() {
    if (!this.formContainer) return;
    
    // Formular-HTML einfügen
    this.formContainer.innerHTML = personalInfoTemplate;
    
    // Fehlermeldung ausblenden
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
      errorMessage.style.display = 'none';
    }
    
    // FormController einrichten
    this.setupFormController();
    this.addFieldsToController();
    
    // Bild-Upload-Funktionalität einrichten
    this.setupImageUpload();
  }

  /**
   * Rendert das Bildungsformular
   */
  renderEducationForm() {
    if (!this.formContainer) return;
    
    // Formular-HTML einfügen
    this.formContainer.innerHTML = educationTemplate;
    
    // FormController einrichten
    this.setupFormController();
    this.addFieldsToController();
  }

  /**
   * Rendert das Berufserfahrungsformular
   */
  renderResumeForm() {
    if (!this.formContainer) return;
    
    // Formular-HTML einfügen
    this.formContainer.innerHTML = resumeTemplate;
    
    // FormController einrichten
    this.setupFormController();
    this.addFieldsToController();
  }

  /**
   * Richtet die Bildupload-Funktionalität ein
   */
  setupImageUpload() {
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    
    if (!imageUpload || !imagePreview || !removeImageBtn) return;

    // Gespeichertes Profilbild laden, falls vorhanden
    const savedProfileImage = dataManager.getProfileImage();
    if (savedProfileImage) {
      imageHandler.createPreviewFromDataURL(savedProfileImage, imagePreview);
      removeImageBtn.style.display = 'inline-block';
    }

    // Event-Listener für Bild-Upload
    imageUpload.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      imageHandler.processProfileImage(
        file,
        // Erfolgs-Callback
        (compressedDataURL) => {
          try {
            // Bild in localStorage speichern
            dataManager.saveProfileImage(compressedDataURL);
            
            // Vorschau aktualisieren
            imageHandler.createPreviewFromDataURL(compressedDataURL, imagePreview);
            
            // Entfernen-Button anzeigen
            removeImageBtn.style.display = 'inline-block';
          } catch (error) {
            console.error('Fehler beim Speichern des Bildes:', error);
            alert('Das Bild ist zu groß für den Speicher. Bitte wähle ein kleineres Bild.');
            
            // Vorschau zurücksetzen
            imagePreview.innerHTML = '<span class="upload-icon">+</span>';
            
            // Input-Feld zurücksetzen
            imageUpload.value = '';
          }
        },
        // Fehler-Callback
        (error) => {
          console.error('Bildverarbeitungsfehler:', error);
          alert('Es gab ein Problem bei der Bildverarbeitung. Bitte versuche es erneut.');
        }
      );
    });

    // Event-Listener für Bild-Entfernen
    removeImageBtn.addEventListener('click', () => {
      // Vorschau zurücksetzen
      imagePreview.innerHTML = '<span class="upload-icon">+</span>';
      
      // Input-Feld zurücksetzen
      imageUpload.value = '';
      
      // Aus localStorage entfernen
      dataManager.removeProfileImage();
      
      // Button ausblenden
      removeImageBtn.style.display = 'none';
    });
  }
}

// Singleton-Instanz exportieren
const formRenderer = new FormRenderer();
export default formRenderer;