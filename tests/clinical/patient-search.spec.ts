/**
 * Clinical Patient Search Tests
 * Flow 1 - Patient Search in Clinical Module (AngularJS UI)
 *
 * Tests cover:
 * - Active tab shows patients with active visits
 * - Search patient by ID using the "All" tab
 * - Verify clinical search page tabs structure
 * - Select patient from search and verify clinical dashboard loads
 * - Empty search results handling
 *
 * Note: Tests use existing patients from the Active tab for search tests because
 * newly created patients take time to be indexed by the Lucene search engine.
 */
import { test, expect } from '../../src/fixtures/clinicalDirectFixture';
import { config } from '../../src/config/env.config';

const CLINICAL_SEARCH_URL = `${config.baseUrl}/bahmni/clinical/index.html#/default/patient/search`;

test.describe.serial('Clinical - Patient Search', () => {
  let existingPatientId: string;

  test('TC_CS_01 - Active tab shows patients with active visits', async ({ clinicalSetup }) => {
    const { page } = clinicalSetup;

    await page.goto(CLINICAL_SEARCH_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for the search page to load - the Active tab loads by default
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 30000 });

    // Verify the patient table has rows (Active tab is selected by default)
    const tableRows = page.locator('table tbody tr');
    await tableRows.first().waitFor({ state: 'visible', timeout: 30000 });
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Store the first patient's ID for subsequent tests
    const firstIdCell = tableRows.first().locator('td').first();
    existingPatientId = (await firstIdCell.textContent())?.trim() || '';
    console.log(`Using existing patient for search tests: ${existingPatientId}`);
    expect(existingPatientId).toBeTruthy();
  });

  test('TC_CS_02 - Search patient by ID using All tab', async ({ clinicalSetup }) => {
    const { page } = clinicalSetup;

    expect(existingPatientId).toBeTruthy();

    // Navigate to search page first
    await page.goto(CLINICAL_SEARCH_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.locator('input[type="text"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Click All tab
    await page.locator('a:has-text("All")').click();
    await page.waitForLoadState('networkidle');

    // Fill search and click Search button
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.clear();
    await searchInput.fill(existingPatientId);
    await page.locator('button:has-text("Search")').click();
    await page.waitForLoadState('networkidle');

    // Verify patient with matching ID appears
    await expect(page.locator(`td:has-text("${existingPatientId}")`).first()).toBeVisible({ timeout: 15000 });
  });

  test('TC_CS_03 - Verify clinical search page tabs are displayed', async ({ clinicalSetup }) => {
    const { page } = clinicalSetup;

    await page.goto(CLINICAL_SEARCH_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.locator('input[type="text"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Verify key tabs exist using link text
    await expect(page.locator('a:has-text("All")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('a:has-text("Notifications")')).toBeVisible({ timeout: 5000 });

    // Verify the search input
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
  });

  test('TC_CS_04 - Select patient from search and verify clinical dashboard loads', async ({ clinicalSetup }) => {
    const { page, patientUuid } = clinicalSetup;

    expect(existingPatientId).toBeTruthy();

    // Navigate to search page and wait for overlay to clear
    await page.goto(CLINICAL_SEARCH_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.locator('input[type="text"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // The AngularJS overlay persists on this page and blocks pointer events.
    // Use dispatchEvent to bypass it.
    await page.locator('a:has-text("All")').dispatchEvent('click');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill(existingPatientId);
    await page.locator('button:has-text("Search")').dispatchEvent('click');
    await page.waitForLoadState('networkidle');

    // Click on the patient row using dispatchEvent
    const patientCell = page.locator(`td:has-text("${existingPatientId}")`).first();
    await patientCell.waitFor({ state: 'visible', timeout: 15000 });
    await patientCell.dispatchEvent('click');
    await page.waitForLoadState('networkidle');

    // Verify clinical dashboard loads
    await page.waitForURL(/.*patient\/.*/, { timeout: 15000 });
    await expect(page.locator('button:has-text("Print")').first()).toBeVisible({ timeout: 60000 });

    // Return to our test patient's dashboard
    await page.goto(
      `${config.baseUrl}/bahmni/clinical/index.html#/default/patient/${patientUuid}/dashboard`,
      { waitUntil: 'domcontentloaded', timeout: 60000 }
    );
    await page.locator('button:has-text("Print")').first().waitFor({ state: 'visible', timeout: 60000 });
  });

  test('TC_CS_05 - Search with no matching results shows No results found', async ({ clinicalSetup }) => {
    const { page, patientUuid } = clinicalSetup;

    await page.goto(CLINICAL_SEARCH_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.locator('input[type="text"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Click All tab (use dispatchEvent to bypass overlay)
    await page.locator('a:has-text("All")').dispatchEvent('click');
    await page.waitForLoadState('networkidle');

    // Search for a non-existent patient
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('ZZZZNONEXISTENT99999');
    await page.locator('button:has-text("Search")').dispatchEvent('click');
    await page.waitForLoadState('networkidle');

    // Verify "No results found" message is shown
    await expect(page.locator('text=No results found')).toBeVisible({ timeout: 10000 });

    // Return to dashboard
    await page.goto(
      `${config.baseUrl}/bahmni/clinical/index.html#/default/patient/${patientUuid}/dashboard`,
      { waitUntil: 'domcontentloaded', timeout: 60000 }
    );
    await page.locator('button:has-text("Print")').first().waitFor({ state: 'visible', timeout: 60000 });
  });
});
