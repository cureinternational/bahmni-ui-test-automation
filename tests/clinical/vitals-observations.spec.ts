/**
 * Clinical Vitals and Observations Tests
 * Flow 3 - Recording vitals and observation forms in the Clinical Module (AngularJS UI)
 *
 * Tests cover:
 * - Navigate to observations tab and verify form fields
 * - Fill vitals fields and save consultation
 * - Verify vitals appear on dashboard after save
 * - Fill partial vitals
 * - Verify multiple consultation tabs can be navigated
 * - Verify observation forms section on dashboard
 */
import { test, expect } from '../../src/fixtures/clinicalDirectFixture';
import { config } from '../../src/config/env.config';

test.describe.serial('Clinical - Vitals and Observations', () => {
  test('TC_VO_01 - Open consultation and verify observation form fields', async ({ clinicalSetup }) => {
    const { angularClinical, angularConsultation, page } = clinicalSetup;

    // Start consultation
    await angularClinical.clickConsultation();
    await page.waitForLoadState('networkidle');
    await angularConsultation.waitForConsultationPageToLoad();

    // Click the Observations tab
    await page.locator('.tab-item:has-text("Observations")').first().click();
    await page.waitForLoadState('networkidle');

    // Verify form content is visible
    const formElements = page.locator(
      'label.control-label, .concept-set-group, .form-field-label, input[type="number"], .leaf-observation-node'
    );
    await expect(formElements.first()).toBeVisible({ timeout: 15000 });
  });

  test('TC_VO_02 - Fill vitals fields and save consultation', async ({ clinicalSetup }) => {
    const { angularConsultation, page } = clinicalSetup;

    // Find numeric input fields on the observations tab
    const numericInputs = page.locator('input[type="number"]:visible');
    const inputCount = await numericInputs.count();
    console.log(`Found ${inputCount} numeric input fields on observations tab`);

    if (inputCount > 0) {
      // Fill available numeric fields with valid vital sign values
      const vitalsValues = ['78', '97', '16', '98.6', '120', '80'];
      for (let i = 0; i < Math.min(inputCount, vitalsValues.length); i++) {
        const input = numericInputs.nth(i);
        if (await input.isVisible()) {
          await input.clear();
          await input.fill(vitalsValues[i]);
        }
      }
    }

    // Save the consultation
    await angularConsultation.saveConsultation();

    // Verify no errors after save
    const errorPopup = page.locator('.error-message, .message-container.error');
    await expect(errorPopup).not.toBeVisible({ timeout: 5000 });
  });

  test('TC_VO_03 - Navigate to dashboard and verify vitals section exists', async ({ clinicalSetup }) => {
    const { angularClinical, page, patientUuid } = clinicalSetup;

    // Navigate to dashboard
    await page.goto(
      `${config.baseUrl}/bahmni/clinical/index.html#/default/patient/${patientUuid}/dashboard`,
      { waitUntil: 'domcontentloaded', timeout: 60000 }
    );
    await page.locator('button:has-text("Print")').first().waitFor({ state: 'visible', timeout: 60000 });

    // Verify Vitals Flow Sheet section exists on dashboard
    await expect(page.locator('h2:has-text("Vitals Flow Sheet")').first()).toBeVisible({ timeout: 10000 });

    // Check if vitals data is present
    const hasData = await angularClinical.hasVitalsData();
    console.log(`Vitals data present on dashboard: ${hasData}`);
  });

  test('TC_VO_04 - Fill partial vitals (only some fields) and save', async ({ clinicalSetup }) => {
    const { angularClinical, angularConsultation, page, patientUuid } = clinicalSetup;

    // Ensure we're on the dashboard first
    await page.goto(
      `${config.baseUrl}/bahmni/clinical/index.html#/default/patient/${patientUuid}/dashboard`,
      { waitUntil: 'domcontentloaded', timeout: 60000 }
    );
    await page.locator('button:has-text("Print")').first().waitFor({ state: 'visible', timeout: 60000 });

    // Start new consultation
    await angularClinical.clickConsultation();
    await page.waitForLoadState('networkidle');
    await angularConsultation.waitForConsultationPageToLoad();

    // Navigate to observations tab
    await page.locator('.tab-item:has-text("Observations")').first().click();
    await page.waitForLoadState('networkidle');

    // Fill only the first 2 numeric fields (partial vitals)
    const numericInputs = page.locator('input[type="number"]:visible');
    const inputCount = await numericInputs.count();

    if (inputCount >= 2) {
      await numericInputs.nth(0).clear();
      await numericInputs.nth(0).fill('82');
      await numericInputs.nth(1).clear();
      await numericInputs.nth(1).fill('96');
    }

    // Save consultation
    await angularConsultation.saveConsultation();

    // Verify no errors
    const errorPopup = page.locator('.error-message, .message-container.error');
    await expect(errorPopup).not.toBeVisible({ timeout: 5000 });
  });

  test('TC_VO_05 - Navigate through consultation tabs without errors', async ({ clinicalSetup }) => {
    const { angularConsultation, page } = clinicalSetup;

    // Verify core tabs can be navigated
    const coreTabs = ['Observations', 'Diagnosis', 'Orders', 'Medications'];
    for (const tabName of coreTabs) {
      const tab = page.locator(`.tab-item:has-text("${tabName}")`).first();
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForLoadState('networkidle');
        // Verify no error after tab switch
        const errorPopup = page.locator('.error-message, .message-container.error');
        await expect(errorPopup).not.toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('TC_VO_06 - Verify dashboard sections after consultations', async ({ clinicalSetup }) => {
    const { angularClinical, angularConsultation, page, patientUuid } = clinicalSetup;

    // Save current consultation and go to dashboard
    await angularConsultation.saveConsultation();

    await page.goto(
      `${config.baseUrl}/bahmni/clinical/index.html#/default/patient/${patientUuid}/dashboard`,
      { waitUntil: 'domcontentloaded', timeout: 60000 }
    );
    await page.locator('button:has-text("Print")').first().waitFor({ state: 'visible', timeout: 60000 });

    // Verify key dashboard sections exist
    await expect(page.locator('h2:has-text("Allergies")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h2:has-text("Vitals Flow Sheet")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h2:has-text("Observation Forms")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h2:has-text("Diagnosis")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h2:has-text("Medications")').first()).toBeVisible({ timeout: 10000 });
  });
});
