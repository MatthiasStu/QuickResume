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
