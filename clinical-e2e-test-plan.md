# Clinical Module - E2E Test Automation Plan

## 1. Scan Summary

| Repo | Key Findings |
|------|-------------|
| **bahmni-ui-test-automation** | Playwright + TypeScript, PageFactory pattern, 13 spec files (23 test cases), 19 page objects, worker-scoped fixtures, Faker-based test data |
| **openmrs-module-bahmniapps** | AngularJS 1.4.9 SPA, Clinical module has 14+ sub-features across 8 consultation tabs (Observations, Diagnosis, Treatment, Disposition, Orders, Bacteriology, Investigation, Summary) |
| **cure-claude-plugins** | Documents 3-layer architecture (Page → Action → Test), strict locator priorities, no `waitForTimeout`, headed-mode debugging, OpenMRS REST API for test data setup |

---

## 2. Clinical Module - All User Flows Identified

From `openmrs-module-bahmniapps/ui/app/clinical/` analysis:

| # | Flow | Sub-flows | Existing Coverage |
|---|------|-----------|-------------------|
| 1 | **Patient Search** | Search by name/ID, recent patients, active patients list | Partial (activePatients page exists) |
| 2 | **Start Consultation** | Open new consultation, select visit type, retrospective entry | Partial |
| 3 | **Vitals/Observations** | Record vitals (BP, temp, pulse, weight, height, BMI), custom observation forms, concept set groups | Partial (vitalsForm, secondVitalsForm) |
| 4 | **Diagnosis** | Add coded/non-coded diagnosis, set certainty (Presumed/Confirmed), primary/secondary, delete diagnosis | **Not covered** |
| 5 | **Treatment/Medication** | Prescribe drugs, dosage/frequency/route/duration, refill, discontinue, drug order sets, CDSS alerts | Partial (medication.spec.ts) |
| 6 | **Disposition** | Admit/Discharge/Refer, disposition notes, warning on overwrite | **Not covered** |
| 7 | **Orders** | Lab orders, radiology orders, order notes, order by category | Partial (radiology-orders.spec.ts) |
| 8 | **Investigations** | Select lab tests by category, investigation notes, multi-tab | **Not covered** |
| 9 | **Bacteriology** | Sample collection, sample type, specimen ID, culture/sensitivity | **Not covered** |
| 10 | **Consultation Summary** | Review all entered data before save, save consultation | **Not covered** |
| 11 | **Dashboard Sections** | View patient dashboard with configurable sections, lab results, treatment history, conditions | **Not covered** |
| 12 | **Visit Management** | View visit history, visit summary, IPD visit details, print visit | **Not covered** |
| 13 | **Forms (Observation)** | Admission letter, discharge summary, death note, history & examination, progress notes | Partial (forms.spec.ts) |
| 14 | **Patient Control Panel** | Sidebar actions, documents, navigation | **Not covered** |
| 15 | **Conditions/Follow-up** | Add conditions, track active conditions | **Not covered** |
| 16 | **Allergies** | Add/edit/delete allergies with severity & reactions | **Not covered as standalone** |
| 17 | **Print** | Print prescription, print dashboard, print visit summary | Partial (print gating tested) |

---

## 3. Implementation Plan

### Phase 0: Prerequisites & Infrastructure Setup

#### 0.1 - New Page Objects Needed

Following the 3-layer architecture from cure-claude-plugins:

| Page Object | Purpose |
|-------------|---------|
| `diagnosisPage.ts` | Diagnosis tab - add/edit/delete diagnoses |
| `dispositionPage.ts` | Disposition tab - admit/discharge/refer |
| `ordersPage.ts` | Orders tab - lab & radiology orders |
| `investigationsPage.ts` | Investigations tab - lab test selection |
| `bacteriologyPage.ts` | Bacteriology tab - specimen/culture entry |
| `consultationSummaryPage.ts` | Summary tab - review before save |
| `patientDashboardPage.ts` | Dashboard sections - view patient data |
| `visitPage.ts` | Visit history & details |
| `conditionsPage.ts` | Conditions management |
| `allergiesPage.ts` | Allergies management |
| `patientSearchPage.ts` | Clinical patient search (extend existing) |

#### 0.2 - New Action Layer

The action layer is currently missing from the project and needs to be introduced:

