# Google Tag Manager Integration Guide

This guide explains how to integrate Consentio with Google Tag Manager (GTM) for advanced consent management.

## Overview

Consentio automatically pushes consent events to the GTM `dataLayer`, making it easy to conditionally fire tags based on user consent preferences.

## Setup Steps

### 1. Install Consentio

Add Consentio to your website before the GTM container:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Consentio - Load before GTM -->
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
    
    <!-- Initialize Consentio -->
    <script>
        const consentio = new Consentio({
            onAccept: (consent) => {
                console.log('Consent accepted:', consent);
            },
            onReject: (consent) => {
                console.log('Consent rejected:', consent);
            }
        });
    </script>
</body>
</html>
```

### 2. Configure GTM Variables

Create these **Data Layer Variables** in GTM:

#### Consent State Variable
- **Variable Name**: `Consent State`
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `consent_state`

#### Individual Category Variables
- **Variable Name**: `Consent - Analytics`
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `consent_state.analytics`

- **Variable Name**: `Consent - Marketing`
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `consent_state.marketing`

### 3. Create GTM Triggers

#### Consent Updated Trigger
- **Trigger Name**: `Consentio - Consent Updated`
- **Trigger Type**: Custom Event
- **Event Name**: `consentio_consent_updated`

#### Analytics Consent Trigger
- **Trigger Name**: `Consentio - Analytics Enabled`
- **Trigger Type**: Custom Event
- **Event Name**: `consentio_consent_updated`
- **Fire On**: Some Custom Events
- **Condition**: `Consent - Analytics` equals `true`

#### Marketing Consent Trigger
- **Trigger Name**: `Consentio - Marketing Enabled`
- **Trigger Type**: Custom Event
- **Event Name**: `consentio_consent_updated`
- **Fire On**: Some Custom Events
- **Condition**: `Consent - Marketing` equals `true`

### 4. Configure Tags

#### Google Analytics 4 Tag
- **Trigger**: `Consentio - Analytics Enabled`
- **Additional Settings**: Configure as needed

#### Facebook Pixel Tag
- **Trigger**: `Consentio - Marketing Enabled`
- **Additional Settings**: Configure as needed

#### Google Ads Conversion Tracking
- **Trigger**: `Consentio - Marketing Enabled`
- **Additional Settings**: Configure as needed

## Advanced Configuration

### Custom Categories

If you have custom cookie categories, configure them in Consentio:

```javascript
const consentio = new Consentio({
    categories: {
        necessary: { required: true, enabled: true },
        analytics: { required: false, enabled: false },
        marketing: { required: false, enabled: false },
        social: { required: false, enabled: false },
        personalization: { required: false, enabled: false }
    }
});
```

Then create corresponding GTM variables:
- `consent_state.social`
- `consent_state.personalization`

### Consent Mode Integration

For Google Analytics 4 Consent Mode integration:

```javascript
const consentio = new Consentio({
    onAccept: (consent) => {
        gtag('consent', 'update', {
            analytics_storage: consent.analytics ? 'granted' : 'denied',
            ad_storage: consent.marketing ? 'granted' : 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted'
        });
    },
    onReject: (consent) => {
        gtag('consent', 'update', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted'
        });
    }
});
```

### Debugging

Enable GTM Preview mode and check the dataLayer for these events:

```javascript
// Expected dataLayer push
{
    event: 'consentio_consent_updated',
    consent_state: {
        necessary: true,
        analytics: true,
        marketing: false
    }
}
```

## Best Practices

1. **Load Order**: Always load Consentio before GTM
2. **Default Consent**: Set conservative defaults (deny optional cookies)
3. **Testing**: Use GTM Preview mode to verify consent triggers
4. **Fallbacks**: Handle cases where Consentio fails to load
5. **Performance**: Use triggers to avoid unnecessary tag firing

## Example Implementation

Complete example with GTM and Google Analytics:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/consentio/dist/consentio.min.js"></script>
    
    <!-- Google tag (gtag.js) with consent mode -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        
        // Set default consent state
        gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted'
        });
        
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID');
    </script>
    
    <!-- GTM -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-XXXXXX');</script>
</head>
<body>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    
    <script>
        const consentio = new Consentio({
            position: 'bottom',
            theme: 'light',
            onAccept: (consent) => {
                // Update consent mode
                gtag('consent', 'update', {
                    analytics_storage: consent.analytics ? 'granted' : 'denied',
                    ad_storage: consent.marketing ? 'granted' : 'denied'
                });
            },
            onReject: (consent) => {
                gtag('consent', 'update', {
                    analytics_storage: 'denied',
                    ad_storage: 'denied'
                });
            },
            onSave: (consent) => {
                gtag('consent', 'update', {
                    analytics_storage: consent.analytics ? 'granted' : 'denied',
                    ad_storage: consent.marketing ? 'granted' : 'denied'
                });
            }
        });
    </script>
</body>
</html>
```

This setup ensures that:
- Consent is collected before any tracking occurs
- GTM triggers fire only when appropriate consent is given
- Google Analytics respects user consent preferences
- The implementation is GDPR and privacy law compliant