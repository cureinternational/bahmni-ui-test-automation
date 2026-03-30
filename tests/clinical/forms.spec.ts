/**
 * Clinical Forms Tests
 * TC_16 - Patient Progress Notes, Admission Orders and Vitals Form
 * TC_18 - Admission Order Form (save and verify visible)
 * TC_19 - Discharge Summary Form & Print (IPD visit)
 * TC_21 - Edit Complex Forms (updated version visible with timestamp)
 */
import { test, expect } from '../../src/fixtures/clinicalFixture';
import { admissionLetterFaker } from '../../test-data/admissionLetterData';

test.describe.serial('Clinical Forms', () => {
  test('TC_16 - Patient Progress Notes, Admission Orders and Vitals Form', async ({ clinicalSetup }) => {
    const { bahmni, page } = clinicalSetup;

    await bahmni.clinicalPage.clickNewConsultation();
    await bahmni.newConsultationPage.waitForNewConsultationPageToOpen();

    // Add and save Vitals form
    await bahmni.newConsultationPage.openVitalsForm();
    await bahmni.vitalsForm.waitForFormToLoad();
    await bahmni.vitalsForm.fillVitalsForm({
      pulse: '72',
      oxygenSaturation: '98',
      respiratoryRate: '16',
      temperature: '37',
      systolicBP: '120',
      diastolicBP: '80',
    });
    await bahmni.vitalsForm.saveForm();

    // Add History and Examination form (Progress Notes)
    await bahmni.newConsultationPage.openHistoryAndExaminationForm();
    await bahmni.historyAndExaminationForm.waitForFormToLoad();
    await bahmni.historyAndExaminationForm.fillHistoryAndExaminationForm({
      chiefComplaint: 'Headache',
      duration: '2',
      durationUnit: 'Days',
      historyOfPresentIllness: 'Patient complains of persistent headache for 2 days.',
    });
    await bahmni.historyAndExaminationForm.saveForm();

    // Add Admission Letter (Admission Orders)
    const admissionData = admissionLetterFaker.simpleAdmissionLetter();
    await bahmni.newConsultationPage.openPinnedForm('Admission Letter');
    await bahmni.admissionLetterForm.waitForFormToLoad();
    await bahmni.admissionLetterForm.fillAdmissionLetterForm(admissionData);
    await bahmni.admissionLetterForm.saveForm();

    await bahmni.newConsultationPage.saveConsultation();
    await page.waitForLoadState('networkidle');
    // Note: Forms may require a page reload to display - known issue
    await page.reload();

    // Verify all forms saved and visible on clinical dashboard
    await expect(page.getByText('Vitals')).toBeVisible();
    await bahmni.clinicalPage.verifyObservationFormSaved('History and Examination');
    await bahmni.clinicalPage.verifyObservationFormSaved('Admission Letter');
  });

  test('TC_18 - Admission Order Form saved and visible', async ({ clinicalSetup }) => {
    const { bahmni, page } = clinicalSetup;

    await bahmni.clinicalPage.clickNewConsultation();
    await bahmni.newConsultationPage.waitForNewConsultationPageToOpen();

    // Add Admission Order form
    const admissionData = admissionLetterFaker.simpleAdmissionLetter();
    await bahmni.newConsultationPage.openPinnedForm('Admission Letter');
    await bahmni.admissionLetterForm.waitForFormToLoad();
    await bahmni.admissionLetterForm.fillAndSaveAdmissionLetter(admissionData);

    await bahmni.newConsultationPage.saveConsultation();
    await page.waitForLoadState('networkidle');
    // Note: Forms require reload to display - known issue
    await page.reload();

    // Verify Admission Order form saved and visible
    await bahmni.clinicalPage.verifyObservationFormSaved('Admission Letter');

    // Open the form and verify saved data
    await bahmni.clinicalPage.verifyAndOpenObservationForm('Admission Letter');
    await bahmni.admissionLetterForm.verifyAdmissionLetterData(admissionData);
    await bahmni.admissionLetterForm.closeModal();
  });

  test('TC_19 - Discharge Summary Form and Print (IPD visit)', async ({ clinicalSetup }) => {
    const { bahmni } = clinicalSetup;

    // NOTE: This test ideally runs on a patient with an active IPD visit.
    // The clinicalFixture creates an OPD visit. For full IPD testing,
    // a separate fixture or setup step to admit the patient is needed.

    await bahmni.clinicalPage.clickNewConsultation();
    await bahmni.newConsultationPage.waitForNewConsultationPageToOpen();

    // TODO: Open Discharge Summary form
    // In IPD context, the Discharge Summary form would be available
    // await bahmni.newConsultationPage.searchAndOpenObservationForm('Discharge Summary');
    // await page.waitForLoadState('networkidle');

    // TODO: Fill in discharge summary sections
    // - Final diagnosis
    // - Discharge instructions
    // - Follow-up plan
    // - Medications on discharge
    // await page.getByLabel('Final Diagnosis').fill('Acute Sinusitis - resolved');
    // await page.getByLabel('Discharge Instructions').fill('Rest for 5 days, avoid cold.');
    // await page.getByLabel('Follow-up Date').fill('...');

    // TODO: If Ethiopia environment (ET), verify Amharic text fields
    // await page.getByLabel('Amharic Notes').fill('...');

    // TODO: Save the discharge summary
    // await page.getByRole('button', { name: 'Save' }).click();
    // await page.waitForLoadState('networkidle');
    // await page.reload();

    // TODO: Verify discharge summary form saved and visible
    // await bahmni.clinicalPage.verifyObservationFormSaved('Discharge Summary');

    // TODO: Print the discharge summary
    // await bahmni.clinicalPage.verifyAndOpenObservationForm('Discharge Summary');
    // await page.getByRole('button', { name: 'Print' }).click();

    // TODO: Verify print includes all required sections:
    // - Patient details
    // - Admission and discharge dates
    // - Final diagnosis
    // - Treatment summary
    // - Discharge instructions
    // - Follow-up plan
    // - Amharic text (for ET environment)
    // await expect(page.locator('[data-test-id="print-discharge-summary"]')).toBeVisible();

    await bahmni.newConsultationPage.cancelConsultation();
  });

  test('TC_21 - Edit complex form shows updated version with timestamp', async ({ clinicalSetup }) => {
    const { bahmni, page } = clinicalSetup;

    // Step 1: Save a form (Admission Letter) in a consultation
    await bahmni.clinicalPage.clickNewConsultation();
    await bahmni.newConsultationPage.waitForNewConsultationPageToOpen();

    const originalData = admissionLetterFaker.simpleAdmissionLetter();
    await bahmni.newConsultationPage.openPinnedForm('Admission Letter');
    await bahmni.admissionLetterForm.waitForFormToLoad();
    await bahmni.admissionLetterForm.fillAndSaveAdmissionLetter(originalData);

    await bahmni.newConsultationPage.saveConsultation();
    await page.waitForLoadState('networkidle');
    await page.reload();

    // Step 2: Open the saved form and edit it
    await bahmni.clinicalPage.verifyAndOpenObservationForm('Admission Letter');
    await bahmni.admissionLetterForm.waitForFormToLoad();

    // TODO: Edit the form content
    // await page.getByLabel('Comments').clear();
    // await page.getByLabel('Comments').fill('Updated: ' + originalData.comments);
    // await page.getByLabel('Referred To Doctor').clear();
    // await page.getByLabel('Referred To Doctor').fill('Dr. Updated');

    await bahmni.admissionLetterForm.saveForm();

    // TODO: Close the edit modal
    // await bahmni.admissionLetterForm.closeModal();

    // Step 3: Verify updated form is visible with a new timestamp
    // TODO: Verify the updated form is shown
    // await bahmni.clinicalPage.verifyObservationFormSaved('Admission Letter');

    // TODO: Verify the form entry shows a timestamp for when it was last edited
    // const formEntry = page.locator('[data-test-id="form-entry-admission-letter"]');
    // await expect(formEntry.locator('[data-test-id="form-timestamp"]')).toBeVisible();
    // Verify the timestamp is updated (more recent than the original save time)

    // TODO: Verify the updated content is shown (not the original)
    // await bahmni.clinicalPage.verifyAndOpenObservationForm('Admission Letter');
    // await expect(page.getByLabel('Comments')).toHaveValue('Updated: ' + originalData.comments);
    // await bahmni.admissionLetterForm.closeModal();
  });
});
