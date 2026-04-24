# E2E Test Implementation - Challenges & Fixes

## Challenge 1: No `data-testid` attributes in AngularJS clinical module

**Problem**: The old AngularJS clinical module has zero `data-testid` attributes across all templates. Every Playwright selector had to be crafted using CSS classes (`button.save-consultation`), Angular-specific attributes (`[ng-click="openConsultation()"]`), text content (`h2:has-text("Allergies")`), or DOM structure — all fragile and prone to breaking with UI changes.

**Impact**: ~30% of implementation time spent writing and debugging selectors. The "Consultation" button alone had 3 different elements matching the text, requiring Angular-specific attribute selectors.

**Fix applied** — Added `data-testid` to key elements in 3 files:

| File | Elements | data-testid values |
|------|----------|-------------------|
| `clinicalDashboardHeader.html` | Save button, Consultation link, Print button, consultation tabs | `save-consultation`, `open-consultation`, `print-dashboard`, `consultation-tab-{index}` |
| `dashboardSection.html` | Dashboard section container | `dashboard-section-{sectionName}` |
| `patientsList.html` | Search wrapper, tab items, search input, search button, table, patient rows | `patient-search`, `search-tab-{name}`, `patient-search-input`, `patient-search-button`, `patient-list-table`, `patient-row-{identifier}` |

---

## Challenge 2: Persistent `#overlay` div blocks all pointer events

**Problem**: The spinner overlay (`spinner.js`) uses a token-based show/hide system. Each `show()` generates a random token pushed to an array; `hide()` removes the token and only calls `fadeOut()` when the array is empty. If any async operation fails to call `hide()` (e.g., a promise chain that errors out), the token leaks and the overlay stays visible with `z-index: 9999999999999`, blocking ALL pointer events indefinitely.

**Root cause** in `ui/app/common/ui-helper/spinner.js`:
```javascript
// Token added on every show() but only removed on explicit hide()
tokens.push(token);

// Only hides when ALL tokens are cleared — one leaked token blocks forever
if (tokens.length === 0) {
    spinnerElement.fadeOut(300);
}
```

**Impact**: On the patient search page, the overlay persisted permanently. Had to use `dispatchEvent('click')` instead of Playwright's native `.click()`, bypassing Playwright's built-in actionability checks (visibility, stability, pointer-events).

**Fix applied** — Added a safety timeout (2 minutes) in `spinner.js` that auto-removes leaked tokens:
```javascript
$timeout(function () {
    if (tokens.indexOf(token) !== -1) {
        _.pull(tokens, token);
        if (tokens.length === 0) {
            spinnerElement.fadeOut(300);
        }
    }
}, MAX_OVERLAY_DURATION_MS);
```

---

## Challenge 3: Newly created patients not searchable in clinical module

**Problem**: Patients created through the React registration UI (`/bahmni-new/registration/`) are not immediately findable via the AngularJS clinical search page. The search calls `/bahmniCommonsSearchUrl/patient/lucene` — a Lucene-indexed endpoint — that requires backend indexing to complete before patients appear in results.

**Impact**: The test fixture creates a patient and starts an OPD visit, but searching for the patient by ID or name returns "No results found". This forced two workarounds:
1. For consultation/vitals tests: Navigate directly to the patient dashboard URL (`/bahmni/clinical/.../patient/{uuid}/dashboard`) bypassing the search page entirely
2. For search tests: Use an existing indexed patient from the Active tab instead of the newly created patient

**Fix**: No frontend fix needed — this is a backend Lucene indexing delay. Possible backend improvements:
- Trigger a synchronous index update after patient creation
- Or expose a REST endpoint to force-reindex a specific patient

---

## Challenge 4: Two different clinical UIs (React vs AngularJS)

**Problem**: The existing page objects in the test automation repo (`clinicalPage.ts`, `newConsultationPage.ts`) were written for the **new React clinical UI** at `/bahmni-new/clinical/`. However, the GCP-QA environment serves the **old AngularJS clinical UI** at `/bahmni/clinical/`. Navigating directly to the React URL shows an infinite "Loading clinical configuration..." spinner.

**Impact**: All existing React page objects were unusable. Had to create:
- `angularClinicalPage.ts` — new page object for the Angular dashboard
- `angularConsultationPage.ts` — new page object for the Angular consultation page
- `clinicalDirectFixture.ts` — new fixture that navigates directly via URL instead of search

**Fix**: This is an environment configuration difference, not a code bug. However, the automation repo should document which page objects work with which UI version, and ideally detect the environment type at runtime.

---

## Challenge 5: Observation form fields are environment-specific concept sets

**Problem**: The Observations tab renders environment-specific concept set forms (e.g., "Orthopaedic Plan", "CURE Lid Gap/Palate" on this environment) rather than standard vitals fields (Pulse, BP, Temperature). The fields are dynamically rendered by AngularJS directives with generated IDs (`{{observation.uniqueId}}`), making them impossible to target with static selectors.

**Impact**: Tests found "0 numeric input fields" on the observations tab because the environment's forms use dropdowns, text areas, and button-select widgets rather than numeric inputs. Tests can verify the form structure exists and save without errors, but can't fill specific vital sign values.

**Fix**: No code fix needed — this is expected behavior for a configurable EMR. The automation should be parameterized to handle different form configurations per environment. A `test-data/conceptSets.json` configuration file could map environment-specific form fields.

---

## Source Code Changes Summary

### Files changed in `openmrs-module-bahmniapps`:

1. **`ui/app/clinical/dashboard/views/clinicalDashboardHeader.html`**
   - Added `data-testid="save-consultation"` to Save button
   - Added `data-testid="open-consultation"` to Consultation link
   - Added `data-testid="print-dashboard"` to Print button
   - Added `data-testid="consultation-tab-{{$index}}"` to consultation tab items

2. **`ui/app/common/displaycontrols/dashboard/views/dashboardSection.html`**
   - Added `data-testid="dashboard-section-{{sectionName}}"` to dashboard section containers

3. **`ui/app/common/patient-search/views/patientsList.html`**
   - Added `data-testid="patient-search"` to search wrapper
   - Added `data-testid="search-tab-{{name}}"` to search tab items
   - Added `data-testid="patient-search-input"` to search input
   - Added `data-testid="patient-search-button"` to search button
   - Added `data-testid="patient-list-table"` to patient results table
   - Added `data-testid="patient-row-{{identifier}}"` to patient rows

4. **`ui/app/common/ui-helper/spinner.js`**
   - Added safety timeout (2 minutes) that auto-removes leaked spinner tokens to prevent the overlay from blocking the UI indefinitely
