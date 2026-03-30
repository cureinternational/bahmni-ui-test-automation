/**
 * Operation Theatre (OT) Module Tests
 * TC_11 - Provider Calendar View (patient visible under correct provider)
 * TC_15 - Diagnosis in OT List View (all diagnoses shown correctly)
 * TC_20 - OT Module Enhancements (calendar details, scroll, no overlap)
 */
import { test, expect } from '@playwright/test';
import { PageFactory } from '../../src/pages/PageFactory';
import { config } from '../../src/config/env.config';
import { generatePatientData } from '../../test-data/patientData';
import { diagnosisFaker } from '../../test-data/diagnosisData';

test.describe('Operation Theatre', () => {
  /**
   * TC_11 - Provider Calendar View
   * Prerequisite: A surgical block must be created with a patient assigned to a provider.
   */
  test('TC_11 - Provider Calendar View shows patient under correct provider', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const adminUser = config.getUser('admin');
    const patientData = generatePatientData();

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(adminUser.username, adminUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    // Step 1: Create a patient with an active visit
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
    await bahmni.createPatientPage.saveAndStartOPDVisit();
    await page.waitForLoadState('networkidle');

    // Step 2: Navigate to Operation Theatre module
    await bahmni.createPatientPage.navigateToHomePage();
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.OPERATION_THEATRE);
    await page.waitForLoadState('networkidle');

    // TODO: Add patient to a surgery block
    // await page.getByRole('button', { name: 'New Block' }).click();
    // await page.getByLabel('Patient').fill(patientData.firstName);
    // await page.getByText(patientData.firstName).first().click();
    // await page.getByLabel('Provider').selectOption({ label: 'Dr. Smith' });
    // await page.getByLabel('Surgery Type').selectOption('Elective');
    // await page.getByLabel('OT').selectOption('OT-1');
    // await page.getByRole('button', { name: 'Save' }).click();
    // await page.waitForLoadState('networkidle');

    // Step 3: Switch to Provider view on the OT calendar
    // TODO: Click on "Provider" view toggle
    // await page.getByRole('button', { name: 'Provider' }).click();
    // await page.waitForLoadState('networkidle');

    // TODO: Verify patient is visible under the correct provider's calendar entry
    // await expect(page.getByText('Dr. Smith')).toBeVisible();
    // await expect(page.getByText(patientData.firstName)).toBeVisible();
    // Ensure the patient entry is listed under Dr. Smith's column, not another provider's
  });

  /**
   * TC_15 - Diagnosis in OT List View
   * Prerequisite: Patient with multiple diagnoses added in a consultation.
   */
  test('TC_15 - Diagnosis in OT List View shows all diagnoses', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const adminUser = config.getUser('admin');
    const patientData = generatePatientData();

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(adminUser.username, adminUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    // Create patient and start visit
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
    await bahmni.createPatientPage.saveAndStartOPDVisit();
    await page.waitForLoadState('networkidle');

    // Navigate to Clinical and add multiple diagnoses
    await bahmni.createPatientPage.navigateToHomePage();
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.CLINICAL);
    await bahmni.activePatientsPage.selectTab('new-active');
    await bahmni.activePatientsPage.waitForPatientList();
    await bahmni.activePatientsPage.selectPatientById(patientId);
    await page.waitForLoadState('networkidle');

    // Add multiple diagnoses in consultation
    await bahmni.clinicalPage.clickNewConsultation();
    await bahmni.newConsultationPage.waitForNewConsultationPageToOpen();

    const diagnosis1 = diagnosisFaker.diagnosis();
    const diagnosis2 = diagnosisFaker.diagnosis();
    await bahmni.newConsultationPage.addDiagnosis(diagnosis1, 'Confirmed');
    await bahmni.newConsultationPage.addDiagnosis(diagnosis2, 'Provisional');
    await bahmni.newConsultationPage.saveDiagnosesAndConditions();
    await bahmni.newConsultationPage.saveConsultation();
    await page.waitForLoadState('networkidle');

    // Navigate to OT module
    await bahmni.createPatientPage.navigateToHomePage();
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.OPERATION_THEATRE);
    await page.waitForLoadState('networkidle');

    // TODO: Switch to List View in OT module
    // await page.getByRole('button', { name: 'List' }).click();
    // await page.waitForLoadState('networkidle');

    // TODO: Search for the patient in the OT list
    // await page.getByPlaceholder('Search').fill(patientData.firstName);

    // TODO: Verify all diagnoses are shown in the OT list entry for the patient
    // await expect(page.getByText(diagnosis1)).toBeVisible();
    // await expect(page.getByText(diagnosis2)).toBeVisible();

    // TODO: Verify diagnoses are wrapped properly (no text overflow or truncation)
    // const diagnosisCell = page.locator('[data-test-id="diagnosis-cell"]');
    // await expect(diagnosisCell).toBeVisible();
    // const overflow = await diagnosisCell.evaluate(el =>
    //   window.getComputedStyle(el).overflow
    // );
    // expect(overflow).not.toBe('hidden');
  });

  /**
   * TC_20 - OT Module Enhancements
   * Prerequisite: At least one surgery scheduled in the OT calendar.
   */
  test('TC_20 - OT Module calendar details visible with scroll and no overlap', async ({
    page,
  }) => {
    const bahmni = new PageFactory(page);
    const adminUser = config.getUser('admin');

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(adminUser.username, adminUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    // Navigate to Operation Theatre module
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.OPERATION_THEATRE);
    await page.waitForLoadState('networkidle');

    // TODO: Verify OT calendar is displayed
    // await expect(page.locator('[data-test-id="ot-calendar"]')).toBeVisible();

    // TODO: Verify surgery details are visible on calendar entries
    // (patient name, time, surgery type, provider)
    // const calendarEntry = page.locator('[data-test-id="ot-calendar-entry"]').first();
    // await expect(calendarEntry).toBeVisible();
    // await expect(calendarEntry.locator('[data-test-id="patient-name"]')).toBeVisible();
    // await expect(calendarEntry.locator('[data-test-id="surgery-time"]')).toBeVisible();

    // TODO: Verify calendar is scrollable (horizontal/vertical)
    // const calendar = page.locator('[data-test-id="ot-calendar"]');
    // await calendar.evaluate(el => el.scrollTo({ left: 200 }));
    // Confirm the scroll happened without JS errors

    // TODO: Verify no visual overlap between calendar entries
    // (Each entry should have non-overlapping bounding boxes)
    // const entries = page.locator('[data-test-id="ot-calendar-entry"]');
    // const count = await entries.count();
    // for (let i = 0; i < count - 1; i++) {
    //   const box1 = await entries.nth(i).boundingBox();
    //   const box2 = await entries.nth(i + 1).boundingBox();
    //   if (box1 && box2) {
    //     expect(box1.y + box1.height).toBeLessThanOrEqualTo(box2.y);
    //   }
    // }
  });
});
