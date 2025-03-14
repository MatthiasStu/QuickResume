/**
 * PreviewRenderer - Zuständig für die Darstellung der Lebenslauf-Vorschau
 * 
 * Diese Klasse rendert die Vorschau des Lebenslaufs basierend auf
 * den gespeicherten Daten und bietet Funktionen zur Interaktion.
 */
import dataManager from '../core/dataManager.js';
import navigation from '../core/navigation.js';
import pdfGenerator from '../utils/pdfGenerator.js';
import styleSwitcher from './styleSwitcher.js';

class PreviewRenderer {
  constructor() {
    this.previewContainer = null;
    this.currentAccentColor = dataManager.getAccentColor();
  }

  /**
   * Initialisiert den PreviewRenderer
   */
  init() {
    // Event-Listener für Buttons
    const downloadButton = document.querySelector('.downloadButton');
    if (downloadButton) {
      downloadButton.addEventListener('click', () => {
        pdfGenerator.generateResumePDF();
      });
    }
    
    const backButton = document.querySelector('.backButton');
    if (backButton) {
      backButton.addEventListener('click', () => {
        navigation.navigateBackFromPreview();
      });
    }
    
    // Initialisiere den Color Picker
    this.initColorPicker();
    
    // Initialisiere den Style Switcher
    styleSwitcher.init();
    
    // Wenn wir auf der Vorschauseite sind, lade die Vorschau
    if (document.getElementById('resumePreview')) {
      this.loadPreview();
    }
  }

  /**
   * Initialisiert den Color Picker und dessen Event-Listener
   */
  initColorPicker() {
    const colorPicker = document.getElementById('accentColorPicker');
    const presetColors = document.querySelectorAll('.preset-color');
    const resetButton = document.getElementById('resetColor');
    
    if (colorPicker) {
      // Setze den gespeicherten Farbwert
      this.currentAccentColor = dataManager.getAccentColor();
      colorPicker.value = this.currentAccentColor;
      
      // Wende die Farbe initial an
      this.applyAccentColor(this.currentAccentColor);
      
      // Farbe ändert sich, wenn der Benutzer eine auswählt
      colorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        this.applyAccentColor(color);
      });
      
