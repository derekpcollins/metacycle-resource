# Private beta

For the 10–20 owners invited from r/metacycle and Discord (spec, "Launch plan" step 3). The site is live at https://metacycle.guide but carries `noindex`, so it isn't in search results yet. Please don't post the link publicly until the public launch.

## What to test

Use it the way you would with a real problem, on your phone in the garage if you can.

1. **Find a fix fast.** From the home page, get from a symptom ("won't power on", "speedometer reads wrong") to the right checks in two taps. Did the checks match what you saw?
2. **Find a part.** Search for a part the way you'd say it ("shock", "fob", "tyres", "charging port"). Did search find it? Is the buy link the right part for the Metacycle, and does it still work? Note the price you see.
3. **Follow a guide.** Battery removal, long-term storage, cold-weather charging, Votol reprogramming, alarm removal, seat upgrades. Are the steps right, in the right order, with the right tools? Anything missing or unsafe?
4. **Check the specs and downloads.** Spec sheet, fuses, pinouts and `/downloads`. Do the values match your bike? Do the files open, and does the SHA-256 match (instructions on the page)?
5. **Report something.** Use "report a problem" or the web form at least once, with or without a GitHub account. Was it quick? Did anything confuse you?
6. **Phone and desktop, light and dark.** Anything hard to read or tap, cut off, or slow on bad signal?

## How to report

- **No GitHub account:** the web form (`/contribute/form`), or "report a problem" / "I checked this" on any page. It files an issue for the editor; leave a name or handle if you'd like credit.
- **GitHub users:** the issue forms (broken link, suggest a part or vendor, share a fix, correct a spec), or "edit this page" to propose a change directly. See [CONTRIBUTING.md](../CONTRIBUTING.md).
- **Anything else** (bugs, ideas, "this felt wrong"): a "Share a fix" report or a GitHub issue is fine. Screenshots help.

Every fact needs a source: a link, a photo, or "I measured it on my bike". Without one, a fix is published as _community-reported_.

## Known gaps

[Help wanted](https://metacycle.guide/contribute/help-wanted) is the live list. As of Nov 13, 2026:

- **Buy links:** all 59 are unverified, with no prices yet. 31 are on stores that block automated checks (AliExpress, Amazon, Alibaba, and cnqsmotor.com's bot wall), so only a person can confirm them. This is the most useful thing beta testers can do.
- **Unknown specs:** rim sizes, front brake caliper and pads, fork model and oil, torque specs, and a maintenance schedule. No source documents these yet.
- **Guides:** none of the 6 has been verified on a bike yet, and difficulty ratings are editor estimates. 15 values in guides, fixes and vendors are still `TODO`.
- **Downloads:** Sondors-authored manuals (user manual, operations manual, warranty) aren't mirrored yet; they're still on [Metacyclopedia's Files page](https://metacyclopedia.github.io/files/).
- **No part photos or exploded diagram** yet.
- **Contacts:** the takedown and maintainer email addresses aren't set up yet.
- **Spam protection on the web form** still uses Cloudflare's test keys; the honeypot, rate limits and hourly cap are the only defenses until real keys are added.
