---
title: The cookie
anchor: the-cookie-contract
permalink: /cookie/
description: The one cookie Consentio sets - what is in it, how long it lasts, and what to say about it in your own cookie policy.
---

Consentio sets **one cookie**, and only after a visitor answers. Nothing is stored before that.

<div class="callout" markdown="1">
**For your cookie policy.** It is a first-party cookie called `consentio`, it stores the visitor's own choice
and nothing else — no identifier, no tracking value — it lasts 90 days, and it is strictly necessary. You set
it, so list it.
</div>

## 🍪 What is in it {#what-is-in-it}

| | |
|---|---|
| **Name** | `consentio`, unless you changed it |
| **What it holds** | the visitor's answer for each of the four categories, plus a version number |
| **How long** | 90 days, counted from the last time they answered |
| **Scope** | this hostname only. `example.com` and `shop.example.com` ask separately |
| **Size** | about 220 bytes |
| **Sent to** | your own server, on every request, like any other cookie |

The value is a small piece of JSON, encoded the way anything in a cookie has to be — so what you see in the
browser's cookie inspector has `%22` where a `"` should be. Decoded, it is:

```json
{"version":1,"consents":{"strictly_necessary":"granted","preferences_functionality":"denied","statistics_performance":"denied","marketing_advertising":"denied"}}
```

Every answer is the word `granted` or `denied`. All four categories are always present.

## ⚙️ The exact attributes {#the-exact-attributes}

`path=/`, `expires` 90 days from the write, `SameSite=Lax`, and `Secure` **over `https` only**.

Over plain `http` the cookie is written without `Secure`, so a choice persists on `http://localhost` and
local development behaves like the deployed site.

**No `Domain` attribute is set**, so the cookie belongs to one hostname. An answer given on `example.com` is
not sent to `shop.example.com`. If you need one answer to cover subdomains, that is a change to the source
rather than a setting you can turn on.

**The 90 days run from each write, not from the first one.** Answering again pushes the expiry out again. A
visitor who answers once and never opens the settings after that is asked again 90 days later.

**Size: about 220 bytes.** 161 bytes of JSON, and the rest is the encoding — `"` and `,` survive as `%22` and
`%2C`. Renaming your categories in the settings does not change it; only the four fixed keys are stored, never
your wording.

## 🧩 Why the answers sit under `consents` {#why-the-answers-sit-under-consents}

They are nested under one key rather than sitting next to `version`, so that no category can ever be named
`version` and overwrite it. If you are reading this cookie yourself, that matters: **a value with no
`consents` key is not a partial answer, it is no answer**, and that is also what an older, flat cookie from
before this change looks like.

## 📖 When the cookie is ignored {#reading-it-four-rules-in-order}

Five checks, in order. Any of the first four and the visitor is treated as **not having answered**, so the
banner shows again.

1. **There is no cookie.**
2. **The value is not valid JSON.** Something else overwrote it.
3. **The version does not match the one you configured.** Not "use what is still valid" — the whole answer is
   thrown away. That is what [raising the version]({{ '/versioning/' | relative_url }}#versioning-stored-consent)
   is for.
4. **There is no `consents` key.** Including an older, flat cookie from before that key existed.
5. **Otherwise** the stored answers are used as they are.

There is no merging and no partial recovery. It is the whole answer or none of it, which is what makes the
behaviour predictable when you change something.

## ❗ What a visitor who has not answered gets {#no-stored-answer-is-not-everything-denied}

Not "everything denied". **One category is granted**, and it is the one that has to be:

```json
{"strictly_necessary":"granted"}
```

Run through [the mapping]({{ '/datalayer/' | relative_url }}#categories-map-to-signals), that gives Google
`security_storage` granted and the other six denied. Nothing that tracks anyone is allowed; the thing that
keeps the site working is.

**If you are writing your own reader, this is the line to get right.** Falling back to "all four denied"
produces the same six denials but *also* denies `security_storage` — code that looks identical, an answer
that is not, and two halves of the same site quietly disagreeing about the same visitor.
