class StyleSwitcher {
    constructor() {
      this.currentStyleIndex = 0;
      this.totalStyles = 3;
      this.stylesWrapper = null;
      this.styleSlides = null;
      this.indicator = null;
      this.accentColor = '#3498db'; // Default accent color
      this.originalResumeHTML = '';
    }
  
    /**
     * Initializes the style switcher
     */
    init() {
      // Get DOM elements
      this.stylesWrapper = document.getElementById('resumeStylesWrapper');
      this.styleSlides = document.querySelectorAll('.resumeStyleSlide');
      this.indicator = document.getElementById('styleIndicator');
      
      if (!this.stylesWrapper || !this.styleSlides.length || !this.indicator) {
        console.error('Style switcher elements not found');
        return;
      }
      
      // Save original resume content
      const originalResume = document.getElementById('resumePreview');
      if (originalResume) {
        this.originalResumeHTML = originalResume.innerHTML;
      }
      
      // Initialize all style templates
      this.initializeStyleTemplates();
      
      // Set up navigation buttons
      const prevBtn = document.getElementById('prevStyleBtn');
      const nextBtn = document.getElementById('nextStyleBtn');
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.prevStyle());
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.nextStyle());
      }
      
      // Update the indicator
      this.updateStyleIndicator();
    }
  
    /**
     * Initialize all CV style templates with content
     */
    initializeStyleTemplates() {
      // Clone content from the first style to other styles
      const resumePreview1 = document.getElementById('resumePreview');
      const resumePreview2 = document.getElementById('resumePreview2');
      const resumePreview3 = document.getElementById('resumePreview3');
      
      if (resumePreview1 && resumePreview2 && resumePreview3) {
        // Clone content
        resumePreview2.innerHTML = resumePreview1.innerHTML;
        resumePreview3.innerHTML = resumePreview1.innerHTML;
        
        // Get current accent color - safely
        const headerElement = resumePreview1.querySelector('.resumeHeader');
        if (headerElement) {
          try {
            const computedStyle = window.getComputedStyle(headerElement);
            if (computedStyle) {
              this.accentColor = computedStyle.borderBottomColor || this.accentColor;
            }
          } catch (error) {
            console.error('Error getting computed style:', error);
            // Keep default accent color
          }
        }
        
        // Apply specific style adjustments for each template
        this.applyStyleSpecificAdjustments();
      }
    }
  
    /**
     * Apply specific adjustments to each CV style
     */
    applyStyleSpecificAdjustments() {
      // Style 2 adjustments
      const style2Headers = document.querySelectorAll('.style2 .resumeSection h2');
      style2Headers.forEach(heading => {
        heading.style.borderLeftColor = this.accentColor;
      });
      
      // Style 3 adjustments for the after elements
      const style3Headers = document.querySelectorAll('.style3 .resumeSection h2');
      style3Headers.forEach(heading => {
        // Since we can't directly style pseudo-elements with JS,
        // we'll add a CSS variable that the :after will use
        heading.style.setProperty('--after-bg-color', this.accentColor);
      });
    }
  
    /**
     * Update the accent color for all styles
     * @param {string} color - The new accent color
     */
    updateAccentColor(color) {
      this.accentColor = color;
      
      // Update all resume templates with the new color
      
      // Update style 1 (original)
      const style1Headers = document.querySelectorAll('.style1 .resumeSection h2');
      style1Headers.forEach(heading => {
        heading.style.color = color;
      });
      
      const style1Header = document.querySelector('.style1 .resumeHeader');
      if (style1Header) {
        style1Header.style.borderBottomColor = color;
      }
      
      // Update style 2
      const style2Headers = document.querySelectorAll('.style2 .resumeSection h2');
      style2Headers.forEach(heading => {
        heading.style.color = color;
        heading.style.borderLeftColor = color;
      });
      
      // Update style 3
      const style3Headers = document.querySelectorAll('.style3 .resumeSection h2');
      style3Headers.forEach(heading => {
        heading.style.color = color;
        heading.style.setProperty('--after-bg-color', color);
      });
      
      const style3HeaderAfters = document.querySelectorAll('.style3 .resumeSection h2:after');
      style3HeaderAfters.forEach(el => {
        if (el && el.style) {
          el.style.backgroundColor = color;
        }
      });
    }
  
    /**
     * Switch to the previous style
     */
    prevStyle() {
      this.currentStyleIndex = (this.currentStyleIndex - 1 + this.totalStyles) % this.totalStyles;
      this.updateStyles();
    }
  
    /**
     * Switch to the next style
     */
    nextStyle() {
      this.currentStyleIndex = (this.currentStyleIndex + 1) % this.totalStyles;
      this.updateStyles();
    }
  
    /**
     * Update the styles based on the current index
     */
    updateStyles() {
      // Update transform to show current style
      const translateX = -this.currentStyleIndex * (100 / this.totalStyles);
      this.stylesWrapper.style.transform = `translateX(${translateX}%)`;
      
      // Update active class
      this.styleSlides.forEach((slide, index) => {
        if (index === this.currentStyleIndex) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
      
      // Update indicator
      this.updateStyleIndicator();
    }
  
    /**
     * Update the style indicator text
     */
    updateStyleIndicator() {
      if (this.indicator) {
        this.indicator.textContent = `Template ${this.currentStyleIndex + 1}/${this.totalStyles}`;
      }
    }
  
    /**
     * Get the currently active resume template element
     * @returns {HTMLElement} The active resume template
     */
    getCurrentResumeTemplate() {
      const activeSlide = document.querySelector('.resumeStyleSlide.active');
      if (activeSlide) {
        return activeSlide.querySelector('.resumeTemplate');
      }
      return document.getElementById('resumePreview');
    }
  }
  
  // Create a StyleSwitcher instance to be used by other modules
  const styleSwitcher = new StyleSwitcher();
  
  // Export for use in other modules
  export default styleSwitcher;