| Action Script | Purpose |
|--------------|---------|
| `clinicalActions.ts` | High-level clinical flows (startConsultation, saveConsultation) |
| `diagnosisActions.ts` | addDiagnosis, verifyDiagnosis, deleteDiagnosis |
| `treatmentActions.ts` | prescribeMedication, verifyPrescription, discontinueDrug |
| `dispositionActions.ts` | setDisposition, verifyDisposition |
| `ordersActions.ts` | placeLabOrder, placeRadiologyOrder, verifyOrder |
| `observationActions.ts` | fillVitals, fillObservationForm, verifyObservation |
| `allergyActions.ts` | addAllergy, verifyAllergy, deleteAllergy |

#### 0.3 - Test Data Setup

| Data Type | Method | Source |
|-----------|--------|--------|
| Diagnosis concepts | OpenMRS REST API | `diagnosisData.ts` |
| Drug concepts | OpenMRS REST API | Existing `medicationData.ts` |
| Lab test concepts | OpenMRS REST API | Existing `investigationData.ts` |
| Allergy concepts | OpenMRS REST API | Existing `allergyData.ts` |
| Disposition concepts | Already in Bahmni | Config-based |
| Order types | Already in Bahmni | Config-based |
| Test patient | Existing fixture | `clinicalFixture.ts` |

---

### Phase 1: Core Consultation Flow (Foundation)

```
tests/clinical/
├── patient-search.spec.ts          # Search, select patient, recent patients
├── start-consultation.spec.ts      # New consultation, visit type, retrospective
├── consultation-save.spec.ts       # Save consultation, verify summary
```

#### Test Cases

**patient-search.spec.ts**
- TC_CS_01: Search patient by full name
- TC_CS_02: Search patient by patient ID
- TC_CS_03: Search patient by partial name
- TC_CS_04: Verify recent patients list shows last viewed patients
- TC_CS_05: Verify active patients tab displays patients with active visits

**start-consultation.spec.ts**
- TC_CS_06: Start new OPD consultation for patient
- TC_CS_07: Verify consultation tabs are displayed after starting consultation
- TC_CS_08: Start retrospective consultation with past date
- TC_CS_09: Verify visit type selection (OPD/IPD)

**consultation-save.spec.ts**
- TC_CS_10: Save empty consultation and verify no errors
- TC_CS_11: Save consultation with data and verify success notification

---

### Phase 2: Consultation Tabs (Primary Clinical Features)

```
tests/clinical/
├── diagnosis.spec.ts               # Add/edit/delete diagnoses, certainty, primary/secondary
├── treatment.spec.ts               # Prescribe, refill, discontinue, drug order sets
├── disposition.spec.ts             # Admit, discharge, refer, notes
├── observations.spec.ts            # Vitals, custom forms, concept sets
├── orders.spec.ts                  # Lab orders, radiology orders, categories
├── allergies.spec.ts               # Add/edit/delete, severity, reactions
```

#### Test Cases

**diagnosis.spec.ts**
- TC_DG_01: Add a coded diagnosis with "Confirmed" certainty
- TC_DG_02: Add a coded diagnosis with "Presumed" certainty
- TC_DG_03: Add a non-coded (free-text) diagnosis
- TC_DG_04: Set diagnosis as Primary
- TC_DG_05: Set diagnosis as Secondary
- TC_DG_06: Add multiple diagnoses in a single consultation
- TC_DG_07: Delete a diagnosis before saving
- TC_DG_08: Verify diagnosis persists after saving and reopening consultation
- TC_DG_09: Verify diagnosis appears on patient dashboard after save

**treatment.spec.ts**
- TC_TX_01: Prescribe a single drug with full dosage details (dose, frequency, route, duration)
- TC_TX_02: Prescribe multiple drugs in a single consultation
- TC_TX_03: Search for a drug by name and select from autocomplete
- TC_TX_04: Discontinue an active drug order
- TC_TX_05: Refill an existing drug order
- TC_TX_06: Verify active prescriptions display on dashboard
- TC_TX_07: Verify drug order history shows past prescriptions
- TC_TX_08: Add "as-directed" instructions to a prescription

**disposition.spec.ts**
- TC_DP_01: Set disposition to "Admit Patient"
- TC_DP_02: Set disposition to "Discharge Patient"
- TC_DP_03: Set disposition to "Refer Patient" with notes
- TC_DP_04: Add disposition notes
- TC_DP_05: Verify warning when overwriting an earlier disposition
- TC_DP_06: Verify disposition appears in consultation summary

