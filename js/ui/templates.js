/**
 * Templates - HTML-Templates für verschiedene Formulartypen
 * 
 * Diese Datei enthält alle HTML-Templates für die Formulare der Anwendung,
 * sauber strukturiert und zentral verwaltet.
 */

/**
 * Template für das Formular mit persönlichen Informationen
 */
export const personalInfoTemplate = `
  <h2>Persönliche Informationen</h2>
  
  <div class="image-upload-container">
    <div class="image-preview-wrapper">
      <div class="image-preview" id="imagePreview" style="border-radius: 0;">
        <span class="upload-icon">+</span>
      </div>
    </div>
    <input type="file" id="imageUpload" accept="image/*">
    <div class="upload-actions">
      <button type="button" class="upload-button" onclick="document.getElementById('imageUpload').click()">Bild hochladen</button>
      <button type="button" class="remove-button" id="removeImageBtn" style="display:none;">Bild entfernen</button>
    </div>
  </div>
  
  <div class="formGroup">
    <label for="firstName">Vorname:</label>
    <input type="text" id="firstName" name="firstName" required>
  </div>
  
  <div class="formGroup">
    <label for="lastName">Nachname:</label>
    <input type="text" id="lastName" name="lastName" required>
  </div>
  
  <div class="formGroup">
    <label for="phone">Telefonnummer:</label>
    <input type="tel" id="phone" name="phone" required>
  </div>
  
  <div class="formGroup">
    <label for="mail">E-Mail:</label>
    <input type="email" id="mail" name="mail" required>
  </div>
  
  <div id="errorMessage" class="errorMessage" style="display: none; color: red; margin-top: 10px;"></div>
`;

/**
 * Template für das Bildungsformular
 */
export const educationTemplate = `
  <h2>Bildung</h2>
  
  <div class="formGroup">
    <label for="school">Bildungseinrichtung:</label>
    <input type="text" id="school" name="school">
  </div>
  
  <div class="formGroup">
    <label for="degree">Abschluss:</label>
    <input type="text" id="degree" name="degree">
  </div>
  
  <div class="formGroup">
    <label for="graduationYear">Abschlussjahr:</label>
    <input type="text" id="graduationYear" name="graduationYear">
  </div>
  
  <div id="errorMessage" class="errorMessage" style="display: none; color: red; margin-top: 10px;"></div>
`;

/**
 * Template für das Berufserfahrungsformular
 */
export const resumeTemplate = `
  <h2>Berufserfahrung</h2>
  
  <div class="formGroup">
    <label for="company">Unternehmen:</label>
    <input type="text" id="company" name="company">
  </div>
  
  <div class="formGroup">
    <label for="position">Position:</label>
    <input type="text" id="position" name="position">
  </div>
  
  <div class="formGroup">
    <label for="workPeriod">Zeitraum:</label>
    <input type="text" id="workPeriod" name="workPeriod">
  </div>
  
  <div class="formGroup">
    <label for="description">Beschreibung:</label>
    <textarea id="description" name="description" rows="4"></textarea>
  </div>
  
  <div id="errorMessage" class="errorMessage" style="display: none; color: red; margin-top: 10px;"></div>
`;