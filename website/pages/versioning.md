---
title: Asking everyone again
anchor: versioning-stored-consent
permalink: /versioning/
description: How to throw away every stored answer and show the banner to everyone again, and when that is the right thing to do.
---

Every stored answer carries a version number. If it does not match the one you have configured, **the whole
answer is thrown away** and that visitor sees the banner again, as if they had never answered.

That is the only way to ask everyone again, and raising the number is how you do it.

## 🔢 How to do it {#how-to-do-it}

Raise `version` by one, in whichever place applies to you:

- **In your HTML:** `data-version="2"` on the tag. This one wins if you set both.
- **In your settings file:** `"version": 2`.
- **In Tag Manager:** the version field on the template.

Set it in every place your site uses. A page that still says `1` will keep honouring old answers while the
rest of your site asks again.

## ⚖️ What it costs {#what-it-costs-to-raise-it}

**Every returning visitor loses their choice**, including the ones who took the trouble to turn things off.
They get the banner again and have to answer again. There is no partial keep and no merge — the old answer is
discarded whole.

So it is not free, and it is not something to do while tidying up.

## ✅ When it is the right thing {#when-it-is-the-right-thing}

Raise it when **an old answer is no longer an answer to the question you are now asking.** For example:

- You started using a category for something materially different from what its description said.
- You rewrote a category's description because the old one was misleading about what it covered.
- You added a new third-party tool under an existing category, and the old wording did not cover it.

## 🚫 When it is not {#when-it-is-not}

- **Fixing a typo or rewording for clarity.** The question is the same; do not ask it again.
- **Adding a category.** You cannot — the four are fixed. If Consentio itself ever changes them, that comes
  with its own version change.
- **Releasing a new version of your site.** Unrelated.
- **Because answers feel stale.** They already expire on their own after 90 days from the last time the
  visitor answered.

If you are unsure, leave it alone. Asking again costs your visitors something, and asking too often trains
people to click whatever makes the banner go away.
