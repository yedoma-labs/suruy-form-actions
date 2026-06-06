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
