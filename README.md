# 🍪 Consentio

> A minimalist, lightweight consent modal designed to simplify privacy compliance

[![npm version](https://badge.fury.io/js/consentio.svg)](https://badge.fury.io/js/consentio)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Gzipped Size](https://img.shields.io/badge/gzipped-<5KB-brightgreen.svg)](https://github.com/ChrisMavrommatis/consentio)

Consentio is a minimalist, open source consent modal designed to simplify privacy compliance. It operates entirely on the frontend with no backend dependencies, making it lightweight and easy to deploy. Integrate Consentio effortlessly with popular tag managers such as Google Tag Manager to manage user consent transparently and efficiently.

## ✨ Features

- 🎯 **Minimalist Design** - Clean, unobtrusive interface that respects your site's design
- 🚀 **Zero Dependencies** - Pure JavaScript implementation with no external libraries
- 🏷️ **Tag Manager Ready** - Seamless integration with Google Tag Manager and other systems
- ⚡ **Lightweight** - Minimal footprint with gzipped size under 5KB
- 🎨 **Customizable** - Multiple themes, positions, and configuration options
- 🔧 **Developer Friendly** - Simple API with comprehensive callback support
- 📱 **Responsive** - Works perfectly on desktop and mobile devices
- 🌐 **Browser Compatible** - Supports all modern browsers

## 🚀 Quick Start

### Installation

#### CDN (Recommended)
```html
<script src="https://cdn.jsdelivr.net/npm/consentio/dist/consentio.min.js"></script>
```

#### NPM
```bash
npm install consentio
```

### Basic Usage

```javascript
// Initialize with default settings
const consentio = new Consentio();

// Or with custom configuration
const consentio = new Consentio({
  position: 'bottom',
  theme: 'light',
  onAccept: (consent) => {
    console.log('Consent accepted:', consent);
    // Enable tracking scripts based on consent
  },
  onReject: (consent) => {
    console.log('Consent rejected:', consent);
    // Handle rejection
  }
});
```

## 🎮 Live Demo

Visit the [interactive demo](https://chrismavrom.github.io/consentio) to see Consentio in action.

## 📖 Configuration

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `string` | `'bottom'` | Modal position: `'bottom'`, `'top'`, or `'center'` |
| `theme` | `string` | `'light'` | Theme: `'light'` or `'dark'` |
| `showRejectButton` | `boolean` | `true` | Show reject all button |
| `showSettingsButton` | `boolean` | `true` | Show settings button |
| `autoShow` | `boolean` | `true` | Automatically show modal if no consent exists |
| `cookieName` | `string` | `'consentio-preferences'` | Cookie name for storing preferences |
| `cookieExpiry` | `number` | `365` | Cookie expiry in days |
| `categories` | `object` | See below | Cookie categories configuration |
| `texts` | `object` | See below | Customizable text labels |
| `onAccept` | `function` | `() => {}` | Callback when user accepts all |
| `onReject` | `function` | `() => {}` | Callback when user rejects optional cookies |
| `onSave` | `function` | `() => {}` | Callback when user saves custom preferences |
| `onShow` | `function` | `() => {}` | Callback when modal is shown |
| `onHide` | `function` | `() => {}` | Callback when modal is hidden |

### Default Categories

```javascript
{
  necessary: { required: true, enabled: true },
  analytics: { required: false, enabled: false },
  marketing: { required: false, enabled: false }
}
```

### Default Texts

```javascript
{
  title: 'Cookie Consent',
  message: 'We use cookies to enhance your browsing experience and analyze site traffic.',
  acceptAll: 'Accept All',
  rejectAll: 'Reject All',
  settings: 'Settings',
  save: 'Save Preferences',
  close: 'Close'
}
```

## 🏷️ Google Tag Manager Integration

Consentio automatically integrates with Google Tag Manager by pushing events to the `dataLayer`:

```javascript
// Consentio automatically triggers this event
{
  event: 'consentio_consent_updated',
  consent_state: {
    necessary: true,
    analytics: true,
    marketing: false
  }
}
```

### GTM Setup

1. Create a Custom Event trigger for `consentio_consent_updated`
2. Use the `consent_state` object to conditionally fire your tags
3. Example trigger condition: `consent_state.analytics == true`

## 🔧 API Reference

### Methods

- `consentio.show()` - Show the consent modal
- `consentio.hide()` - Hide the consent modal
- `consentio.hasConsent()` - Check if consent has been given
- `consentio.getConsent()` - Get current consent object
- `consentio.isConsentGiven(category)` - Check if specific category is consented
- `consentio.resetConsent()` - Reset consent (for testing)

### Example Usage

```javascript
const consentio = new Consentio({
  position: 'center',
  theme: 'dark',
  categories: {
    necessary: { required: true, enabled: true },
    analytics: { required: false, enabled: false },
    marketing: { required: false, enabled: false },
    social: { required: false, enabled: false }
  },
  texts: {
    title: 'We Value Your Privacy',
    message: 'This website uses cookies to ensure you get the best experience.'
  },
  onAccept: (consent) => {
    // Enable Google Analytics
    if (consent.analytics) {
      gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
    
    // Enable Marketing pixels
    if (consent.marketing) {
      // Initialize Facebook Pixel, etc.
    }
  }
});

// Check consent status
if (consentio.isConsentGiven('analytics')) {
  // Analytics is enabled
}
```

## 🎨 Styling

Consentio includes built-in responsive styles, but you can customize the appearance:

```css
/* Override default styles */
.consentio-modal {
  font-family: 'Your Custom Font';
}

.consentio-btn-accept {
  background: #your-brand-color;
}
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11+ (with polyfills)

## 📄 License

Licensed under the [Apache License 2.0](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📞 Support

- [Documentation](https://github.com/ChrisMavrommatis/consentio)
- [Issues](https://github.com/ChrisMavrommatis/consentio/issues)
- [Discussions](https://github.com/ChrisMavrommatis/consentio/discussions)

---

Built with ❤️ by [ChrisMavrommatis](https://github.com/ChrisMavrommatis)
