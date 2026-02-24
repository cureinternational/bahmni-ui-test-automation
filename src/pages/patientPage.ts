import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

/**
 * Type for registered patient data
 */
export type RegisteredPatient = {
  firstName: string;
  lastName: string;
  fullName: string;
};

/**
 * PatientPage class for consolidated patient registration and management operations
 * Combines registration, search, and patient data operations
 */
export class PatientPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // --- CENTRALIZED SELECTORS ---
  private readonly selectors = {
    // Navigation & Home
    homeBtn: '.fa-home',
    registrationApp: 'text=Registration',

    // Registration - Main Actions
    createNewBtn: 'text=Create New',
    saveBtn: 'button:has-text("Save")',

    // Registration - Form Fields
    firstName: 'input[placeholder="First Name"]',
    middleName: 'input[placeholder="Middle Name"]',
    lastName: 'input[placeholder="Last Name"]',
    gender: 'select:has-text("Gender")',

    // Proximity Selectors
    age: 'input#ageYears',
    estimatedAge: 'input[type="checkbox"]',
    village: '//label[contains(text(), "Village")]/following::input[1]',
    phone: '//label[contains(text(), "Phone") or contains(text(), "Mobile")]/following::input[1]',

    // Visit Details
    startVisitBtn: 'text=Enter Visit Details',
    closeVisitBtn: 'button:has-text("Close Visit")',
    registrationFee: '//label[contains(text(), "Fee")]/following::input[1]',

    // Search
    searchInput: '#registrationNumber',
    searchButton: '.search-patient-btn',
    patientIdDisplay: '#patientIdentifierValue',

    // Sub-Modules / Tabs
    adtLink: 'text=Patient ADT',
    nutritionalLink: 'text=Nutritional Values',
    relationshipsLink: 'text=Relationships',
    registrationLocation: '//label[contains(text(), "Registration Location")]/following::select[1]',

    // Nutritional Form
    heightInput: '//label[contains(text(), "HEIGHT")]/following::input[1]',
    weightInput: '//label[contains(text(), "WEIGHT")]/following::input[1]',
    muacInput: '//label[contains(text(), "MUAC")]/following::input[1]',

    // Relationships
    addRelationBtn: 'text=Register New Person',
    selectPersonBtn: 'text=Select Person',
    relationType: '//h3[text()="Relationships"]/following::select[1]',
    relationNameInput: 'input[name="name"]',

    // Image Upload
    uploadPopupBtn: '[ng-click="launchPhotoUploadPopup()"]',
    fileInput: '.fileUpload',
    confirmPhotoBtn: 'button:has-text("Confirm Photo")',
  } as const;

  // --- ACTIONS (METHODS) ---

  /**
   * CONSOLIDATED REGISTRATION METHOD
   * Registers a patient, handles data generation, saves, and returns the patient data.
   * @param params - Registration parameters
   * @returns RegisteredPatient object with patient details
   */
  async registerNewPatient(
    params: {
      firstName?: string;
      lastName?: string;
      gender?: string;
      age?: string;
      startVisit?: boolean;
    } = {}
  ): Promise<RegisteredPatient> {
    // A. Generate Data
    const firstName = params.firstName || faker.person.firstName();
    const lastName = params.lastName || faker.person.lastName();
    const middleName = faker.person.middleName();
    const gender = params.gender || 'Male';
    const age = params.age || '30';

    console.log(`Registering: ${firstName} ${lastName}`);

    await this.page.locator(this.selectors.createNewBtn).click();

    // C. Fill Form
    await this.page.locator(this.selectors.firstName).fill(firstName);
    await this.page.locator(this.selectors.middleName).fill(middleName);
    await this.page.locator(this.selectors.lastName).fill(lastName);
    await this.page.locator(this.selectors.gender).selectOption({ label: gender });
    await this.page.locator(this.selectors.age).fill(age);
    await this.selectRegistrationLocation('CURE Ethiopia Hospital');

    // Check the CURE patient checkbox
    await this.page.getByRole('checkbox', { name: 'CURE patient' }).check();

    // Start OPD visit
    await this.startOpdVisit();

    // Return data object
    return {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
    };
  }

  /**
   * Navigate to Home
   */
  async navigateToHome() {
    await this.page.locator(this.selectors.homeBtn).click();
  }

  /**
   * Helper to navigate to Registration Module safely
   */
  async navigateToRegistration() {
    const home = this.page.locator(this.selectors.homeBtn);
    if (await home.isVisible()) {
      await home.click();
    }
    await this.page.locator(this.selectors.registrationApp).click();
  }

  /**
   * Starts a visit and enters registration fee
   */
  async startVisit() {
    const startBtn = this.page.locator(this.selectors.startVisitBtn);
    if (await startBtn.isVisible()) {
      await startBtn.click();

      const feeInput = this.page.locator(this.selectors.registrationFee);
      if (await feeInput.isVisible()) {
        await feeInput.fill('100');
      }
    }
  }

  /**
   * Closes the current visit handling the confirmation dialog
   */
  async closeVisit() {
    // Handle "Are you sure?" dialog
    this.page.once('dialog', async (dialog) => {
      console.log(`Accepting dialog: ${dialog.message()}`);
      await dialog.accept();
    });

    await this.page.locator(this.selectors.closeVisitBtn).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Searches for a patient using the patient ID
   * @param patientID - Patient identifier
   */
  async searchPatient(patientID: string) {
    await this.page.locator('#patientIdentifier').click();
    await this.page.locator('#patientIdentifier').fill(patientID);
    await this.page.keyboard.press('Enter');
    await this.page.getByText(patientID).click();
  }

  /**
   * Navigation Methods
   */
  async openPatientADT() {
    await this.page.locator(this.selectors.adtLink).click();
  }

  async openNutritionalValues() {
    await this.page.locator(this.selectors.nutritionalLink).click();
  }

  /**
   * Fills Nutritional Values
   */
  async enterNutritionalValues() {
    await this.openNutritionalValues();

    const height = faker.number.int({ min: 150, max: 190 }).toString();
    const weight = faker.number.int({ min: 50, max: 90 }).toString();
    const muac = '20';

    await this.page.locator(this.selectors.heightInput).fill(height);
    await this.page.locator(this.selectors.weightInput).fill(weight);
    await this.page.locator(this.selectors.muacInput).fill(muac);

    await this.page.locator(this.selectors.saveBtn).click();
  }

  /**
   * Adds a Relationship
   */
  async addRelationship() {
    await this.page.locator(this.selectors.relationshipsLink).click();

    // Select Relation Type (e.g., Parent)
    await this.page.locator(this.selectors.relationType).selectOption({ index: 1 });

    await this.page.locator(this.selectors.selectPersonBtn).click();
    await this.page.locator(this.selectors.addRelationBtn).click();

    // Fill Relation Popup Form (Assuming it opens a dialog)
    const relFirstName = faker.person.firstName();
    const relLastName = faker.person.lastName();

    await this.page.locator('input[name="firstName"]').fill(relFirstName);
    await this.page.locator('input[name="lastName"]').fill(relLastName);
    await this.page.locator('select[name="gender"]').selectOption({ label: 'Female' });
    await this.page.locator('input[name="birthdate"]').fill('01/01/1980');

    await this.page.locator('button:has-text("Register")').click();
  }

  /**
   * Uploads patient image
   * @param imagePath - Absolute path to the image file
   */
  async uploadPatientImage(imagePath: string) {
    await this.page.locator(this.selectors.uploadPopupBtn).click();

    // Playwright handles file input explicitly
    await this.page.locator(this.selectors.fileInput).setInputFiles(imagePath);

    await this.page.locator(this.selectors.confirmPhotoBtn).click();
  }

  /**
   * Select registration location from dropdown
   * @param locationName - Name of the location
   */
  async selectRegistrationLocation(locationName: string) {
    const dropdown = this.page.locator(this.selectors.registrationLocation);

    // Wait for visibility
    await dropdown.waitFor({ state: 'visible' });

    // Select the option by its text label
    await dropdown.selectOption({ label: locationName });

    console.log(`Selected Registration Location: ${locationName}`);
  }

  /**
   * Navigates to Clinical module from home page
   */
  async navigateToClinicalFromHome() {
    await this.page.getByRole('link', { name: ' Clinical' }).click();
  }

  /**
   * Clicks the 'Start OPD visit' button
   */
  async startOpdVisit() {
    await this.page.getByRole('button', { name: 'Start OPD visit' }).click();
  }

  /**
   * Search for a patient by name and return the patient ID from the result
   * @param firstName - Patient's first name
   * @param lastName - Patient's last name
   * @returns Patient ID or null if not found
   */
  async getPatientIdByName(firstName: string, lastName: string): Promise<string | null> {
    const searchName = `${firstName} ${lastName}`;

    // Click and fill the search box
    await this.page.getByRole('textbox', { name: 'Name Phone Number Zone' }).click();
    await this.page.getByRole('textbox', { name: 'Name Phone Number Zone' }).fill(searchName);
    await this.page.getByRole('textbox', { name: 'Name Phone Number Zone' }).press('Enter');

    // Click the Search button in the form
    await this.page.locator('form[name="searchByNameForm"]').getByRole('button', { name: 'Search' }).click();

    // Wait for results table to load with data rows
    await this.page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 30000 });

    // Get the first result row and extract patient ID from first cell
    const resultRow = this.page.locator('tbody tr').first();
    const patientIdCell = resultRow.locator('td').first();
    const patientID = await patientIdCell.innerText();

    return patientID.trim() || null;
  }
}
