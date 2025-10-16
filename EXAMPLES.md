# Examples

This directory contains examples of how to use Consentio in different scenarios.

## Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/consentio/dist/consentio.min.js"></script>
</head>
<body>
    <h1>My Website</h1>
    
    <script>
        const consentio = new Consentio();
    </script>
</body>
</html>
```

## Custom Configuration

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/consentio/dist/consentio.min.js"></script>
</head>
<body>
    <h1>My Website</h1>
    
    <script>
        const consentio = new Consentio({
            position: 'center',
            theme: 'dark',
            texts: {
                title: 'We Value Your Privacy',
                message: 'This website uses cookies to ensure you get the best experience on our website.',
                acceptAll: 'I Accept',
                rejectAll: 'No Thanks'
            },
            onAccept: (consent) => {
                console.log('User accepted:', consent);
                // Enable analytics if consented
                if (consent.analytics) {
                    // Initialize Google Analytics
                    gtag('config', 'GA_MEASUREMENT_ID');
                }
            },
            onReject: (consent) => {
                console.log('User rejected optional cookies:', consent);
            }
        });
    </script>
</body>
</html>
```

## Google Tag Manager Integration

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Load Consentio before GTM -->
    <script src="https://cdn.jsdelivr.net/npm/consentio/dist/consentio.min.js"></script>
    
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-XXXXXX');</script>
</head>
<body>
    <!-- GTM noscript -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    
    <h1>My Website</h1>
    
    <script>
        const consentio = new Consentio({
            onAccept: (consent) => {
                // Consent data is automatically pushed to dataLayer
                console.log('Consent accepted:', consent);
            }
        });
    </script>
</body>
</html>
```

## React Integration

```jsx
import React, { useEffect, useState } from 'react';

// Import the ES module build
import Consentio from 'consentio/dist/consentio.esm.js';

function App() {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    const consentio = new Consentio({
      onAccept: (consent) => {
        setConsentGiven(true);
        console.log('Consent accepted:', consent);
      },
      onReject: (consent) => {
        setConsentGiven(true);
        console.log('Consent rejected:', consent);
      }
    });

    // Check if consent already exists
    if (consentio.hasConsent()) {
      setConsentGiven(true);
    }
  }, []);

  return (
    <div className="App">
      <h1>My React App</h1>
      {consentGiven && <p>Consent status recorded!</p>}
    </div>
  );
}

export default App;
```

## Vue.js Integration

```vue
<template>
  <div id="app">
    <h1>My Vue App</h1>
    <p v-if="consentGiven">Consent status recorded!</p>
  </div>
</template>

<script>
import Consentio from 'consentio/dist/consentio.esm.js';

export default {
  name: 'App',
  data() {
    return {
      consentGiven: false
    };
  },
  mounted() {
    const consentio = new Consentio({
      onAccept: (consent) => {
        this.consentGiven = true;
        console.log('Consent accepted:', consent);
      },
      onReject: (consent) => {
        this.consentGiven = true;
        console.log('Consent rejected:', consent);
      }
    });

    // Check if consent already exists
    if (consentio.hasConsent()) {
      this.consentGiven = true;
    }
  }
};
</script>
```

## Manual Control

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/consentio/dist/consentio.min.js"></script>
</head>
<body>
    <h1>My Website</h1>
    
    <button onclick="showConsentModal()">Manage Cookie Preferences</button>
    <button onclick="resetConsent()">Reset Consent (for testing)</button>
    
    <script>
        // Initialize with autoShow disabled
        const consentio = new Consentio({
            autoShow: false,
            onAccept: (consent) => {
                console.log('Consent accepted:', consent);
            }
        });

        function showConsentModal() {
            consentio.show();
        }

        function resetConsent() {
            consentio.resetConsent();
            consentio.show();
        }

        // Show modal only if no consent exists
        if (!consentio.hasConsent()) {
            consentio.show();
        }
    </script>
</body>
</html>
```