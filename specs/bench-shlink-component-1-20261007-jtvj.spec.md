---
name: Browser redirect rule conditions
description: Add Shlink 5.1.0 browser-matching redirect rule conditions to the modal and rule cards, gated by a server feature flag.
targets:
  - src/redirect-rules/helpers/RedirectRuleModal.tsx
  - src/redirect-rules/helpers/RedirectRuleCard.tsx
  - src/utils/features.ts
  - test/redirect-rules/helpers/RedirectRuleModal.test.tsx
  - test/redirect-rules/helpers/RedirectRuleCard.test.tsx
---

# Browser redirect rule conditions

## Requirements

- **REQ-1** When the `browserRedirectConditions` server feature is enabled (Shlink 5.1.0 or newer), the redirect rule modal condition type select lists **Browser** as the last option, immediately after **After date** when date conditions are also enabled.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-2** When the `browserRedirectConditions` server feature is disabled (server older than 5.1.0), the condition type select does not offer **Browser** among its options.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-3** When the condition type **Browser** is selected, the modal shows a select labelled **Browser:** whose options appear in this order with the given labels and values: Google Chrome (`chrome`), Mozilla Firefox (`firefox`), Microsoft Edge (`edge`), Safari (`safari`), Opera (`opera`), Android browser (`android_browser`).
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-4** Confirming the redirect rule modal persists a browser condition as `{ type: 'browser', matchValue: '<selected browser value>', matchKey: null }` (for example `{ type: 'browser', matchValue: 'firefox', matchKey: null }` when Mozilla Firefox is selected).
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-5** Opening the redirect rule modal to edit a rule that already has a browser condition shows type **Browser** selected and the **Browser:** select set to the saved `matchValue`, and the user can change the selection and save the updated value.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-6** On a redirect rule card, a browser condition is shown as `Browser is <matchValue>` using the stored API value (for example `Browser is chrome` when `matchValue` is `chrome`).
  `[@test] ../test/redirect-rules/helpers/RedirectRuleCard.test.tsx`

- **REQ-7** The `browserRedirectConditions` capability is registered in server feature detection with minimum Shlink version `5.1.0` and is readable through the same `useFeature('browserRedirectConditions')` mechanism as other version-gated redirect condition features.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

## Assumptions

- `@shlinkio/shlink-js-sdk` already exposes `browser` as a valid `ShlinkRedirectConditionType`; if the installed SDK version lacks it, implementation may bump the dev dependency only (no script changes in `package.json`).
- Rule cards display the raw `matchValue` sent to the API (for example `chrome`), not the human-readable browser label from the modal select.
- Switching a condition to type **Browser** clears `matchKey` and resets `matchValue` until the user picks a browser, consistent with other condition types.
- Accessibility coverage for browser conditions reuses the existing modal and card a11y tests by extending their fixtures where needed; no separate a11y-only test is required beyond those suites.
