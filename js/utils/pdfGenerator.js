/**
 * PDFGenerator - Zuständig für die Generierung von PDF-Dokumenten
 * 
 * Diese Klasse kapselt die PDF-Erstellungslogik und bietet
 * eine saubere Schnittstelle zum Generieren von Lebenslauf-PDFs.
 */
import dataManager from '../core/dataManager.js';

class PDFGenerator {
  /**
   * Generiert eine PDF aus den gespeicherten Lebenslaufdaten
   */
  generateResumePDF() {
    // Lade alle benötigten Daten
    const resumeData = dataManager.getResumeData();
    const profileImage = dataManager.getProfileImage();
    const accentColor = dataManager.getAccentColor();
    
    // Erstelle einen Ladeindikator
    this.createLoadingIndicator();
    
    // HTML-Template für das PDF erstellen
    const pdfTemplate = this.createPDFTemplate(resumeData, profileImage, accentColor);
    
    // PDF-Optionen
    const opt = {
      margin: [15, 15, 15, 15],
      filename: `lebenslauf_${resumeData.lastName || 'dokument'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait'
      }
    };
    
    // Generiere PDF
    html2pdf()
      .set(opt)
      .from(pdfTemplate)
      .save()
      .then(() => {
        this.removeLoadingIndicator();
      })
      .catch(error => {
        console.error("Fehler bei der PDF-Generierung:", error);
        this.removeLoadingIndicator();
        alert("Bei der Erstellung der PDF ist ein Fehler aufgetreten. Bitte versuche es erneut.");
      });
  }

  /**
   * Erstellt einen Ladeindikator auf der Seite
   * @returns {HTMLElement} Das erstellte Ladeindikator-Element
   */
  createLoadingIndicator() {
    const loadingIndicator = document.createElement("div");
    loadingIndicator.id = "pdfLoadingIndicator";
    loadingIndicator.textContent = "PDF wird erstellt...";
    loadingIndicator.style.position = "fixed";
    loadingIndicator.style.top = "50%";
    loadingIndicator.style.left = "50%";
    loadingIndicator.style.transform = "translate(-50%, -50%)";
    loadingIndicator.style.padding = "20px";
    loadingIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    loadingIndicator.style.color = "white";
    loadingIndicator.style.borderRadius = "5px";
    loadingIndicator.style.zIndex = "9999";
    document.body.appendChild(loadingIndicator);
    
    return loadingIndicator;
  }

  /**
   * Entfernt den Ladeindikator von der Seite
   */
  removeLoadingIndicator() {
    const loadingIndicator = document.getElementById("pdfLoadingIndicator");
    if (loadingIndicator) {
      document.body.removeChild(loadingIndicator);
    }
  }

  /**
   * Erzeugt einen helleren Farbton für eine gegebene Farbe
   * @param {string} hexColor - Die Ausgangsfarbe als Hex-Code
   * @param {number} percent - Prozentsatz der Aufhellung (0-100)
   * @returns {string} Die aufgehellte Farbe als Hex-Code
   */
  getLighterShade(hexColor, percent = 90) {
    // Wandle Hex in RGB um
    let r = parseInt(hexColor.slice(1, 3), 16);
    let g = parseInt(hexColor.slice(3, 5), 16);
    let b = parseInt(hexColor.slice(5, 7), 16);
    
    // Berechne helleren Farbton
    r = Math.floor(r + (255 - r) * (percent / 100));
    g = Math.floor(g + (255 - g) * (percent / 100));
    b = Math.floor(b + (255 - b) * (percent / 100));
    
    // Wandle zurück in Hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Erstellt das HTML-Template für die PDF
   * @param {Object} data - Die Lebenslaufdaten
   * @param {string} profileImageSrc - Die Profilbild-URL
   * @param {string} accentColor - Die Akzentfarbe
   * @returns {HTMLElement} Das Template-Element
   */
  createPDFTemplate(data, profileImageSrc, accentColor) {
    // Daten extrahieren
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    const phone = data.phone || '';
    const email = data.mail || '';
    const school = data.school || '';
    const degree = data.degree || 'Abschluss';
    const graduationYear = data.graduationYear || '';
    const company = data.company || '';
    const position = data.position || 'Position';
    const workPeriod = data.workPeriod || '';
    const description = data.description || '';
    
    // Nutze die bereitgestellte Akzentfarbe oder Standard-Blau, falls keine angegeben
    const themeColor = accentColor || '#3498db';
    const lighterThemeColor = this.getLighterShade(themeColor, 95);
    
    // Konstante Größe für den Bildcontainer
    const containerSize = 100;
    
    // Header mit Kontaktinformationen und Profilbild
    const headerHTML = `
      <div style="position: relative; padding-bottom: 30px; margin-bottom: 25px; min-height: 120px;">
        <div style="padding-right: 120px;">
          <h1 style="font-size: 28px; margin: 0 0 10px 0; color: #2c3e50;">${firstName} ${lastName}</h1>
          <div style="font-size: 14px; color: #555; margin-bottom: 25px;">
            ${phone ? `<span style="margin-right: 15px;">Tel: ${phone}</span>` : ''}
            ${email ? `<span>E-Mail: ${email}</span>` : ''}
          </div>
        </div>
        ${profileImageSrc ? `
          <div style="position: absolute; top: -10px; right: 0; width: ${containerSize}px; height: ${containerSize}px;">
            <img src="${profileImageSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
          </div>
        ` : ''}
        <div style="border-bottom: 2px solid ${themeColor}; width: 100%; position: absolute; bottom: 0;"></div>
      </div>
    `;
    
    // Bildungsabschnitt
    const hasEducation = school || degree || graduationYear;
    const educationHTML = hasEducation ? `
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 20px; color: ${themeColor}; margin: 0 0 15px 0; padding-bottom: 5px; border-bottom: 1px solid ${lighterThemeColor};">Bildung</h2>
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-weight: bold; font-size: 16px;">${degree}</span>
            <span style="font-style: italic; color: #666;">${graduationYear}</span>
          </div>
          <div style="font-size: 15px; color: ${themeColor}; margin-bottom: 5px;">${school}</div>
        </div>
      </div>
    ` : '';
    
    // Berufserfahrungsabschnitt
    const hasExperience = company || position || workPeriod || description;
    const experienceHTML = hasExperience ? `
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 20px; color: ${themeColor}; margin: 0 0 15px 0; padding-bottom: 5px; border-bottom: 1px solid ${lighterThemeColor};">Berufserfahrung</h2>
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-weight: bold; font-size: 16px;">${position}</span>
            <span style="font-style: italic; color: #666;">${workPeriod}</span>
          </div>
          <div style="font-size: 15px; color: ${themeColor}; margin-bottom: 5px;">${company}</div>
          <div style="font-size: 14px; line-height: 1.4; margin-top: 8px;">${description}</div>
        </div>
      </div>
    ` : '';
    
    // Neues Element für PDF-optimiertes Template erstellen
    const pdfTemplate = document.createElement('div');
    pdfTemplate.style.fontFamily = 'Arial, sans-serif';
    pdfTemplate.style.padding = '30px';
    pdfTemplate.style.color = '#333';
    
    // Alle Abschnitte kombinieren
    pdfTemplate.innerHTML = headerHTML + educationHTML + experienceHTML;
    
    return pdfTemplate;
  }
}

// Singleton-Instanz exportieren
const pdfGenerator = new PDFGenerator();
export default pdfGenerator;