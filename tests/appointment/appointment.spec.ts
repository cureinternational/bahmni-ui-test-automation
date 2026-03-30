/**
 * Appointment Scheduling Tests
 * TC_04 - Schedule waitlisted appointment (when slots are full)
 * TC_05 - View Patient Visit Queue in "My Patients" after appointment creation
 */
import { test, expect } from '@playwright/test';
import { PageFactory } from '../../src/pages/PageFactory';
import { config } from '../../src/config/env.config';
import { generatePatientData } from '../../test-data/patientData';

test.describe('Appointment Scheduling', () => {
  test('TC_04 - Schedule waitlisted appointment when slots are full', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const receptionistUser = config.getUser('receptionist');
    const patientData = generatePatientData();

    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(receptionistUser.username, receptionistUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    // First create a patient to schedule appointment for
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

    // Navigate to Appointment Scheduling module
    await bahmni.createPatientPage.navigateToHomePage();
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.APPOINTMENT_SCHEDULING);
    await page.waitForLoadState('networkidle');

    // TODO: Search for the patient in appointment scheduling
    // await page.getByPlaceholder('Search Patient').fill(patientData.firstName);
    // await page.getByText(patientData.firstName + ' ' + patientData.lastName).click();

    // TODO: Attempt to schedule appointment for a fully-booked slot
    // await page.getByRole('button', { name: 'New Appointment' }).click();
    // await page.getByLabel('Service').selectOption('General OPD');
    // await page.getByLabel('Date').fill('...');  // Select a date with full slots
    // await page.getByLabel('Time').selectOption('...'); // Select a time slot that is full

    // TODO: System should indicate slot is full and offer waitlist option
    // await expect(page.getByText('Slot is full')).toBeVisible();
    // OR the Waitlist button becomes available

    // TODO: Select Waitlist option
    // await page.getByRole('button', { name: 'Waitlist' }).click();

    // TODO: Save the waitlisted appointment
    // await page.getByRole('button', { name: 'Save' }).click();
    // await page.waitForLoadState('networkidle');

    // TODO: Verify patient added to waitlist
    // await expect(page.getByText('Added to waitlist')).toBeVisible();
    // OR navigate to waitlist view and verify patient appears
    // await page.getByText('Waitlist').click();
    // await expect(page.getByText(patientData.firstName)).toBeVisible();
  });

  test('TC_05 - View patient visit queue in My Patients after appointment', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const adminUser = config.getUser('admin');
    const doctorUser = config.getUser('doctor');
    const patientData = generatePatientData();

    // Step 1: Admin creates a patient and schedules an appointment with specialty and provider
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
    const _patientId = await bahmni.createPatientPage.getPatientId();
    await bahmni.createPatientPage.saveAndStartOPDVisit();
    await page.waitForLoadState('networkidle');

    // Navigate to Appointment Scheduling
    await bahmni.createPatientPage.navigateToHomePage();
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.APPOINTMENT_SCHEDULING);
    await page.waitForLoadState('networkidle');

    // TODO: Create appointment with specialty and provider (doctor)
    // await page.getByRole('button', { name: 'New Appointment' }).click();
    // await page.getByPlaceholder('Search Patient').fill(patientData.firstName);
    // await page.getByText(patientData.firstName + ' ' + patientData.lastName).click();
    // await page.getByLabel('Service/Specialty').selectOption('Orthopedics');
    // await page.getByLabel('Provider').selectOption(doctorUser.username);
    // await page.getByRole('button', { name: 'Save' }).click();
    // await page.waitForLoadState('networkidle');

    // Step 2: Logout and login as the provider (doctor)
    await bahmni.homePage.logout();
    await bahmni.loginPage.login(doctorUser.username, doctorUser.password);
    await bahmni.locationPage.selectLocation(config.defaults.location);

    // Step 3: Open Clinical module and navigate to My Patients
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.CLINICAL);
    await page.waitForLoadState('networkidle');

    // TODO: Navigate to "My Patients" tab/queue
    // await bahmni.activePatientsPage.selectTab('my-patients');
    // OR
    // await page.getByRole('tab', { name: 'My Patients' }).click();
    // await page.waitForLoadState('networkidle');

    // TODO: Verify the patient appears in the My Patients queue
    // await expect(page.getByText(patientData.firstName)).toBeVisible();
    // await expect(page.getByText(patientId)).toBeVisible();
  });
});
