function openPersonalInfoInput() {
    document.getElementById('formContainer').innerHTML = `
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
            </div>
    `;
    
    // Image upload functionality
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');

    // Load saved profile image if exists
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
        const img = document.createElement('img');
        img.src = savedProfileImage;
        img.style.objectFit = 'contain'; // Ensure consistent display
        imagePreview.innerHTML = '';
        imagePreview.appendChild(img);
        removeImageBtn.style.display = 'inline-block';
    }
    

    // Image upload event listener
    imageUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Resize and compress the image before storing
                resizeAndCompressImage(e.target.result, 400, 400, 0.7)
                    .then(compressedDataURL => {
                        // Clear previous preview
                        imagePreview.innerHTML = '';
                        
                        // Create and append image
                        const img = document.createElement('img');
                        img.src = compressedDataURL;
                        img.style.objectFit = 'contain';
                        imagePreview.appendChild(img);
                        
                        // Try to save to localStorage with error handling
                        try {
                            localStorage.setItem('profileImage', compressedDataURL);
                            // Show remove button
                            removeImageBtn.style.display = 'inline-block';
                        } catch (error) {
                            console.error('Failed to save image to localStorage:', error);
                            alert('Das Bild ist zu groß für den Speicher. Bitte wähle ein kleineres Bild.');
                            // Reset preview
                            imagePreview.innerHTML = '<span class="upload-icon">+</span>';
                            // Clear file input
                            imageUpload.value = '';
                        }
                    })
                    .catch(error => {
                        console.error('Image processing error:', error);
                        alert('Es gab ein Problem bei der Bildverarbeitung. Bitte versuche es erneut.');
                    });
            };
            reader.readAsDataURL(file);
        }
    });

    // Remove image functionality
    removeImageBtn.addEventListener('click', function() {
        // Reset preview
        imagePreview.innerHTML = '<span class="upload-icon">+</span>';
        
        // Clear file input
        imageUpload.value = '';
        
        // Remove from localStorage
        localStorage.removeItem('profileImage');
        
        // Hide remove button
        removeImageBtn.style.display = 'none';
    });
    
    // Neu-Initialisierung des FormControllers nach DOM-Änderung
    initializeFormController();
}

function resizeAndCompressImage(dataURL, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions
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
            
            // Create canvas and resize
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            // Draw resized image
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get compressed data URL
            const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataURL);
        };
        
        img.onerror = function() {
            reject(new Error('Failed to load image'));
        };
        
        img.src = dataURL;
    });
}
/**
 * Öffnet das Bildungsformular (Fortschritt 50%)
 */
function openEducationInput() {
    document.getElementById('formContainer').innerHTML = `
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
    
    // Neu-Initialisierung des FormControllers nach DOM-Änderung
    initializeFormController();
}

/**
 * Öffnet das Berufserfahrungsformular (Fortschritt 75%)
 */
function openResumeInput() {
    document.getElementById('formContainer').innerHTML = `
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
    
    // Neu-Initialisierung des FormControllers nach DOM-Änderung
    initializeFormController();
}
