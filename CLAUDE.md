# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Bahmni UI Automation is a Playwright-based test framework for Bahmni 3.0 EMR system. Tests cover functional, E2E, and visual regression testing across registration and clinical workflows.

## Common Commands

### Running Tests

```bash
# Local environment (requires SSL cert setup)
npm run test:local

# Ethiopia environment (default)
npm run test:et

# Niger environment
npm run test:niger

# Specific test file
npm run test:et -- tests/registration/sanity.spec.ts --project=chromium

# Headed mode (visible browser)
npm run test:headed:local
npm run test:headed

# Debug mode
npm run test:debug

# UI mode
npm run test:ui

# Specific browser
npm run test:chromium
npm run test:firefox
```

### Code Quality

```bash
# Lint
npm run lint
npm run lint:fix

# Format
npm run format
npm run format:check
```

### Test Reports

```bash
# HTML report
npm run report

# Allure reports
npm run allure:generate    # Generate report
npm run allure:open        # Open existing report
npm run allure:serve       # Generate and open
npm run allure:clean       # Clean up reports
```

## Environment Configuration

Tests use environment-specific `.env` files:
- `.env.local` - Local Bahmni instance (https://localhost)
- `.env.et` - Ethiopia environment (default)
- `.env.niger` - Niger environment

Environment is selected via `NODE_ENV` variable (defaults to `et`):
```bash
NODE_ENV=et npx playwright test
NODE_ENV=niger npx playwright test
NODE_ENV=local npx playwright test
```

### Required Environment Variables

Create `.env.<env>` files based on `.env.example`. Required variables:
- `BASE_URL` - Base Bahmni URL (all other URLs are derived from this)
- `USER_ADMIN_USERNAME`, `USER_ADMIN_PASSWORD` (base64 encoded)
- `USER_DOCTOR_USERNAME`, `USER_DOCTOR_PASSWORD` (base64 encoded)
- `USER_NURSE_USERNAME`, `USER_NURSE_PASSWORD` (base64 encoded)
- `USER_RECEPTIONIST_USERNAME`, `USER_RECEPTIONIST_PASSWORD` (base64 encoded)

**Note**: All usernames and passwords must be base64 encoded in the .env files for security.
Encode credentials using: `echo -n 'your-credential' | base64`

Optional variables include locale, location, viewport settings, and timeouts.

### Local SSL Certificate Setup

When testing against local Bahmni with self-signed certificates:

```bash
# Extract certificate from Docker
docker exec bahmni-standard-proxy-1 cat /etc/tls/cert.pem > /tmp/bahmni-cert.pem

# Add to macOS keychain
sudo security add-trusted-cert -d -r trustRoot -p ssl -k /Library/Keychains/System.keychain /tmp/bahmni-cert.pem
```

The certificate must remain at `/tmp/bahmni-cert.pem` as test scripts reference this path via `NODE_EXTRA_CA_CERTS`.

## Architecture

### Page Object Model (POM)

All UI interactions are encapsulated in page classes in `src/pages/`. Pages use `data-test-id` attributes when available for stable locators.

**PageFactory** (`src/pages/PageFactory.ts`) provides centralized access to all page objects. Initialize once per test:

```typescript
const bahmni = new PageFactory(page);
await bahmni.loginPage.goto();
await bahmni.loginPage.login(username, password);
```

Key page objects:
- `loginPage` - Login and locale selection
- `locationPage` - Location selection after login
- `homePage` - Module navigation hub
- `registrationSearchPage` - Patient search in registration
- `createPatientPage` - Patient creation and editing
- `clinicalPage` - Clinical module search
- `consultationDashboard` - Patient consultation dashboard
- `newConsultationPage` - New consultation form
- `activePatientsPage` - Active patients list in clinical module

### Configuration System

`src/config/env.config.ts` loads environment variables and provides a typed config object:

```typescript
import { config } from '../config/env.config';

// Access URLs
config.baseUrl
config.urls.login
config.urls.clinicalSearch

// Access user credentials
const adminUser = config.getUser('admin');
const doctorUser = config.getUser('doctor');

// Access defaults
config.defaults.locale    // e.g., "string:en"
config.defaults.location  // e.g., "OPD-1"
```

### Test Data Generation

Test data generators in `test-data/` use Faker.js to create random, realistic data:

```typescript
import { generatePatientData } from '../../test-data/patientData';

const patientData = generatePatientData();
// Returns: firstName, lastName, middleName, gender, dateOfBirth, phoneNumber, email, address, identifiers
```

Available generators:
- `patientData.ts` - Patient demographics
- `medicationData.ts` - Medication prescriptions
- `diagnosisData.ts` - Clinical diagnoses
- `allergyData.ts` - Patient allergies
- `vaccinationData.ts` - Vaccination records
- `investigationData.ts` - Lab investigations
- `admissionLetterData.ts` - Admission letter data

### Custom Fixtures

**Clinical Fixture** (`src/fixtures/clinicalFixture.ts`) provides worker-scoped setup for clinical tests:

```typescript
import { test, expect } from '../../src/fixtures/clinicalFixture';

test.describe.serial('Clinical Tests', () => {
  test('test name', async ({ clinicalSetup }) => {
    const { bahmni, patientData, patientId, page } = clinicalSetup;
    // Patient already created and logged in, ready for clinical workflow
  });
});
```

This fixture:
- Creates a patient once per worker (not per test)
- Maintains login session across all tests in the worker
- Navigates to clinical module and selects the patient
- Use with `test.describe.serial()` for maximum efficiency

### Global Setup/Teardown

`global-setup.ts` runs once before all tests:
- Verifies environment accessibility
- Creates required OpenMRS relationship types (Father/Son, Mother/Son, Husband/Wife, Elder Sibling/Younger Sibling)
- Skips creation if relationships already exist

`global-teardown.ts` runs after all tests for cleanup.

## Writing Tests

### Standard Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { PageFactory } from '../../src/pages/PageFactory';
import { config } from '../../src/config/env.config';
import { generatePatientData } from '../../test-data/patientData';

test.describe('Test Suite Name', () => {
  test('test description', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const adminUser = config.getUser('admin');
    const patientData = generatePatientData();

    // Login workflow
    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(adminUser.username, adminUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    // Test actions
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.REGISTRATION_NEW);
    // ...
  });
});
```

### Clinical Tests with Fixture

```typescript
import { test, expect } from '../../src/fixtures/clinicalFixture';

