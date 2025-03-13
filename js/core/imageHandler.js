/**
 * ImageHandler - Verarbeitet und manipuliert Bilder für die Anwendung
 * 
 * Diese Klasse ist verantwortlich für alle bildspezifischen Operationen:
 * - Größenanpassung
 * - Komprimierung
 * - Lesen und Umwandeln von Dateien in Data-URLs
 */
class ImageHandler {
    /**
     * Liest eine Datei ein und gibt sie als Data-URL zurück
     * @param {File} file - Die einzulesende Datei
     * @returns {Promise<string>} Promise mit der Data-URL
     */
    readFileAsDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          resolve(event.target.result);
        };
        
        reader.onerror = (error) => {
          reject(new Error('Fehler beim Einlesen der Datei: ' + error));
        };
        
        reader.readAsDataURL(file);
      });
    }
  
    /**
     * Ändert die Größe eines Bildes und komprimiert es
     * @param {string} dataURL - Das Ursprungsbild als Data-URL
     * @param {number} maxWidth - Maximale Breite in Pixeln
     * @param {number} maxHeight - Maximale Höhe in Pixeln
     * @param {number} quality - Qualität der Komprimierung (0-1)
     * @returns {Promise<string>} Promise mit der komprimierten Data-URL
     */
    resizeAndCompressImage(dataURL, maxWidth, maxHeight, quality) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          // Neue Dimensionen berechnen
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          // Canvas erstellen und Bild neu zeichnen
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Komprimierte Data-URL ausgeben
          const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataURL);
        };
        
        img.onerror = () => {
          reject(new Error('Fehler beim Laden des Bildes'));
        };
        
        img.src = dataURL;
      });
    }
  
    /**
     * Prozess für das Hochladen eines Profilbildes
     * @param {File} file - Die Bilddatei
     * @param {Function} onSuccess - Callback bei Erfolg
     * @param {Function} onError - Callback bei Fehler
     */
    processProfileImage(file, onSuccess, onError) {
      if (!file) {
        if (onError) onError(new Error('Keine Datei ausgewählt'));
        return;
      }
  
      this.readFileAsDataURL(file)
        .then(dataURL => this.resizeAndCompressImage(dataURL, 400, 400, 0.7))
        .then(compressedDataURL => {
          if (onSuccess) onSuccess(compressedDataURL);
        })
        .catch(error => {
          console.error('Fehler bei der Bildverarbeitung:', error);
          if (onError) onError(error);
        });
    }
  
    /**
     * Erstellt ein Vorschaubild aus einer Data-URL
     * @param {string} dataURL - Das Bild als Data-URL
     * @param {HTMLElement} container - Das Container-Element für die Vorschau
     */
    createPreviewFromDataURL(dataURL, container) {
      // Vorhandene Inhalte löschen
      container.innerHTML = '';
      
      // Bild-Element erstellen und anfügen
      const img = document.createElement('img');
      img.src = dataURL;
      img.style.objectFit = 'contain';
      container.appendChild(img);
    }
  }
  
  // Singleton-Instanz exportieren
  const imageHandler = new ImageHandler();
  export default imageHandler;