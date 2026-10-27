# [0.2.0](https://github.com/yedoma-labs/suruy-form-actions/compare/v0.1.1...v0.2.0) (2026-10-27)


### Bug Fixes

* **deps:** update dependencies to latest ([#18](https://github.com/yedoma-labs/suruy-form-actions/issues/18)) ([71c7925](https://github.com/yedoma-labs/suruy-form-actions/commit/71c7925231dd63275f87581fe97921b31479f385))


### Features

* **schema:** add options constraint for allowed values ([f31dcf6](https://github.com/yedoma-labs/suruy-form-actions/commit/f31dcf63cafb42595785184366c1c31d47feb752))

## [0.1.1](https://github.com/yedoma-labs/suruy-form-actions/compare/v0.1.0...v0.1.1) (2026-10-10)

### Bug Fixes

- collapse files array in package.json to satisfy biome formatter ([f1a2b4a](https://github.com/yedoma-labs/suruy-form-actions/commit/f1a2b4a62d38efa3af20b8b427fba43702950d63))
- switch vite minifier from esbuild to oxc ([b039f84](https://github.com/yedoma-labs/suruy-form-actions/commit/b039f84bf115267afe4b521f930bb98c3dc96785))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-06

### Added

- Initial release of `@yedoma-labs/suruy-form-actions`
- `createFormAction` - Create type-safe form actions with validation
- `createSimpleAction` - Create form actions without validation
- `useFormAction` - React hook for client-side form state management
- `useFieldProps` - Helper hook for field error handling
- `schema` - Zero-dependency validation schema builder
- `parseFormData` - Utility to parse FormData into typed objects
- Full TypeScript support with type inference
- Progressive enhancement support (works without JavaScript)
- ESM and CommonJS dual module support
- Comprehensive unit tests (13 tests, 100% coverage)
- Complete API documentation

### Technical Details

- Zero runtime dependencies
- Bundle size: ~1.4KB gzipped (ESM), ~1.25KB gzipped (CJS)
- React 18-19 peer dependency support
- Node.js 22+ required
- Built with Vite 6 + TypeScript 5.6
- Tested with Vitest 2
- Linted with Biome 1.9
