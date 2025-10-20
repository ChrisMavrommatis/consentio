# Consentio 🍪

Consentio is a minimalist, lightweight consent modal designed to simplify privacy compliance. Built with vanilla JavaScript, it provides a beautiful, accessible, and customizable cookie consent solution without any dependencies.

## ✨ Features

- 🎨 **Beautiful Design** - Modern, responsive UI with smooth animations
- ⚡ **Lightweight** - Less than 15KB total size, no dependencies
- 🛠️ **Highly Customizable** - Flexible configuration and styling options
- ♿ **Accessible** - WCAG compliant with keyboard navigation support
- 📱 **Mobile First** - Optimized for all devices and screen sizes
- 🌙 **Dark Mode** - Automatic dark mode detection and support
- 🔧 **Easy Integration** - Simple API with callback functions
- 📦 **Frontend Only** - No backend or server setup required

## 🚀 Quick Start

1. **Include the files in your HTML:**

```html
<link rel="stylesheet" href="src/consentio.css">
<script src="src/consentio.js"></script>
```

2. **Initialize Consentio:**

```javascript
const consentio = new Consentio({
    title: 'Cookie Consent',
    message: 'We use cookies to enhance your experience.',
    onAccept: (consent) => {
        console.log('User accepted cookies:', consent);
        // Enable your tracking scripts here
    }
});

consentio.init();
```

3. **Check consent status:**

```javascript
if (consentio.hasCategory('analytics')) {
    // Load analytics scripts
    enableGoogleAnalytics();
}
```

## 📖 Configuration Options

```javascript
const consentio = new Consentio({
    // Basic settings
    cookieName: 'consentio',           // Cookie name for storage
    expiryDays: 365,                   // Cookie expiry in days
    title: 'Cookie Consent',           // Modal title
    message: 'We use cookies...',      // Main message
    acceptText: 'Accept All',          // Accept button text
    rejectText: 'Reject All',          // Reject button text
    customizeText: 'Customize',        // Customize button text
    privacyPolicyUrl: '/privacy',      // Privacy policy link
    showCustomize: true,               // Show customize option
    
    // Cookie categories
    categories: {
        necessary: {
            name: 'Essential Cookies',
            description: 'Required for basic functionality',
            required: true,
            enabled: true
        },
        analytics: {
            name: 'Analytics',
            description: 'Help us understand site usage',
            required: false,
            enabled: false
        },
        marketing: {
            name: 'Marketing',
            description: 'Used for advertising purposes',
            required: false,
            enabled: false
        }
    },
    
    // Callback functions
    onAccept: (consent) => { /* Handle accept */ },
    onReject: (consent) => { /* Handle reject */ },
    onCustomize: (consent) => { /* Handle custom */ }
});
```

## 🔧 API Methods

### Initialization
```javascript
consentio.init()              // Initialize the consent modal
```

### Consent Management
```javascript
consentio.showModal()         // Show the consent modal
consentio.hideModal()         // Hide the consent modal
consentio.reset()             // Clear stored consent and show modal
consentio.getConsent()        // Get current consent object
consentio.hasConsent()        // Check if any consent is stored
consentio.hasCategory('analytics') // Check specific category consent
```

## 🎯 Integration Examples

### Google Analytics 4
```javascript
const consentio = new Consentio({
    onAccept: (consent) => {
        if (consent.analytics) {
            gtag('consent', 'update', {
                analytics_storage: 'granted'
            });
        }
    }
});
```

### Google Tag Manager
```javascript
const consentio = new Consentio({
    onAccept: (consent) => {
        dataLayer.push({
            event: 'consent_updated',
            consent_analytics: consent.analytics,
            consent_marketing: consent.marketing
        });
    }
});
```

### Facebook Pixel
```javascript
const consentio = new Consentio({
    onAccept: (consent) => {
        if (consent.marketing) {
            fbq('consent', 'grant');
        } else {
            fbq('consent', 'revoke');
        }
    }
});
```

## 🎨 Customization

### Custom Styling
You can override the CSS variables to match your brand:

```css
:root {
    --consentio-primary-color: #your-brand-color;
    --consentio-border-radius: 12px;
    --consentio-font-family: 'Your Font', sans-serif;
}
```

### Custom Categories
```javascript
const consentio = new Consentio({
    categories: {
        necessary: {
            name: 'Essential',
            description: 'Required for the site to work',
            required: true,
            enabled: true
        },
        functional: {
            name: 'Functional',
            description: 'Enhance your experience',
            required: false,
            enabled: false
        },
        performance: {
            name: 'Performance',
            description: 'Help us improve the site',
            required: false,
            enabled: false
        }
    }
});
```

## 🌐 Demo

Run the demo locally:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser to see the interactive demo.

## 📱 Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## 📄 License

Apache-2.0 License. See [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

- 📧 Issues: [GitHub Issues](https://github.com/ChrisMavrommatis/consentio/issues)
- 📖 Docs: [README.md](README.md)
- 💬 Discussions: [GitHub Discussions](https://github.com/ChrisMavrommatis/consentio/discussions)

---

Made with ❤️ by [ChrisMavrommatis](https://github.com/ChrisMavrommatis)

