/**
 * End-to-End Flow Test
 * Demonstrates complete workflow: Login -> Register Patient -> Select Patient Across Modules
 * This replicates typical Gauge spec scenarios
 */
import { test } from '@playwright/test';
import { PageFactory } from '../../src/pages/PageFactory';
import { config } from '../../src/config/env.config';

test.describe('Complete Patient Management Flow', () => {
  test('gk', { tag: ['@gk', '@smoke', '@critical'] }, async ({ page }) => {
    console.log('Starting patient management flow test');

    const bahmni = new PageFactory(page);
    const adminUser = config.getUser('admin');

    // Login
    await bahmni.loginPage.goto();
    await bahmni.loginPage.login(adminUser.username, adminUser.password);
    await bahmni.locationPage.selectLocation('CURE Ethiopia Hospital');

    // Navigate to Registration and register patient
    // await bahmni.patientPage.navigateToHome();
    await bahmni.patientPage.navigateToRegistration();
    const registeredPatient = await bahmni.patientPage.registerNewPatient();

    // Get patient ID
    const patientID = await bahmni.patientPage.getPatientIdByName(
      registeredPatient.firstName,
      registeredPatient.lastName
    );

    // Navigate to Clinical module and search for patient
    await bahmni.patientPage.navigateToHome();
    await bahmni.patientPage.navigateToClinicalFromHome();

    if (patientID) {
      await bahmni.patientPage.searchPatient(patientID);
      console.log(`Successfully found and opened patient: ${patientID}`);
    } else {
      throw new Error('Patient ID not found');
    }
  });
});
