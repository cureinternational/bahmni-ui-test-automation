/**
 * Inpatient Module Tests
 * TC_06 - Ward Nurse Dashboard search (by name / ID / bed / age)
 * TC_07 - View IPD Dashboard details (Vitals, Allergies, Diagnosis, Treatments, etc.)
 * TC_08 - Upload Consent Form to Patient Documents
 */
import { test, expect } from '@playwright/test';
import { PageFactory } from '../../src/pages/PageFactory';
import { config } from '../../src/config/env.config';
import { generatePatientData } from '../../test-data/patientData';

test.describe('Inpatient', () => {
  /**
   * TC_06 - Ward Nurse Dashboard search
   * Prerequisite: At least one patient admitted to a ward.
   */
  test('TC_06 - Ward Nurse Dashboard search', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const nurseUser = config.getUser('nurse');

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(nurseUser.username, nurseUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    // Navigate to Inpatient (Bed Management) module
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.BED_MANAGEMENT);
    await page.waitForLoadState('networkidle');

    // TODO: Select a ward from the ward list
    // await page.getByText('General Ward').click();
    // await page.waitForLoadState('networkidle');

    // TODO: Verify ward nurse dashboard is displayed
    // await expect(page.locator('[data-test-id="ward-dashboard"]')).toBeVisible();

    // Search by patient name
    // await page.getByPlaceholder('Search').fill('John');
    // await expect(page.locator('[data-test-id="patient-row"]')).toBeVisible();

    // Search by patient ID
    // await page.getByPlaceholder('Search').clear();
    // await page.getByPlaceholder('Search').fill('ABC200049');
    // await expect(page.locator('[data-test-id="patient-row"]')).toBeVisible();

    // Search by bed number
    // await page.getByPlaceholder('Search').clear();
    // await page.getByPlaceholder('Search').fill('Bed-1');
    // await expect(page.locator('[data-test-id="patient-row"]')).toBeVisible();

    // Search by age
    // await page.getByPlaceholder('Search').clear();
    // await page.getByPlaceholder('Search').fill('25');
    // await expect(page.locator('[data-test-id="patient-row"]')).toBeVisible();

    // TODO: Verify matching patients are returned for each search type
  });

  /**
   * TC_07 - View IPD Dashboard details
   * Prerequisite: Patient admitted with active IPD visit.
   */
  test('TC_07 - View IPD Dashboard details', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const doctorUser = config.getUser('doctor');

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(doctorUser.username, doctorUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    // Navigate to Clinical module
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.CLINICAL);
    await page.waitForLoadState('networkidle');

    // TODO: Select a patient with an active IPD visit
    // await bahmni.activePatientsPage.selectTab('active');
    // await bahmni.activePatientsPage.waitForPatientList();
    // await bahmni.activePatientsPage.selectPatientByName('IPD Test Patient');
    // await page.waitForLoadState('networkidle');

    // TODO: Click on the IPD tab on the patient dashboard
    // await page.getByRole('tab', { name: 'IPD' }).click();
    // await page.waitForLoadState('networkidle');

    // Verify all required IPD dashboard sections are present
    const ipdSections = [
      'Vitals and Nutritional Values',
      'Allergies',
      'Diagnosis',
      'Treatments',
      'Nursing Tasks',
      'Drug Chart',
      'Intake / Output',
      'Nutrition Advice',
      'Patient Feeding Record',
    ];

    // TODO: Verify each section is visible on the IPD dashboard
    // for (const section of ipdSections) {
    //   await expect(page.getByText(section)).toBeVisible();
    // }
  });

  /**
   * TC_08 - Upload Consent Form
   * Prerequisite: Patient with an active visit.
   */
  test('TC_08 - Upload Consent Form to patient documents', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const adminUser = config.getUser('admin');
    const patientData = generatePatientData();

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(adminUser.username, adminUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    // Create patient and start a visit
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
    const _patientId = await bahmni.createPatientPage.getPatientId();
    await bahmni.createPatientPage.saveAndStartOPDVisit();
    await page.waitForLoadState('networkidle');

    // Navigate to Patient Documents module
    await bahmni.createPatientPage.navigateToHomePage();
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.PATIENT_DOCUMENTS);
    await page.waitForLoadState('networkidle');

    // TODO: Search for the patient in Patient Documents
    // await page.getByPlaceholder('Search Patient').fill(patientId);
    // await page.getByText(patientData.firstName).click();
    // await page.waitForLoadState('networkidle');

    // TODO: Select "Consent Form" document type
    // await page.getByRole('button', { name: 'Upload Document' }).click();
    // await page.getByLabel('Document Type').selectOption('Consent Form');

    // TODO: Upload a PDF/image file
    // const fileInput = page.locator('input[type="file"]');
    // await fileInput.setInputFiles('test-data/sample-consent-form.pdf');

    // TODO: Save the uploaded document
    // await page.getByRole('button', { name: 'Save' }).click();
    // await page.waitForLoadState('networkidle');

    // TODO: Verify document is visible in the documents table
    // await expect(page.getByText('Consent Form')).toBeVisible();

    // TODO: Navigate to patient clinical dashboard and verify document visible in visit documents
    // await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.CLINICAL);
    // await bahmni.activePatientsPage.selectPatientById(patientId);
    // await page.getByText('Documents').click();
    // await expect(page.getByText('Consent Form')).toBeVisible();

    // TODO: Click the document and verify it opens in a new tab
    // const [docTab] = await Promise.all([
    //   page.context().waitForEvent('page'),
    //   page.getByText('Consent Form').click(),
    // ]);
    // await docTab.waitForLoadState('networkidle');
    // await expect(docTab).toHaveURL(/.*consent/);
    // await docTab.close();
  });
});
