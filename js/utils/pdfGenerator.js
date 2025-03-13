/**
 * PDFGenerator - Zuständig für die Generierung von PDF-Dokumenten
 * 
 * Diese Klasse nutzt jsPDF und html2canvas für bessere Kontrolle
 * über den PDF-Erstellungsprozess, behält aber das ursprüngliche Layout.
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
    
    // Erstelle ein temporäres Container-Element für das Rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm'; // A4 Breite
    
    // Füge das Element zum DOM hinzu
    document.body.appendChild(container);
    
    // HTML-Template für das PDF erstellen und in den Container einfügen
    container.innerHTML = this.createPDFTemplate(resumeData, profileImage, accentColor);
    
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
   * @returns {string} Das HTML-Template als String
   */
  createPDFTemplate(data, profileImageSrc, accentColor) {
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
    
    // Nutze die bereitgestellte Akzentfarbe oder Standard-Lila, falls keine angegeben
    const themeColor = accentColor || '#9b59b6';
    
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
              <span style="font-style: italic; color: #666;">${graduationYear || '2018'}</span>
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
}

// Singleton-Instanz exportieren
const pdfGenerator = new PDFGenerator();
export default pdfGenerator;