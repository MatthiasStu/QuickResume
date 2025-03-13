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
    
    // Wenn wir auf der Vorschauseite sind, lade die Vorschau
    if (document.getElementById('resumePreview')) {
      this.loadPreview();
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
    this.updateTextContent("previewSchool", resumeData.school || '');
    this.updateTextContent("previewDegree", resumeData.degree || 'Abschluss');
    this.updateTextContent("previewGraduationYear", resumeData.graduationYear || '');
    
    // Berufserfahrung
    this.updateTextContent("previewCompany", resumeData.company || '');
    this.updateTextContent("previewPosition", resumeData.position || 'Position');
    this.updateTextContent("previewWorkPeriod", resumeData.workPeriod || '');
    this.updateTextContent("previewDescription", resumeData.description || '');
    
    // Leere Sektionen ausblenden
    this.hideEmptySections();
    
    console.log("Vorschaudaten erfolgreich geladen");
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