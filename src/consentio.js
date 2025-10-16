/**
 * Consentio - Minimalist Consent Modal
 * 
 * A lightweight, frontend-only consent management solution for privacy compliance.
 * Integrates seamlessly with tag managers and provides transparent consent handling.
 * 
 * @author ChrisMavrommatis
 * @license Apache-2.0
 */

class Consentio {
  constructor(options = {}) {
    this.options = {
      // Default configuration
      position: options.position || 'bottom',
      theme: options.theme || 'light',
      showRejectButton: options.showRejectButton !== false,
      showSettingsButton: options.showSettingsButton !== false,
      autoShow: options.autoShow !== false,
      cookieName: options.cookieName || 'consentio-preferences',
      cookieExpiry: options.cookieExpiry || 365,
      categories: options.categories || {
        necessary: { required: true, enabled: true },
        analytics: { required: false, enabled: false },
        marketing: { required: false, enabled: false }
      },
      texts: {
        title: options.texts?.title || 'Cookie Consent',
        message: options.texts?.message || 'We use cookies to enhance your browsing experience and analyze site traffic.',
        acceptAll: options.texts?.acceptAll || 'Accept All',
        rejectAll: options.texts?.rejectAll || 'Reject All',
        settings: options.texts?.settings || 'Settings',
        save: options.texts?.save || 'Save Preferences',
        close: options.texts?.close || 'Close',
        ...options.texts
      },
      onAccept: options.onAccept || (() => {}),
      onReject: options.onReject || (() => {}),
      onSave: options.onSave || (() => {}),
      onShow: options.onShow || (() => {}),
      onHide: options.onHide || (() => {})
    };

    this.consent = this.loadConsent();
    this.modal = null;
    this.backdrop = null;
    this.settingsModal = null;
    this.originalOverflow = null; // Store original overflow value

    // Initialize if auto-show is enabled and no consent exists
    if (this.options.autoShow && !this.hasConsent()) {
      this.init();
    }
  }

  /**
   * Initialize the consent modal
   */
  init() {
    this.injectCSS();
    this.createModal();
    if (this.options.autoShow && !this.hasConsent()) {
      this.show();
    }
  }

  /**
   * Check if consent has been given
   */
  hasConsent() {
    return this.consent !== null;
  }

  /**
   * Get current consent status
   */
  getConsent() {
    return this.consent;
  }

  /**
   * Check if a specific category is consented
   */
  isConsentGiven(category) {
    return this.consent && this.consent[category] === true;
  }

  /**
   * Show the consent modal
   */
  show() {
    if (!this.modal) {
      this.createModal();
    }
    // Store original overflow value
    this.originalOverflow = document.body.style.overflow;
    
    this.modal.style.display = 'block';
    this.backdrop.style.display = 'block';
    document.body.style.overflow = 'hidden';
    this.options.onShow(this);
  }

