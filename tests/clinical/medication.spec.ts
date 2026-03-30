/**
 * Medication Tests
 * TC_03 - Prescribe medication (print allowed only if weight & diagnosis exist)
 * TC_14 - Rule-based medication dosage (mg/kg auto-calculation)
 * TC_17 - Medication print (prescription includes all mandated fields)
 */
import { test, expect } from '../../src/fixtures/clinicalFixture';
import { medicationFaker } from '../../test-data/medicationData';
import { diagnosisFaker } from '../../test-data/diagnosisData';

test.describe.serial('Medication', () => {
  test('TC_03 - Prescribe medication (print gated by weight and diagnosis)', async ({
    clinicalSetup,
  }) => {
    const { bahmni, page } = clinicalSetup;

    // Open a new consultation
    await bahmni.clinicalPage.clickNewConsultation();
    await bahmni.newConsultationPage.waitForNewConsultationPageToOpen();

    // Add vitals (weight is mandatory for print)
    await bahmni.newConsultationPage.openVitalsForm();
    await bahmni.vitalsForm.waitForFormToLoad();
    // TODO: Fill weight field specifically (weight is required for medication print)
    // await page.getByLabel('Weight').fill('65');
    await bahmni.vitalsForm.saveForm();

    // Add a confirmed diagnosis
    const diagnosis = diagnosisFaker.diagnosis();
    await bahmni.newConsultationPage.addDiagnosis(diagnosis, 'Confirmed');
    await bahmni.newConsultationPage.saveDiagnosesAndConditions();

    // Open Medication tab and add medication
    const medication = medicationFaker.oralMedication();
    await bahmni.newConsultationPage.addMedication(medication);

    // TODO: Attempt to print prescription and verify it is allowed (weight + diagnosis present)
    // await page.getByRole('button', { name: 'Print' }).click();
    // await expect(page.locator('[data-test-id="print-prescription-modal"]')).toBeVisible();

    await bahmni.newConsultationPage.saveConsultation();
    await page.waitForLoadState('networkidle');

    // Verify medication visible in patient dashboard
    await bahmni.clinicalPage.verifyMedicationDisplayed(medication);
  });

  test('TC_03b - Print blocked when weight or diagnosis is missing', async ({ clinicalSetup }) => {
    const { bahmni, page } = clinicalSetup;

    await bahmni.clinicalPage.clickNewConsultation();
    await bahmni.newConsultationPage.waitForNewConsultationPageToOpen();

    // Add medication WITHOUT adding weight or diagnosis
    const medication = medicationFaker.oralMedication();
    await bahmni.newConsultationPage.addMedication(medication);

    // TODO: Attempt to print and verify it is blocked / shows an error
    // await page.getByRole('button', { name: 'Print' }).click();
    // await expect(page.getByText('Weight and diagnosis are required to print')).toBeVisible();

    await bahmni.newConsultationPage.cancelConsultation();
  });

  test('TC_14 - Rule-based medication dosage (mg/kg auto-calculation)', async ({
    clinicalSetup,
  }) => {
    const { bahmni, page } = clinicalSetup;

    await bahmni.clinicalPage.clickNewConsultation();
    await bahmni.newConsultationPage.waitForNewConsultationPageToOpen();

    // Ensure weight is captured (required for mg/kg rule)
    await bahmni.newConsultationPage.openVitalsForm();
    await bahmni.vitalsForm.waitForFormToLoad();
    // TODO: Fill patient weight
    // await page.getByLabel('Weight').fill('70');
    await bahmni.vitalsForm.saveForm();

    // Navigate to medication tab
    // TODO: Open medication section
    // await bahmni.newConsultationPage.searchAndOpenObservationForm('Medication');

    // TODO: Add medication and select mg/kg dosage rule
    // await page.getByPlaceholder('Search drug').fill('Paracetamol');
    // await page.getByText('Paracetamol').first().click();

    // TODO: Select mg/kg dosage rule
    // await page.getByLabel('Dosage Rule').selectOption('mg/kg');

    // TODO: Verify dosage is auto-calculated based on patient weight
    // const expectedDosage = 70 * 10; // 10 mg/kg example
    // await expect(page.getByLabel('Dosage')).toHaveValue(String(expectedDosage));

    // TODO: Verify the dosage unit field is disabled (locked after auto-calculation)
    // await expect(page.getByLabel('Dosage Unit')).toBeDisabled();

    await bahmni.newConsultationPage.saveConsultation();
    await page.waitForLoadState('networkidle');
  });

  test('TC_17 - Medication print includes all mandated fields', async ({ clinicalSetup }) => {
    const { bahmni, page, patientData } = clinicalSetup;

    await bahmni.clinicalPage.clickNewConsultation();
    await bahmni.newConsultationPage.waitForNewConsultationPageToOpen();

    // Add vitals (weight required)
    await bahmni.newConsultationPage.openVitalsForm();
    await bahmni.vitalsForm.waitForFormToLoad();
    // TODO: Fill weight
    // await page.getByLabel('Weight').fill('65');
    await bahmni.vitalsForm.saveForm();

    // Add diagnosis
    const diagnosis = diagnosisFaker.diagnosis();
    await bahmni.newConsultationPage.addDiagnosis(diagnosis, 'Confirmed');
    await bahmni.newConsultationPage.saveDiagnosesAndConditions();

    // Add medication
    const medication = medicationFaker.oralMedication();
    await bahmni.newConsultationPage.addMedication(medication);

    await bahmni.newConsultationPage.saveConsultation();
    await page.waitForLoadState('networkidle');

    // Re-open consultation and print prescription
    await bahmni.clinicalPage.clickNewConsultation();
    await bahmni.newConsultationPage.waitForNewConsultationPageToOpen();

    // TODO: Click Print on the medication section
    // await page.getByRole('button', { name: 'Print' }).click();

    // TODO: Verify print preview contains all mandated fields:
    // - Patient name
    // - Patient ID
    // - Date of prescription
    // - Medication name
    // - Dosage and frequency
    // - Duration
    // - Prescribing doctor name
    // await expect(page.getByText(patientData.firstName)).toBeVisible();
    // await expect(page.getByText(medication.name)).toBeVisible();
    // await expect(page.getByText(medication.dosage.toString())).toBeVisible();

    await bahmni.newConsultationPage.cancelConsultation();
  });
});
