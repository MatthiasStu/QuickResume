let progress= 25; 


/**
 * QuickResume - JavaScript Funktionen
 * 
 * Diese Datei enthält alle JavaScript-Funktionen für die QuickResume-Anwendung.
 */

// ========== NAVIGATION UND UI-STEUERUNG ==========

/**
 * Navigiert zur Eingabeseite
 */
function startProgress() {
    window.location.href = "inputpage.html";
}

/**
 * Verwaltet die Navigation zur Landingpage
 */
function navigateToLandingPage(  ) {
    const currentPage = window.location.pathname;

    if (currentPage === "/index.html") {
        window.location.href = "/index.html";
    } else if (currentPage === "/inputpage.html") {
        document.getElementById("customConfirm").style.display = "flex";
    }
}

/**
 * Verarbeitet die Antwort auf den Bestätigungsdialog
 */
function confirmAction(isConfirmed) {
    document.getElementById("customConfirm").style.display = "none"; 

    if (isConfirmed) {
        window.location.href = "/index.html";
    }
}

/**
 * Aktualisiert die Fortschrittsanzeige
 */
function updateProgressbar(percent) { 
    let progressbar = document.getElementById("progressbar");
    if (progressbar) {
        progressbar.style.width = percent + "%"; 
        progressbar.textContent = percent + "%";
    }
}

// ========== PDF-GENERIERUNG ==========

/**
 * Generiert eine PDF-Datei aus dem Lebenslauf-Vorschaubereich
 */
function generatePDF() {
    const element = document.getElementById("resumePreview");
    
    if (!element) {
        console.error("Das Element zum Generieren der PDF wurde nicht gefunden.");
        return;
    }
    
    // Element klonen, um das Original nicht zu verändern
    const elementClone = element.cloneNode(true);
    
    // Spezifische Stile für optimale PDF-Darstellung anwenden
    elementClone.style.width = "210mm";
    elementClone.style.height = "auto"; 
    elementClone.style.padding = "15mm";
    elementClone.style.backgroundColor = "white";
    elementClone.style.color = "black";
    elementClone.style.textAlign = "left";  // Linksbündige Ausrichtung sicherstellen
    
    // Temporären Container erstellen
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.appendChild(elementClone);
    document.body.appendChild(tempContainer);
    
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
    
    // HTML2PDF Optionen
    const opt = {
        margin: [10, 10, 15, 10],
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true,
            letterRendering: true,
            allowTaint: false,
            scrollY: 0,
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: false,
            putOnlyUsedFonts: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // PDF generieren
    html2pdf()
        .set(opt)
        .from(elementClone)
        .save()
        .then(() => {
            document.body.removeChild(tempContainer);
            document.body.removeChild(loadingIndicator);
        })
        .catch(error => {
            console.error("Fehler bei der PDF-Generierung:", error);
            document.body.removeChild(tempContainer);
            document.body.removeChild(loadingIndicator);
            alert("Bei der Erstellung der PDF ist ein Fehler aufgetreten.");
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
    
    // Vorschauseite mit den geladenen Daten füllen
    document.getElementById("previewFirstName").textContent = resumeData.firstName || '';
    document.getElementById("previewLastName").textContent = resumeData.lastName || '';
    
    // Daten in die zweite Section übertragen
    document.getElementById("previewFirstName2").textContent = resumeData.firstName || '';
    document.getElementById("previewLastName2").textContent = resumeData.lastName || '';
    
    // Telefonnummer anzeigen, falls vorhanden
    if (document.getElementById("previewPhone")) {
        document.getElementById("previewPhone").textContent = resumeData.phone || '';
    }
    
    if (document.getElementById("previewMail")) {
        document.getElementById("previewMail").textContent = resumeData.mail || '';
    }
    console.log("Vorschaudaten erfolgreich geladen");
}

// ========== SEITEN-INITIALISIERUNG ==========

// Event-Listener beim Laden der Seite
window.addEventListener('DOMContentLoaded', function() {
  // Prüfe, ob wir auf der Eingabeseite sind
  if (document.getElementById('userForm')) {
    // FormController initialisieren
    const formCtrl = new FormController('userForm');
    
    // Fehler-Container setzen
    formCtrl.setErrorContainer('errorMessage');
    
    // Felder hinzufügen mit Validierungsregeln
    formCtrl.addField('firstName', { 
        required: true,
        errorMessage: 'Bitte gib deinen Vornamen ein.'
    });
    
    formCtrl.addField('lastName', { 
        required: true,
        errorMessage: 'Bitte gib deinen Nachnamen ein.'
    });
    
    formCtrl.addField('phone', { 
        required: true,
        pattern: /^[0-9]{6,}$/,
        errorMessage: 'Bitte gib eine gültige Telefonnummer ein (nur Zahlen, mindestens 6 Ziffern).',
        liveValidate: true // Live-Validierung während der Eingabe
    });

        formCtrl.addField('mail', { 
            required: true,
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            errorMessage: 'Bitte gib eine gültige E-Mail-Adresse ein.',
            liveValidate: true
        });
        
        const referrer = document.referrer;
        const isComingFromLandingPage = referrer.includes('index.html');
        
        // Vorhandene Daten laden
        const savedData = localStorage.getItem('resumeData');
        
        if (isComingFromLandingPage) {
            // Wenn von der Landingpage kommend, Formular leeren
            localStorage.removeItem('resumeData');
            formCtrl.fillWithData({
                firstName: '',
                lastName: '',
                phone: ''
            });
        } else if (savedData) {
            // Von anderen Seiten (z.B. Vorschau): Daten laden
            formCtrl.fillWithData(JSON.parse(savedData));
        }
        
        // Formular-Button einrichten
        document.getElementById('nextButton').addEventListener('click', function() {
            formCtrl.submit(function(data) {
                // Daten speichern
                localStorage.setItem('resumeData', JSON.stringify(data));
                
                // Fortschritt aktualisieren
                progress += 25; 
                updateProgressbar(progress); 
                console.log(progress)
                
              if(progress == 100){
                 window.location.href = 'preview.html';
                }else if(progress == 50){ 
                    openEducationInput()
                }else if(progress == 75){ 
                    openResumeInput()
                }
            });
        });
    }
    
    // Prüfe, ob wir auf der Vorschauseite sind
    if (document.getElementById('resumePreview')) {
        loadPreview();
    }
});

function openEducationInput(){ 
    document.getElementById('formContainer').innerHTML = ``;
}

function openResumeInput(){ 
    document.getElementById('formContainer').innerHTML = ``;
}