/**
 * Navigation - Verwaltet die Seitennavigation und den Fortschritt in der Anwendung
 * 
 * Diese Klasse steuert:
 * - Navigation zwischen Seiten
 * - Fortschrittsanzeige
 * - Modalen Bestätigungsdialog
 */
import dataManager from './dataManager.js';
import formRenderer from '../ui/formRenderer.js';

class Navigation {
  constructor() {
    this.pages = {
      LANDING: '/index.html',
      INPUT: '/inputpage.html',
      PREVIEW: '/preview.html',
      FINAL: '/finalpage.html'
    };
    
    this.progressSteps = {
      PERSONAL: 25,
      EDUCATION: 50,
      EXPERIENCE: 75,
      COMPLETE: 100
    };
  }

  /**
   * Initialisiert die Navigation und Eventlistener
   */
  init() {
    // Navigationsleisten-Listener hinzufügen
    const logoElement = document.querySelector('.logo');
    if (logoElement) {
      logoElement.addEventListener('click', () => this.navigateToLandingPage(true));
    }
    
    // Home-Link in der Navigation-Bar
    const homeLinks = document.querySelectorAll('.navBarItems li a[href="#home"]');
    homeLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateToLandingPage(true);
      });
    });
    
    // Zurück-Buttons finden und Listener hinzufügen
    const backButtons = document.querySelectorAll('.backButton');
    backButtons.forEach(button => {
      button.addEventListener('click', () => this.navigateBack());
    });
    
    // Modale Bestätigungsbuttons einrichten
    const confirmButton = document.querySelector('.confirm-btn');
    const cancelButton = document.querySelector('.cancel-btn');
    
    if (confirmButton) {
      confirmButton.addEventListener('click', () => this.confirmAction(true));
    }
    
    if (cancelButton) {
      cancelButton.addEventListener('click', () => this.confirmAction(false));
    }
    
    // Klick außerhalb des Modals schließt es
    const modalElement = document.getElementById('customConfirm');
    if (modalElement) {
      modalElement.addEventListener('click', (event) => {
        if (event.target === modalElement) {
          this.confirmAction(false);
        }
      });
    }
  }

  /**
   * Startet den Lebenslauf-Erstellungsprozess
   */
  startProgress() {
    dataManager.saveFormProgress(this.progressSteps.PERSONAL);
    window.location.href = this.pages.INPUT;
  }

  /**
   * Navigiert zur Startseite mit optionaler Bestätigung
   * @param {boolean} isNavbar - Ob die Navigation von der Navigationsleiste ausgelöst wurde
   */
  navigateToLandingPage(isNavbar = false) {
    const currentPage = window.location.pathname;
    const currentProgress = dataManager.getFormProgress();

    if (currentPage === this.pages.LANDING) {
      // Bereits auf der Startseite
      return;
    } 
    
    if (currentPage === this.pages.INPUT || currentPage === this.pages.PREVIEW) {
      if (currentProgress === this.progressSteps.PERSONAL || isNavbar === true) {
        // Bestätigung bei Navigationsverlust anzeigen
        this.showConfirmDialog();
      } else if (currentProgress === this.progressSteps.EDUCATION) {
        // Zurück zum ersten Formular
        this.updateProgress(this.progressSteps.PERSONAL);
        formRenderer.renderPersonalInfoForm();
      } else if (currentProgress === this.progressSteps.EXPERIENCE) {
        // Zurück zum zweiten Formular
        this.updateProgress(this.progressSteps.EDUCATION);
        formRenderer.renderEducationForm();
      } else if (currentProgress === this.progressSteps.COMPLETE) {
        // Zurück zum dritten Formular
        this.updateProgress(this.progressSteps.EXPERIENCE);
        formRenderer.renderResumeForm();
      }
    }
  }

  /**
   * Allgemeine Methode für die Zurück-Navigation
   */
  navigateBack() {
    const currentPage = window.location.pathname;
    const currentProgress = dataManager.getFormProgress();
    
    if (currentPage.includes('preview.html')) {
      // Zurück von der Vorschauseite zur Eingabeseite
      this.navigateBackFromPreview();
    } else if (currentPage.includes('inputpage.html')) {
      // Auf der Eingabeseite, zurück basierend auf dem aktuellen Fortschritt
      this.navigateToLandingPage();
    } else if (currentPage.includes('finalpage.html')) {
      // Zurück von der finalen Seite zur Vorschauseite
      window.location.href = this.pages.PREVIEW;
    }
  }

  /**
   * Behandelt die Zurück-Navigation von der Vorschauseite
   */
  navigateBackFromPreview() {
    // Fortschritt auf Berufserfahrung setzen
    dataManager.saveFormProgress(this.progressSteps.EXPERIENCE);
    window.location.href = this.pages.INPUT;
  }

  /**
   * Zeigt den Bestätigungsdialog an
   */
  showConfirmDialog() {
    const modal = document.getElementById('customConfirm');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  /**
   * Verarbeitet die Antwort des Bestätigungsdialogs
   * @param {boolean} isConfirmed - Ob die Aktion bestätigt wurde
   */
  confirmAction(isConfirmed) {
    const modal = document.getElementById('customConfirm');
    if (modal) {
      modal.style.display = 'none';
    }

    if (isConfirmed) {
      window.location.href = this.pages.LANDING;
    }
  }

  /**
   * Aktualisiert den Fortschritt in der Anwendung
   * @param {number} newProgress - Der neue Fortschrittswert
   */
  updateProgress(newProgress) {
    dataManager.saveFormProgress(newProgress);
    this.updateProgressbar(newProgress);
  }

  /**
   * Aktualisiert die visuelle Fortschrittsanzeige
   * @param {number} percent - Der Fortschrittswert in Prozent
   */
  updateProgressbar(percent) {
    const progressbar = document.getElementById('progressbar');
    if (progressbar) {
      progressbar.style.width = percent + '%';
      progressbar.textContent = percent + '%';
    }
  }

  /**
   * Navigiert zum nächsten Schritt basierend auf dem aktuellen Fortschritt
   * @param {Object} formData - Die gesammelten Formulardaten
   */
  nextStep(formData) {
    const currentProgress = dataManager.getFormProgress();
    
    // Speichern der Formulardaten
    const saveSuccess = dataManager.saveResumeData(formData);
    
    if (!saveSuccess) {
      alert('Es gab ein Problem beim Speichern der Daten. Bitte versuche es erneut.');
      return;
    }

    // Entsprechende Navigation basierend auf aktuellem Fortschritt
    if (currentProgress === this.progressSteps.PERSONAL) {
      this.updateProgress(this.progressSteps.EDUCATION);
      formRenderer.renderEducationForm();
    } else if (currentProgress === this.progressSteps.EDUCATION) {
      this.updateProgress(this.progressSteps.EXPERIENCE);
      formRenderer.renderResumeForm();
    } else if (currentProgress === this.progressSteps.EXPERIENCE) {
      this.updateProgress(this.progressSteps.COMPLETE);
      window.location.href = this.pages.PREVIEW;
    } else if (currentProgress === this.progressSteps.COMPLETE) {
      window.location.href = this.pages.FINAL;
    }
  }
}

// Singleton-Instanz exportieren
const navigation = new Navigation();
export default navigation;