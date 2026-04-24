/**
 * Clinical Start Consultation Tests
 * Flow 2 - Starting a new consultation in the Clinical Module (AngularJS UI)
 *
 * Tests cover:
 * - Start new consultation and verify page loads with Save button
 * - Verify consultation tabs are displayed (Observations, Diagnosis, Treatment, etc.)
 * - Verify patient info is displayed in consultation context
 * - Verify observation form sections load
 * - Save empty consultation succeeds
 * - Navigate back to dashboard after consultation
 */
import { test, expect } from '../../src/fixtures/clinicalDirectFixture';
import { config } from '../../src/config/env.config';

test.describe.serial('Clinical - Start Consultation', () => {
  test('TC_SC_01 - Start consultation and verify Save button is visible', async ({ clinicalSetup }) => {
    const { angularClinical, angularConsultation, page } = clinicalSetup;

    // Click Consultation button from dashboard
    await angularClinical.clickConsultation();
    await page.waitForLoadState('networkidle');

    // Verify the Save button is visible on the consultation page
    await angularConsultation.waitForConsultationPageToLoad();
    await expect(page.locator('button.save-consultation')).toBeVisible();
  });

  test('TC_SC_02 - Verify consultation tabs are displayed', async ({ clinicalSetup }) => {
    const { page } = clinicalSetup;

    // Verify core consultation tabs exist
    const coreTabNames = ['Observations', 'Diagnosis', 'Orders', 'Medications'];
    for (const tabName of coreTabNames) {
      await expect(page.locator(`.tab-item:has-text("${tabName}")`).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC_SC_03 - Verify patient info is displayed in consultation header', async ({ clinicalSetup }) => {
    const { page, patientId } = clinicalSetup;

    // The patient ID should be visible on the consultation page header
    await expect(page.locator(`text=${patientId}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_SC_04 - Navigate to Observations tab and verify form sections', async ({ clinicalSetup }) => {
    const { page } = clinicalSetup;

    // Click the Observations tab
    await page.locator('.tab-item:has-text("Observations")').first().click();
    await page.waitForLoadState('networkidle');

    // Verify form content loads (concept sets, labels, inputs)
    const formContent = page.locator(
      'label.control-label, .concept-set-group, .form-field-label, .obs-section, .concept-set, .leaf-observation-node'
    );
    await expect(formContent.first()).toBeVisible({ timeout: 15000 });
  });

  test('TC_SC_05 - Save empty consultation succeeds without errors', async ({ clinicalSetup }) => {
    const { angularConsultation, page } = clinicalSetup;

    // Save the consultation without entering any data
    await angularConsultation.saveConsultation();

    // Verify Save succeeded - the save button should still be visible (page stays on consultation)
    // and there should be no error messages
    const errorPopup = page.locator('.error-message, .message-container.error, .ngdialog-content:has-text("Error")');
    await expect(errorPopup).not.toBeVisible({ timeout: 5000 });

    // The Save button should still be visible (consultation page remains)
    await expect(page.locator('button.save-consultation')).toBeVisible({ timeout: 10000 });
  });

  test('TC_SC_06 - Navigate back to dashboard from consultation', async ({ clinicalSetup }) => {
    const { page, patientUuid } = clinicalSetup;

    // Navigate back to the dashboard using the URL
    await page.goto(
      `${config.baseUrl}/bahmni/clinical/index.html#/default/patient/${patientUuid}/dashboard`,
      { waitUntil: 'domcontentloaded', timeout: 60000 }
    );

    // Verify dashboard loads - Print button and Consultation link should be visible
    await expect(page.locator('button:has-text("Print")').first()).toBeVisible({ timeout: 60000 });
    await expect(page.locator('[ng-click="openConsultation()"]:visible').first()).toBeVisible({ timeout: 10000 });
  });
});
