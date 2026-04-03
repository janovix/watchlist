# [1.1.0-rc.36](https://github.com/janovix/watchlist/compare/v1.1.0-rc.35...v1.1.0-rc.36) (2026-04-02)


### Bug Fixes

* adjust z-index for header component and enhance layout structure in layout content ([69aad30](https://github.com/janovix/watchlist/commit/69aad30147ffa645ee41aa5e4c852615b9ae6d0f))

# [1.1.0-rc.35](https://github.com/janovix/watchlist/compare/v1.1.0-rc.34...v1.1.0-rc.35) (2026-04-02)


### Features

* integrate driver.js for onboarding popover and enhance loading states across various pages ([bac0bd4](https://github.com/janovix/watchlist/commit/bac0bd44bbd734fc82dae0d9ddd0e5150aed623b))

# [1.1.0-rc.34](https://github.com/janovix/watchlist/compare/v1.1.0-rc.33...v1.1.0-rc.34) (2026-03-30)


### Bug Fixes

* update theme color in web manifest and enhance layout with z-index adjustments in header component ([8dd6e63](https://github.com/janovix/watchlist/commit/8dd6e6393751566b2e589de648647ee9f38ac774))

# [1.1.0-rc.33](https://github.com/janovix/watchlist/compare/v1.1.0-rc.32...v1.1.0-rc.33) (2026-03-28)


### Bug Fixes

* remove z-index from header component for improved layout consistency ([dcb3839](https://github.com/janovix/watchlist/commit/dcb3839fb795b67f84abefa7d8508fd68764a93a))

# [1.1.0-rc.32](https://github.com/janovix/watchlist/compare/v1.1.0-rc.31...v1.1.0-rc.32) (2026-03-26)


### Features

* add risk level handling and badge color logic to QueriesPage ([82cce05](https://github.com/janovix/watchlist/commit/82cce05eaafde964af40f18f6707f8fb1a9eaac4))

# Changelog

All notable changes to this project will be documented in this file.

# [1.1.0-rc.31](https://github.com/janovix/watchlist/compare/v1.1.0-rc.30...v1.1.0-rc.31) (2026-03-12)

### Features

* implement country multi-select component and integrate into home and query detail pages ([8f8b4ee](https://github.com/janovix/watchlist/commit/8f8b4ee608c1851dd37aaedaaf9151732e648359))

# [1.1.0-rc.30](https://github.com/janovix/watchlist/compare/v1.1.0-rc.29...v1.1.0-rc.30) (2026-03-12)

### Features

* add risk indicators to QueriesPage and update watchlist search threshold ([6c28225](https://github.com/janovix/watchlist/commit/6c282253c6d51748d4fef57527f752dfc51b9f53))

# [1.1.0-rc.29](https://github.com/janovix/watchlist/compare/v1.1.0-rc.28...v1.1.0-rc.29) (2026-03-12)

### Features

* add lodash.debounce for search term debouncing in QueriesPage ([ef7399e](https://github.com/janovix/watchlist/commit/ef7399ee80231e076ea17ec71485d849e27bfed7))

# [1.1.0-rc.28](https://github.com/janovix/watchlist/compare/v1.1.0-rc.27...v1.1.0-rc.28) (2026-03-11)

### Features

* enhance QueriesPage with user avatars and initials, update status handling for skipped queries ([2de5d03](https://github.com/janovix/watchlist/commit/2de5d036e612c5d402421aa4d478083697b187ae))

# [1.1.0-rc.27](https://github.com/janovix/watchlist/compare/v1.1.0-rc.26...v1.1.0-rc.27) (2026-03-11)

### Bug Fixes

* format birthDate display in QueryDetailPage and MatchCard components ([16823d2](https://github.com/janovix/watchlist/commit/16823d26afc92b40af007fdf8ecbd25544f6bd65))

# [1.1.0-rc.26](https://github.com/janovix/watchlist/compare/v1.1.0-rc.25...v1.1.0-rc.26) (2026-03-10)

### Features

* add polyfill for esbuild's __name helper in RootLayout ([c8982c4](https://github.com/janovix/watchlist/commit/c8982c48e69b75788bd418d2aa7c3a63525e694f))

# [1.1.0-rc.25](https://github.com/janovix/watchlist/compare/v1.1.0-rc.24...v1.1.0-rc.25) (2026-03-06)

### Features

* implement server-side Better Auth client and enhance JWT handling in hooks ([8dafbef](https://github.com/janovix/watchlist/commit/8dafbef931c906884637d3de840d113956994ffe))

# [1.1.0-rc.24](https://github.com/janovix/watchlist/compare/v1.1.0-rc.23...v1.1.0-rc.24) (2026-03-03)

### Features

* enhance Storybook configuration with environment variable injection for authentication URLs ([f8dbb18](https://github.com/janovix/watchlist/commit/f8dbb1833a9d7dd2206df004fe82277eaf035cc4))

# [1.1.0-rc.23](https://github.com/janovix/watchlist/compare/v1.1.0-rc.22...v1.1.0-rc.23) (2026-02-27)

### Bug Fixes

* update error message for watchlist query limit and clarify subscription access for AML and Watchlist plans ([3572664](https://github.com/janovix/watchlist/commit/3572664d0916d07621974b67f049aed35ecf9a01))

# [1.1.0](https://github.com/janovix/watchlist/compare/v1.0.0...v1.1.0) (2026-02-26)

### Bug Fixes

* **auth:** align logout logic with aml project ([566a7ee](https://github.com/janovix/watchlist/commit/566a7ee157b30542a2cb935c713674b2696b9919))
* **auth:** align logout with aml - same function and better-auth v1.4.5 ([d13172a](https://github.com/janovix/watchlist/commit/d13172acb69ce706841fa7112ca9333ea25f12dc))
* **auth:** prevent duplicate search requests by waiting for JWT to load ([6c9c0b6](https://github.com/janovix/watchlist/commit/6c9c0b662637d81985fdad208f11cee6e0640d50))
* **auth:** remove SessionGuard to match aml middleware-only approach ([460d560](https://github.com/janovix/watchlist/commit/460d5601958f419821c1aa16cdad0866ebb89407))
* **auth:** remove state update before logout to match aml ([4dcca67](https://github.com/janovix/watchlist/commit/4dcca678e484db8dfdd5d183ece4ec807bb86840))
* **auth:** use authClient.signOut and redirect to /login path ([16fdb3e](https://github.com/janovix/watchlist/commit/16fdb3e41632a1b6045bc5559a779e446b431d4e))
* **auth:** use authClient.signOut instead of manual fetch ([e47a480](https://github.com/janovix/watchlist/commit/e47a480c501d32601c9d06ee111c816dc944e2b0))
* **auth:** use direct fetch with redirect manual on logout ([b39beae](https://github.com/janovix/watchlist/commit/b39beaebe6ebcb6e0e2033f9d60464d3555b81fd))
* **auth:** use direct fetch with redirect manual to prevent auto-redirect ([3560853](https://github.com/janovix/watchlist/commit/3560853b61fdd1df97b0bd32712ed2a1e64ce7cc))
* **auth:** use onSuccess callback in signOut to control redirect ([9855dea](https://github.com/janovix/watchlist/commit/9855deafeb6181a68fb45065e33cbc39f8caf472))
* **middleware:** enhance session cookie handling in middleware to prevent premature session expiration ([4a35396](https://github.com/janovix/watchlist/commit/4a3539659688d5d4242594fc27d77fb2f99adaa9))
* **middleware:** update matcher to exclude 'monitoring' from route handling ([6a55ad5](https://github.com/janovix/watchlist/commit/6a55ad524de5c8a6aa349f4e0014f214f1583546))
* **middleware:** validate session with auth service ([6e175a1](https://github.com/janovix/watchlist/commit/6e175a18047659e5f05b59277b5afd47a2d65d37))
* **ResultPage:** prevent search execution until JWT is fully loaded ([8f63438](https://github.com/janovix/watchlist/commit/8f6343853a5d013919dca96369c3883cb158c329))
* update canSubmit condition to include jwtLoading state ([a3281b6](https://github.com/janovix/watchlist/commit/a3281b6eb8829db53eda83f95b018b9d7a4ce2ac))
* update default values for topK and threshold in WatchlistSearchRequest ([10feefd](https://github.com/janovix/watchlist/commit/10feefd0eec476fecc1eafd3eda527149856d6cf))

### Features

* Add auth module tests and utilities ([7f4999c](https://github.com/janovix/watchlist/commit/7f4999c22bbf6eb52b6faaf0d54fe2f000d0d729))
* add background animation and new info and queries pages ([ad63c94](https://github.com/janovix/watchlist/commit/ad63c9488012e6855ce76a8ac49b86f63b63631c))
* add environment variable management and update landing page links ([f103683](https://github.com/janovix/watchlist/commit/f1036838adecd3b036902a197dea259ebced4fd2))
* add external link dialog component and integrate with screening results card for improved user experience ([9bf39f0](https://github.com/janovix/watchlist/commit/9bf39f0d67720d06317a79f4a73cb0610ca67285))
* Add favicon ([b9cd8ce](https://github.com/janovix/watchlist/commit/b9cd8ce7448376df1d508bdc871cbca5d4bbdbb4))
* add LanguageProvider and update auth service URL handling ([9c1f67f](https://github.com/janovix/watchlist/commit/9c1f67f42a2476576b43614c635bd4d594a5d8e1))
* Add PDF export functionality for search results ([9f17e4a](https://github.com/janovix/watchlist/commit/9f17e4ace09e436bed933c43c5593efe0a7439c5))
* Add session guard and integrate auth ([262cb6e](https://github.com/janovix/watchlist/commit/262cb6e14fc7d95fab9d5de4ce994799314353f7))
* Add tests for pep API and UI components ([5830183](https://github.com/janovix/watchlist/commit/5830183b2ffa7d9912312f8f7d6e9170a30ae931))
* **auth:** add JWT authentication support for watchlist-svc API calls ([01a3eb9](https://github.com/janovix/watchlist/commit/01a3eb99142449e7759e0997195c40a442632a49))
* enhance organization fetching to include user membership role ([a59f3e3](https://github.com/janovix/watchlist/commit/a59f3e3b620f199a22e86afe85fcb4511c414942))
* enhance QueriesPage and QueryDetailPage with PDF export functionality and organization selection ([81e7e1f](https://github.com/janovix/watchlist/commit/81e7e1f9826a101d424e77c82d166a44e99f3aac))
* enhance RecentSearches component with loading state and improve layout in QueryDetailSkeleton ([d06f585](https://github.com/janovix/watchlist/commit/d06f585f257fd43435a2ab9def67be097d2b2a05))
* Implement Better Auth integration ([1a76944](https://github.com/janovix/watchlist/commit/1a76944005e71b984f7159f48e64217a28f1c12d))
* implement real-time search query updates with useSearchQuery hook and add ScreeningResultsCard component ([b607867](https://github.com/janovix/watchlist/commit/b607867f96f4834b85151fcde3249eb56e5e5237))
* integrate RateLimitBlocker component and enhance query status handling with partial state ([db5b8c4](https://github.com/janovix/watchlist/commit/db5b8c436d80d42e01b830f6b9c0e426faf68a5e))
* Integrate Sentry for error monitoring and tracing ([de433e7](https://github.com/janovix/watchlist/commit/de433e78c47daa8107d464ad5ff3eaf745aeb856))
* **middleware:** add onboarding redirection for users without a name or organization ([2daff26](https://github.com/janovix/watchlist/commit/2daff2648d95ef3a863db8743c5981c27488269e))
* **middleware:** enhance session validation and add external URL handling for redirects ([e2f3f8e](https://github.com/janovix/watchlist/commit/e2f3f8e7da52a9b059fdfbac7e952a9582d4182d))
* **ResultPage:** add SAT 69-B results section and update translations ([ff91d50](https://github.com/janovix/watchlist/commit/ff91d50b8cc43698066f481c3ea51c0ff9ba1d71))
* **ResultPage:** integrate PEP search functionality with SSE support and display results ([17635b8](https://github.com/janovix/watchlist/commit/17635b86330a0e7688ee1dd86ced48c57c81ad9f))
* **settings:** implement server settings management and context provider ([a06c6e8](https://github.com/janovix/watchlist/commit/a06c6e8cad51915c3076c2a32b48fcf1277a80f6))
* **stories:** update LanguageToggle to support Portuguese and wrap components in ThemeProvider ([df3b0a9](https://github.com/janovix/watchlist/commit/df3b0a96b2389e962edf8a93f219aff8e8b2f3ed))
* **subscription:** add SubscriptionBanner component and related functionality for subscription status notifications ([4cf6577](https://github.com/janovix/watchlist/commit/4cf65770a35d1199d7fbb0e1b9a056e156f76da0))
* **subscription:** add SubscriptionProvider to layout and enhance usage limit error handling in watchlist search ([bc1f66f](https://github.com/janovix/watchlist/commit/bc1f66f4535d009fa95bb2b58093f7b85179f13a))
* update logo component to use CSS custom properties for theming ([3956f26](https://github.com/janovix/watchlist/commit/3956f26b7d62aad915f955b4424110454a289abd))
* update styles and layout for improved UI and user experience ([bc12b77](https://github.com/janovix/watchlist/commit/bc12b77eabdcb577e99cde3c4983533b4022c850))
* Use environment variables for Sentry config ([a7b1c38](https://github.com/janovix/watchlist/commit/a7b1c38abf1ee8c4609a32962b1599845d89d86f))
* **watchlist:** add UNSC results section to search results page ([bd2c586](https://github.com/janovix/watchlist/commit/bd2c5867b027ca6e135f8febfda65459d6a1e70c))
* **watchlist:** implement advanced search functionality with new API integration ([42f6406](https://github.com/janovix/watchlist/commit/42f6406557e91c99c459f2081b6bc5aa2743987a))

# [1.1.0-rc.22](https://github.com/janovix/watchlist/compare/v1.1.0-rc.21...v1.1.0-rc.22) (2026-02-26)

### Features

* enhance organization fetching to include user membership role ([a59f3e3](https://github.com/janovix/watchlist/commit/a59f3e3b620f199a22e86afe85fcb4511c414942))

# [1.1.0-rc.21](https://github.com/janovix/watchlist/compare/v1.1.0-rc.20...v1.1.0-rc.21) (2026-02-25)

### Features

* add environment variable management and update landing page links ([f103683](https://github.com/janovix/watchlist/commit/f1036838adecd3b036902a197dea259ebced4fd2))

# [1.1.0-rc.20](https://github.com/janovix/watchlist/compare/v1.1.0-rc.19...v1.1.0-rc.20) (2026-02-24)

### Bug Fixes

* update default values for topK and threshold in WatchlistSearchRequest ([10feefd](https://github.com/janovix/watchlist/commit/10feefd0eec476fecc1eafd3eda527149856d6cf))

# [1.1.0-rc.19](https://github.com/janovix/watchlist/compare/v1.1.0-rc.18...v1.1.0-rc.19) (2026-02-23)

### Features

* integrate RateLimitBlocker component and enhance query status handling with partial state ([db5b8c4](https://github.com/janovix/watchlist/commit/db5b8c436d80d42e01b830f6b9c0e426faf68a5e))

# [1.1.0-rc.18](https://github.com/janovix/watchlist/compare/v1.1.0-rc.17...v1.1.0-rc.18) (2026-02-23)

### Features

* enhance QueriesPage and QueryDetailPage with PDF export functionality and organization selection ([81e7e1f](https://github.com/janovix/watchlist/commit/81e7e1f9826a101d424e77c82d166a44e99f3aac))

# [1.1.0-rc.17](https://github.com/janovix/watchlist/compare/v1.1.0-rc.16...v1.1.0-rc.17) (2026-02-23)

### Features

* add external link dialog component and integrate with screening results card for improved user experience ([9bf39f0](https://github.com/janovix/watchlist/commit/9bf39f0d67720d06317a79f4a73cb0610ca67285))

# [1.1.0-rc.16](https://github.com/janovix/watchlist/compare/v1.1.0-rc.15...v1.1.0-rc.16) (2026-02-20)

### Features

* enhance RecentSearches component with loading state and improve layout in QueryDetailSkeleton ([d06f585](https://github.com/janovix/watchlist/commit/d06f585f257fd43435a2ab9def67be097d2b2a05))

# [1.1.0-rc.15](https://github.com/janovix/watchlist/compare/v1.1.0-rc.14...v1.1.0-rc.15) (2026-02-20)

### Features

* update styles and layout for improved UI and user experience ([bc12b77](https://github.com/janovix/watchlist/commit/bc12b77eabdcb577e99cde3c4983533b4022c850))

# [1.1.0-rc.14](https://github.com/janovix/watchlist/compare/v1.1.0-rc.13...v1.1.0-rc.14) (2026-02-19)

### Features

* update logo component to use CSS custom properties for theming ([3956f26](https://github.com/janovix/watchlist/commit/3956f26b7d62aad915f955b4424110454a289abd))

# [1.1.0-rc.13](https://github.com/janovix/watchlist/compare/v1.1.0-rc.12...v1.1.0-rc.13) (2026-02-17)

### Features

* implement real-time search query updates with useSearchQuery hook and add ScreeningResultsCard component ([b607867](https://github.com/janovix/watchlist/commit/b607867f96f4834b85151fcde3249eb56e5e5237))

# [1.1.0-rc.12](https://github.com/janovix/watchlist/compare/v1.1.0-rc.11...v1.1.0-rc.12) (2026-02-17)

### Bug Fixes

* update canSubmit condition to include jwtLoading state ([a3281b6](https://github.com/janovix/watchlist/commit/a3281b6eb8829db53eda83f95b018b9d7a4ce2ac))

# [1.1.0-rc.11](https://github.com/janovix/watchlist/compare/v1.1.0-rc.10...v1.1.0-rc.11) (2026-02-17)

### Bug Fixes

* **middleware:** enhance session cookie handling in middleware to prevent premature session expiration ([4a35396](https://github.com/janovix/watchlist/commit/4a3539659688d5d4242594fc27d77fb2f99adaa9))

# [1.1.0-rc.10](https://github.com/janovix/watchlist/compare/v1.1.0-rc.9...v1.1.0-rc.10) (2026-02-16)

### Features

* add LanguageProvider and update auth service URL handling ([9c1f67f](https://github.com/janovix/watchlist/commit/9c1f67f42a2476576b43614c635bd4d594a5d8e1))

# [1.1.0-rc.9](https://github.com/janovix/watchlist/compare/v1.1.0-rc.8...v1.1.0-rc.9) (2026-02-16)

### Features

* add background animation and new info and queries pages ([ad63c94](https://github.com/janovix/watchlist/commit/ad63c9488012e6855ce76a8ac49b86f63b63631c))

# [1.1.0-rc.8](https://github.com/janovix/watchlist/compare/v1.1.0-rc.7...v1.1.0-rc.8) (2026-02-13)

### Features

* **watchlist:** add UNSC results section to search results page ([bd2c586](https://github.com/janovix/watchlist/commit/bd2c5867b027ca6e135f8febfda65459d6a1e70c))

# [1.1.0-rc.7](https://github.com/janovix/watchlist/compare/v1.1.0-rc.6...v1.1.0-rc.7) (2026-02-13)

### Features

* **ResultPage:** add SAT 69-B results section and update translations ([ff91d50](https://github.com/janovix/watchlist/commit/ff91d50b8cc43698066f481c3ea51c0ff9ba1d71))

# [1.1.0-rc.6](https://github.com/janovix/watchlist/compare/v1.1.0-rc.5...v1.1.0-rc.6) (2026-02-12)

### Features

* **subscription:** add SubscriptionProvider to layout and enhance usage limit error handling in watchlist search ([bc1f66f](https://github.com/janovix/watchlist/commit/bc1f66f4535d009fa95bb2b58093f7b85179f13a))

# [1.1.0-rc.5](https://github.com/janovix/watchlist/compare/v1.1.0-rc.4...v1.1.0-rc.5) (2026-02-12)

### Features

* **ResultPage:** integrate PEP search functionality with SSE support and display results ([17635b8](https://github.com/janovix/watchlist/commit/17635b86330a0e7688ee1dd86ced48c57c81ad9f))

# [1.1.0-rc.4](https://github.com/janovix/watchlist/compare/v1.1.0-rc.3...v1.1.0-rc.4) (2026-02-11)

### Bug Fixes

* **middleware:** update matcher to exclude 'monitoring' from route handling ([6a55ad5](https://github.com/janovix/watchlist/commit/6a55ad524de5c8a6aa349f4e0014f214f1583546))

# [1.1.0-rc.3](https://github.com/janovix/watchlist/compare/v1.1.0-rc.2...v1.1.0-rc.3) (2026-02-11)

### Bug Fixes

* **ResultPage:** prevent search execution until JWT is fully loaded ([8f63438](https://github.com/janovix/watchlist/commit/8f6343853a5d013919dca96369c3883cb158c329))

### Features

* **watchlist:** implement advanced search functionality with new API integration ([42f6406](https://github.com/janovix/watchlist/commit/42f6406557e91c99c459f2081b6bc5aa2743987a))

# [1.1.0-rc.2](https://github.com/janovix/watchlist/compare/v1.1.0-rc.1...v1.1.0-rc.2) (2026-01-16)

### Features

* **middleware:** add onboarding redirection for users without a name or organization ([2daff26](https://github.com/janovix/watchlist/commit/2daff2648d95ef3a863db8743c5981c27488269e))
* **middleware:** enhance session validation and add external URL handling for redirects ([e2f3f8e](https://github.com/janovix/watchlist/commit/e2f3f8e7da52a9b059fdfbac7e952a9582d4182d))
* **subscription:** add SubscriptionBanner component and related functionality for subscription status notifications ([4cf6577](https://github.com/janovix/watchlist/commit/4cf65770a35d1199d7fbb0e1b9a056e156f76da0))

# [1.1.0-rc.1](https://github.com/janovix/watchlist/compare/v1.0.0...v1.1.0-rc.1) (2026-01-12)

### Bug Fixes

* **auth:** align logout logic with aml project ([566a7ee](https://github.com/janovix/watchlist/commit/566a7ee157b30542a2cb935c713674b2696b9919))
* **auth:** align logout with aml - same function and better-auth v1.4.5 ([d13172a](https://github.com/janovix/watchlist/commit/d13172acb69ce706841fa7112ca9333ea25f12dc))
* **auth:** prevent duplicate search requests by waiting for JWT to load ([6c9c0b6](https://github.com/janovix/watchlist/commit/6c9c0b662637d81985fdad208f11cee6e0640d50))
* **auth:** remove SessionGuard to match aml middleware-only approach ([460d560](https://github.com/janovix/watchlist/commit/460d5601958f419821c1aa16cdad0866ebb89407))
* **auth:** remove state update before logout to match aml ([4dcca67](https://github.com/janovix/watchlist/commit/4dcca678e484db8dfdd5d183ece4ec807bb86840))
* **auth:** use authClient.signOut and redirect to /login path ([16fdb3e](https://github.com/janovix/watchlist/commit/16fdb3e41632a1b6045bc5559a779e446b431d4e))
* **auth:** use authClient.signOut instead of manual fetch ([e47a480](https://github.com/janovix/watchlist/commit/e47a480c501d32601c9d06ee111c816dc944e2b0))
* **auth:** use direct fetch with redirect manual on logout ([b39beae](https://github.com/janovix/watchlist/commit/b39beaebe6ebcb6e0e2033f9d60464d3555b81fd))
* **auth:** use direct fetch with redirect manual to prevent auto-redirect ([3560853](https://github.com/janovix/watchlist/commit/3560853b61fdd1df97b0bd32712ed2a1e64ce7cc))
* **auth:** use onSuccess callback in signOut to control redirect ([9855dea](https://github.com/janovix/watchlist/commit/9855deafeb6181a68fb45065e33cbc39f8caf472))
* **middleware:** validate session with auth service ([6e175a1](https://github.com/janovix/watchlist/commit/6e175a18047659e5f05b59277b5afd47a2d65d37))

### Features

* Add auth module tests and utilities ([7f4999c](https://github.com/janovix/watchlist/commit/7f4999c22bbf6eb52b6faaf0d54fe2f000d0d729))
* Add favicon ([b9cd8ce](https://github.com/janovix/watchlist/commit/b9cd8ce7448376df1d508bdc871cbca5d4bbdbb4))
* Add PDF export functionality for search results ([9f17e4a](https://github.com/janovix/watchlist/commit/9f17e4ace09e436bed933c43c5593efe0a7439c5))
* Add session guard and integrate auth ([262cb6e](https://github.com/janovix/watchlist/commit/262cb6e14fc7d95fab9d5de4ce994799314353f7))
* Add tests for pep API and UI components ([5830183](https://github.com/janovix/watchlist/commit/5830183b2ffa7d9912312f8f7d6e9170a30ae931))
* **auth:** add JWT authentication support for watchlist-svc API calls ([01a3eb9](https://github.com/janovix/watchlist/commit/01a3eb99142449e7759e0997195c40a442632a49))
* Implement Better Auth integration ([1a76944](https://github.com/janovix/watchlist/commit/1a76944005e71b984f7159f48e64217a28f1c12d))
* Integrate Sentry for error monitoring and tracing ([de433e7](https://github.com/janovix/watchlist/commit/de433e78c47daa8107d464ad5ff3eaf745aeb856))
* **settings:** implement server settings management and context provider ([a06c6e8](https://github.com/janovix/watchlist/commit/a06c6e8cad51915c3076c2a32b48fcf1277a80f6))
* **stories:** update LanguageToggle to support Portuguese and wrap components in ThemeProvider ([df3b0a9](https://github.com/janovix/watchlist/commit/df3b0a96b2389e962edf8a93f219aff8e8b2f3ed))
* Use environment variables for Sentry config ([a7b1c38](https://github.com/janovix/watchlist/commit/a7b1c38abf1ee8c4609a32962b1599845d89d86f))

# [1.0.0](https://github.com/janovix/watchlist/compare/v1.0.0-rc.15...v1.0.0) (2025-12-14)

### Bug Fixes

* adding cf build script ([e4304da](https://github.com/algtools/next-template/commit/e4304dae686a6cabe53f20a6a88d73f6d6d1dbbe))
* update CI workflow to skip Chromatic publishing on 'dev' branch ([17b1390](https://github.com/algtools/next-template/commit/17b1390591887196d224e5b7e6f214b824b93372))

### Features

* Add core functionality ([1cfb1d8](https://github.com/algtools/next-template/commit/1cfb1d8bb6bd41aa3e7d2808b143d41c56d183dd))
* integrate storybook ([72c57c8](https://github.com/algtools/next-template/commit/72c57c8bc2114ba1bfa9e993f479edf5198ec87c))

# [1.0.0-rc.15](https://github.com/janovix/watchlist/compare/v1.0.0-rc.14...v1.0.0-rc.15) (2026-01-09)

### Features

* Integrate Sentry for error monitoring and tracing ([cb4aa5f](https://github.com/janovix/watchlist/commit/cb4aa5f671de8bf9b8248d62fc187e380ff234d7))
* Use environment variables for Sentry config ([4c7e0f1](https://github.com/janovix/watchlist/commit/4c7e0f1f84e2f8c18d5250de254bb926b1a2f843))

# [1.0.0-rc.14](https://github.com/janovix/watchlist/compare/v1.0.0-rc.13...v1.0.0-rc.14) (2026-01-07)

### Features

* Add favicon ([80ec49b](https://github.com/janovix/watchlist/commit/80ec49b071f3f855b6ba5f0b59be830aca138ef1))

# [1.0.0-rc.13](https://github.com/janovix/watchlist/compare/v1.0.0-rc.12...v1.0.0-rc.13) (2025-12-19)

### Bug Fixes

* **middleware:** validate session with auth service ([db1891a](https://github.com/janovix/watchlist/commit/db1891ad714d5fb4cafb91eb3d34ae05f0058e5e))

# [1.0.0-rc.12](https://github.com/janovix/watchlist/compare/v1.0.0-rc.11...v1.0.0-rc.12) (2025-12-19)

### Bug Fixes

* **auth:** prevent duplicate search requests by waiting for JWT to load ([7a6caeb](https://github.com/janovix/watchlist/commit/7a6caeba5bf77f8e5c3a4fda718b7556f87ed9a3))

### Features

* **auth:** add JWT authentication support for watchlist-svc API calls ([c5bcc0e](https://github.com/janovix/watchlist/commit/c5bcc0ede52b256c5c97ffbbe047462a28d5f3d9))

# [1.0.0-rc.11](https://github.com/janovix/watchlist/compare/v1.0.0-rc.10...v1.0.0-rc.11) (2025-12-18)

### Features

* Add PDF export functionality for search results ([b8be8e0](https://github.com/janovix/watchlist/commit/b8be8e0d432fe54ecadc48ece9fd044a059e4c64))
* Add tests for pep API and UI components ([5f53c73](https://github.com/janovix/watchlist/commit/5f53c733cffc2ffd5f0f2a2a93a408eb03ceb838))

# [1.0.0-rc.10](https://github.com/janovix/watchlist/compare/v1.0.0-rc.9...v1.0.0-rc.10) (2025-12-18)

### Bug Fixes

* **auth:** remove SessionGuard to match aml middleware-only approach ([c2335cb](https://github.com/janovix/watchlist/commit/c2335cb0132cd2b390b8692d1042eae66c635453))

# [1.0.0-rc.9](https://github.com/janovix/watchlist/compare/v1.0.0-rc.8...v1.0.0-rc.9) (2025-12-18)

### Bug Fixes

* **auth:** remove state update before logout to match aml ([7545bde](https://github.com/janovix/watchlist/commit/7545bde3eadf68c4faacc2f2af11e23f5f842da7))

# [1.0.0-rc.8](https://github.com/janovix/watchlist/compare/v1.0.0-rc.7...v1.0.0-rc.8) (2025-12-18)

### Bug Fixes

* **auth:** use onSuccess callback in signOut to control redirect ([679a6bf](https://github.com/janovix/watchlist/commit/679a6bf7c8a137944f1a4eaf8161f4da286277f8))

# [1.0.0-rc.7](https://github.com/janovix/watchlist/compare/v1.0.0-rc.6...v1.0.0-rc.7) (2025-12-18)

### Bug Fixes

* **auth:** use authClient.signOut instead of manual fetch ([9147edf](https://github.com/janovix/watchlist/commit/9147edf886754b4f7570882929aad8321a12fda9))

# [1.0.0-rc.6](https://github.com/janovix/watchlist/compare/v1.0.0-rc.5...v1.0.0-rc.6) (2025-12-18)

### Bug Fixes

* **auth:** use direct fetch with redirect manual on logout ([1db7304](https://github.com/janovix/watchlist/commit/1db7304325770cdf8167071d37fa713951f81325))

# [1.0.0-rc.5](https://github.com/janovix/watchlist/compare/v1.0.0-rc.4...v1.0.0-rc.5) (2025-12-18)

### Bug Fixes

* **auth:** align logout with aml - same function and better-auth v1.4.5 ([be6dbff](https://github.com/janovix/watchlist/commit/be6dbffcf80c17992347ab181e6a203b728fd13d))
* **auth:** use direct fetch with redirect manual to prevent auto-redirect ([32baefe](https://github.com/janovix/watchlist/commit/32baefe047664fe8477f6b694d8cd9b30412186e))

# [1.0.0-rc.4](https://github.com/janovix/watchlist/compare/v1.0.0-rc.3...v1.0.0-rc.4) (2025-12-18)

### Bug Fixes

* **auth:** use authClient.signOut and redirect to /login path ([d39ea2a](https://github.com/janovix/watchlist/commit/d39ea2a4aaff901aa4dae11357a37d3d72c64ac5))

# [1.0.0-rc.3](https://github.com/janovix/watchlist/compare/v1.0.0-rc.2...v1.0.0-rc.3) (2025-12-18)

### Bug Fixes

* **auth:** align logout logic with aml project ([20cd580](https://github.com/janovix/watchlist/commit/20cd58069621e594bed84bc10a1d66afa0e267fc))

# [1.0.0-rc.2](https://github.com/janovix/watchlist/compare/v1.0.0-rc.1...v1.0.0-rc.2) (2025-12-18)

### Features

* Add auth module tests and utilities ([26a8143](https://github.com/janovix/watchlist/commit/26a8143596378ca18831500db6b573ce9041f393))
* Add session guard and integrate auth ([0a4d060](https://github.com/janovix/watchlist/commit/0a4d0606a5e1dae8b8aaea22aaa52065b9098453))
* Implement Better Auth integration ([ff96a3e](https://github.com/janovix/watchlist/commit/ff96a3e698deaf1cd85a0ac9aa346d348eaa5b4e))

# 1.0.0-rc.1 (2025-12-17)

### Features

* Add documentation descriptions to storybook components ([42cc2a8](https://github.com/janovix/watchlist/commit/42cc2a85e4a4a1e3b6c72d94826c94be2d30a817))
* Add Logo component and theme provider ([382a935](https://github.com/janovix/watchlist/commit/382a9357ea71291329d5279c27f6d4d0a10efd04))
* Add many dependencies for UI components and utilities ([a16fc98](https://github.com/janovix/watchlist/commit/a16fc9820d907202cf7dec5e310a441d7d21e1ba))
* Add storybook stories for new views and components ([0b714fb](https://github.com/janovix/watchlist/commit/0b714fbfd7c7aa9d2baccfb1d2a6d81ac20b70b6))
* Improve theme handling in Logo component ([3df6c8c](https://github.com/janovix/watchlist/commit/3df6c8ce442c7296724bbcde7e5068ffdf6734f4))
* Specify pnpm as package manager ([3f79a5f](https://github.com/janovix/watchlist/commit/3f79a5f01d828f44a1dfa7cc7b251570991ae294))
