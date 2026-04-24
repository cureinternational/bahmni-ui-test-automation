import { test as base, BrowserContext } from '@playwright/test';
import { PageFactory } from '../pages/PageFactory';
import { AngularClinicalPage } from '../pages/angularClinicalPage';
import { AngularConsultationPage } from '../pages/angularConsultationPage';
import { config } from '../config/env.config';
import { generatePatientData, PatientData } from '../../test-data/patientData';
import { Page } from '@playwright/test';

type SharedClinicalContext = {
  context: BrowserContext;
  page: Page;
  bahmni: PageFactory;
  angularClinical: AngularClinicalPage;
  angularConsultation: AngularConsultationPage;
  patientData: PatientData;
  patientId: string;
  patientUuid: string;
};

type ClinicalFixtures = {
  clinicalSetup: {
    bahmni: PageFactory;
    angularClinical: AngularClinicalPage;
    angularConsultation: AngularConsultationPage;
    patientData: PatientData;
    patientId: string;
    patientUuid: string;
    page: Page;
  };
};

type WorkerFixtures = {
  sharedClinicalContext: SharedClinicalContext;
};

/**
 * Navigate to the patient's AngularJS clinical dashboard
 */
async function navigateToPatientDashboard(page: Page, patientUuid: string) {
  const url = `${config.baseUrl}/bahmni/clinical/index.html#/default/patient/${patientUuid}/dashboard`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Wait for the dashboard to load - look for heading sections or the Print button
  await page
    .locator('button:has-text("Print")')
    .or(page.locator('h2:has-text("Allergies")'))
    .first()
    .waitFor({ state: 'visible', timeout: 60000 });
}

/**
 * Clinical test fixture using the old AngularJS clinical UI.
 * Creates a patient via UI, starts OPD visit, and navigates directly
 * to the patient's clinical dashboard URL.
 */
export const test = base.extend<ClinicalFixtures, WorkerFixtures>({
  sharedClinicalContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const bahmni = new PageFactory(page);
      const angularClinical = new AngularClinicalPage(page);
      const angularConsultation = new AngularConsultationPage(page);
      const adminUser = config.getUser('admin');

      // Login once
      await bahmni.loginPage.goto();
      await bahmni.loginPage.login(adminUser.username, adminUser.password);
      await bahmni.locationPage.selectLocation(config.defaults.location);

      let patientId: string;
      let patientUuid: string;
      let patientData: PatientData;

      const existingPatientUuid = process.env.TEST_PATIENT_UUID;

      if (existingPatientUuid) {
        console.log(`[fixture] Reusing patient UUID: ${existingPatientUuid}`);
        patientUuid = existingPatientUuid;
        patientId = process.env.TEST_PATIENT_ID || '';
        patientData = generatePatientData();
      } else {
        // Create a fresh patient via UI
        patientData = generatePatientData();
        await bahmni.homePage.navigateToModule(bahmni.homePage.MODULES.REGISTRATION_NEW);
        await bahmni.registrationSearchPage.clickCreateNewPatientBtn();

        await bahmni.createPatientPage.createPatient({
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          gender: patientData.gender,
          dateOfBirth: patientData.dateOfBirth,
          middleName: patientData.middleName,
        });

        await bahmni.createPatientPage.savePatient();
        await page.waitForURL(/.*\/patient\/[a-f0-9-]+/, { waitUntil: 'domcontentloaded', timeout: 45000 });

        // Extract UUID from registration URL
        const url = page.url();
        const uuidMatch = url.match(/patient\/([a-f0-9-]{36})/);
        patientUuid = uuidMatch ? uuidMatch[1] : '';

        patientId = await bahmni.createPatientPage.getPatientId();

        // Start OPD visit
        await bahmni.createPatientPage.saveAndStartOPDVisit();
        await page.waitForLoadState('networkidle');

        console.log(`[fixture] Created patient: ${patientId} (UUID: ${patientUuid})`);
      }

      // Navigate directly to the AngularJS clinical dashboard
      await navigateToPatientDashboard(page, patientUuid);

      await use({
        context,
        page,
        bahmni,
        angularClinical,
        angularConsultation,
        patientData,
        patientId,
        patientUuid,
      });

      await context.close();
    },
    { scope: 'worker' },
  ],

  clinicalSetup: async ({ sharedClinicalContext }, use) => {
    const { page, bahmni, angularClinical, angularConsultation, patientData, patientId, patientUuid } =
      sharedClinicalContext;

    // Ensure we're on the clinical dashboard (not in consultation)
    const currentUrl = page.url();
    const isOnDashboard = currentUrl.includes(`/patient/${patientUuid}/dashboard`);

    if (!isOnDashboard) {
      await navigateToPatientDashboard(page, patientUuid);
    }

    await use({
      bahmni,
      angularClinical,
      angularConsultation,
      patientData,
      patientId,
      patientUuid,
      page,
    });
  },
});

export { expect } from '@playwright/test';
