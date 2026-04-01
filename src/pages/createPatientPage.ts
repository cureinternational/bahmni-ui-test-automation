import { Page, expect } from '@playwright/test';
import * as path from 'path';

/**
 * CreatePatientPage class for Bahmni create new patient page
 * URL: https://docker.standard.mybahmni.in/bahmni-new/registration/patient/new
 */
export class CreatePatientPage {
  private readonly page: Page;

  // Constants for gender options (public as they may be used in tests)
  readonly GENDER = {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
  } as const;

  // Constants for visit type options (public as they may be used in tests)
  readonly VISIT_TYPE = {
    EMERGENCY: 'Start EMERGENCY visit',
    IPD: 'Start IPD visit',
    SPECIAL_OPD: 'Start Special OPD visit',
    FOLLOW_UP: 'Start Follow Up visit',
  } as const;

  // Locator selectors
  private readonly selectors = {
    // Header elements
    homeLink: 'a:has-text("Home"), a[href*="dashboard"], a.home-btn, i.fa-home, [title="Home"]',
    searchPatientLink: 'a:has-text("Search Patient")',

    // Photo upload - No IDs available
    uploadPhotoButton: 'button:has-text("Upload photo")',
    capturePhotoButton: 'button:has-text("Capture photo")',

    // Patient ID format - Dynamic ID
    patientIdFormatDropdown: 'button[role="combobox"]:has-text("ABC")',

    // CURE patient checkbox
    curePatientCheckbox:
      'label:has-text("CURE patient") input, input[type="checkbox"][name="shouldGenerateIdentifier"]',

    // Basic information - Support both old and new registration UIs
    firstNameInput: '#first-name, input[placeholder="First Name"]',
    middleNameInput: '#middle-name, input[placeholder="Middle Name"]',
    lastNameInput: '#last-name, input[placeholder="Last Name"]',
    genderDropdown: 'select#gender',

    // Age fields - Support both old and new registration UIs
    yearsAgeInput: '#age-years, input[name="ageYears"]',
    monthsAgeInput: '#age-months, input[name="ageMonths"]',
    daysAgeInput: '#age-days, input[name="ageDays"]',

    // Date of birth - Support both old and new registration UIs
    dateOfBirthInput: '#date-of-birth, #birthdate',
    estimatedCheckbox: '#accuracy, input[name="birthdateEstimated"]',
    birthTimeInput: '#birth-time',

    // Address information
    houseNumberInput: '#address1',
    localitySectorInput: '#address2',
    cityVillageInput: '#cityVillage',
    pinCodeDropdown: '#postalCode',
    districtDropdown: '#countyDistrict',
    stateDropdown: '#stateProvince',

    // Contact information - Support both old and new registration UIs
    phoneNumberInput: 'input[placeholder="Phone number"], input[name="phonenumber"]',
    alternatePhoneInput: 'input[placeholder="Alternate phone number"]',

    // Additional information
    emailInput: 'input[placeholder="Email"], input[name="email"]',

    // Additional identifiers - Dynamic IDs with identifier prefix
    drivingLicenceInput: 'input[placeholder="Driving Licence"]',
    nationalIdInput: 'input[placeholder="National ID"]',
    passportInput: 'input[placeholder="Passport"]',

    // Relationships
    relationshipsSection: 'text=Relationships Information',
    addAnotherRelationshipButton: 'button:has-text("Add another")',
    relationshipTypeComboBox: '[data-testid="new-relationship-type-combobox"]',
    patientSearchComboBox: '[data-testid="new-relationship-patient-search-combobox"]',
    existingRelationshipType: '[data-testid="existing-relationship-type"]',
    existingRelationshipPatientLink: '[data-testid="existing-relationship-patient-link"]',

    // Action buttons
    saveButton: 'button:has-text("Save")',
    startOPDVisitButton: 'button:has-text("Start OPD visit")',
    visitTypeDropdown: 'button[role="combobox"]:has(img[alt="Open menu"])',
    backToSearchButton: 'button:has-text("Back to search patient")',
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Fill basic patient information
   * @param firstName - Patient's first name
   * @param lastName - Patient's last name
   * @param gender - Patient's gender
   * @param dateOfBirth - Date of birth in dd/mm/yyyy format
   * @param middleName - Optional middle name
   */
  async fillBasicInformation(
    firstName: string,
    lastName: string,
    gender: string,
    dateOfBirth: string,
    middleName?: string
  ) {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.locator(this.selectors.firstNameInput).fill(firstName);
    await this.page.locator(this.selectors.lastNameInput).fill(lastName);

    if (middleName) {
      await this.page.locator(this.selectors.middleNameInput).fill(middleName);
    }

    await this.selectGender(gender);
    // Convert dd/mm/yyyy → yyyy-mm-dd for HTML date input compatibility
    const [dd, mm, yyyy] = dateOfBirth.split('/');
    const isoDate = `${yyyy}-${mm}-${dd}`;
    await this.page.locator(this.selectors.dateOfBirthInput).fill(isoDate);
  }

  /**
   * Select gender from dropdown
   * @param gender - Gender to select
   */
  async selectGender(gender: string) {
    const selectElement = this.page.locator(this.selectors.genderDropdown);
    await selectElement.selectOption({ label: gender });
  }

  /**
   * Fill age in years, months, and days
   * @param years - Years
   * @param months - Months (optional)
   * @param days - Days (optional)
   * @param estimated - Whether age is estimated (optional)
   */
  async fillAge(years: number, months?: number, days?: number, estimated?: boolean) {
    await this.page.locator(this.selectors.yearsAgeInput).fill(years.toString());

    if (months !== undefined) {
      await this.page.locator(this.selectors.monthsAgeInput).fill(months.toString());
    }

    if (days !== undefined) {
      await this.page.locator(this.selectors.daysAgeInput).fill(days.toString());
    }

    if (estimated) {
      await this.page.locator(this.selectors.estimatedCheckbox).check();
    }
  }

  /**
   * Fill address information from bottom to top
   * @param address - Address object with fields
   */
  async fillAddressInformation(address: {
    state: string;
    district: string;
    pinCode: string;
    city: string;
    locality: string;
    houseNumber: string;
  }) {
    await this.page.locator('text=Address information').scrollIntoViewIfNeeded();

    await this.page.locator(this.selectors.stateDropdown).click();
    await this.page.locator(this.selectors.stateDropdown).fill(address.state);
    await this.page.getByRole('option', { name: address.state, exact: true }).click();

    await this.page.locator(this.selectors.districtDropdown).click();
    await this.page.locator(this.selectors.districtDropdown).fill(address.district);
    await this.page.locator(`li[role="option"]:has-text("${address.district}")`).first().click();

    await this.page.locator(this.selectors.pinCodeDropdown).click();
    await this.page.locator(this.selectors.pinCodeDropdown).fill(address.pinCode);
    await this.page.locator(`li[role="option"]:has-text("${address.pinCode}")`).first().click();

    await this.page.locator(this.selectors.cityVillageInput).fill(address.city);
    await this.page.locator(this.selectors.localitySectorInput).fill(address.locality);
    await this.page.locator(this.selectors.houseNumberInput).fill(address.houseNumber);
  }

  /**
   * Fill contact information
   * @param phoneNumber - Phone number
   * @param alternatePhone - Alternate phone number (optional)
   */
  async fillContactInformation(phoneNumber: string, alternatePhone?: string) {
    // Handle different label variants across environments
    const standardPhone = this.page.getByRole('textbox', { name: /^Phone number$/i });
    const guardianPhone = this.page.getByRole('textbox', { name: /Mobile Phone/i });

    if (await standardPhone.isVisible()) {
      await standardPhone.fill(phoneNumber);
    } else if (await guardianPhone.isVisible()) {
      await guardianPhone.fill(phoneNumber);
    }

    if (alternatePhone) {
      await this.page.getByRole('textbox', { name: /Alternate phone/i }).fill(alternatePhone);
    }
  }

  /**
   * Select registration location (required in some environments)
   * @param location - Location name to select
   */
  async selectRegistrationLocation(location: string) {
    const locationDropdown = this.page.locator('select[name="registrationLocation"], #registrationLocation');
    if (await locationDropdown.isVisible()) {
      await locationDropdown.selectOption(location);
    }
  }

  /**
   * Fill email address
   * @param email - Email address
   */
  async fillEmail(email: string) {
    await this.page.getByRole('textbox', { name: /Email/i }).fill(email);
  }

  /**
   * Upload patient photo
   * @param photoName - Name of photo file in test-data folder
   */
  async uploadPhoto(photoName: string) {
    const photoPath = path.join(__dirname, '..', '..', 'test-data', photoName);
    await this.page.locator(this.selectors.uploadPhotoButton).click();
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.waitFor({ state: 'attached' });
    await this.page.setInputFiles('input[type="file"]', photoPath);
    const confirmButton = this.page.getByRole('button', { name: /confirm/i });
    await confirmButton.waitFor({ state: 'visible' });
    await confirmButton.click();
  }

  /**
   * Add relationship for patient
   * @param relationshipType - Type of relationship (e.g., "Father/ Son", "Husband/ Wife")
   * @param relatedPersonName - Name of the related person to search for
   */
  async addRelationshipForPatient(relationshipType: string, relatedPersonName: string) {
    // Scroll to relationships section
    await this.page.locator(this.selectors.relationshipsSection).scrollIntoViewIfNeeded();

    // Click relationship type combobox
    await this.page.locator(this.selectors.relationshipTypeComboBox).click();

    // Search and select relationship type
    await this.page.keyboard.type(relationshipType);
    const relationshipOption = this.page.getByRole('option', { name: relationshipType });
    await relationshipOption.waitFor({ state: 'visible', timeout: 5000 });
    await relationshipOption.click();

    // Click patient search combobox
    await this.page.locator(this.selectors.patientSearchComboBox).click();

    // Search and select patient
    await this.page.keyboard.type(relatedPersonName);
    const patientOption = this.page.getByRole('option').first();
    await patientOption.waitFor({ state: 'visible', timeout: 5000 });
    await patientOption.click();
  }

  /**
   * Fill additional identifiers
   * @param identifiers - Object containing identifier fields
   */
  async fillAdditionalIdentifiers(identifiers: { drivingLicence: string; nationalId: string; passport: string }) {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.locator(this.selectors.drivingLicenceInput).waitFor({ state: 'visible' });
    await this.page.locator(this.selectors.drivingLicenceInput).fill(identifiers.drivingLicence);
    await this.page.locator(this.selectors.nationalIdInput).fill(identifiers.nationalId);
    await this.page.locator(this.selectors.passportInput).fill(identifiers.passport);
  }

  async navigateToHomePage() {
    await this.page.locator(this.selectors.homeLink).click();
  }

  /**
   * Complete patient registration flow
   * @param patientData - Object containing all patient information
   */
  async createPatient(patientData: {
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    middleName?: string;
    phoneNumber?: string;
    email?: string;
    registrationLocation?: string;
  }) {
    // Check CURE patient checkbox (required for patient to appear in Clinical module)
    const cureCheckbox = this.page.locator(this.selectors.curePatientCheckbox).first();
    await cureCheckbox.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await cureCheckbox.isVisible().catch(() => false)) {
      await cureCheckbox.check();
    }

    await this.fillBasicInformation(
      patientData.firstName,
      patientData.lastName,
      patientData.gender,
      patientData.dateOfBirth,
      patientData.middleName
    );

    if (patientData.phoneNumber) {
      await this.fillContactInformation(patientData.phoneNumber);
    }

    if (patientData.email) {
      await this.fillEmail(patientData.email);
    }

    // Fill registration location if provided or if the field is required
    const locationToUse = patientData.registrationLocation ?? process.env.DEFAULT_LOCATION;
    if (locationToUse) {
      await this.selectRegistrationLocation(locationToUse);
    }
  }

