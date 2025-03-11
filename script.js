/**
 * QuickResume - JavaScript Funktionen
 * 
 * Diese Datei enthält alle JavaScript-Funktionen für die QuickResume-Anwendung.
 */

// Globale Variablen
let progress = 25; // Standardwert für den Startfortschritt

// ========== NAVIGATION UND UI-STEUERUNG ==========

/**
 * Navigiert zur Eingabeseite
 */
function startProgress() {
    // Setze Fortschritt zurück
    progress = 25;
    localStorage.setItem('formProgress', progress);
    window.location.href = "inputpage.html";
}

/**
 * Verwaltet die Navigation je nach aktuellem Fortschritt
 */
function navigateToLandingPage(isNavbar = false) {
    const currentPage = window.location.pathname;

    if (currentPage === "/index.html") {
        // Already on landing page
        window.location.href = "/index.html";
    } else if (currentPage === "/inputpage.html" || currentPage === "/preview.html") {
        // Check current progress and navigation method
        if (progress === 25 || isNavbar === true) {
            // Always show confirmation for navbar/logo or when at initial progress
            document.getElementById("customConfirm").style.display = "flex";
        } else if (progress === 50) {
            // At 50% go back to first form
            updateProgress(25);
            openPersonalInfoInput();
        } else if (progress === 75) {
            // At 75% go back to second form
            updateProgress(50);
            openEducationInput();
        } else if (progress === 100) {
            // At 100% go back to third form
            updateProgress(75);
            openResumeInput();
        }
    }
}

/**
 * Verarbeitet die Antwort auf den Bestätigungsdialog
 * 
 * @param {boolean} isConfirmed - Gibt an, ob der Benutzer bestätigt hat
 */
function confirmAction(isConfirmed) {
    document.getElementById("customConfirm").style.display = "none"; 

    if (isConfirmed) {
        // Weiterleitung zur Startseite bei Bestätigung
        window.location.href = "/index.html";
    }
}

/**
 * Aktualisiert den Fortschritt und speichert ihn im localStorage
 * 
 * @param {number} newProgress - Neuer Fortschrittswert 
 */
function updateProgress(newProgress) {
    progress = newProgress;
    updateProgressbar(progress);
    localStorage.setItem('formProgress', progress);
}

/**
 * Aktualisiert die Fortschrittsanzeige
 * 
 * @param {number} percent - Prozentsatz des Fortschritts (0-100)
 */
function updateProgressbar(percent) { 
    let progressbar = document.getElementById("progressbar");
    if (progressbar) {
        progressbar.style.width = percent + "%"; 
        progressbar.textContent = percent + "%";
    }
}

// ========== FORMULAR-FUNKTIONEN ==========

/**
 * Öffnet das Formular für persönliche Informationen (Fortschritt 25%)
 */

/**
 * Initialisiert den FormController mit den aktuell angezeigten Formularfeldern
 */
function initializeFormController() {
    // FormController initialisieren
    const formCtrl = new FormController('userForm');
    
    // Fehler-Container setzen
    formCtrl.setErrorContainer('errorMessage');
    
    // Vorhandene Felder im DOM finden und dem Controller hinzufügen
    const inputs = document.querySelectorAll('#userForm input, #userForm textarea');
    
    inputs.forEach(input => {
        const fieldId = input.id;
        let validationRules = { required: true };
        
        // Spezifische Validierungsregeln basierend auf Feldtyp hinzufügen
        if (fieldId === 'phone') {
            validationRules.pattern = /^[0-9]{6,}$/;
            validationRules.errorMessage = 'Bitte gib eine gültige Telefonnummer ein (nur Zahlen, mindestens 6 Ziffern).';
            validationRules.liveValidate = true;
        } else if (fieldId === 'mail') {
            validationRules.pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            validationRules.errorMessage = 'Bitte gib eine gültige E-Mail-Adresse ein.';
            validationRules.liveValidate = true;
        } else if (fieldId === 'graduationYear') {
            validationRules.pattern = /^(19|20)\d{2}$/;
            validationRules.errorMessage = 'Bitte gib ein gültiges Jahr ein (z.B. 2020).';
            validationRules.liveValidate = true;
        }
        
        formCtrl.addField(fieldId, validationRules);
    });
    
    // Vorhandene Daten laden und in die richtigen Felder einfüllen
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
        formCtrl.fillWithData(JSON.parse(savedData));
    }
    // Formular-Button neu einrichten
    setupFormButton(formCtrl);
}