**observations.spec.ts**
- TC_OB_01: Fill vitals form (BP systolic/diastolic, temperature, pulse, weight, height)
- TC_OB_02: Verify BMI auto-calculates from weight and height
- TC_OB_03: Fill a custom observation form (e.g., History & Examination)
- TC_OB_04: Save observation and verify it displays on dashboard
- TC_OB_05: Edit a previously saved observation
- TC_OB_06: Navigate between multiple observation form tabs

**orders.spec.ts**
- TC_OR_01: Place a lab order by searching for a test
- TC_OR_02: Place a radiology order
- TC_OR_03: Place multiple orders in a single consultation
- TC_OR_04: Add notes to an order
- TC_OR_05: Verify placed orders appear on patient dashboard
- TC_OR_06: Place orders by category/panel selection

**allergies.spec.ts**
- TC_AL_01: Add an allergy with reaction and severity
- TC_AL_02: Add multiple allergies
- TC_AL_03: Delete an allergy
- TC_AL_04: Verify allergies display on patient dashboard
- TC_AL_05: Edit an existing allergy

---

### Phase 3: Secondary Clinical Features

```
tests/clinical/
├── investigations.spec.ts          # Lab test selection, categories, notes
├── bacteriology.spec.ts            # Sample collection, culture/sensitivity
├── conditions.spec.ts              # Add/track conditions
├── consultation-summary.spec.ts    # Review all data, verify completeness
```

#### Test Cases

**investigations.spec.ts**
- TC_IN_01: Select a lab test from the investigation tab
- TC_IN_02: Select tests from different categories/panels
- TC_IN_03: Add investigation notes
- TC_IN_04: Verify selected investigations appear in consultation summary
- TC_IN_05: Remove an investigation before saving

**bacteriology.spec.ts**
- TC_BA_01: Add a bacteriology sample with collection date and type
- TC_BA_02: Add specimen identifier
- TC_BA_03: Add multiple specimens in a single consultation
- TC_BA_04: Verify bacteriology data displays after save

**conditions.spec.ts**
- TC_CO_01: Add an active condition
- TC_CO_02: Verify conditions display on patient dashboard
- TC_CO_03: Mark a condition as inactive

**consultation-summary.spec.ts**
- TC_SM_01: Verify consultation summary displays all entered data (diagnosis, treatment, disposition, observations)
- TC_SM_02: Navigate to consultation summary tab and verify completeness
- TC_SM_03: Save consultation from summary tab

---

### Phase 4: Dashboard & Visit Management

```
tests/clinical/
├── patient-dashboard.spec.ts       # Dashboard sections, configurable tabs
├── visit-history.spec.ts           # View past visits, visit summary
├── visit-print.spec.ts             # Print prescription, dashboard, visit
```

#### Test Cases

**patient-dashboard.spec.ts**
- TC_DB_01: Verify patient demographics display on dashboard header
- TC_DB_02: Verify dashboard sections load (treatment, lab results, diagnoses, etc.)
- TC_DB_03: Navigate between dashboard tabs
- TC_DB_04: Verify patient photo displays (if uploaded)
- TC_DB_05: Verify control panel sidebar shows patient info and actions

**visit-history.spec.ts**
- TC_VH_01: View list of past visits for a patient
- TC_VH_02: Open a past visit and verify visit summary details
- TC_VH_03: Verify visit summary shows diagnosis, treatment, observations from that visit
- TC_VH_04: Navigate between visit tabs (if configured)

**visit-print.spec.ts**
- TC_VP_01: Print prescription from consultation
- TC_VP_02: Print patient dashboard
- TC_VP_03: Print visit summary

---

### Phase 5: End-to-End Integration Flows

```
tests/clinical/
├── e2e-opd-consultation.spec.ts    # Full OPD flow
├── e2e-ipd-workflow.spec.ts        # Full IPD flow
├── e2e-lab-workflow.spec.ts        # Consultation → lab order → verify
├── e2e-medication-lifecycle.spec.ts # Prescribe → refill → discontinue
```

#### Test Cases

**e2e-opd-consultation.spec.ts**
- TC_E2E_01: Complete OPD consultation: search patient → start consultation → record vitals → add diagnosis → prescribe medication → set disposition → save → verify on dashboard

**e2e-ipd-workflow.spec.ts**
- TC_E2E_02: Full IPD workflow: admit patient → fill admission forms → record vitals → add diagnosis → prescribe medication → fill discharge summary → discharge → verify

