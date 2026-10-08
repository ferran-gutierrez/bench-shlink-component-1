---
name: Browser redirect rule conditions
description: Create, edit, and display browser-based redirect rule conditions gated by Shlink 5.1.0
targets:
  - ../src/redirect-rules/helpers/RedirectRuleModal.tsx
  - ../src/redirect-rules/helpers/RedirectRuleCard.tsx
  - ../src/utils/features.ts
  - ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx
  - ../test/redirect-rules/helpers/RedirectRuleCard.test.tsx
---

- **REQ-1** The server feature `browserRedirectConditions` is registered with minimum Shlink version `5.1.0`, and when it is disabled the redirect rule modal condition type select does not list a "Browser" option.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-2** When `browserRedirectConditions` is enabled and every other version-gated redirect condition type is also enabled, the condition type select lists "Browser" immediately after "After date" and before any other option.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-3** When the condition type is `browser`, the modal shows a select labelled "Browser:" whose options appear in this order with these labels and values: Google Chrome (`chrome`), Mozilla Firefox (`firefox`), Microsoft Edge (`edge`), Safari (`safari`), Opera (`opera`), Android browser (`android_browser`).
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-4** Saving a redirect rule after adding a browser condition and choosing Mozilla Firefox in the Browser select calls `onSave` with a condition `{ type: 'browser', matchValue: 'firefox', matchKey: null }`.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-5** When the modal opens to edit a rule that already contains `{ type: 'browser', matchValue: 'safari', matchKey: null }`, the Browser select shows Safari selected.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-6** A redirect rule card whose conditions include `{ type: 'browser', matchValue: 'chrome', matchKey: null }` displays the text `Browser is chrome`.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleCard.test.tsx`

## Assumptions

- The `@shlinkio/shlink-js-sdk` api-contract includes `browser` as a valid `ShlinkRedirectConditionType`; if the installed SDK version lacks it, the implementation may bump that dependency while keeping `package.json` scripts unchanged.
- Card summary text uses the raw `matchValue` sent to the API (for example `chrome`), not the human-readable select label (for example `Google Chrome`), as in the request example.
- Switching an existing condition row to the Browser type clears `matchValue` and `matchKey` to `null`, matching how other condition types behave in the modal today.
- Accessibility checks for redirect rule modal and card scenarios that include browser conditions must continue to pass, consistent with existing redirect-rules tests.
