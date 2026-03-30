/**
 * Orders Module Tests
 * TC_12 - Radiology Order Ownership (radiologist claims ownership of an order)
 */
import { test, expect } from '@playwright/test';
import { PageFactory } from '../../src/pages/PageFactory';
import { config } from '../../src/config/env.config';
import { generatePatientData } from '../../test-data/patientData';
import { medicalFaker } from '../../test-data/investigationData';

test.describe('Radiology Orders', () => {
  test('TC_12 - Radiologist claims ownership of a radiology order', async ({ page }) => {
    const bahmni = new PageFactory(page);
    const adminUser = config.getUser('admin');
    const doctorUser = config.getUser('doctor');
    const patientData = generatePatientData();

    // Step 1: Create patient and start visit as doctor
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
    await bahmni.createPatientPage.saveAndStartOPDVisit();
    await page.waitForLoadState('networkidle');

    // Step 2: Navigate to Clinical and add a radiology investigation order
    await bahmni.createPatientPage.navigateToHomePage();
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.CLINICAL);
    await bahmni.activePatientsPage.selectTab('new-active');
    await bahmni.activePatientsPage.waitForPatientList();
    await bahmni.activePatientsPage.selectPatientById(patientId);
    await page.waitForLoadState('networkidle');

    await bahmni.clinicalPage.clickNewConsultation();
    await bahmni.newConsultationPage.waitForNewConsultationPageToOpen();

    // Add a radiology investigation
    const radiologyOrder = medicalFaker.investigation_radiology();
    await bahmni.newConsultationPage.addInvestigation(radiologyOrder);
    await bahmni.newConsultationPage.saveConsultation();
    await page.waitForLoadState('networkidle');

    // Step 3: Navigate to Orders module and claim ownership as radiologist
    await bahmni.createPatientPage.navigateToHomePage();
    await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.ORDERS);
    await page.waitForLoadState('networkidle');

    // TODO: Search for the patient's radiology order
    // await page.getByPlaceholder('Search Patient').fill(patientId);
    // OR navigate to radiology section
    // await page.getByText('Radiology').click();
    // await page.waitForLoadState('networkidle');

    // TODO: Locate the radiology order for the patient
    // await expect(page.getByText(radiologyOrder)).toBeVisible();
    // await expect(page.getByText(patientData.firstName)).toBeVisible();

    // TODO: Radiologist claims ownership of the order
    // await page.getByRole('button', { name: 'Claim' }).click();
    // OR
    // await page.locator('[data-test-id="claim-ownership-btn"]').click();
    // await page.waitForLoadState('networkidle');

    // TODO: Verify radiologist name is shown on the order after claiming
    // await expect(page.getByText(doctorUser.username)).toBeVisible();
    // OR look for the radiologist display name
    // await expect(page.locator('[data-test-id="order-owner"]')).toContainText('Radiologist Name');

    // TODO: Verify the order status updated to reflect ownership
    // await expect(page.locator('[data-test-id="order-status"]')).toContainText('In Progress');
  });
});
