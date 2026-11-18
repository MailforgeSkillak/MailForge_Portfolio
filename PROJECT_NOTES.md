# Project Notes — MailForge Portfolio V6

## Purpose
A detailed, interactive, long-form project showcase for MailForge by Skillak. The site is designed for customers, partners, accelerators, and investors.

## Project truth baseline (owner-provided, 2026-11-16)
- Stage: Development / advanced working MVP.
- Current customers: none.
- Gmail and Outlook sending: both internally tested, per owner.
- No commercial traction or MRR has been supplied.
- Product guide documents public pages, 23 user workspace pages, central admin features, 10 AI tools, and end-to-end user journey.

## Main content architecture
- Story + pain points and problem-solution mapping.
- Solution paradigm and core workflow.
- Target segments and sector-specific playbooks.
- Complete public/workspace/admin module catalog.
- AI tool deep dives.
- Seven-step user journey and real screenshot gallery.
- Sending lifecycle and trust boundaries.
- Competitor landscape and comparison framing.
- SaaS revenue model, current stage, roadmap, expansion opportunities and FAQ.

## Screenshot inventory
23 slots are managed through `admin-app.js`; seven latest workspace screenshots were added to the matching catalog modules and a dedicated gallery. Product screenshots are distributed according to their actual screens: dashboard, onboarding, templates, campaigns, contacts, automation, analytics, campaign results, media.

## Competitor references in site
- Mailchimp: https://mailchimp.com/features/
- Brevo: https://www.brevo.com/features/email-marketing/
- ActiveCampaign: https://www.activecampaign.com/platform/email-marketing
- GMass: https://www.gmass.co/features
- Mailmeteor: https://mailmeteor.com/products/gmail

These official pages are linked as examples of competitor positioning and feature sets. They do not prove a head-to-head benchmark.

## Security/accuracy constraints
- Do not claim guaranteed inbox placement.
- Do not claim absolute privacy or local-only data storage without architecture proof.
- 400 messages per rolling 24h is described as an internal safety cap, not a Google/Microsoft quota.
- Distinguish product scope from tested production functionality.
- Distinguish planned additions from existing features.
- Tracking metrics have known limitations (e.g. opens can be affected by privacy systems and automated image fetching).

## Hosting
Static site: GitHub repository `MailforgeSkillak/MailForge_Portfolio` as source/media storage + AWS Amplify Hosting deployment on branch `main`. Do not store private customer data, sender lists, API secrets, or payment details in the public repository.

## V6 inventory
- 23 HTML sections, 37 page/module groups, 10 AI detail cards, 6 vertical playbooks, 5 competitor cards, and 9 FAQs.
- 62 editable text nodes are automatically discovered by admin CMS via `data-editable`.
- 16 media slots; repeated screenshots in module cards share the same `data-media-slot` key so a single replacement updates every linked placement.


## V7 additions
- Added seven supplied workspace screenshots: campaigns, contacts, analytics, sending accounts, team/permissions, guide, and support.
- Added all seven screenshots to the catalog module descriptions and the latest-workspace gallery.
- Added seven managed media slots; total managed slots: 23.
- Updated deployment and CMS documentation from the earlier Cloudflare recommendation to the AWS Amplify setup currently used by the owner.
