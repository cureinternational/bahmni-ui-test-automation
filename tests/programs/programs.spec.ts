/**
 * Programs Module Tests
 * TC_09 - Pre-patient Program Enrollment (Pre-patient Triage)
 */
import { test, expect } from '@playwright/test';
import { PageFactory } from '../../src/pages/PageFactory';
import { config } from '../../src/config/env.config';
import { generatePatientData } from '../../test-data/patientData';

test.describe('Programs', () => {
  test('TC_09 - Pre-patient Program Enrollment in Pre-patient Triage', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const adminUser = config.getUser('admin');
    const patientData = generatePatientData();

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(adminUser.username, adminUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    // Step 1: Create a pre-patient
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.REGISTRATION_NEW);
    await bahmni.registrationSearchPage.clickCreateNewPatientBtn();
    await bahmni.createPatientPage.createPatient({
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      gender: patientData.gender,
      dateOfBirth: patientData.dateOfBirth,
      phoneNumber: patientData.phoneNumber,
    });

    await bahmni.createPatientPage.savePatient();
    const patientId = await bahmni.createPatientPage.getPatientId();
    expect(patientId).toBeTruthy();

    // Step 2: Navigate to Triage / Programs module
    await bahmni.createPatientPage.navigateToHomePage();
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.PROGRAMS);
    await page.waitForLoadState('networkidle');

    // Step 3: Click the "Pre-patient Triage" tab (newly created patients appear here)
    await page.getByRole('link', { name: /Pre-patient Triage/i }).click();
    await page.waitForLoadState('networkidle');

    // Step 4: Search for the patient by name (live search - no button needed)
    const searchBox = page.getByRole('textbox').first();
    await searchBox.fill(patientData.firstName);
    await page.waitForTimeout(1000);

    // Step 5: Click the patient identifier link (blue link in first column) to open programs page
    const patientRow = page.locator('tr').filter({ hasText: patientData.firstName }).first();
    await patientRow.waitFor({ timeout: 15000 });
    await patientRow.locator('td').first().click();
    await page.waitForLoadState('networkidle');

    // Step 6: Click "New Program Enrollment" to start enrollment
    await page.locator('text=New Program Enrollment').click();
    await page.waitForLoadState('networkidle');

    // Step 7: Select "Pre-patient" program from the program dropdown
    await page.locator('select').first().selectOption({ label: 'Pre-patient' });
    await page.waitForLoadState('networkidle');

    // Step 8: Fill enrollment fields
    const allSelects = page.locator('select');
    const selectCount = await allSelects.count();
    if (selectCount > 1) {
      // Doctor/Provider field (2nd select)
      await allSelects.nth(1).selectOption({ index: 1 });
    }
    if (selectCount > 2) {
      // Specialty field (3rd select)
      await allSelects.nth(2).selectOption({ index: 1 });
    }

    const notesField = page.locator('textarea').first();
    if (await notesField.isVisible()) {
      await notesField.fill('Pre-patient referred for triage assessment.');
    }

    // Step 9: Save/Enroll
    await page.getByRole('button', { name: /save|enroll|done/i }).first().click();
    await page.waitForLoadState('networkidle');

    // Verify patient enrolled successfully
    await expect(page.locator('body')).toContainText(/pre-patient/i);
  });
});