/**
 * Richtet den Weiter-Button für das aktuelle Formular ein
 */
function setupFormButton(formCtrl) {
    const nextButton = document.getElementById('nextButton');
    
    if (nextButton) {
        // Alle alten Event-Listener entfernen
        const newButton = nextButton.cloneNode(true);
        nextButton.parentNode.replaceChild(newButton, nextButton);
        
        // Neuen Event-Listener hinzufügen
        newButton.addEventListener('click', function() {
            formCtrl.submit(function(data) {
                // Bestehende Daten laden und mit neuen Daten zusammenführen
                const existingData = localStorage.getItem('resumeData') ? 
                    JSON.parse(localStorage.getItem('resumeData')) : {};
                const updatedData = {...existingData, ...data};
                
                // Aktualisierte Daten speichern
                localStorage.setItem('resumeData', JSON.stringify(updatedData));
                
                // Fortschritt aktualisieren und zum nächsten Schritt gehen
                if (progress === 25) {
                    updateProgress(50);
                    openEducationInput();
                } else if (progress === 50) {
                    updateProgress(75);
                    openResumeInput();
                } else if (progress === 75) {
                    updateProgress(100);
                    window.location.href = 'preview.html';
                }
            });
        });
    }
}

// ========== PDF-GENERIERUNG ==========

/**
 * Generiert eine PDF-Datei aus dem Lebenslauf-Vorschaubereich
 */
/**
 * Generiert eine PDF-Datei aus dem Lebenslauf-Vorschaubereich
 * Enthält Optimierungen für eine saubere Darstellung und korrekte Formatierung
 */
