/**
 * Triage Module Tests
 * TC_02 - View triage form (Doctor navigates to pre-patient triage queue)
 * TC_22 - Update triage stage & outcome
 */
import { test } from '@playwright/test';
import { PageFactory } from '../../src/pages/PageFactory';
import { config } from '../../src/config/env.config';

test.describe('Triage', () => {
  /**
   * Prerequisite: A pre-patient must exist in the triage queue.
   * Run TC_01 or TC_09 first, or ensure a pre-patient is enrolled in Pre-patient Triage program.
   */
  test('TC_02 - View triage form', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const doctorUser = config.getUser('doctor');

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(doctorUser.username, doctorUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    // Navigate to Programs module which contains the Pre-patient Triage queue
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.PROGRAMS);
    await page.waitForLoadState('networkidle');

    // TODO: Navigate to the Pre-patient Triage queue
    // The triage queue is typically accessible from Programs or a dedicated Triage module
    // await page.getByText('Pre-patient Triage').click();
    // await page.waitForLoadState('networkidle');

    // TODO: Verify the triage queue is visible with patient records
    // await expect(page.locator('[data-test-id="triage-queue"]')).toBeVisible();

    // TODO: Open a patient record from the triage queue
    // const firstPatient = page.locator('[data-test-id="triage-patient-row"]').first();
    // const [triageTab] = await Promise.all([
    //   page.context().waitForEvent('page'),
    //   firstPatient.click(),
    // ]);
    // await triageTab.waitForLoadState('networkidle');

    // TODO: Verify triage form is displayed on new tab
    // await expect(triageTab.locator('[data-test-id="triage-form"]')).toBeVisible();
    // await triageTab.close();
  });

  test('TC_22 - Update triage stage and outcome', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const doctorUser = config.getUser('doctor');

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(doctorUser.username, doctorUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    // Navigate to Programs (Triage queue)
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.PROGRAMS);
    await page.waitForLoadState('networkidle');

    // TODO: Open the triage form for a patient in the queue
    // await page.getByText('Pre-patient Triage').click();
    // const firstPatient = page.locator('[data-test-id="triage-patient-row"]').first();
    // await firstPatient.click();
    // await page.waitForLoadState('networkidle');

    // TODO: Select clinic type from the triage form
    // await page.getByLabel('Clinic Type').selectOption('General');

    // TODO: Select speciality
    // await page.getByLabel('Speciality').selectOption('Orthopedics');

    // TODO: Select specific doctor
    // await page.getByLabel('Doctor').selectOption({ label: 'Dr. Smith' });

    // TODO: Enter notes
    // await page.getByLabel('Notes').fill('Patient presents with acute pain in left knee.');

    // Save triage form
    // await page.getByRole('button', { name: 'Save' }).click();
    // await page.waitForLoadState('networkidle');

    // TODO: Verify triage outcome updated and workflow advanced
    // await expect(page.getByText('Triage saved successfully')).toBeVisible();
    // Verify patient moved to appropriate queue/stage based on triage outcome
    // await expect(page.locator('[data-test-id="triage-status"]')).toContainText('Triaged');
  });
});
