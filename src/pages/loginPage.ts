import { Page } from '@playwright/test';
import { config } from '../config/env.config';
import { CatoAuthPage } from './catoAuthPage';

/**
 * LoginPage class for Bahmni EMR login page
 */
export class LoginPage {
  private readonly page: Page;
  private readonly catoAuth: CatoAuthPage;

  // Constants for locale options
  readonly LOCALE_OPTIONS = {
    ENGLISH: 'string:en',
    SPANISH: 'string:es',
    FRENCH: 'string:fr',
    ITALIAN: 'string:it',
    PORTUGUESE: 'string:pt_BR',
    CHINESE: 'string:zh',
    HINDI: 'string:hi',
  } as const;

  // Locator selectors
  private readonly selectors = {
    usernameInput: '#username',
    passwordInput: '#password',
    localeDropdown: '#locale',
    loginButton: 'button[type="submit"]',
    pageTitle: 'text=BAHMNI EMR LOGIN',
    helpLink: 'a[href*="bahmni.atlassian.net"]',
  } as const;

  constructor(page: Page) {
    this.page = page;
    this.catoAuth = new CatoAuthPage(page);
  }

  /**
   * Navigate to the login page
   * Handles Cato authentication if credentials are configured
   */
  async goto() {
    // Authenticate with Cato if required (QA environment)
    await this.catoAuth.authenticateIfNeeded();

    // Navigate to login page
    await this.page.goto(config.urls.login, { waitUntil: 'domcontentloaded', timeout: 15000 });
  }

  /**
   * Perform complete login action
   * @param username - Username to login with
   * @param password - Password to login with
   * @param locale - Optional locale selection (defaults to English)
   */
  async login(username: string, password: string, locale?: string) {
    if (locale) {
      await this.page.locator(this.selectors.localeDropdown).selectOption(locale);
    }
    await this.page.locator(this.selectors.usernameInput).fill(username);
    await this.page.locator(this.selectors.passwordInput).fill(password);
    await this.page.locator(this.selectors.loginButton).first().click();
    await this.page.waitForURL(/.*loginLocation/);
  }
}