test.describe.serial('Clinical Workflow', () => {
  test('consultation test', async ({ clinicalSetup }) => {
    const { bahmni, patientData, patientId, page } = clinicalSetup;

    // Patient already created and selected in clinical dashboard
    await bahmni.consultationDashboard.clickStartConsultation();
    // ...
  });
});
```

## Playwright Configuration

Key settings in `playwright.config.ts`:
- Environment-based config loading via `NODE_ENV`
- Tests run in parallel by default (`fullyParallel: true`)
- CI mode: 1 worker, 2 retries
- Reports: Allure, HTML, JSON, list
- Artifacts: traces, screenshots, videos on failure only
- Default browser: Chromium (Firefox and WebKit commented out)

## Project Structure

```
├── src/
│   ├── config/          # Environment configuration
│   ├── fixtures/        # Custom test fixtures
│   └── pages/           # Page Object Model classes
├── tests/               # Test specifications by module
│   └── registration/    # Registration tests
├── test-data/           # Test data generators
├── reports/             # Generated test reports
│   ├── allure-results/
│   └── html-report/
├── global-setup.ts      # Pre-test setup (relationships, etc.)
├── global-teardown.ts   # Post-test cleanup
└── playwright.config.ts # Playwright configuration
```

## Development Notes

- Prefer `data-test-id` attributes for locators when available
- Use PageFactory for consistent page object access
- Use config object for all environment-specific values
- Generate test data with Faker.js generators
- For clinical tests requiring patient setup, use the clinical fixture
- Tests in `test.describe.serial()` blocks share worker-scoped fixtures
- CI runs with `fullyParallel: true` for speed, but uses 1 worker for stability