  /**
   * Verify basic patient information
   * @param patientData - Patient data to verify
   */
  async verifyBasicInformation(patientData: {
    firstName: string;
    middleName?: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
  }) {
    await expect(this.page.locator(this.selectors.firstNameInput)).toHaveValue(patientData.firstName);
    if (patientData.middleName) {
      await expect(this.page.locator(this.selectors.middleNameInput)).toHaveValue(patientData.middleName);
    }
    await expect(this.page.locator(this.selectors.lastNameInput)).toHaveValue(patientData.lastName);
    await expect(this.page.getByRole('combobox', { name: /gender/i })).toContainText(patientData.gender);
    await expect(this.page.locator(this.selectors.dateOfBirthInput)).toHaveValue(patientData.dateOfBirth);
  }

  /**
   * Verify contact information
   * @param phoneNumber - Phone number to verify
   * @param email - Email to verify
   */
  async verifyContactInformation(phoneNumber: string, email: string) {
    await expect(this.page.getByRole('textbox', { name: /^Phone number$/i })).toHaveValue(phoneNumber);
    await expect(this.page.getByRole('textbox', { name: /Email/i })).toHaveValue(email);
  }

  /**
   * Verify address information
   * @param address - Address object to verify
   */
  async verifyAddressInformation(address: {
    houseNumber: string;
    locality: string;
    city: string;
    pinCode: string;
    district: string;
    state: string;
  }) {
    await this.page.locator('text=Address information').scrollIntoViewIfNeeded();
    await expect(this.page.locator(this.selectors.houseNumberInput)).toHaveValue(address.houseNumber);
    await expect(this.page.locator(this.selectors.localitySectorInput)).toHaveValue(address.locality);
    await expect(this.page.locator(this.selectors.cityVillageInput)).toHaveValue(address.city);
    await expect(this.page.locator(this.selectors.pinCodeDropdown)).toHaveValue(address.pinCode);
    await expect(this.page.locator(this.selectors.districtDropdown)).toHaveValue(address.district);
    await expect(this.page.locator(this.selectors.stateDropdown)).toHaveValue(address.state);
  }

