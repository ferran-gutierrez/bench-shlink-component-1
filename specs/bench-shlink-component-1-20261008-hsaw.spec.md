---
name: Browser redirect rule conditions
description: Create, edit, and display browser-based redirect rule conditions gated on Shlink 5.1.0+
targets:
  - ../src/redirect-rules/helpers/RedirectRuleModal.tsx
  - ../src/redirect-rules/helpers/RedirectRuleCard.tsx
  - ../src/utils/features.ts
---

- **REQ-1** The features module exposes a server feature named `browserRedirectConditions` that is enabled when the connected Shlink server version is `5.1.0` or newer and disabled for `5.0.0`.
  `[@test] ../test/utils/features.test.ts`

- **REQ-2** When `browserRedirectConditions` is disabled, the redirect rule modal condition type dropdown for a newly added condition lists exactly `Device type`, `Language`, and `Query param` if no other redirect condition features are enabled.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-3** When `browserRedirectConditions` is enabled together with all other redirect condition features, the condition type dropdown lists `Browser` as the last option, immediately after `After date`.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-4** When the condition type is `browser`, the modal shows a select labelled `Browser:` whose options are, in order, `Google Chrome` (`chrome`), `Mozilla Firefox` (`firefox`), `Microsoft Edge` (`edge`), `Safari` (`safari`), `Opera` (`opera`), and `Android browser` (`android_browser`).
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-5** Confirming the redirect rule modal after choosing `Browser` and selecting `Mozilla Firefox` saves a condition `{ type: 'browser', matchValue: 'firefox', matchKey: null }` with no `matchKey`.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-6** Opening the redirect rule modal with an existing condition `{ type: 'browser', matchValue: 'safari', matchKey: null }` shows type `Browser` selected and `Safari` selected in the `Browser:` select.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-7** A redirect rule card renders a browser condition with `matchValue` `chrome` as the text `Browser is chrome`.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleCard.test.tsx`

- **REQ-8** A redirect rule modal whose initial conditions include `{ type: 'browser', matchValue: 'edge', matchKey: null }` passes accessibility checks.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleModal.test.tsx`

- **REQ-9** A redirect rule card whose conditions include `{ type: 'browser', matchValue: 'opera', matchKey: null }` passes accessibility checks.
  `[@test] ../test/redirect-rules/helpers/RedirectRuleCard.test.tsx`

## Assumptions

- The Shlink API condition type string is `browser` with the match value being one of `chrome`, `firefox`, `edge`, `safari`, `opera`, or `android_browser`; `@shlinkio/shlink-js-sdk` is expected to include `browser` in `ShlinkRedirectConditionType`, and the dependency may be bumped within allowed paths if the installed SDK version lacks it.
- Condition summaries on rule cards use the raw API `matchValue` (for example `chrome`), not the human-readable browser label, matching how device conditions display values such as `android`.
- Browser support follows the same feature-flag pattern as existing version-gated redirect conditions (`ipRedirectCondition`, `dateRedirectConditions`, etc.), wired through `FeaturesProvider` / `useFeature`.
- When `browserRedirectConditions` is disabled, users cannot add a new browser condition; displaying or editing browser conditions loaded from the API on an older server is out of scope and follows the same limitations as other version-gated condition types today.
