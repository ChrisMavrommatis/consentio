/**
 * @jest-environment jsdom
 */

// Load the UMD build for testing
const fs = require('fs');
const path = require('path');

// Setup window context for UMD
global.window = global;
global.globalThis = global;

// Read the built UMD file and execute it in global scope
const consentioCode = fs.readFileSync(path.join(__dirname, '../dist/consentio.js'), 'utf8');
eval(consentioCode);

const Consentio = global.Consentio;

// Mock localStorage and document.cookie
Object.defineProperty(window.document, 'cookie', {
  writable: true,
  value: '',
});

describe('Consentio', () => {
  let consentio;
  
  beforeEach(() => {
    // Clear cookies
    document.cookie = '';
    // Clear any existing modal elements
    document.body.innerHTML = '';
    // Reset dataLayer
    window.dataLayer = [];
  });

  afterEach(() => {
    if (consentio) {
      consentio.resetConsent();
    }
  });

  describe('Initialization', () => {
    test('should create instance with default options', () => {
      consentio = new Consentio({ autoShow: false });
      expect(consentio).toBeInstanceOf(Consentio);
      expect(consentio.options.position).toBe('bottom');
      expect(consentio.options.theme).toBe('light');
      expect(consentio.options.cookieName).toBe('consentio-preferences');
    });

    test('should accept custom options', () => {
      consentio = new Consentio({
        autoShow: false,
        position: 'top',
        theme: 'dark',
        cookieName: 'custom-consent'
      });
      expect(consentio.options.position).toBe('top');
      expect(consentio.options.theme).toBe('dark');
      expect(consentio.options.cookieName).toBe('custom-consent');
    });
  });

  describe('Consent Management', () => {
    test('should initially have no consent', () => {
      consentio = new Consentio({ autoShow: false });
      expect(consentio.hasConsent()).toBe(false);
      expect(consentio.getConsent()).toBe(null);
    });

    test('should save and load consent', () => {
      consentio = new Consentio({ autoShow: false });
      const testConsent = { necessary: true, analytics: true, marketing: false };
      
      consentio.saveConsent(testConsent);
      expect(consentio.hasConsent()).toBe(true);
      expect(consentio.getConsent()).toEqual(testConsent);
    });

    test('should check individual consent categories', () => {
      consentio = new Consentio({ autoShow: false });
      const testConsent = { necessary: true, analytics: true, marketing: false };
      
      consentio.saveConsent(testConsent);
      expect(consentio.isConsentGiven('necessary')).toBe(true);
      expect(consentio.isConsentGiven('analytics')).toBe(true);
      expect(consentio.isConsentGiven('marketing')).toBe(false);
    });

    test('should reset consent', () => {
      consentio = new Consentio({ autoShow: false });
      const testConsent = { necessary: true, analytics: true, marketing: false };
      
      consentio.saveConsent(testConsent);
      expect(consentio.hasConsent()).toBe(true);
      
      consentio.resetConsent();
      expect(consentio.hasConsent()).toBe(false);
    });
  });

  describe('Modal Creation', () => {
    test('should create modal elements', () => {
      consentio = new Consentio({ autoShow: false });
      consentio.init();
      
      const modal = document.querySelector('.consentio-modal');
      const backdrop = document.querySelector('.consentio-backdrop');
      
      expect(modal).toBeTruthy();
      expect(backdrop).toBeTruthy();
    });

    test('should inject CSS styles', () => {
      consentio = new Consentio({ autoShow: false });
      consentio.init();
      
      const styles = document.getElementById('consentio-styles');
      expect(styles).toBeTruthy();
      expect(styles.tagName).toBe('STYLE');
    });

    test('should apply correct theme class', () => {
      consentio = new Consentio({ autoShow: false, theme: 'dark' });
      consentio.init();
      
      const modal = document.querySelector('.consentio-modal');
      expect(modal.classList.contains('consentio-dark')).toBe(true);
    });

    test('should apply correct position class', () => {
      consentio = new Consentio({ autoShow: false, position: 'center' });
      consentio.init();
      
      const modal = document.querySelector('.consentio-modal');
      expect(modal.classList.contains('consentio-center')).toBe(true);
    });
  });

  describe('Consent Actions', () => {
    test('should accept all cookies', () => {
      let acceptedConsent = null;
      consentio = new Consentio({
        autoShow: false,
        onAccept: (consent) => { acceptedConsent = consent; }
      });
      
      consentio.acceptAll();
      
      expect(acceptedConsent).toEqual({
        necessary: true,
        analytics: true,
        marketing: true
      });
      expect(consentio.hasConsent()).toBe(true);
    });

    test('should reject optional cookies', () => {
      let rejectedConsent = null;
      consentio = new Consentio({
        autoShow: false,
        onReject: (consent) => { rejectedConsent = consent; }
      });
      
      consentio.rejectAll();
      
      expect(rejectedConsent).toEqual({
        necessary: true,
        analytics: false,
        marketing: false
      });
      expect(consentio.hasConsent()).toBe(true);
    });
  });

  describe('DataLayer Integration', () => {
    test('should push to dataLayer when consent is saved', () => {
      window.dataLayer = [];
      consentio = new Consentio({ autoShow: false });
      
      const testConsent = { necessary: true, analytics: true, marketing: false };
      consentio.saveConsent(testConsent);
      
      expect(window.dataLayer).toContainEqual({
        event: 'consentio_consent_updated',
        consent_state: testConsent
      });
    });

    test('should handle missing dataLayer gracefully', () => {
      delete window.dataLayer;
      consentio = new Consentio({ autoShow: false });
      
      const testConsent = { necessary: true, analytics: true, marketing: false };
      expect(() => {
        consentio.saveConsent(testConsent);
      }).not.toThrow();
    });
  });

  describe('Custom Categories', () => {
    test('should handle custom categories', () => {
      consentio = new Consentio({
        autoShow: false,
        categories: {
          necessary: { required: true, enabled: true },
          analytics: { required: false, enabled: false },
          marketing: { required: false, enabled: false },
          social: { required: false, enabled: false }
        }
      });
      
      consentio.acceptAll();
      const consent = consentio.getConsent();
      
      expect(consent).toEqual({
        necessary: true,
        analytics: true,
        marketing: true,
        social: true
      });
    });
  });

  describe('Custom Texts', () => {
    test('should use custom text labels', () => {
      consentio = new Consentio({
        autoShow: false,
        texts: {
          title: 'Custom Title',
          message: 'Custom message',
          acceptAll: 'Custom Accept'
        }
      });
      
      consentio.init();
      
      const modal = document.querySelector('.consentio-modal');
      expect(modal.innerHTML).toContain('Custom Title');
      expect(modal.innerHTML).toContain('Custom message');
      expect(modal.innerHTML).toContain('Custom Accept');
    });
  });
});