  /**
   * Verify relationship
   * @param relationshipType - Expected relationship type
   * @param patientName - Expected patient name
   */
  async verifyRelationship(relationshipType: string, patientName: string) {
    await this.page.locator(this.selectors.relationshipsSection).scrollIntoViewIfNeeded();
    await expect(this.page.locator(this.selectors.existingRelationshipType)).toHaveText(relationshipType);
    await expect(this.page.locator(this.selectors.existingRelationshipPatientLink)).toHaveText(patientName);
  }

  /**
   * Click on the patient link in relationships section
   * Opens patient record in a new tab and switches to it
   * @returns New CreatePatientPage instance for the opened tab
   */
  async clickPatientLink() {
    // Wait for new page to open when clicking the link
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.locator(this.selectors.existingRelationshipPatientLink).click(),
    ]);

    // Wait for the new page to load
    await newPage.waitForLoadState('domcontentloaded');

    // Return new page instance for the opened tab
    return new CreatePatientPage(newPage);
  }

  /**
   * Click search patient link
   */
  async clickSearchPatient() {
    await this.page.locator(this.selectors.searchPatientLink).click();
  }

  /**
   * Save the patient
   */
  async savePatient() {
    await this.page.locator(this.selectors.saveButton).click();
    // Wait for the save to complete (spinner disappears or page settles)
    await this.page.waitForLoadState('networkidle', { timeout: 45000 });
  }

  /**
   * Get the generated patient ID after saving
   * @returns Patient ID string
   */
  async getPatientId(): Promise<string> {
    // Scroll to top where patient ID is displayed
    await this.page.evaluate(() => window.scrollTo(0, 0));
    // Wait for the generated patient ID to appear - supports both display formats:
    //  - New UI:  "Patient ID : ABC200049"
    //  - Legacy:  "Identification Number: ET75475"
    const patientIdLocator = this.page
      .locator('text=/Identification Number[:\\s]+[A-Z]{2,6}\\d+/i')
      .or(this.page.locator('text=/Patient ID\\s*[:\\-]\\s*[A-Z]{2,6}\\d+/i'));
    await patientIdLocator.first().waitFor({ timeout: 15000 });
    const patientIdText = await patientIdLocator.first().textContent();
    const match = patientIdText?.match(/[A-Z]{2,6}\d+/i);
    return match ? match[0] : '';
  }

  /**
   * Save and start OPD visit
   */
  async saveAndStartOPDVisit() {
    await this.page.locator(this.selectors.startOPDVisitButton).click();
  }

  /**
   * Select visit type from dropdown and start visit
   * @param visitType - Visit type to select
   */
  async selectVisitTypeAndStart(visitType: string) {
    await this.page.locator(this.selectors.visitTypeDropdown).click();
    await this.page.locator(`li[role="option"]:has-text("${visitType}")`).click();
  }

  /**
   * Go back to search patient page
   */
  async backToSearch() {
    await this.page.locator(this.selectors.backToSearchButton).click();
  }
}
