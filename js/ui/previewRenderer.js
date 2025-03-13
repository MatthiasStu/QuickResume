/**
 * PreviewRenderer - Zuständig für die Darstellung der Lebenslauf-Vorschau
 * 
 * Diese Klasse rendert die Vorschau des Lebenslaufs basierend auf
 * den gespeicherten Daten und bietet Funktionen zur Interaktion.
 */
import dataManager from '../core/dataManager.js';
import navigation from '../core/navigation.js';
import pdfGenerator from '../utils/pdfGenerator.js';

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
    
    // Grundlegende Informationen
    this.updateTextContent("previewFirstName", resumeData.firstName || '');
    this.updateTextContent("previewLastName", resumeData.lastName || '');
    this.updateTextContent("previewPhone", resumeData.phone || '');
    this.updateTextContent("previewMail", resumeData.mail || '');
    
    // Profilbild hinzufügen
    this.updateProfileImage(profileImage);
    
    // Kontaktinformationen ein-/ausblenden
    document.getElementById("contactPhone").style.display = resumeData.phone ? 'inline' : 'none';
    document.getElementById("contactEmail").style.display = resumeData.mail ? 'inline' : 'none';
    
    // Bildung
    this.updateTextContent("previewSchool", resumeData.school || 'IGS Melle');
    this.updateTextContent("previewDegree", resumeData.degree || 'Erweiterter Sekundarabschluss 2');
    this.updateTextContent("previewGraduationYear", resumeData.graduationYear || '2018');
    
    // Berufserfahrung
    this.updateTextContent("previewCompany", resumeData.company || 'Developer Akademie');
    this.updateTextContent("previewPosition", resumeData.position || 'Weiterbildung zum Frontend Web Developer');
    this.updateTextContent("previewWorkPeriod", resumeData.workPeriod || '2018-2019');
    this.updateTextContent("previewDescription", resumeData.description || 'TÜV Zertifizierter Bildungsträger, weiterbildung zum Softwareentwickler Schwerpunkt Frontend Entwicklung');
    
    // Nur die Hauptüberschriften in Akzentfarbe
    this.updateSectionColors();
    
    // Leere Sektionen ausblenden
    this.hideEmptySections();
    
    // Wende die gespeicherte Akzentfarbe an
    this.applyAccentColor(this.currentAccentColor);
    
    console.log("Vorschaudaten erfolgreich geladen");
  }

  /**
   * Setzt die korrekten Farben für alle Abschnitte im Lebenslauf
   */
  updateSectionColors() {
    // Institutionen/Unternehmen sollten normale Farbe haben, nicht die Akzentfarbe
    const schoolEl = document.getElementById("previewSchool");
    const companyEl = document.getElementById("previewCompany");
    
    if (schoolEl) schoolEl.style.color = "#333";
    if (companyEl) companyEl.style.color = "#333";
    
    // Überschriften haben die Akzentfarbe (wird durch applyAccentColor behandelt)
    const sectionTitles = document.querySelectorAll('.resumeSection h2');
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
   */
  updateProfileImage(profileImage) {
    const previewProfileImage = document.getElementById("previewProfileImage");
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
    const educationSection = document.getElementById("educationSection");
    if (educationSection) {
      educationSection.style.display = hasEducation ? 'block' : 'none';
    }
    
    // Prüfe Berufserfahrungssektion
    const hasExperience = resumeData.company || resumeData.position || 
                          resumeData.workPeriod || resumeData.description;
    const experienceSection = document.getElementById("experienceSection");
    if (experienceSection) {
      experienceSection.style.display = hasExperience ? 'block' : 'none';
    }
  }
}

// Singleton-Instanz exportieren
const previewRenderer = new PreviewRenderer();
export default previewRenderer;