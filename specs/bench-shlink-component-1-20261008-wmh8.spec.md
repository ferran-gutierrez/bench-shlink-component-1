---
name: Browser redirect rule conditions
description: Support creating, editing, and displaying browser-based redirect rule conditions gated by Shlink 5.1.0 server feature browserRedirectConditions.
targets:
  - src/utils/features.ts
  - src/redirect-rules/helpers/RedirectRuleModal.tsx
  - src/redirect-rules/helpers/RedirectRuleCard.tsx
  - test/utils/features.test.ts
  - test/redirect-rules/helpers/RedirectRuleModal.test.tsx
  - test/redirect-rules/helpers/RedirectRuleCard.test.tsx
---

## Requirements

- **REQ-1** The server feature map exposes `browserRedirectConditions`, enabled when the connected Shlink server version is 5.1.0 or newer (and when server version is `latest`, treated like other min-version-only features).
  `[@test] ../test/utils/features.test.ts`

- **REQ-2** In the redirect rule modal, when `browserRedirectConditions` is enabled, the condition type select lists a `Browser` option (label `Browser`) after every other supported condition type for the current server features.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-3** In the redirect rule modal, when `browserRedirectConditions` is disabled, the condition type select does not offer a `Browser` option.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-4** When the condition type is `browser`, the modal shows a select labelled `Browser:` whose options are, in order, Google Chrome (`chrome`), Mozilla Firefox (`firefox`), Microsoft Edge (`edge`), Safari (`safari`), Opera (`opera`), and Android browser (`android_browser`), using a placeholder option when no browser is selected yet (same pattern as device type).
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-5** Confirming the modal with a browser condition saves it as `{ type: 'browser', matchValue: <selected browser code>, matchKey: null }`.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-6** Opening the modal to edit an existing rule whose condition has `type: 'browser'` pre-selects that condition’s `matchValue` in the browser select and allows changing it before save.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-7** On a redirect rule card, a browser condition is rendered as `Browser is <matchValue>` (for example `Browser is chrome`), using the stored API value rather than the human-friendly label.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleCard.test.tsx`

## Assumptions

- `@shlinkio/shlink-js-sdk` types already include the redirect condition type `browser`; if the installed dev dependency lacks it, bumping `@shlinkio/shlink-js-sdk` in `package.json` / `package-lock.json` is acceptable to satisfy TypeScript checks.
- Browser condition chips on rule cards are shown whenever the API returns a `browser` condition, even when `browserRedirectConditions` is disabled for the server (consistent with other version-gated condition types already stored on rules).
- Accessibility coverage for browser conditions follows the existing redirect rule modal and card tests (extended fixtures rather than separate a11y-only cases).
