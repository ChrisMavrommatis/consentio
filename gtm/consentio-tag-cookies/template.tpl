﻿___INFO___

{
  "type": "MACRO",
  "id": "cvt_temp_public_id",
  "version": 1,
  "securityGroups": [],
  "displayName": "Consentio Tag - Cookies",
  "description": "Variable for inputting the cookies for Consentio Tag",
  "containerContexts": [
    "WEB"
  ]
}


___TEMPLATE_PARAMETERS___

[
  {
    "type": "PARAM_TABLE",
    "name": "cookies",
    "displayName": "",
    "paramTableColumns": [
      {
        "param": {
          "type": "TEXT",
          "name": "name",
          "displayName": "Name",
          "simpleValueType": true,
          "lineCount": 2
        },
        "isUnique": true
      },
      {
        "param": {
          "type": "TEXT",
          "name": "purpose",
          "displayName": "Purpose",
          "simpleValueType": true,
          "lineCount": 3
        },
        "isUnique": false
      },
      {
        "param": {
          "type": "TEXT",
          "name": "provenance",
          "displayName": "Provenance",
          "simpleValueType": true,
          "lineCount": 2
        },
        "isUnique": false
      },
      {
        "param": {
          "type": "TEXT",
          "name": "duration",
          "displayName": "Duration",
          "simpleValueType": true,
          "lineCount": 2
        },
        "isUnique": false
      },
      {
        "param": {
          "type": "SELECT",
          "name": "category",
          "displayName": "Category",
          "macrosInSelect": false,
          "selectItems": [
            {
              "value": "strictly_necessary",
              "displayValue": "Strictly Necessary"
            },
            {
              "value": "preferences_functionality",
              "displayValue": "Preferences - Functionality"
            },
            {
              "value": "statistics_performance",
              "displayValue": "Statistics - Performance"
            },
            {
              "value": "marketing_advertising",
              "displayValue": "Marketing - Advertising"
            }
          ],
          "simpleValueType": true
        },
        "isUnique": false
      }
    ]
  }
]


___SANDBOXED_JS_FOR_WEB_TEMPLATE___

// Enter your template code here.
const log = require('logToConsole');
log('Contentio Tag: Cookies =', data);

// Variables must return a value.
return data.cookies;


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

Created on 8/24/2026, 4:19:15 PM