  /**
   * Hide the consent modal
   */
  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
    if (this.backdrop) {
      this.backdrop.style.display = 'none';
    }
    if (this.settingsModal) {
      this.settingsModal.style.display = 'none';
    }
    // Restore original overflow value
    document.body.style.overflow = this.originalOverflow || '';
    this.options.onHide(this);
  }

  /**
   * Accept all cookies
   */
  acceptAll() {
    const consent = {};
    Object.keys(this.options.categories).forEach(category => {
      consent[category] = true;
    });
    this.saveConsent(consent);
    this.hide();
    this.options.onAccept(consent, this);
  }

  /**
   * Reject all optional cookies
   */
  rejectAll() {
    const consent = {};
    Object.keys(this.options.categories).forEach(category => {
      consent[category] = this.options.categories[category].required;
    });
    this.saveConsent(consent);
    this.hide();
    this.options.onReject(consent, this);
  }

  /**
   * Show settings modal
   */
  showSettings() {
    if (!this.settingsModal) {
      this.createSettingsModal();
    }
    this.modal.style.display = 'none';
    this.settingsModal.style.display = 'block';
  }

  /**
   * Save custom preferences
   */
  savePreferences() {
    const consent = {};
    Object.keys(this.options.categories).forEach(category => {
      const checkbox = document.getElementById(`consentio-${category}`);
      consent[category] = checkbox ? checkbox.checked : this.options.categories[category].required;
    });
    this.saveConsent(consent);
    this.hide();
    this.options.onSave(consent, this);
  }

  /**
   * Save consent to cookie
   */
  saveConsent(consent) {
    this.consent = consent;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.options.cookieExpiry);
    document.cookie = `${this.options.cookieName}=${encodeURIComponent(JSON.stringify(consent))}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    // Trigger GTM dataLayer event for integration
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        event: 'consentio_consent_updated',
        consent_state: consent
      });
    }
  }

  /**
   * Load consent from cookie
   */
  loadConsent() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.options.cookieName) {
        try {
          return JSON.parse(decodeURIComponent(value));
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Reset consent (for testing/debugging)
   */
  resetConsent() {
    document.cookie = `${this.options.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    this.consent = null;
  }

  /**
   * Create the main consent modal
   */
  createModal() {
    // Create backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'consentio-backdrop';
    this.backdrop.style.display = 'none';

    // Create modal container
    this.modal = document.createElement('div');
    this.modal.className = `consentio-modal consentio-${this.options.position} consentio-${this.options.theme}`;
    this.modal.style.display = 'none';

    // Modal content
    this.modal.innerHTML = `
      <div class="consentio-content">
        <h3 class="consentio-title">${this.options.texts.title}</h3>
        <p class="consentio-message">${this.options.texts.message}</p>
        <div class="consentio-actions">
          <button class="consentio-btn consentio-btn-accept" id="consentio-accept-all">
            ${this.options.texts.acceptAll}
          </button>
          ${this.options.showRejectButton ? `
            <button class="consentio-btn consentio-btn-reject" id="consentio-reject-all">
              ${this.options.texts.rejectAll}
            </button>
          ` : ''}
          ${this.options.showSettingsButton ? `
            <button class="consentio-btn consentio-btn-settings" id="consentio-settings">
              ${this.options.texts.settings}
            </button>
          ` : ''}
        </div>
      </div>
    `;

    // Add event listeners
    this.modal.querySelector('#consentio-accept-all').addEventListener('click', () => this.acceptAll());
    
    if (this.options.showRejectButton) {
      this.modal.querySelector('#consentio-reject-all').addEventListener('click', () => this.rejectAll());
    }
    
    if (this.options.showSettingsButton) {
      this.modal.querySelector('#consentio-settings').addEventListener('click', () => this.showSettings());
    }

    // Append to body
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.modal);
  }

  /**
   * Create the settings modal
   */
  createSettingsModal() {
    this.settingsModal = document.createElement('div');
    this.settingsModal.className = `consentio-settings-modal consentio-${this.options.theme}`;
    this.settingsModal.style.display = 'none';

    const categoriesHTML = Object.keys(this.options.categories).map(category => {
      const config = this.options.categories[category];
      const isChecked = this.consent ? this.consent[category] : config.enabled;
      
      return `
        <div class="consentio-category">
          <label class="consentio-category-label">
            <input 
              type="checkbox" 
              id="consentio-${category}"
              ${isChecked ? 'checked' : ''}
              ${config.required ? 'disabled' : ''}
            />
            <span class="consentio-category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            ${config.required ? '<span class="consentio-required">(Required)</span>' : ''}
          </label>
        </div>
      `;
    }).join('');

    this.settingsModal.innerHTML = `
      <div class="consentio-settings-content">
        <h3 class="consentio-title">Cookie Settings</h3>
        <div class="consentio-categories">
          ${categoriesHTML}
        </div>
        <div class="consentio-settings-actions">
          <button class="consentio-btn consentio-btn-save" id="consentio-save-preferences">
            ${this.options.texts.save}
          </button>
          <button class="consentio-btn consentio-btn-close" id="consentio-close-settings">
            ${this.options.texts.close}
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    this.settingsModal.querySelector('#consentio-save-preferences').addEventListener('click', () => this.savePreferences());
    this.settingsModal.querySelector('#consentio-close-settings').addEventListener('click', () => this.hide());

    document.body.appendChild(this.settingsModal);
  }

  /**
   * Inject CSS styles
   */
  injectCSS() {
    if (document.getElementById('consentio-styles')) return;

    const style = document.createElement('style');
    style.id = 'consentio-styles';
    style.textContent = `
      .consentio-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9998;
      }

      .consentio-modal {
        position: fixed;
        z-index: 9999;
        max-width: 500px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
      }

      .consentio-bottom {
        bottom: 20px;
        left: 20px;
        right: 20px;
      }

      .consentio-top {
        top: 20px;
        left: 20px;
        right: 20px;
      }

      .consentio-center {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 500px;
      }

      .consentio-content {
        padding: 20px;
      }

      .consentio-title {
        margin: 0 0 10px 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .consentio-message {
        margin: 0 0 20px 0;
        color: #666;
      }

      .consentio-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .consentio-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        flex: 1;
        min-width: 100px;
      }

      .consentio-btn-accept {
        background: #007bff;
        color: white;
      }

      .consentio-btn-accept:hover {
        background: #0056b3;
      }

      .consentio-btn-reject {
        background: #6c757d;
        color: white;
      }

      .consentio-btn-reject:hover {
        background: #545b62;
      }

      .consentio-btn-settings {
        background: #f8f9fa;
        color: #333;
        border: 1px solid #dee2e6;
      }

      .consentio-btn-settings:hover {
        background: #e9ecef;
      }

      .consentio-settings-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 400px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
      }

      .consentio-settings-content {
        padding: 20px;
      }

      .consentio-categories {
        margin: 20px 0;
      }

      .consentio-category {
        margin-bottom: 15px;
      }

      .consentio-category-label {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
      }

      .consentio-category-label input[type="checkbox"] {
        margin: 0;
      }

      .consentio-category-name {
        font-weight: 500;
      }

      .consentio-required {
        color: #666;
        font-size: 12px;
      }

      .consentio-settings-actions {
        display: flex;
        gap: 10px;
      }

      .consentio-btn-save {
        background: #28a745;
        color: white;
        flex: 1;
      }

      .consentio-btn-save:hover {
        background: #1e7e34;
      }

      .consentio-btn-close {
        background: #f8f9fa;
        color: #333;
        border: 1px solid #dee2e6;
        flex: 1;
      }

      .consentio-btn-close:hover {
        background: #e9ecef;
      }

      /* Dark theme */
      .consentio-dark {
        background: #333;
        color: #fff;
      }

      .consentio-dark .consentio-title {
        color: #fff;
      }

      .consentio-dark .consentio-message {
        color: #ccc;
      }

      .consentio-dark .consentio-btn-settings {
        background: #555;
        color: #fff;
        border-color: #666;
      }

      .consentio-dark .consentio-btn-settings:hover {
        background: #666;
      }

      .consentio-dark .consentio-btn-close {
        background: #555;
        color: #fff;
        border-color: #666;
      }

      .consentio-dark .consentio-btn-close:hover {
        background: #666;
      }

      /* Responsive design */
      @media (max-width: 600px) {
        .consentio-modal {
          left: 10px;
          right: 10px;
          bottom: 10px;
        }

        .consentio-actions {
          flex-direction: column;
        }

        .consentio-btn {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Consentio;
} else if (typeof define === 'function' && define.amd) {
  define([], function() { return Consentio; });
} else {
  window.Consentio = Consentio;
}

export default Consentio;