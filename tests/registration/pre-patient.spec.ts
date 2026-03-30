/**
 * Pre-Patient Registration Tests
 * TC_01 - Register new pre-patient
 * TC_10 - Pre-patient attribute configuration (without CURE checkbox)
 * TC_13 - CUREKid icon configuration
 */
import { test, expect } from '@playwright/test';
import { PageFactory } from '../../src/pages/PageFactory';
import { config } from '../../src/config/env.config';
import { generatePatientData } from '../../test-data/patientData';

test.describe('Pre-Patient Registration', () => {
  test('TC_01 - Register new pre-patient', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const receptionistUser = config.getUser('receptionist');
    const patientData = generatePatientData();

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(receptionistUser.username, receptionistUser.password);
    await bahmni.locationPage.selectLocation('Registration Desk');

    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.REGISTRATION_NEW);
    await bahmni.registrationSearchPage.clickCreateNewPatientBtn();

    // Fill mandatory fields: Name, DOB/Age, Gender, Phone, Zone
    await bahmni.createPatientPage.createPatient({
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      gender: patientData.gender,
      dateOfBirth: patientData.dateOfBirth,
      phoneNumber: patientData.phoneNumber,
    });

    // Fill address (Zone field)
    await bahmni.createPatientPage.fillAddressInformation(patientData.address);

    // Fill optional fields
    await bahmni.createPatientPage.fillEmail(patientData.email);

    await bahmni.createPatientPage.savePatient();

    // Verify pre-patient registered and ID generated
    await expect(page).toHaveURL(/.*\/patient\/[a-f0-9-]+/);
    const patientId = await bahmni.createPatientPage.getPatientId();
    expect(patientId).toBeTruthy();
  });

  test('TC_10 - Pre-patient attribute configuration without CURE checkbox', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const receptionistUser = config.getUser('receptionist');
    const patientData = generatePatientData();

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(receptionistUser.username, receptionistUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.REGISTRATION_NEW);
    await bahmni.registrationSearchPage.clickCreateNewPatientBtn();

    await bahmni.createPatientPage.createPatient({
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      gender: patientData.gender,
      dateOfBirth: patientData.dateOfBirth,
    });

    // TODO: Ensure CURE patient checkbox is NOT checked (pre-patient configuration)
    // await page.getByLabel('CURE Patient').uncheck();

    await bahmni.createPatientPage.savePatient();

    await expect(page).toHaveURL(/.*\/patient\/[a-f0-9-]+/);
    const patientId = await bahmni.createPatientPage.getPatientId();
    expect(patientId).toBeTruthy();

    // Verify pre-patient appears in Programs module
    await bahmni.createPatientPage.navigateToHomePage();
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.PROGRAMS);
    // TODO: Search for patient and verify they appear in Programs
    // await page.getByPlaceholder('Search').fill(patientData.firstName);
    // await expect(page.getByText(patientData.firstName)).toBeVisible();

    // Verify pre-patient appears in Appointment Scheduling module
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.APPOINTMENT_SCHEDULING);
    // TODO: Search for patient and verify they appear in Appointments
    // await page.getByPlaceholder('Search patient').fill(patientData.firstName);
    // await expect(page.getByText(patientData.firstName)).toBeVisible();
  });

  test('TC_13 - CUREKid icon configuration', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const receptionistUser = config.getUser('receptionist');
    const patientData = generatePatientData();

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(receptionistUser.username, receptionistUser.password);
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

    // TODO: Check the CUREKid attribute/checkbox during registration
    // await page.getByLabel('CUREKid').check();

    await bahmni.createPatientPage.savePatient();
    const patientId = await bahmni.createPatientPage.getPatientId();
    expect(patientId).toBeTruthy();

    // Start OPD visit to make patient visible in clinical queues
    await bahmni.createPatientPage.saveAndStartOPDVisit();
    await page.waitForLoadState('networkidle');

    // Navigate to Clinical module and verify CUREKid icon in patient queue
    await bahmni.createPatientPage.navigateToHomePage();
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.CLINICAL);
    await bahmni.activePatientsPage.waitForPatientList();

    // TODO: Verify CUREKid icon is visible in the patient queue without overlapping other elements
    // await expect(page.locator('[data-test-id="curekid-icon"]')).toBeVisible();
    // await expect(page.locator('[data-test-id="curekid-icon"]')).not.toHaveClass(/overlap/);

    // Open patient and verify CUREKid icon on dashboard
    await bahmni.activePatientsPage.selectPatientById(patientId);
    await page.waitForLoadState('networkidle');

    // TODO: Verify CUREKid icon visible on patient clinical dashboard without overlap
    // await expect(page.locator('[data-test-id="curekid-icon"]')).toBeVisible();
  });
});
