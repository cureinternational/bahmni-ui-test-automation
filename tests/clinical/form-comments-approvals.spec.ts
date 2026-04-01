/**
 * Form Comments & Approvals Tests
 * Story: As a provider, I want to see the comment panel and buttons
 *        so that I can add comments and approve forms.
 *
 * Flow (verified from actual UI):
 *   1. Login as superman, navigate to Clinical, search for patient
 *   2. Navigate to observations page, click "Add New Obs Form" → search input
 *   3. Type "admission order form", select "Admission Order Form" from dropdown
 *   4. Fill mandatory fields (Procedure, Allergies check), click Save
 *   5. Click patient name (Back to Dashboard) to return to dashboard
 *   6. In "Observation Forms" section, click the date hyperlink next to form name
 *   7. Modal opens: form data, Actions table, Approve & Comment buttons
 *   8. Comment: opens "Add Comment" section with textarea + Save/Cancel
 *   9. Approve: opens "Confirmation" with "Do you want to proceed?" + Submit/Cancel
 */
import { test, expect, Page } from '@playwright/test';
import { PageFactory } from '../../src/pages/PageFactory';
import { config } from '../../src/config/env.config';

test.describe.serial('Form Comments and Approvals', () => {
  let patientId: string;

  /** Helper: login as superman, navigate to Clinical, search for patient */
  async function loginAndNavigateToPatient(page: Page): Promise<PageFactory> {
    const bahmni = new PageFactory(page);
    const pid = patientId;

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(config.users.admin.username, config.users.admin.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    await page.goto(config.urls.clinicalSearch);
    await page.waitForLoadState('networkidle');
    await bahmni.patientPage.searchPatient(pid);

    return bahmni;
  }

  /** Helper: on patient dashboard, click the date link in "Observation Forms" to open modal */
  async function openObsFormModal(page: Page) {
    // Scroll to "Observation Forms" section
    const obsFormsHeading = page.locator('h2:has-text("Observation Forms")').first();
    await obsFormsHeading.scrollIntoViewIfNeeded();

    // Click the date hyperlink (e.g. "01 Apr 2026 11:48 am") next to Admission Order Form
    const obsFormsSection = obsFormsHeading.locator('..');
    await obsFormsSection.locator('a').first().click();

    // Wait for the modal to appear — detected by the Approve button becoming visible
    await page.locator('button:has-text("Approve")').waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Setup: Register or reuse patient, add Admission Order Form, fill, save, return to dashboard.
   */
  test('Setup - Register patient, fill form, return to dashboard', async ({ page }) => {
    const bahmni = new PageFactory(page);

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(config.users.admin.username, config.users.admin.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    await bahmni.patientPage.navigateToRegistration();
    const registeredPatient = await bahmni.patientPage.registerNewPatient();
    await page.waitForLoadState('domcontentloaded');

    const foundId = await bahmni.patientPage.getPatientIdByName(
      registeredPatient.firstName,
      registeredPatient.lastName
    );
    if (!foundId) throw new Error('Patient ID not found after registration');
    patientId = foundId;
    console.log(`[Setup] Created patient: ${patientId}`);

    await bahmni.patientPage.navigateToHome();
    await bahmni.patientPage.navigateToClinicalFromHome();
    await page.waitForLoadState('domcontentloaded');
    await bahmni.patientPage.searchPatient(patientId);

    // Navigate to observations page via URL
    const dashboardUrl = page.url().split('?')[0];
    await page.goto(dashboardUrl + '/concept-set-group/observations');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Click "Add New Obs Form" — opens a search input
    await page.locator('#template-control-panel-button').dispatchEvent('click');
    await page.waitForTimeout(1000);

    // Type form name in the search input
    const searchInput = page.locator('input[type="text"]').last();
    await searchInput.fill('admission order form');
    await page.waitForTimeout(1000);

    // Click "Admission Order Form" from the dropdown — use dispatchEvent to bypass #overlay
    await page.locator('#Admission_Order_Form').dispatchEvent('click');
    await page.waitForTimeout(2000);

    // Fill mandatory: Procedure textarea
    await page.locator('textarea').first().fill('Test procedure');

    // Fill mandatory: Allergies check — dispatchEvent to bypass #overlay
    await page.locator('button[id="Yes, allergies recorded"]').dispatchEvent('click');

    // Click green "Save" button at top right — dispatchEvent to bypass #overlay
    await page.locator('button:has-text("Save")').first().dispatchEvent('click');
    await page.waitForTimeout(3000);

    // Navigate back to patient dashboard via direct URL
    await page.goto(dashboardUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Verify form appears in "Observation Forms" section on the dashboard
    await expect(page.locator('h2:has-text("Observation Forms")').first()).toBeVisible({ timeout: 10000 });
  });

  /**
   * TC_COMMENT_01 - Form view modal shows Approve & Comment buttons, and Actions table
   */
  test('TC_COMMENT_01 - Modal displays Approve, Comment buttons and Actions table', async ({ page }) => {
    await loginAndNavigateToPatient(page);
    await openObsFormModal(page);

    // Verify modal title
    await expect(page.locator('text=Admission Order Form').first()).toBeVisible();

    // Verify form data is displayed read-only
    await expect(page.locator('text=Procedure')).toBeVisible();

    // Verify Approve and Comment buttons at the bottom
    await expect(page.locator('button:has-text("Approve")')).toBeVisible();
    await expect(page.locator('button:has-text("Comment")')).toBeVisible();

    // Verify Actions table with headers
    await expect(page.locator('th:has-text("Action")')).toBeVisible();
    await expect(page.locator('th:has-text("Date & Time")')).toBeVisible();
    await expect(page.locator('th:has-text("Provider")')).toBeVisible();
    await expect(page.locator('th:has-text("Comments")')).toBeVisible();

    // Verify the Creation action row exists
    await expect(page.locator('td:has-text("Creation")')).toBeVisible();

    // Close modal via X button
    await page.locator('[class*="close"]').first().click();
  });

  /**
   * TC_COMMENT_02 - Clicking Comment opens "Add Comment" section with textarea
   */
  test('TC_COMMENT_02 - Clicking Comment opens Add Comment section', async ({ page }) => {
    await loginAndNavigateToPatient(page);
    await openObsFormModal(page);

    // Click Comment button
    await page.locator('button:has-text("Comment")').click();

    // Verify "Add Comment" heading appears
    await expect(page.locator('text=Add Comment')).toBeVisible();

    // Verify textarea with placeholder is visible
    await expect(page.locator('textarea[placeholder*="256"]')).toBeVisible();

    // Verify Cancel and Save buttons appear
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Save")')).toBeVisible();

    // Click Cancel to close
    await page.locator('button:has-text("Cancel")').click();
  });

  /**
   * TC_COMMENT_03 - Submit a comment and verify it appears in Actions table
   */
  test('TC_COMMENT_03 - Submitting a comment adds it to Actions table', async ({ page }) => {
    await loginAndNavigateToPatient(page);
    await openObsFormModal(page);

    // Click Comment button
    await page.locator('button:has-text("Comment")').click();
    await expect(page.locator('text=Add Comment')).toBeVisible();

    // Fill comment text
    const commentText = 'Patient is stable for admission';
    await page.locator('textarea[placeholder*="256"]').fill(commentText);

    // Click Save (in the Add Comment section)
    await page.locator('button:has-text("Save")').last().click();
    await page.waitForTimeout(3000);

    // Verify success message
    await expect(page.locator('text=Comment added successfully!')).toBeVisible({ timeout: 10000 });

    // Verify comment row appears in Actions table
    await expect(page.locator('td:has-text("Comment")')).toBeVisible();
    await expect(page.locator(`td:has-text("${commentText}")`)).toBeVisible();

    // Close modal
    await page.locator('[class*="close"]').first().click();
  });

  /**
   * TC_COMMENT_04 - Comment entry shows provider name
   */
  test('TC_COMMENT_04 - Comment shows provider name in Actions table', async ({ page }) => {
    await loginAndNavigateToPatient(page);
    await openObsFormModal(page);

    // Verify the Actions table shows the provider "superman"
    await expect(page.locator('td:has-text("superman")')).toBeVisible();

    // Close modal
    await page.locator('[class*="close"]').first().click();
  });

  /**
   * TC_APPROVE_01 - Clicking Approve shows confirmation, submitting shows success on dashboard
   */
  test('TC_APPROVE_01 - Approve flow: confirmation dialog then success message', async ({ page }) => {
    await loginAndNavigateToPatient(page);
    await openObsFormModal(page);

    // Click Approve button
    await page.locator('button:has-text("Approve")').click();

    // Verify confirmation section appears
    await expect(page.locator('text=Confirmation')).toBeVisible();
    await expect(page.locator('text=Do you want to proceed with approving this form?')).toBeVisible();
    await expect(page.locator('button:has-text("Submit")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();

    // Click Submit to approve
    await page.locator('button:has-text("Submit")').click();

    // Modal closes and success banner appears on dashboard
    await expect(page.locator('text=Admission Order Form approved successfully')).toBeVisible({
      timeout: 10000,
    });
  });
});