      // Farbe wird erst gespeichert, wenn der Benutzer die Auswahl abschließt
      colorPicker.addEventListener('change', (e) => {
        const color = e.target.value;
        this.currentAccentColor = color;
        dataManager.saveAccentColor(color);
      });
    }
    
    // Event-Listener für vordefinierte Farben
    if (presetColors) {
      presetColors.forEach(preset => {
        preset.addEventListener('click', () => {
          const color = preset.getAttribute('data-color');
          
          if (colorPicker) {
            colorPicker.value = color;
          }
          
          this.currentAccentColor = color;
          dataManager.saveAccentColor(color);
          this.applyAccentColor(color);
        });
      });
    }
    
    // Event-Listener für den Zurücksetzen-Button
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        const defaultColor = dataManager.resetAccentColor();
        
        if (colorPicker) {
          colorPicker.value = defaultColor;
        }
        
        this.currentAccentColor = defaultColor;
        this.applyAccentColor(defaultColor);
      });
    }
  }

  /**
   * Wendet die ausgewählte Akzentfarbe auf den Lebenslauf an
   * @param {string} color - Die anzuwendende Farbe als Hex-Code
   */
  applyAccentColor(color) {
    const resumePreview = document.getElementById('resumePreview');
    if (!resumePreview) return;
    
    // Selektiere alle Elemente, die die Akzentfarbe verwenden
    const header = resumePreview.querySelector('.resumeHeader');
    const sectionHeadings = resumePreview.querySelectorAll('.resumeSection h2');
    
    // Wende die Farbe an
    if (header) {
      header.style.borderBottomColor = color;
    }
    
    sectionHeadings.forEach(heading => {
      heading.style.color = color;
    });
    
    // Update style switcher with new color
    if (styleSwitcher) {
      styleSwitcher.updateAccentColor(color);
    }
    
    // Speichere die Farbe für die PDF-Generierung
    if (color !== this.currentAccentColor) {
      this.currentAccentColor = color;
    }
  }

  /**
   * Lädt die Daten in die Vorschau
   */
  loadPreview() {
    console.log("Vorschau wird geladen...");
    
    // Daten aus dem localStorage laden
    const resumeData = dataManager.getResumeData();
    const profileImage = dataManager.getProfileImage();
    
    if (Object.keys(resumeData).length === 0) {
      console.warn("Keine gespeicherten Daten gefunden, Umleitung zur Eingabeseite");
      window.location.href = navigation.pages.INPUT;
      return;
    }
    
    // Alle Vorschau-Templates aktualisieren (für alle Stile)
    const previewTemplates = document.querySelectorAll('.resumeTemplate');
    previewTemplates.forEach(template => {
      this.updateTemplate(template, resumeData, profileImage);
    });
    
    // Wende die gespeicherte Akzentfarbe an
    this.applyAccentColor(this.currentAccentColor);
    
    console.log("Vorschaudaten erfolgreich geladen");
  }

  /**
   * Aktualisiert ein bestimmtes Template mit den Daten
   * @param {HTMLElement} template - Das zu aktualisierende Template
   * @param {Object} resumeData - Die Lebenslaufdaten
   * @param {string} profileImage - Das Profilbild als Data-URL
   */
  updateTemplate(template, resumeData, profileImage) {
    // Selektiere Elemente im spezifischen Template
    const firstNameEl = template.querySelector('[id^="previewFirstName"]');
    const lastNameEl = template.querySelector('[id^="previewLastName"]');
    const phoneEl = template.querySelector('[id^="previewPhone"]');
    const mailEl = template.querySelector('[id^="previewMail"]');
    const schoolEl = template.querySelector('[id^="previewSchool"]');
    const degreeEl = template.querySelector('[id^="previewDegree"]');
    const gradYearEl = template.querySelector('[id^="previewGraduationYear"]');
    const companyEl = template.querySelector('[id^="previewCompany"]');
    const positionEl = template.querySelector('[id^="previewPosition"]');
    const workPeriodEl = template.querySelector('[id^="previewWorkPeriod"]');
    const descriptionEl = template.querySelector('[id^="previewDescription"]');
    const profileImageEl = template.querySelector('[id^="previewProfileImage"]');
    const contactPhoneEl = template.querySelector('[id^="contactPhone"]');
    const contactEmailEl = template.querySelector('[id^="contactEmail"]');
    
    // Grundlegende Informationen aktualisieren
    if (firstNameEl) firstNameEl.textContent = resumeData.firstName || '';
    if (lastNameEl) lastNameEl.textContent = resumeData.lastName || '';
    if (phoneEl) phoneEl.textContent = resumeData.phone || '';
    if (mailEl) mailEl.textContent = resumeData.mail || '';
    
    // Kontaktinformationen ein-/ausblenden
    if (contactPhoneEl) contactPhoneEl.style.display = resumeData.phone ? 'inline' : 'none';
    if (contactEmailEl) contactEmailEl.style.display = resumeData.mail ? 'inline' : 'none';
    
    // Bildung
    if (schoolEl) schoolEl.textContent = resumeData.school || 'IGS Melle';
    if (degreeEl) degreeEl.textContent = resumeData.degree || 'Erweiterter Sekundarabschluss 2';
    if (gradYearEl) gradYearEl.textContent = resumeData.graduationYear || '2018';
    
    // Berufserfahrung
    if (companyEl) companyEl.textContent = resumeData.company || 'Developer Akademie';
    if (positionEl) positionEl.textContent = resumeData.position || 'Weiterbildung zum Frontend Web Developer';
    if (workPeriodEl) workPeriodEl.textContent = resumeData.workPeriod || '2018-2019';
    if (descriptionEl) descriptionEl.textContent = resumeData.description || 'TÜV Zertifizierter Bildungsträger, weiterbildung zum Softwareentwickler Schwerpunkt Frontend Entwicklung';
    
    // Profilbild aktualisieren
    if (profileImageEl) {
      this.updateProfileImage(profileImage, profileImageEl);
    }
    
    // Leere Sektionen ausblenden
    const educationSection = template.querySelector('[id^="educationSection"]');
    const experienceSection = template.querySelector('[id^="experienceSection"]');
    
    const hasEducation = resumeData.school || resumeData.degree || resumeData.graduationYear;
    const hasExperience = resumeData.company || resumeData.position || 
                          resumeData.workPeriod || resumeData.description;
    
    if (educationSection) educationSection.style.display = hasEducation ? 'block' : 'none';
    if (experienceSection) experienceSection.style.display = hasExperience ? 'block' : 'none';
    
    // Sektions-Farben nur für Hauptüberschriften in Akzentfarbe
    this.updateSectionColors(template);
  }

  /**
   * Setzt die korrekten Farben für alle Abschnitte im Lebenslauf
   * @param {HTMLElement} template - Das Template, in dem Farben aktualisiert werden sollen
   */
  updateSectionColors(template) {
    // Institutionen/Unternehmen sollten normale Farbe haben, nicht die Akzentfarbe
    const schoolEl = template.querySelector('[id^="previewSchool"]');
    const companyEl = template.querySelector('[id^="previewCompany"]');
    
    if (schoolEl) schoolEl.style.color = "#333";
    if (companyEl) companyEl.style.color = "#333";
    
    // Überschriften haben die Akzentfarbe (wird durch applyAccentColor behandelt)
    const sectionTitles = template.querySelectorAll('.resumeSection h2');
    sectionTitles.forEach(title => {
      title.style.color = this.currentAccentColor;
    });
  }

  /**
   * Aktualisiert den Textinhalt eines Elements
   * @param {string} elementId - Die ID des Elements
   * @param {string} content - Der neue Inhalt
   */
  updateTextContent(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = content;
    }
  }

  /**
   * Aktualisiert das Profilbild in der Vorschau
   * @param {string} profileImage - Das Profilbild als Data-URL
   * @param {HTMLElement} previewProfileImage - Das Element für das Profilbild
   */
  updateProfileImage(profileImage, previewProfileImage) {
    if (!previewProfileImage) return;
    
    if (profileImage) {
      // Erstelle ein Bild-Element
      const imgElement = document.createElement('img');
      imgElement.src = profileImage;
      imgElement.classList.add('profile-image');
      
      // Lösche vorhandene Inhalte und füge neues Bild hinzu
      previewProfileImage.innerHTML = '';
      previewProfileImage.appendChild(imgElement);
      
      // Zeige den Profilbild-Container
      previewProfileImage.style.display = 'block';
    } else {
      // Verstecke den Profilbild-Container, wenn kein Bild vorhanden ist
      previewProfileImage.style.display = 'none';
    }
  }

  /**
   * Blendet leere Sektionen in der Vorschau aus
   */
  hideEmptySections() {
    // Prüfe Bildungssektion
    const resumeData = dataManager.getResumeData();
    const hasEducation = resumeData.school || resumeData.degree || resumeData.graduationYear;
    const educationSections = document.querySelectorAll('[id^="educationSection"]');
    
    educationSections.forEach(section => {
      section.style.display = hasEducation ? 'block' : 'none';
    });
    
    // Prüfe Berufserfahrungssektion
    const hasExperience = resumeData.company || resumeData.position || 
                          resumeData.workPeriod || resumeData.description;
    const experienceSections = document.querySelectorAll('[id^="experienceSection"]');
    
    experienceSections.forEach(section => {
      section.style.display = hasExperience ? 'block' : 'none';
    });
  }
}

// Singleton-Instanz exportieren
const previewRenderer = new PreviewRenderer();
export default previewRenderer;