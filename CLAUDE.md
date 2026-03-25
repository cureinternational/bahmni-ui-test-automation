# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Playwright-based test automation framework for Bahmni 3.0 UI, including functional, end-to-end, and visual regression testing. Tests healthcare workflows like patient registration, clinical consultations, medications, and observations.

## Environment Setup

### Required Environment Files
Create `.env.local` or `.env.dev` files from `.env.example` with:
- `BASE_URL`: Bahmni instance URL
- User credentials for 4 roles: `USER_ADMIN_*`, `USER_DOCTOR_*`, `USER_NURSE_*`, `USER_RECEPTIONIST_*`
- `DEFAULT_LOCATION`: Login location (default: `OPD-1`)

### Local Testing with SSL Certificates
For local Bahmni instances with self-signed certificates:
```bash
docker exec bahmni-standard-proxy-1 cat /etc/tls/cert.pem > /tmp/bahmni-cert.pem
sudo security add-trusted-cert -d -r trustRoot -p ssl -k /Library/Keychains/System.keychain /tmp/bahmni-cert.pem
```
The certificate must remain at `/tmp/bahmni-cert.pem` as npm scripts reference this path.

## Common Commands

### Running Tests
```bash
# Local environment (requires SSL cert setup)
npm run test:local

# Dev environment
npm run test:dev

# Headed mode (see browser)
npm run test:headed:local
npm run test:headed

# Specific test file
npm run test:local -- tests/registration/sanity.spec.ts --project=chromium

# Specific browser
npm run test:chromium
npm run test:firefox

# Debug mode
npm run test:debug

# Interactive UI mode
npm run test:ui
```

### Code Quality
```bash
npm run lint              # Check for errors
npm run lint:fix          # Auto-fix errors
npm run format            # Format code
npm run format:check      # Check formatting
```

### Test Reports
```bash
# Allure reports
npm run allure:serve      # Quick view (recommended)
npm run allure:generate   # Generate HTML report
npm run allure:open       # Open generated report
npm run allure:clean      # Clean old reports

# Playwright HTML report
npm run report
```

## Architecture

### Global Setup/Teardown
- **`global-setup.ts`**: Runs once before all tests to verify environment accessibility and create OpenMRS relationship types (Father/Son, Mother/Son, Husband/Wife, Elder Sibling/Younger Sibling) via REST API
- **`global-teardown.ts`**: Runs once after all tests

### Page Object Model
All page objects are in `src/pages/` and accessed through **PageFactory** (single point of access):

```typescript
const bahmni = new PageFactory(page);
await bahmni.loginPage.login(username, password);
await bahmni.createPatientPage.createPatient(data);
```

Key page objects:
- `LoginPage`, `LocationPage`, `HomePage`: Authentication and navigation
- `RegistrationSearchPage`, `CreatePatientPage`: Patient registration
- `ClinicalPage`, `ConsultationDashboard`, `NewConsultationPage`: Clinical workflows
- `ActivePatientsPage`: Patient list management
- Form pages: `VitalsForm`, `AdmissionLetterForm`, `DeathNoteForm`, `HistoryAndExaminationForm`

### Test Fixtures
**`src/fixtures/clinicalFixture.ts`**: Worker-scoped fixture that optimizes clinical test performance by:
1. Creating a patient once per worker
2. Logging in once and maintaining the session
3. Starting an OPD visit
4. Navigating to the clinical module

Use with `test.describe.serial()` for sequential tests sharing the same patient:

```typescript
import { test, expect } from '../../src/fixtures/clinicalFixture';

test.describe.serial('Clinical Tests', () => {
  test('test 1', async ({ clinicalSetup }) => {
    const { bahmni, page, patientData, patientId } = clinicalSetup;
    // Test code - login and patient creation already done
  });
});
```

The fixture ensures you're on the clinical dashboard between tests, not stuck in a consultation.

### Configuration
**`src/config/env.config.ts`**: Centralized configuration with:
- `config.baseUrl`: Base URL from env
- `config.urls`: Constructed application URLs
- `config.users`: Credentials for all roles (admin, doctor, nurse, receptionist)
- `config.getUser(role)`: Helper to get user by role
- `config.defaults`: Default location and locale
- `config.playwright`: Playwright settings from env

### Test Data
Test data files in `test-data/` use faker libraries to generate:
- `patientData.ts`: Patient demographics with `generatePatientData()`
- `allergyData.ts`: Allergies with allergens, severity, reactions
- `diagnosisData.ts`: Conditions and diagnoses
- `investigationData.ts`: Lab tests, radiology, procedures
- `medicationData.ts`: Prescriptions with dosage, frequency
- `vaccinationData.ts`: Immunization records
- `admissionLetterData.ts`: Observation forms

### Environment Switching
Tests use `NODE_ENV` to switch between environments:
- `NODE_ENV=local` loads `.env.local` (requires `NODE_EXTRA_CA_CERTS=/tmp/bahmni-cert.pem`)
- `NODE_ENV=dev` loads `.env.dev` (default)

## Playwright Configuration

**`playwright.config.ts`** configures:
- Test directory: `./tests`
- Parallel execution: Fully parallel (except on CI)
- Retries: 2 on CI, 0 locally
- Workers: 1 on CI, unlimited locally
- Reporters: Allure, HTML, JSON, list
- Screenshots/videos/traces: On failure only
- Timeouts: 30s actions, 30s navigation (configurable via env)
- Projects: Chromium enabled by default (Firefox/WebKit commented out)

## Test Organization

Tests are organized by module:
- `tests/registration/`: Patient registration flows
- `tests/clinical/`: Clinical consultation workflows

Tests use either:
1. Standard Playwright fixtures for independent tests
2. Clinical fixture for sequential tests sharing a patient/session

## Locator Strategy

Use `data-test-id` attributes for stable locators. Page objects prioritize these over CSS/XPath selectors.

## Known Issues & Workarounds

1. **Vaccinations don't display without refresh**: Add `await page.reload()` after saving consultation with vaccination
2. **Observation forms don't display without refresh**: Add `await page.reload()` after saving consultation with forms

These are documented in test files with `// TODO: Remove this refresh once the bug is fixed`

## CI/CD

**`azure-pipelines.yml`**: Azure Pipelines configuration for CI builds.

## Important Notes

- All tests assume a running Bahmni instance (local Docker or remote)
- Global setup creates OpenMRS relationship types if they don't exist
- Clinical fixture reduces test execution time by reusing sessions and patients across tests in a worker
- Allure reports track historical trends when history folder is preserved between runs
- Environment must be accessible before tests run (verified in global setup)
