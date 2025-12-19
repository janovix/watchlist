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