function generatePDF() {
    // Lebenslauf-Container abrufen
    const element = document.getElementById("resumePreview");
    
    if (!element) {
        console.error("Das Element zum Generieren der PDF wurde nicht gefunden.");
        return;
    }
    
    // Lade-Indikator anzeigen
    const loadingIndicator = document.createElement("div");
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
    
    // Name des Bewerbers für den Dateinamen holen
    const lastName = document.getElementById("previewLastName").textContent || 'dokument';
    
    // Einfachere Optionen für html2pdf
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `lebenslauf_${lastName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 1,
            useCORS: true,
            logging: false
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait'
        }
    };
    
    // PDF generieren mit minimaler Manipulation
    html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
            document.body.removeChild(loadingIndicator);
        })
        .catch(error => {
            console.error("Fehler bei der PDF-Generierung:", error);
            document.body.removeChild(loadingIndicator);
            alert("Bei der Erstellung der PDF ist ein Fehler aufgetreten. Bitte versuche es erneut.");
        });
}
/**
 * Lädt die gespeicherten Daten in die Vorschauseite
 */
function loadPreview() {
    console.log("Vorschau wird geladen...");
    
    // Daten aus dem localStorage laden
    const resumeDataString = localStorage.getItem("resumeData");
    
    if (!resumeDataString) {
        console.warn("Keine gespeicherten Daten gefunden, Umleitung zur Eingabeseite");
        window.location.href = "inputpage.html";
        return;
    }
    
    const resumeData = JSON.parse(resumeDataString);
    
    // Grundlegende Informationen
    document.getElementById("previewFirstName").textContent = resumeData.firstName || '';
    document.getElementById("previewLastName").textContent = resumeData.lastName || '';
    document.getElementById("previewPhone").textContent = resumeData.phone || '';
    document.getElementById("previewMail").textContent = resumeData.mail || '';
    
    // Verstecke Kontaktinformationen, wenn sie leer sind
    document.getElementById("contactPhone").style.display = resumeData.phone ? 'inline' : 'none';
    document.getElementById("contactEmail").style.display = resumeData.mail ? 'inline' : 'none';
    
    // Bildung
    document.getElementById("previewSchool").textContent = resumeData.school || '';
    document.getElementById("previewDegree").textContent = resumeData.degree || 'Abschluss';
    document.getElementById("previewGraduationYear").textContent = resumeData.graduationYear || '';
    
    // Verstecke Bildungsabschnitt, wenn alle Felder leer sind
    const hasEducation = resumeData.school || resumeData.degree || resumeData.graduationYear;
    document.getElementById("educationSection").style.display = hasEducation ? 'block' : 'none';
    
    // Berufserfahrung
    document.getElementById("previewCompany").textContent = resumeData.company || '';
    document.getElementById("previewPosition").textContent = resumeData.position || 'Position';
    document.getElementById("previewWorkPeriod").textContent = resumeData.workPeriod || '';
    document.getElementById("previewDescription").textContent = resumeData.description || '';
    
    // Verstecke Berufserfahrungsabschnitt, wenn alle Felder leer sind
    const hasExperience = resumeData.company || resumeData.position || 
                         resumeData.workPeriod || resumeData.description;
    document.getElementById("experienceSection").style.display = hasExperience ? 'block' : 'none';
    
    console.log("Vorschaudaten erfolgreich geladen");
}

// Hilfsfunktion zum Ausblenden leerer Sektionen
function hideEmptySections() {
    const sections = document.querySelectorAll('.resumeSection');
    
    sections.forEach(section => {
        // Prüfe, ob alle dynamischen Felder in dieser Sektion leer sind
        const dynamicFields = section.querySelectorAll('[id^="preview"]');
        let allEmpty = true;
        
        dynamicFields.forEach(field => {
            if (field.textContent.trim() !== '') {
                allEmpty = false;
            }
        });
        
        // Wenn alle Felder leer sind, blende die Sektion aus
        if (allEmpty && dynamicFields.length > 0) {
            section.style.display = 'none';
        } else {
            section.style.display = 'block';
        }
    });
}

// ========== SEITEN-INITIALISIERUNG ==========

// Event-Listener beim Laden der Seite
window.addEventListener('DOMContentLoaded', function() {
    // Progress aus localStorage laden, falls vorhanden
    const savedProgress = localStorage.getItem('formProgress');
    if (savedProgress) {
        progress = parseInt(savedProgress);
        updateProgressbar(progress);
    }
    
    // Prüfe, ob wir auf der Eingabeseite sind
    if (document.getElementById('userForm')) {
        // Je nach Fortschritt das richtige Formular anzeigen
        if (progress === 25) {
            openPersonalInfoInput();
        } else if (progress === 50) {
            openEducationInput();
        } else if (progress === 75) {
            openResumeInput();
        } else if (progress === 100) {
            // Wir sind mit allen Formularen fertig, zur Vorschau navigieren
            window.location.href = 'preview.html';
        }
    }
    
    // Prüfe, ob wir auf der Vorschauseite sind
    if (document.getElementById('resumePreview')) {
        loadPreview();
    }
});

function navigateBackFromPreview() {
    // Fortschritt auf 75% setzen (letzte Formularseite)
    localStorage.setItem('formProgress', 75);
    
    // Zurück zur Eingabeseite navigieren
    window.location.href = "inputpage.html";
}



// Exportiere benötigte Funktionen, damit form-controller.js sie verwenden kann
window.openPersonalInfoInput = openPersonalInfoInput;
window.openEducationInput = openEducationInput;
window.openResumeInput = openResumeInput;