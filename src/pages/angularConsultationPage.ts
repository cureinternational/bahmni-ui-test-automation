import { Page } from '@playwright/test';

/**
 * AngularConsultationPage - Page object for the old AngularJS consultation page
 * URL: /bahmni/clinical/index.html#/default/patient/{uuid}/dashboard/...
 */
export class AngularConsultationPage {
  private readonly page: Page;

  private readonly selectors = {
    // Save button
    saveButton: 'button.save-consultation, button.confirm.save-consultation',

    // Consultation tabs (in the header tab bar)
    observationsTab: '.tab-item:has-text("Observations")',
    diagnosisTab: '.tab-item:has-text("Diagnosis")',
    treatmentTab: '.tab-item:has-text("Treatment")',
    dispositionTab: '.tab-item:has-text("Disposition")',
    ordersTab: '.tab-item:has-text("Orders")',
    bacteriologyTab: '.tab-item:has-text("Bacteriology")',
    consultationTab: '.tab-item:has-text("Consultation")',

    // Back to dashboard link
    backLink: 'a[href*="patient/search"], .back-btn',

    // Observation form concept sets - these are collapsible sections
    conceptSetGroup: '.concept-set-group',
    conceptSetTitle: '.concept-set-title, .form-field-label',

    // Diagnosis section
    diagnosisSearchInput: '#diagnosis-search, input[ng-model*="diagnosisText"], .diagnosis input[type="text"]',

    // Treatment / medication section
    drugSearchInput: '#drug-name, input[ng-model*="drugName"], .treatment input[type="text"]',
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for the consultation page to load
   */
  async waitForConsultationPageToLoad() {
    await this.page.locator(this.selectors.saveButton).waitFor({ state: 'visible', timeout: 30000 });
  }

  /**
   * Click the Save button to save the consultation
   */
  async saveConsultation() {
    await this.page.locator(this.selectors.saveButton).click();
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    // After save, the page stays on the consultation - not auto-navigating to dashboard
  }

  /**
   * Check if we're still on the consultation page (Save button visible)
   */
  async isOnConsultationPage(): Promise<boolean> {
    return this.page.locator(this.selectors.saveButton).isVisible();
  }

  /**
   * Navigate to a consultation tab
   */
  async selectTab(tabName: string) {
    await this.page.locator(`.tab-item:has-text("${tabName}")`).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if a consultation tab is visible
   */
  async isTabVisible(tabName: string): Promise<boolean> {
    return this.page.locator(`.tab-item:has-text("${tabName}")`).isVisible();
  }

  /**
   * Get all visible consultation tab names
   */
  async getVisibleTabNames(): Promise<string[]> {
    const tabs = this.page.locator('.tab-item');
    const count = await tabs.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await tabs.nth(i).textContent();
      if (text?.trim()) names.push(text.trim());
    }
    return names;
  }

  /**
   * Fill a vitals/observation numeric field by its label text
   * In the old Angular UI, observation fields have labels and associated inputs
   */
  async fillObservationField(labelText: string, value: string) {
    // Find the label, then the associated input
    const container = this.page.locator(`label:has-text("${labelText}")`).locator('..').locator('..');
    const input = container.locator('input[type="number"], input[type="text"]').first();
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.clear();
    await input.fill(value);
  }

  /**
   * Select a button option in an observation field (e.g., body position)
   */
  async selectButtonOption(buttonText: string) {
    await this.page.locator(`button:has-text("${buttonText}")`).click();
  }

  /**
   * Open an observation form by clicking on it in the concept set group
   */
  async openObservationForm(formName: string) {
    const formHeader = this.page.locator(`text=${formName}`).first();
    await formHeader.waitFor({ state: 'visible', timeout: 10000 });
    await formHeader.click();
  }

  /**
   * Fill vitals form fields
   */
  async fillVitals(vitalsData: {
    pulse?: string;
    oxygenSaturation?: string;
    respiratoryRate?: string;
    temperature?: string;
    systolicBP?: string;
    diastolicBP?: string;
    bodyPosition?: string;
    weight?: string;
    height?: string;
  }) {
    if (vitalsData.pulse) await this.fillObservationField('Pulse', vitalsData.pulse);
    if (vitalsData.oxygenSaturation) await this.fillObservationField('SpO2', vitalsData.oxygenSaturation);
    if (vitalsData.respiratoryRate) await this.fillObservationField('Respiratory', vitalsData.respiratoryRate);
    if (vitalsData.temperature) await this.fillObservationField('Temperature', vitalsData.temperature);
    if (vitalsData.systolicBP) await this.fillObservationField('Systolic', vitalsData.systolicBP);
    if (vitalsData.diastolicBP) await this.fillObservationField('Diastolic', vitalsData.diastolicBP);
    if (vitalsData.weight) await this.fillObservationField('Weight', vitalsData.weight);
    if (vitalsData.height) await this.fillObservationField('Height', vitalsData.height);
    if (vitalsData.bodyPosition) await this.selectButtonOption(vitalsData.bodyPosition);
  }
}
