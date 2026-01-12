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

# [1.1.0](https://github.com/janovix/watchlist/compare/v1.0.0...v1.1.0) (2026-01-10)


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
* Use environment variables for Sentry config ([a7b1c38](https://github.com/janovix/watchlist/commit/a7b1c38abf1ee8c4609a32962b1599845d89d86f))

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

# 1.0.0 (2025-12-14)


### Bug Fixes

* adding cf build script ([e4304da](https://github.com/algtools/next-template/commit/e4304dae686a6cabe53f20a6a88d73f6d6d1dbbe))
* update CI workflow to skip Chromatic publishing on 'dev' branch ([17b1390](https://github.com/algtools/next-template/commit/17b1390591887196d224e5b7e6f214b824b93372))


### Features

* Add core functionality ([1cfb1d8](https://github.com/algtools/next-template/commit/1cfb1d8bb6bd41aa3e7d2808b143d41c56d183dd))
* integrate storybook ([72c57c8](https://github.com/algtools/next-template/commit/72c57c8bc2114ba1bfa9e993f479edf5198ec87c))

# [1.0.0-rc.4](https://github.com/algtools/next-template/compare/v1.0.0-rc.3...v1.0.0-rc.4) (2025-12-14)


### Features

* Add core functionality ([1cfb1d8](https://github.com/algtools/next-template/commit/1cfb1d8bb6bd41aa3e7d2808b143d41c56d183dd))

# [1.0.0-rc.3](https://github.com/algtools/next-template/compare/v1.0.0-rc.2...v1.0.0-rc.3) (2025-12-13)


### Bug Fixes

* update CI workflow to skip Chromatic publishing on 'dev' branch ([17b1390](https://github.com/algtools/next-template/commit/17b1390591887196d224e5b7e6f214b824b93372))

# [1.0.0-rc.2](https://github.com/algtools/next-template/compare/v1.0.0-rc.1...v1.0.0-rc.2) (2025-12-13)


### Features

* integrate storybook ([72c57c8](https://github.com/algtools/next-template/commit/72c57c8bc2114ba1bfa9e993f479edf5198ec87c))

# 1.0.0-rc.1 (2025-12-13)


### Bug Fixes

* adding cf build script ([e4304da](https://github.com/algtools/next-template/commit/e4304dae686a6cabe53f20a6a88d73f6d6d1dbbe))


### Features

# Changelog

All notable changes to this project will be documented in this file.
