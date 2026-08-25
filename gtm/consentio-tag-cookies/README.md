# Consentio Tag - Cookies

A Google Tag Manager variable holding the cookie table the
[Consentio](https://github.com/ChrisMavrommatis/consentio) banner shows in its settings panel.

Create one, add a row per cookie your site sets, and select it in the **Consentio Tag**'s *Cookies Variable*
field. Leave it at *None* and the banner shows no table.

Full documentation: <https://chrismavrommatis.github.io/consentio/configuration/>

## ⚙️ A row {#a-row}

| Column | What goes in it |
|---|---|
| Name | the cookie's name, as it appears in the browser |
| Purpose | what it is for, in words a visitor can read |
| Provenance | who sets it - your site, or which third party |
| Duration | how long it lasts |
| Category | which of the four consent categories it belongs to |

## 📋 The four categories {#the-four-categories}

`strictly_necessary`, `preferences_functionality`, `statistics_performance` and `marketing_advertising`.
They are fixed, so every row belongs to one of them.

## 📄 Licence {#licence}

Apache 2.0. See [LICENSE](LICENSE).
