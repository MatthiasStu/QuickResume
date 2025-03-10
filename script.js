function startProgress() {
    window.location.href = "inputpage.html";
}

function navigateToLandingPage() {
    const currentPage = window.location.pathname;

    if (currentPage === "/index.html") {
        window.location.href = "/index.html";
    } else if (currentPage === "/inputpage.html") {
        document.getElementById("customConfirm").style.display = "flex"; // Popup anzeigen
    }
}


function confirmAction(isConfirmed) {
    document.getElementById("customConfirm").style.display = "none"; 

    if (isConfirmed) {
        window.location.href = "/index.html"; // Weiterleitung
    }
}


function nextStep(percent){ 

updateProgressbar(percent); 
}

function updateProgressbar(percent){ 
    let progressbar = document.getElementById("progressbar")
    progressbar.style.width = percent + "%"; 
    progressbar.textContent = percent + "%";
}

function saveDataAndContinue() {
    // Get form data
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    
    // Validate form data
    if (!firstName || !lastName) {
        alert("Bitte fülle alle Felder aus.");
        return;
    }
    
    // Save data to local storage
    const userData = {
        firstName: firstName,
        lastName: lastName
    };
    
    localStorage.setItem("resumeData", JSON.stringify(userData));
    
    // Update progress and navigate to preview page
    updateProgressbar(50);
    window.location.href = "preview.html";
}

// Function to generate PDF (to be used in preview.html)
function generatePDF() {
    // Get resume container
    const element = document.getElementById("resumePreview");
    
    if (!element) {
        console.error("Das Element zum Generieren der PDF wurde nicht gefunden.");
        return;
    }
    
    // Create a clone of the element to avoid modifying the original
    const elementClone = element.cloneNode(true);
    
    // Apply specific styles to ensure visibility in the PDF
    elementClone.style.width = "210mm"; // A4 width
    elementClone.style.height = "auto";
    elementClone.style.padding = "20mm";
    elementClone.style.backgroundColor = "white";
    elementClone.style.color = "black";
    
    // Create a temporary container for the clone
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.appendChild(elementClone);
    document.body.appendChild(tempContainer);
    
    // Options for html2pdf
    const opt = {
        margin: 10,
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true,
            letterRendering: true,
            allowTaint: false
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: false
        }
    };
    
    // Show a loading indicator
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
    
    // Generate the PDF with a promise chain
    html2pdf()
        .set(opt)
        .from(elementClone)
        .save()
        .then(() => {
            // Clean up
            document.body.removeChild(tempContainer);
            document.body.removeChild(loadingIndicator);
        })
        .catch(error => {
            console.error("PDF generation error:", error);
            document.body.removeChild(tempContainer);
            document.body.removeChild(loadingIndicator);
            alert("Bei der Erstellung der PDF ist ein Fehler aufgetreten. Bitte versuche es erneut.");
        });
}



function loadPreview() {
    console.log("loadPreview function called");
    
    // Daten aus dem LocalStorage laden
    const resumeDataString = localStorage.getItem("resumeData");
    console.log("Data from localStorage:", resumeDataString);
    
    if (!resumeDataString) {
        console.warn("No data found in localStorage, redirecting to input page");
        window.location.href = "inputpage.html";
        return;
    }
    
    const resumeData = JSON.parse(resumeDataString);
    console.log("Parsed data:", resumeData);
    
    // Fülle die Preview-Seite mit den geladenen Daten
    document.getElementById("previewFirstName").textContent = resumeData.firstName;
    document.getElementById("previewLastName").textContent = resumeData.lastName;
    
    // Übertrage die Daten in die zweite Section
    document.getElementById("previewFirstName2").textContent = resumeData.firstName;
    document.getElementById("previewLastName2").textContent = resumeData.lastName;
    
    console.log("Preview data loaded successfully");
}