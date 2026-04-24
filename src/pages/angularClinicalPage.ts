import { Page } from '@playwright/test';

/**
 * AngularClinicalPage - Page object for the old AngularJS clinical dashboard
 * URL: /bahmni/clinical/index.html#/default/patient/{uuid}/dashboard
 */
export class AngularClinicalPage {
  private readonly page: Page;

  private readonly selectors = {
    // Top header actions
    consultationButton: 'a:has-text("Consultation"), .btn-consultation, [id*="consultation"]',
    consultationLink: 'text=Consultation',
    printButton: 'button:has-text("Print")',

    // Dashboard tabs
    generalTab: 'text=General',
    preSurgeryTrackerTab: 'text=Pre-Surgery Tracker',
    addTabButton: 'text=+',

    // Patient info
    patientName: '.patient-information .patient-name, .patient-name',
    patientId: '.patient-information .patient-id',

    // Dashboard section headings (h2 elements)
    allergiesHeading: 'h2:has-text("Allergies")',
    diagnosisHeading: 'h2:has-text("Diagnosis")',
    conditionsHeading: 'h2:has-text("Conditions")',
    vitalsFlowSheetHeading: 'h2:has-text("Vitals Flow Sheet")',
    observationFormsHeading: 'h2:has-text("Observation Forms")',
    medicationsHeading: 'h2:has-text("Medications")',
    labResultsHeading: 'h2:has-text("Lab Results")',
    dispositionHeading: 'h2:has-text("Disposition")',
    programsHeading: 'h2:has-text("Programs")',
    visitsHeading: 'h2:has-text("Visits")',
    appointmentsHeading: 'h2:has-text("Appointments")',
    admissionDetailsHeading: 'h2:has-text("Admission Details")',
    radiologyOrdersHeading: 'h2:has-text("Radiology Orders")',

    // Sidebar navigation links
    homeDashboardLink: 'text=Home Dashboard',
    registrationLink: 'text=Registration',
    labEntryLink: 'text=Lab Entry',
    addDiagnosisLink: 'text=Add Diagnosis',
    patientQueueLink: 'text=Patient Queue',
    bahmniHomeLink: 'text=Bahmni Home',
    logoutLink: 'text=Logout',

    // Search in sidebar
    searchPatientInput: 'input[placeholder*="Search Patient"]',
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for the clinical dashboard to fully load
   */
  async waitForDashboardToLoad() {
    // Wait for the Print button or a dashboard section heading
    await this.page
      .locator('button:has-text("Print")')
      .or(this.page.locator('h2:has-text("Allergies")'))
      .first()
      .waitFor({ state: 'visible', timeout: 60000 });
  }

  /**
   * Click the Consultation button to start/open a consultation
   */
  async clickConsultation() {
    // Multiple "Consultation" elements exist (hidden button + visible link + sidebar link).
    // Use the ng-click attribute to target the right ones, then pick the visible one.
    const consultationEl = this.page.locator('[ng-click="openConsultation()"]:visible').first();
    await consultationEl.waitFor({ state: 'visible', timeout: 10000 });
    await consultationEl.click();
  }

  /**
   * Check if a section heading is visible
   */
  async isSectionVisible(sectionName: string): Promise<boolean> {
    return this.page.locator(`h2:has-text("${sectionName}")`).isVisible();
  }

  /**
   * Get patient name from the dashboard header
   */
  async getPatientDisplayInfo(): Promise<string> {
    const patientInfo = this.page.locator('table').first().locator('td').first();
    return (await patientInfo.textContent())?.trim() || '';
  }

  /**
   * Navigate to a dashboard tab
   */
  async selectDashboardTab(tabName: string) {
    await this.page.locator(`text=${tabName}`).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click a sidebar navigation link
   */
  async navigateToSidebarLink(linkName: string) {
    await this.page.locator(`text=${linkName}`).click();
  }

  /**
   * Get text content of a dashboard section
   */
  async getSectionContent(sectionName: string): Promise<string> {
    // Find the section container that has the heading, then get its text
    const section = this.page.locator(`h2:has-text("${sectionName}")`).locator('..');
    return (await section.textContent())?.trim() || '';
  }

  /**
   * Check if vitals data is present on the dashboard
   */
  async hasVitalsData(): Promise<boolean> {
    const vitalsSection = this.page.locator('h2:has-text("Vitals Flow Sheet")').locator('..');
    const content = await vitalsSection.textContent();
    return !content?.includes('No data captured');
  }

  /**
   * Check if observation forms are present
   */
  async hasObservationForms(): Promise<boolean> {
    const formsSection = this.page.locator('h2:has-text("Observation Forms")').locator('..');
    const content = await formsSection.textContent();
    return !content?.includes('No Form found');
  }
}
