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
    // Daten extrahieren
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    const phone = data.phone || '';
    const email = data.mail || '';
    const school = data.school || '';
    const degree = data.degree || '';
    const graduationYear = data.graduationYear || '';
    const company = data.company || '';
    const position = data.position || '';
    const workPeriod = data.workPeriod || '';
    const description = data.description || '';
    
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
              <span style="font-weight: bold; font-size: 16px; color: #333;">${degree || 'Erweiterter Sekundarabschluss 2'}</span>
              <span style="font-style: italic; color: #666;">${graduationYear || '2020'}</span>
            </div>
            <div style="font-size: 15px; color: #333; margin-bottom: 5px;">${school || 'IGS Melle'}</div>
          </div>
        </div>
        
        <!-- Berufserfahrungsabschnitt -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 20px; color: ${themeColor}; margin: 0 0 15px 0;">Berufserfahrung</h2>
          
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="font-weight: bold; font-size: 16px; color: #333;">${position || 'Weiterbildung zum Frontend Web Developer'}</span>
              <span style="font-style: italic; color: #666;">${workPeriod || '2018-2019'}</span>
            </div>
            <div style="font-size: 15px; color: #333; margin-bottom: 5px;">${company || 'Developer Akademie'}</div>
            <div style="font-size: 14px; line-height: 1.4; margin-top: 8px; color: #333;">${description || 'TÜV Zertifizierter Bildungsträger, weiterbildung zum Softwareentwickler Schwerpunkt Frontend Entwicklung'}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Fixed Style 2 Template - Better date handling
   * @param {Object} data - Die Lebenslaufdaten
   * @param {string} profileImageSrc - Die Profilbild-URL
   * @param {string} accentColor - Die Akzentfarbe
   * @returns {string} Das HTML-Template als String
   */
  createStyle2Template(data, profileImageSrc, accentColor) {
    // Daten extrahieren
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    const phone = data.phone || '';
    const email = data.mail || '';
    const school = data.school || '';
    const degree = data.degree || '';
    const graduationYear = data.graduationYear || '';
    const company = data.company || '';
    const position = data.position || '';
    const workPeriod = data.workPeriod || '';
    const description = data.description || '';
    
    // Format the work period to avoid hyphen issues (add proper spacing)
    const formattedWorkPeriod = workPeriod ? workPeriod.replace('-', ' - ') : '2018 - 2019';
    
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
                  <span style="font-weight: bold; font-size: 17px; color: #333; display: block;">${degree || 'Erweiterter Sekundarabschluss 2'}</span>
                </td>
                <td style="vertical-align: top; text-align: right; width: 30%;">
                  <span style="font-style: italic; color: #666;">${graduationYear || '2020'}</span>
                </td>
              </tr>
            </table>
            <div style="font-size: 15px; color: #333; margin-bottom: 5px; margin-top: 5px;">${school || 'IGS Melle'}</div>
          </div>
        </div>
        
        <!-- Berufserfahrungsabschnitt -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 20px; color: ${themeColor}; margin: 0 0 15px 0; font-style: italic; padding-left: 10px; border-left: 3px solid ${themeColor};">Berufserfahrung</h2>
          
          <div style="margin-bottom: 15px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top; width: 70%;">
                  <span style="font-weight: bold; font-size: 17px; color: #333; display: block;">${position || 'Weiterbildung zum Frontend Web Developer'}</span>
                </td>
                <td style="vertical-align: top; text-align: right; width: 30%;">
                  <span style="font-style: italic; color: #666;">${formattedWorkPeriod}</span>
                </td>
              </tr>
            </table>
            <div style="font-size: 15px; color: #333; margin-top: 5px; margin-bottom: 5px;">${company || 'Developer Akademie'}</div>
            <div style="font-size: 14px; line-height: 1.4; margin-top: 8px; color: #333;">${description || 'TÜV Zertifizierter Bildungsträger, weiterbildung zum Softwareentwickler Schwerpunkt Frontend Entwicklung'}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
 * Fixed Style 3 Template with correct text alignment
 * @param {Object} data - Die Lebenslaufdaten
 * @param {string} profileImageSrc - Die Profilbild-URL
 * @param {string} accentColor - Die Akzentfarbe
 * @returns {string} Das HTML-Template als String
 */
  createStyle3Template(data, profileImageSrc, accentColor) {
    // Daten extrahieren
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    const phone = data.phone || '';
    const email = data.mail || '';
    const school = data.school || '';
    const degree = data.degree || '';
    const graduationYear = data.graduationYear || '';
    const company = data.company || '';
    const position = data.position || '';
    const workPeriod = data.workPeriod || '';
    const description = data.description || '';
    
    // Nutze die bereitgestellte Akzentfarbe oder Standard-Blau, falls keine angegeben
    const themeColor = accentColor || '#3498db';
    
    // This approach uses simple table structure with mixed alignments for maximum PDF compatibility
    return `
      <div style="font-family: 'Trebuchet MS', sans-serif; color: #222; line-height: 1.6; padding: 20px 30px; width: 100%;">
        <!-- Header - centered -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
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
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30px; margin-bottom: 30px;">
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
              <span style="font-weight: bold; font-size: 16px; color: #333;">${degree || 'Erweiterter Sekundarabschluss 2'}</span>
            </td>
          </tr>
          <tr>
            <td align="center">
              <span style="font-style: italic; font-size: 14px; color: #666;">${graduationYear || '2020'}</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 5px;">
              <span style="font-size: 15px; color: #333;">${school || 'IGS Melle'}</span>
            </td>
          </tr>
        </table>
        
        <!-- Berufserfahrung Section - heading centered, description left-aligned -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30px; margin-bottom: 30px;">
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
              <span style="font-weight: bold; font-size: 16px; color: #333;">${position || 'Weiterbildung zum Frontend Web Developer'}</span>
            </td>
          </tr>
          <tr>
            <td align="center">
              <span style="font-style: italic; font-size: 14px; color: #666;">${workPeriod || '2018-2019'}</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 5px;">
              <span style="font-size: 15px; color: #333;">${company || 'Developer Akademie'}</span>
            </td>
          </tr>
        </table>
        
        <!-- IMPORTANT: Separate table just for the description with forced left alignment -->
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="left" style="text-align: left !important;">
              <span style="font-size: 14px; line-height: 1.4; color: #333; text-align: left !important;">
                ${description || 'TÜV Zertifizierter Bildungsträger, weiterbildung zum Softwareentwickler Schwerpunkt Frontend Entwicklung'}
              </span>
            </td>
          </tr>
        </table>
      </div>
    `;
  }
}

// Singleton-Instanz exportieren
const pdfGenerator = new PDFGenerator();
export default pdfGenerator;