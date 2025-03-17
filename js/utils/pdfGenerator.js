/**
 * PDFGenerator - Zuständig für die Generierung von PDF-Dokumenten
 * 
 * Diese Klasse nutzt jsPDF und html2canvas für bessere Kontrolle
 * über den PDF-Erstellungsprozess, behält aber das ursprüngliche Layout.
 */
import dataManager from '../core/dataManager.js';
import styleSwitcher from '../ui/styleSwitcher.js';

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
    
    // Get current style index
    const styleIndex = styleSwitcher.currentStyleIndex;
    
    // Select the template based on the current active style
    const templateElement = document.querySelector(`.resumeStyleSlide[id="resumeStyle${styleIndex + 1}"] .resumeTemplate`);
    
    if (!templateElement) {
      console.error('Template element not found');
      this.removeLoadingIndicator();
      alert("Fehler beim Generieren des PDFs: Template nicht gefunden.");
      return;
    }
    
    // Erstelle ein temporäres Container-Element für das Rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm'; // A4 Breite
    
    // Füge das Element zum DOM hinzu
    document.body.appendChild(container);
    
    // HTML-Template für das PDF erstellen und in den Container einfügen
    container.innerHTML = this.createPDFTemplate(resumeData, profileImage, accentColor, styleIndex + 1);
    
    // Warte kurz, damit Bilder geladen werden können
    setTimeout(() => {
      // Verwende html2canvas zur Konvertierung des HTML in ein Canvas
      html2canvas(container, {
        scale: 2, // Höhere Auflösung
        useCORS: true,
        logging: false,
        allowTaint: true
      }).then(canvas => {
        // Erstelle ein neues jsPDF-Dokument
        const pdf = new jspdf.jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        
        // Canvas in das PDF umwandeln
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const imgWidth = 210; // A4 Breite in mm
        const pageHeight = 297; // A4 Höhe in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        
        // PDF speichern
        pdf.save(`lebenslauf_${resumeData.lastName || 'dokument'}.pdf`);
        
        // Aufräumen
        document.body.removeChild(container);
        this.removeLoadingIndicator();
      }).catch(error => {
        console.error("Fehler bei der Canvas-Erstellung:", error);
        document.body.removeChild(container);
        this.removeLoadingIndicator();
        alert("Bei der Erstellung der PDF ist ein Fehler aufgetreten. Bitte versuche es erneut.");
      });
    }, 500); // 500ms warten, damit Bilder geladen werden können
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
   * Erstellt das HTML-Template für die PDF
   * @param {Object} data - Die Lebenslaufdaten
   * @param {string} profileImageSrc - Die Profilbild-URL
   * @param {string} accentColor - Die Akzentfarbe
   * @param {number} styleNumber - Die Nummer des Stils (1, 2 oder 3)
   * @returns {string} Das HTML-Template als String
   */
  createPDFTemplate(data, profileImageSrc, accentColor, styleNumber) {
    switch (styleNumber) {
      case 2:
        return this.createStyle2Template(data, profileImageSrc, accentColor);
      case 3:
        return this.createStyle3Template(data, profileImageSrc, accentColor);
      default:
        return this.createStyle1Template(data, profileImageSrc, accentColor);
    }
  }

  /**
   * Erstellt das Standard-Template (Stil 1)
   * @param {Object} data - Die Lebenslaufdaten
   * @param {string} profileImageSrc - Die Profilbild-URL
   * @param {string} accentColor - Die Akzentfarbe
   * @returns {string} Das HTML-Template als String
   */
  createStyle1Template(data, profileImageSrc, accentColor) {
    // Daten extrahieren und mit Leerzeichen zwischen Wörtern sicherstellen
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    const phone = data.phone || '';
    const email = data.mail || '';
    
    // Bildungsdaten mit korrekten Abständen
    const school = data.school || 'IGS Melle';
    const degree = this.ensureProperSpacing(data.degree || 'Erweiterter Sekundarabschluss 1');
    const graduationYear = data.graduationYear || '2018';
    
    // Berufserfahrungsdaten mit korrekten Abständen
    const company = data.company || 'Developer Akademie';
    const position = this.ensureProperSpacing(data.position || 'Weiterbildung zum Frontend Web Developer');
    const workPeriod = data.workPeriod || '2018-2019';
    const description = this.ensureProperSpacing(data.description || 'TÜV Zertifizierter Bildungsträger, weiterbildung zum Softwareentwickler Schwerpunkt Frontend Entwicklung');
    
    // Nutze die bereitgestellte Akzentfarbe oder Standard-Blau, falls keine angegeben
    const themeColor = accentColor || '#3498db';
    
    // Vollständiges HTML-Template als String zurückgeben
    return `
      <div style="font-family: 'Lato', Arial, sans-serif; color: #333; padding: 20px 30px; margin: 0; width: 100%; box-sizing: border-box;">
        <!-- Header mit Name und Kontaktdaten -->
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; padding-right: 20px;">
              <h1 style="font-size: 28px; margin: 0 0 5px 0; color: #2c3e50;">${firstName} ${lastName}</h1>
              <div style="font-size: 14px; color: #555;">
                ${phone ? `<span style="margin-right: 20px;">Tel: ${phone}</span>` : ''}
                ${email ? `<span>E-Mail: ${email}</span>` : ''}
              </div>
            </td>
            <td style="vertical-align: top; width: 100px; text-align: right;">
              ${profileImageSrc ? `
                <img src="${profileImageSrc}" style="width: 100px; height: auto; display: block; margin-left: auto;">
              ` : ''}
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top: 5px;">
              <div style="border-bottom: 2px solid ${themeColor}; width: 100%;"></div>
            </td>
          </tr>
        </table>
        
        <!-- Bildungsabschnitt -->
        <div style="margin-top: 20px; margin-bottom: 25px;">
          <h2 style="font-size: 20px; color: ${themeColor}; margin: 0 0 15px 0;">Bildung</h2>
          
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="font-weight: bold; font-size: 16px; color: #333;">${degree}</span>
              <span style="font-style: italic; color: #666;">${graduationYear}</span>
            </div>
            <div style="font-size: 15px; color: #333; margin-bottom: 5px;">${school}</div>
          </div>
        </div>
        
        <!-- Berufserfahrungsabschnitt -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 20px; color: ${themeColor}; margin: 0 0 15px 0;">Berufserfahrung</h2>
          
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="font-weight: bold; font-size: 16px; color: #333;">${position}</span>
              <span style="font-style: italic; color: #666;">${workPeriod}</span>
            </div>
            <div style="font-size: 15px; color: #333; margin-bottom: 5px;">${company}</div>
            <div style="font-size: 14px; line-height: 1.6; margin-top: 8px; color: #333; word-spacing: 0.1em; letter-spacing: 0.02em;">${description}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Erstellt das Stil 2 Template mit verbesserten Abständen
   * @param {Object} data - Die Lebenslaufdaten
   * @param {string} profileImageSrc - Die Profilbild-URL
   * @param {string} accentColor - Die Akzentfarbe
   * @returns {string} Das HTML-Template als String
   */
  createStyle2Template(data, profileImageSrc, accentColor) {
    // Daten extrahieren mit korrekten Abständen
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    const phone = data.phone || '';
    const email = data.mail || '';
    
    // Bildungsdaten mit korrekten Abständen
    const school = data.school || 'IGS Melle';
    const degree = this.ensureProperSpacing(data.degree || 'Erweiterter Sekundarabschluss 1');
    const graduationYear = data.graduationYear || '2018';
    
    // Berufserfahrungsdaten mit korrekten Abständen
    const company = data.company || 'Developer Akademie';
    const position = this.ensureProperSpacing(data.position || 'Weiterbildung zum Frontend Web Developer');
    const workPeriod = data.workPeriod ? data.workPeriod.replace(/-/g, ' - ') : '2018 - 2019';
    const description = this.ensureProperSpacing(data.description || 'TÜV Zertifizierter Bildungsträger, weiterbildung zum Softwareentwickler Schwerpunkt Frontend Entwicklung');
    
    // Nutze die bereitgestellte Akzentfarbe oder Standard-Lila, falls keine angegeben
    const themeColor = accentColor || '#3498db';
    
    // Vollständiges HTML-Template als String zurückgeben (Stil 2)
    return `
      <div style="font-family: 'Georgia', serif; color: #444; padding: 20px 30px; margin: 0; width: 100%; box-sizing: border-box;">
        <!-- Header mit Name und Kontaktdaten -->
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: top; padding-right: 20px;">
                <h1 style="font-size: 28px; margin: 0 0 5px 0; color: #2c3e50;">${firstName} ${lastName}</h1>
                <div style="font-size: 14px; color: #555;">
                  ${phone ? `<span style="margin-right: 20px;">Tel: ${phone}</span>` : ''}
                  ${email ? `<span>E-Mail: ${email}</span>` : ''}
                </div>
              </td>
              <td style="vertical-align: top; width: 100px; text-align: right;">
                ${profileImageSrc ? `
                  <img src="${profileImageSrc}" style="width: 100px; height: auto; display: block; margin-left: auto;">
                ` : ''}
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Bildungsabschnitt -->
        <div style="margin-top: 20px; margin-bottom: 25px;">
          <h2 style="font-size: 20px; color: ${themeColor}; margin: 0 0 15px 0; font-style: italic; padding-left: 10px; border-left: 3px solid ${themeColor};">Bildung</h2>
          
          <div style="margin-bottom: 15px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top; width: 70%;">
                  <span style="font-weight: bold; font-size: 17px; color: #333; display: block; word-spacing: 0.1em; letter-spacing: 0.02em;">${degree}</span>
                </td>
                <td style="vertical-align: top; text-align: right; width: 30%;">
                  <span style="font-style: italic; color: #666;">${graduationYear}</span>
                </td>
              </tr>
            </table>
            <div style="font-size: 15px; color: #333; margin-bottom: 5px; margin-top: 5px;">${school}</div>
          </div>
        </div>
        
        <!-- Berufserfahrungsabschnitt -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 20px; color: ${themeColor}; margin: 0 0 15px 0; font-style: italic; padding-left: 10px; border-left: 3px solid ${themeColor};">Berufserfahrung</h2>
          
          <div style="margin-bottom: 15px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top; width: 70%;">
                  <span style="font-weight: bold; font-size: 17px; color: #333; display: block; word-spacing: 0.1em; letter-spacing: 0.02em;">${position}</span>
                </td>
                <td style="vertical-align: top; text-align: right; width: 30%;">
                  <span style="font-style: italic; color: #666;">${workPeriod}</span>
                </td>
              </tr>
            </table>
            <div style="font-size: 15px; color: #333; margin-top: 5px; margin-bottom: 5px;">${company}</div>
            <div style="font-size: 14px; line-height: 1.6; margin-top: 8px; color: #333; word-spacing: 0.1em; letter-spacing: 0.02em;">${description}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Verbesserte Version des Stil 3 Templates mit korrekter Textausrichtung und Abständen
   * @param {Object} data - Die Lebenslaufdaten
   * @param {string} profileImageSrc - Die Profilbild-URL
   * @param {string} accentColor - Die Akzentfarbe
   * @returns {string} Das HTML-Template als String
   */
  createStyle3Template(data, profileImageSrc, accentColor) {
    // Daten extrahieren mit korrekten Abständen
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    const phone = data.phone || '';
    const email = data.mail || '';
    
    // Bildungsdaten mit korrekten Abständen
    const school = data.school || 'IGS Melle';
    const degree = this.ensureProperSpacing(data.degree || 'Erweiterter Sekundarabschluss 1');
    const graduationYear = data.graduationYear || '2018';
    
    // Berufserfahrungsdaten mit korrekten Abständen
    const company = data.company || 'Developer Akademie';
    const position = this.ensureProperSpacing(data.position || 'Weiterbildung zum Frontend Web Developer');
    const workPeriod = data.workPeriod ? data.workPeriod.replace(/-/g, ' - ') : '2018 - 2019';
    const description = this.ensureProperSpacing(data.description || 'TÜV Zertifizierter Bildungsträger, weiterbildung zum Softwareentwickler Schwerpunkt Frontend Entwicklung');
    
    // Nutze die bereitgestellte Akzentfarbe oder Standard-Blau, falls keine angegeben
    const themeColor = accentColor || '#3498db';
    
    // Verbesserte Version mit saubererem HTML und korrekten Abständen
    return `
      <div style="font-family: 'Trebuchet MS', sans-serif; color: #222; line-height: 1.6; padding: 20px 30px; width: 100%;">
        <!-- Header - centered -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; border-collapse: separate;">
          <tr>
            <td align="center">
              ${profileImageSrc ? `<img src="${profileImageSrc}" width="100" style="border-radius: 5px;">` : ''}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 15px;">
              <span style="font-size: 28px; color: #2c3e50; font-weight: bold;">${firstName} ${lastName}</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 5px;">
              ${phone ? `<span style="font-size: 14px; color: #555; margin-right: 15px;">Tel: ${phone}</span>` : ''}
              ${email ? `<span style="font-size: 14px; color: #555;">E-Mail: ${email}</span>` : ''}
            </td>
          </tr>
        </table>
        
        <!-- Bildung Section - heading centered -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30px; margin-bottom: 30px; border-collapse: separate;">
          <tr>
            <td align="center">
              <span style="font-size: 20px; color: ${themeColor}; font-weight: bold;">Bildung</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 5px;">
              <div style="width: 50px; height: 2px; background-color: ${themeColor};"></div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 15px;">
              <span style="font-weight: bold; font-size: 16px; color: #333; word-spacing: 0.1em; letter-spacing: 0.02em;">${degree}</span>
            </td>
          </tr>
          <tr>
            <td align="center">
              <span style="font-style: italic; font-size: 14px; color: #666;">${graduationYear}</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 5px;">
              <span style="font-size: 15px; color: #333;">${school}</span>
            </td>
          </tr>
        </table>
        
        <!-- Berufserfahrung Section - heading centered -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30px; margin-bottom: 15px; border-collapse: separate;">
          <tr>
            <td align="center">
              <span style="font-size: 20px; color: ${themeColor}; font-weight: bold;">Berufserfahrung</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 5px;">
              <div style="width: 50px; height: 2px; background-color: ${themeColor};"></div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 15px;">
              <span style="font-weight: bold; font-size: 16px; color: #333; word-spacing: 0.1em; letter-spacing: 0.02em;">${position}</span>
            </td>
          </tr>
          <tr>
            <td align="center">
              <span style="font-style: italic; font-size: 14px; color: #666;">${workPeriod}</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 5px; padding-bottom: 15px;">
              <span style="font-size: 15px; color: #333;">${company}</span>
            </td>
          </tr>
        </table>
        
        <!-- Description with proper left alignment and spacing -->
        <div style="text-align: left; padding: 0 20px;">
          <p style="font-size: 14px; line-height: 1.6; color: #333; word-spacing: 0.1em; letter-spacing: 0.02em; margin-top: 0;">${description}</p>
        </div>
      </div>
    `;
  }

  /**
   * Hilfsfunktion, um korrekte Wortabstände sicherzustellen
   * @param {string} text - Der zu formatierende Text
   * @returns {string} Formatierter Text mit korrekten Wortabständen
   */
  ensureProperSpacing(text) {
    if (!text) return '';
    
    // 1. Ersetze mehrfache Leerzeichen durch ein einzelnes
    let result = text.replace(/\s+/g, ' ');
    
    // 2. Stelle sicher, dass nach jedem Komma ein Leerzeichen folgt
    result = result.replace(/,(?!\s)/g, ', ');
    
    // 3. Stelle sicher, dass nach "Sekundarabschluss" und vor Zahlen ein Leerzeichen steht
    result = result.replace(/(Sekundarabschluss)(\d)/g, '$1 $2');
    
    // 4. Stelle sicher, dass TÜV und Zertifizierter richtig getrennt sind
    result = result.replace(/TÜV(?!\s)Zertifizierter/g, 'TÜV Zertifizierter');
    
    // 5. Ersetze Bindestriche in Zeiträumen mit umgebenden Leerzeichen
    result = result.replace(/(\d+)-(\d+)/g, '$1 - $2');
    
    return result;
  }
}

// Singleton-Instanz exportieren
const pdfGenerator = new PDFGenerator();
export default pdfGenerator;