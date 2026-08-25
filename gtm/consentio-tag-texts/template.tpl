﻿___INFO___

{
  "type": "MACRO",
  "id": "cvt_temp_public_id",
  "version": 1,
  "securityGroups": [],
  "displayName": "Consentio Tag - Texts",
  "description": "Variable for setting up the texts within the Contentio Tag",
  "containerContexts": [
    "WEB"
  ]
}


___TEMPLATE_PARAMETERS___

[
  {
    "type": "GROUP",
    "name": "bar",
    "displayName": "Bar",
    "groupStyle": "ZIPPY_OPEN_ON_PARAM",
    "subParams": [
      {
        "type": "TEXT",
        "name": "barTitle",
        "displayName": "Bar Title",
        "simpleValueType": true,
        "valueHint": "Cookie Policy",
        "canBeEmptyString": true,
        "lineCount": 1
      },
      {
        "type": "TEXT",
        "name": "barDescription",
        "displayName": "Bar Description",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "This site uses cookies to enhance your experience. We are assuming that you are okay with that, but you can change that by clicking at the settings button.",
        "lineCount": 3
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "modal",
    "displayName": "Modal",
    "groupStyle": "ZIPPY_OPEN_ON_PARAM",
    "subParams": [
      {
        "type": "TEXT",
        "name": "modalTitle",
        "displayName": "Modal Title",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "Cookie Settings",
        "lineCount": 1
      },
      {
        "type": "TEXT",
        "name": "modalDescription",
        "displayName": "Modal Description",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "Here you can change your cookie preferences. Clicking on save will save the current settings, while clicking on cancel makes no change. According to the European general data protection regulation (GDPR) and the ePrivacy directive, websites must receive the user’s consent before using any cookie besides the strictly necessary ones. You can expand each section to learn a bit more for each category. If you are interested to learn more, then follow the link.",
        "lineCount": 4
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "buttons",
    "displayName": "Buttons",
    "groupStyle": "ZIPPY_OPEN_ON_PARAM",
    "subParams": [
      {
        "type": "TEXT",
        "name": "buttonSettings",
        "displayName": "Settings Button",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "Settings",
        "lineCount": 1
      },
      {
        "type": "TEXT",
        "name": "buttonSave",
        "displayName": "Save Button",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "Save",
        "lineCount": 1
      },
      {
        "type": "TEXT",
        "name": "buttonCancel",
        "displayName": "Cancel Button",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "Cancel",
        "lineCount": 1
      },
      {
        "type": "TEXT",
        "name": "buttonAcceptAll",
        "displayName": "Accept All Button",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "Accept All",
        "lineCount": 1
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "cookiesTable",
    "displayName": "Cookies Table",
    "groupStyle": "ZIPPY_OPEN_ON_PARAM",
    "subParams": [
      {
        "type": "TEXT",
        "name": "alwaysOnLabel",
        "displayName": "Always On Label",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "lineCount": 1,
        "valueHint": "Always On"
      },
      {
        "type": "TEXT",
        "name": "cookieTableHeaderName",
        "displayName": "Cookies Table Header Name",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "lineCount": 1,
        "valueHint": "Cookie Name"
      },
      {
        "type": "TEXT",
        "name": "cookieTableHeaderPurpose",
        "displayName": "Cookies Table Header Purpose",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "lineCount": 1,
        "valueHint": "Cookie Purpose"
      },
      {
        "type": "TEXT",
        "name": "cookieTableHeaderProvenance",
        "displayName": "Cookies Table Header Provenance",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "lineCount": 1,
        "valueHint": "Provenance"
      },
      {
        "type": "TEXT",
        "name": "cookieTableHeaderDuration",
        "displayName": "Cookies Table Header Duration",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "lineCount": 1,
        "valueHint": "Duration"
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "consents",
    "displayName": "Consents",
    "groupStyle": "ZIPPY_CLOSED",
    "subParams": [
      {
        "type": "TEXT",
        "name": "strictlyNecessaryTitle",
        "displayName": "Strictly Necessary Title",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "Strictly Necessary Cookies",
        "lineCount": 1
      },
      {
        "type": "TEXT",
        "name": "strictlyNecessaryDescription",
        "displayName": "Strictly Necessary Description",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "These cookies are essential for you to browse the website and use its features, such as accessing secure areas of the site.  \t\t\t\tCookies that allow web shops to hold your items in your cart while you are shopping online are an example of strictly necessary cookies.",
        "lineCount": 3
      },
      {
        "type": "TEXT",
        "name": "preferencesFunctionalityTitle",
        "displayName": "Preferences Functionality Title",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "Preferences Cookies",
        "lineCount": 1
      },
      {
        "type": "TEXT",
        "name": "preferencesFunctionalityDescription",
        "displayName": "Preferences Functionality Description",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "Preference cookies enable a website to remember information that changes the way the website behaves or looks, such as your preferred language or the region that you are in.",
        "lineCount": 3
      },
      {
        "type": "TEXT",
        "name": "statisticsPerformanceTitle",
        "displayName": "Statistics Performance Title",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "Statistics Cookies",
        "lineCount": 1
      },
      {
        "type": "TEXT",
        "name": "statisticsPerformanceDescription",
        "displayName": "Statistics Performance Description",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "Statistic cookies help website owners to understand how visitors interact with websites by collecting and reporting information anonymously.",
        "lineCount": 3
      },
      {
        "type": "TEXT",
        "name": "marketingAdvertisingTitle",
        "displayName": "Marketing Advertising Title",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "Marketing Cookies",
        "lineCount": 1
      },
      {
        "type": "TEXT",
        "name": "marketingAdvertisingDescription",
        "displayName": "Marketing Advertising Description",
        "simpleValueType": true,
        "canBeEmptyString": true,
        "valueHint": "Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third party advertisers.",
        "lineCount": 3
      }
    ]
  }
]


___SANDBOXED_JS_FOR_WEB_TEMPLATE___

// Enter your template code here.
const log = require('logToConsole');
const Object = require('Object');

log('Consentio Tag: Texts =', data);


function removeNullsOrEmtpyStrings(obj){
  for(const key in obj){
    const value = obj[key];
    if(value === null || value === undefined || value === ""){
      Object.delete(obj, key);
    }
  }
}


var returnObject = {
  barTitle: data.barTitle,
  barDescription: data.barDescription,
  buttonSettings: data.buttonSettings,
  buttonSave: data.buttonSave,
  buttonCancel: data.buttonCancel,
  buttonAcceptAll: data.buttonAcceptAll,
  modalTitle: data.modalTitle,
  modalDescription: data.modalDescription,
  alwaysOnLabel: data.alwaysOnLabel,
  cookieTableHeaderName: data.cookieTableHeaderName,
  cookieTableHeaderPurpose: data.cookieTableHeaderPurpose,
  cookieTableHeaderProvenance: data.cookieTableHeaderProvenance,
  cookieTableHeaderDuration: data.cookieTableHeaderDuration,
  strictly_necessary: {
    title: data.strictlyNecessaryTitle,
    description: data.strictlyNecessarydescription
  },
  preferences_functionality: {
    title: data.preferencesFunctionalityTitle,
    description: data.preferencesFunctionalityDescription
  },
  statistics_performance: {
    title: data.statisticsPerformanceTitle,
    description: data.statisticsPerformanceDescription
  },
  marketing_advertising: {
    title: data.marketingAdvertisingTitle,
    description: data.marketingAdvertisingDescription
  }
};


removeNullsOrEmtpyStrings(returnObject);
removeNullsOrEmtpyStrings(returnObject.strictly_necessary);
removeNullsOrEmtpyStrings(returnObject.preferences_functionality);
removeNullsOrEmtpyStrings(returnObject.statistics_performance);
removeNullsOrEmtpyStrings(returnObject.marketing_advertising);

// Variables must return a value.
return returnObject;


___WEB_PERMISSIONS___

[
  {
    "instance": {
      "key": {
        "publicId": "logging",
        "versionId": "1"
      },
      "param": [
        {
          "key": "environments",
          "value": {
            "type": 1,
            "string": "debug"
          }
        }
      ]
    },
    "isRequired": true
  }
]


___TESTS___

scenarios: []


___NOTES___

Created on 8/24/2026, 4:19:20 PM

