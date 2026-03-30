/**
 * Lab Entry Module Tests
 * TC_23 - Upload a Lab report (Haemoglobin test)
 */
import { test, expect } from '@playwright/test';
import { PageFactory } from '../../src/pages/PageFactory';
import { config } from '../../src/config/env.config';
import { generatePatientData } from '../../test-data/patientData';

test.describe('Lab Entry', () => {
  test('TC_23 - Upload a Lab report', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const adminUser = config.getUser('admin');
    const patientData = generatePatientData();

    // Step 1: Create a patient with an active visit (prerequisite for lab orders)
    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(adminUser.username, adminUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

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
    await bahmni.createPatientPage.saveAndStartOPDVisit();
    await page.waitForLoadState('networkidle');

    // Step 2: Navigate to Lab Entry module
    await bahmni.createPatientPage.navigateToHomePage();
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.LAB_ENTRY);
    await page.waitForLoadState('networkidle');

    // Step 3: Search for the patient
    // TODO: Search for the patient in the Lab Entry module
    // await page.getByPlaceholder('Search Patient').fill(patientId);
    // OR by name
    // await page.getByPlaceholder('Search').fill(patientData.firstName);
    // await page.getByText(patientData.firstName + ' ' + patientData.lastName).click();
    // await page.waitForLoadState('networkidle');

    // Step 4: Click "Upload Report +" button
    // TODO: Click the Upload Report button
    // await page.getByRole('button', { name: 'Upload Report +' }).click();
    // await page.waitForLoadState('networkidle');

    // Step 5: Select the available test "Haemoglobin"
    // TODO: Select Haemoglobin test from the available tests list
    // await page.getByText('Haemoglobin').click();
    // OR from a dropdown
    // await page.getByLabel('Test').selectOption('Haemoglobin');

    // Step 6: Upload a file/document (report file)
    // TODO: Upload the lab report file
    // const fileInput = page.locator('input[type="file"]');
    // await fileInput.setInputFiles('test-data/sample-lab-report.pdf');

    // Step 7: Fill 'Report Date' field
    // TODO: Fill in the report date
    // const today = new Date().toLocaleDateString('en-GB'); // dd/mm/yyyy format
    // await page.getByLabel('Report Date').fill(today);

    // Step 8: Fill 'Requested By' field
    // TODO: Fill in the requesting doctor
    // await page.getByLabel('Requested By').fill('Dr. Smith');
    // OR select from dropdown
    // await page.getByLabel('Requested By').selectOption({ label: 'Dr. Smith' });

    // Step 9: Save and Upload
    // TODO: Click Save/Upload button
    // await page.getByRole('button', { name: 'Save' }).click();
    // await page.waitForLoadState('networkidle');

    // Verify lab report upload was successful
    // TODO: Verify success message
    // await expect(page.getByText('Report uploaded successfully')).toBeVisible();

    // TODO: Verify report is visible in the reports table
    // await expect(page.getByText('Haemoglobin')).toBeVisible();
    // await expect(page.locator('[data-test-id="lab-report-row"]')).toBeVisible();

    // Verify selecting the report opens it in a new tab
    // TODO: Click on the report and verify it opens in a new tab
    // const [reportTab] = await Promise.all([
    //   page.context().waitForEvent('page'),
    //   page.getByText('Haemoglobin').click(),
    // ]);
    // await reportTab.waitForLoadState('networkidle');
    // await expect(reportTab).toHaveURL(/.*report/);
    // await reportTab.close();
  });
});