**e2e-lab-workflow.spec.ts**
- TC_E2E_03: Lab order flow: start consultation → place lab order → save → verify order appears on dashboard → verify in orders section

**e2e-medication-lifecycle.spec.ts**
- TC_E2E_04: Medication lifecycle: prescribe drug → verify active → refill → verify updated → discontinue → verify in history

---

## 4. Dependencies

### Environment Dependencies

| Dependency | What Is Needed | Why |
|------------|----------------|-----|
| **Bahmni environment URL** | Base URL of your lower environment | To configure `.env` file |
| **User credentials** | Admin, Doctor, Nurse, Receptionist logins | For role-based test flows |
| **Login location** | Default location name for login | Required by Bahmni login |
| **Installed modules** | Confirm which clinical features are enabled (Bacteriology? CDSS? Tele-consultation?) | Some features may not be deployed |
| **Custom forms** | List of observation forms configured (Admission Letter, Discharge Summary, etc.) | Forms vary per deployment |
| **Drug list** | Confirm drugs available in your formulary | Medication tests need valid drug names |
| **Lab test concepts** | Confirm lab tests/panels available | Order tests need valid concept names |
| **Diagnosis concepts** | Confirm coded diagnoses available | Diagnosis tests need valid concept names |

### Technical Dependencies

| Dependency | Status | Action Needed |
|------------|--------|---------------|
| Node.js 20+ | Verify on your machine | `node --version` |
| Playwright browsers | Need install | `npx playwright install chromium` |
| `.env` file for your environment | **Need to create** | Copy `.env.example`, fill in your env values |
| Network access to Bahmni | Required | Tests run against live Bahmni instance |
| Test data (concepts, drugs, etc.) | May need API setup | `global-setup.ts` handles some; may need extending |
| `data-testid` attributes in UI | **Check availability** | Some locators may need CSS/XPath fallbacks if `data-testid` is absent |

### Configuration Dependencies

| Item | Question |
|------|----------|
| **Clinical dashboard tabs** | Which tabs are enabled in your `clinical/app.json` config? |
| **Observation forms** | Which forms are configured under Observations? |
| **Drug order config** | Is rule-based dosing enabled (mg/kg calculations)? |
| **Programs** | Any programs configured that affect clinical flow? |
| **CDSS** | Is Clinical Decision Support enabled? |
| **Print templates** | Any custom print templates? |

---

## 5. Test Case Summary

| Phase | Spec Files | Test Cases |
|-------|-----------|------------|
| Phase 1: Core Consultation Flow | 3 | 11 |
| Phase 2: Consultation Tabs | 6 | 30 |
| Phase 3: Secondary Features | 4 | 15 |
| Phase 4: Dashboard & Visits | 3 | 12 |
| Phase 5: E2E Integration | 4 | 4 |
| **Total** | **20** | **72** |

---

## 6. Execution Order

1. **Phase 0** — Set up infrastructure (page objects, action layer, test data)
2. **Phase 1** — Core consultation flow is the foundation everything else depends on
3. **Phase 2** — Each consultation tab is independent, can be developed concurrently
4. **Phase 3 & 4** — After core tabs are stable
5. **Phase 5** — Integration flows compose everything together

---

## 7. Architecture & Conventions

All new code follows the 3-layer architecture documented in `cure-claude-plugins`:

```
src/
├── pages/          # Layer 1: UI Mapping (locators + atomic interactions only)
├── actions/        # Layer 2: Business Logic (reusable multi-step flows, no assertions)
├── fixtures/       # Shared worker-scoped fixtures
├── config/         # Environment configuration
└── utils/          # Shared utilities

tests/
├── clinical/       # Layer 3: Test Execution (assertions + action calls only)

test-data/          # Factory functions for test data generation
```

### Key Rules
- **Locator priority**: `data-testid` → `getByRole` → `getByLabel` → unique `id` → fallback with comment
- **No `waitForTimeout()`**: Use `waitFor({ state: 'visible' })`, `waitForLoadState('networkidle')`, `waitForURL()`
- **Headed-mode first**: Always debug with `npm run test:headed:local` before committing
- **Assertions only in tests**: Page objects and actions never contain `expect()` calls
- **Action naming**: `add*`, `verify*`, `navigate*`, `register*`, `search*`
