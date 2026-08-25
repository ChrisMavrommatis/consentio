___INFO___

{
  "type": "MACRO",
  "id": "cvt_temp_public_id",
  "version": 1,
  "securityGroups": [],
  "displayName": "Consentio Tag - Cookies",
  "categories": [
    "UTILITY",
    "TAG_MANAGEMENT"
  ],
  "description": "The cookie table the Consentio banner shows in its settings. Select it in the Consentio Tag's Cookies Variable field.",
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
          "lineCount": 2,
          "help": "The cookie's name as it appears in the browser.",
          "valueHint": "_ga"
        },
        "isUnique": true
      },
      {
        "param": {
          "type": "TEXT",
          "name": "purpose",
          "displayName": "Purpose",
          "simpleValueType": true,
          "lineCount": 3,
          "help": "What it is for, in words a visitor can read. This is the column they actually stop on.",
          "valueHint": "Tells Google Analytics one visitor's page views apart from another's"
        },
        "isUnique": false
      },
      {
        "param": {
          "type": "TEXT",
          "name": "provenance",
          "displayName": "Provenance",
          "simpleValueType": true,
          "lineCount": 2,
          "help": "Who sets it - your site, or the name of the third party that does.",
          "valueHint": "Google"
        },
        "isUnique": false
      },
      {
        "param": {
          "type": "TEXT",
          "name": "duration",
          "displayName": "Duration",
          "simpleValueType": true,
          "lineCount": 2,
          "help": "How long it lasts. \"Session\" if it goes when the browser closes.",
          "valueHint": "2 years"
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
          "simpleValueType": true,
          "help": "Which of the four consent categories it belongs to. Getting this wrong is what makes the table misleading rather than useful."
        },
        "isUnique": false
      }
    ],
    "help": "One row per cookie your site sets, including Consentio's own: name consentio, purpose \"Stores the answer you give to this banner\", provenance this site, duration 90 days, category Strictly Necessary."
  }
]


___SANDBOXED_JS_FOR_WEB_TEMPLATE___

const log = require('logToConsole');
log('Consentio Tag: Cookies =', data);

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

scenarios:
- name: the table is returned as entered
  code: |-
    const rows = [
      {
        name: 'consentio',
        purpose: 'Stores the answer to this banner',
        provenance: 'First party',
        duration: '90 days',
        category: 'strictly_necessary'
      }
    ];

    const variableResult = runCode({ cookies: rows });

    assertThat(variableResult).isEqualTo(rows);
- name: an empty table returns an empty list
  code: |-
    const variableResult = runCode({ cookies: [] });

    assertThat(variableResult).isEqualTo([]);


___NOTES___

Created on 8/24/2026, 4:19:15 PM

