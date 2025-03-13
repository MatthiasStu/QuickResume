/**
 * QuickResume - Hauptanwendung
 * 
 * Diese Datei initialisiert alle Komponenten und stellt den Einstiegspunkt
 * der Anwendung dar.
 */
import navigation from './core/navigation.js';
import formRenderer from './ui/formRenderer.js';
import previewRenderer from './ui/previewRenderer.js';
import dataManager from './core/dataManager.js';

class App {
  /**
   * Initialisiert die Anwendung
   */
  init() {
    // Aktuelle Seite ermitteln
    const currentPage = window.location.pathname;
    
    // Gemeinsame Initialisierung für alle Seiten
    navigation.init();
    
    // Seitenspezifische Initialisierung
    if (currentPage.includes('index.html') || currentPage === '/') {
      this.initLandingPage();
    } else if (currentPage.includes('inputpage.html')) {
      this.initInputPage();
    } else if (currentPage.includes('preview.html')) {
      this.initPreviewPage();
    } else if (currentPage.includes('finalpage.html')) {
      this.initFinalPage();
    }
    
    console.log('QuickResume App initialisiert auf Seite:', currentPage);
  }

  /**
   * Initialisiert die Startseite
   */
  initLandingPage() {
    // Listener für den Lebenslauf-Erstellungsbutton
    const createResumeButton = document.querySelector('.blueButton');
    if (createResumeButton) {
      createResumeButton.addEventListener('click', () => {
        navigation.startProgress();
      });
    }
  }

  /**
   * Initialisiert die Eingabeseite
   */
  initInputPage() {
    // Formular-Renderer initialisieren
    formRenderer.init();
    
    // Fortschrittsanzeige aktualisieren
    const progress = dataManager.getFormProgress();
    navigation.updateProgressbar(progress);
  }

  /**
   * Initialisiert die Vorschauseite
   */
  initPreviewPage() {
    // Vorschau-Renderer initialisieren
    previewRenderer.init();
  }

  /**
   * Initialisiert die finale Seite
   */
  initFinalPage() {
    // Spezifische Aktionen für die finale Seite
    // (Aktuell keine speziellen Aktionen erforderlich)
  }
}

// App-Instanz erstellen und initialisieren
const app = new App();

// DOM-Content-Loaded-Event abwarten, dann App initialisieren
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

// Exportieren für mögliche Verwendung in anderen Modulen
export default app;