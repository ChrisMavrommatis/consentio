---
title: The cookie
anchor: the-cookie-contract
permalink: /cookie/
description: The one cookie Consentio sets - what is in it, how long it lasts, and what to say about it in your own cookie policy.
---

Consentio sets **one cookie**, and only after a visitor answers. Nothing is stored before that.

<div class="callout" markdown="1">
**For your cookie policy.** It is a first-party cookie called `consentio`, it stores the visitor's own choice
and the date they made it — no identifier, no tracking value — it lasts 90 days unless you change that, and
it is strictly necessary. You set it, so list it.
</div>

## 🍪 What is in it {#what-is-in-it}

| | |
|---|---|
| **Name** | `consentio`, unless you changed it |
| **What it holds** | the visitor's answer for each of the four categories, a version number, and the date they answered |
| **How long** | 90 days by default, counted from the last time they answered. `cookieLifetime` changes it |
| **Scope** | this hostname only, unless you turn on `shareAcrossSubdomains`. `example.com` and `shop.example.com` otherwise ask separately |
| **Size** | about 250 bytes |
| **Sent to** | your own server, on every request, like any other cookie |

The value is a small piece of JSON, encoded the way anything in a cookie has to be — so what you see in the
browser's cookie inspector has `%22` where a `"` should be. Decoded, it is:

```json
{"version":1,"consents":{"strictly_necessary":"granted","preferences_functionality":"denied","statistics_performance":"denied","marketing_advertising":"denied"},"date":"2026-09-09T10:00:00.000Z"}
```

Every answer is the word `granted` or `denied`. All four categories are always present.

**`date` is when the visitor answered**, in UTC, and it is rewritten every time they answer again. Nothing in
Consentio reads it yet — it is stored so that something can later, and because the only way to put a date on
a cookie that already exists is to throw the cookie away and ask everyone again.

**A cookie with no `date` is a perfectly good answer.** Every one written before this release has none, and
they are all still honoured. If you read this cookie yourself, do not require the key.

**This cookie is your record of consent.** Consentio keeps no log anywhere else: there is no server, so
there is nothing to export. What you can show is what the cookie holds — which categories the visitor
granted, when, and against which `version` of your wording. If a hosted platform's consent log is
something you are asked for, this is the answer, and it lives in the visitor's browser and on your server's
request logs, nowhere else.

## ⚙️ The exact attributes {#the-exact-attributes}

`path=/`, `expires` from the lifetime you set, `SameSite=Lax`, `Secure` **over `https` only**, and `Domain`
only if you asked for one answer across your subdomains.

Over plain `http` the cookie is written without `Secure`, so a choice persists on `http://localhost` and
local development behaves like the deployed site.

**The expiry runs from each write, not from the first one.** Answering again pushes it out again. A visitor
who answers once and never opens the settings after that is asked again a lifetime later.

**Size: about 250 bytes.** The value above is 195 bytes of JSON and 253 bytes once encoded — `"` and `,`
survive as `%22` and `%2C` — and the name adds `consentio=` in front. Renaming your categories in the settings does not change it; only the four fixed keys are stored, never
your wording.

## ⏳ How long it lasts {#how-long-it-lasts}

**90 days, unless you say otherwise.** Set `cookieLifetime` in your settings file — a number of days — or
`data-cookie-lifetime` on the tag. On the Tag Manager route the settings file is the one place.

```json
{ "cookieLifetime": 365 }
```

A longer life asks the visitor less often; a shorter one keeps their answer fresher. It changes nothing about
what is stored. A value that is not a positive number is ignored and you get the 90 days.

## 🌐 One answer across subdomains {#one-answer-across-subdomains}

**By default no `Domain` is set**, so the cookie belongs to one hostname: an answer given on
`www.example.com` is not sent to `shop.example.com`, and the same person is asked on each.

Turn on `shareAcrossSubdomains` and one answer covers all of them:

```json
{ "shareAcrossSubdomains": true }
```

On the tag it is `data-share-across-subdomains="true"`; on the Tag Manager route the settings file is the
one place.

**There is no domain to type, and that is the point.** A domain the browser will not take is dropped **with
no error at all** — nothing stored, and the banner back on every page load — so the one thing worth removing
is the chance of typing a wrong one. Consentio finds the right domain by asking the browser: from
`www.example.co.uk` it offers `co.uk`, then `example.co.uk`, and keeps the first one accepted, deleting each
short-lived probe cookie as it goes. `co.uk` is refused and `example.co.uk` is kept. The same walk gets
`example.com` from `www.example.com`.

**`localhost` and an IP address stay on the one host**, because neither can carry a shared domain. Turning
the setting on there changes nothing and says nothing.

**Turn it off again and the shared cookie goes.** Every write clears the answer at both scopes before storing
it at the one in use, so you never end up with two cookies of the same name and a browser sending both.

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

## 📋 The other cookies your site sets {#the-other-cookies-your-site-sets}

This page is about the one cookie Consentio writes. The rest are yours, and they go in
[the cookie table]({{ '/cookies/' | relative_url }}) — one row each, shown in the settings panel.
[The cookie catalogue]({{ '/cookies/catalogue/' | relative_url }}) has rows for the tools a site commonly
runs, already in that shape.
