import { Page } from '@playwright/test';
import { config } from '../config/env.config';

/**
 * Cato Authentication Page
 * Handles authentication with Cato (Cloudflare Access or similar SSO)
 * This is required before accessing the Bahmni login page on QA environment
 */
export class CatoAuthPage {
  private readonly page: Page;
  private readonly cato = config.cato;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Check if Cato credentials are configured
   */
  hasCatoCredentials(): boolean {
    return !!(this.cato.username && this.cato.password);
  }

  /**
   * Authenticate with Cato if required
   * Navigates to base URL and handles Cato login if prompted
   */
  async authenticateIfNeeded() {
    if (!this.hasCatoCredentials()) {
      console.log('⚠ Cato credentials not configured, skipping Cato authentication');
      return;
    }

    console.log('🔐 Attempting Cato authentication...');

    try {
      // Navigate to base URL which may trigger Cato SSO
      await this.page.goto(config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });

      // Wait a bit for redirect/SSO to initialize
      await this.page.waitForTimeout(2000);

      // Check if we're on a Cato authentication page
      const isCatoPage = await this.isCatoAuthPage();

      if (isCatoPage) {
        console.log('✓ Cato auth page detected, logging in...');
        await this.login();
        // Wait for redirect after Cato auth
        await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      } else {
        console.log('✓ No Cato auth required, proceeding...');
      }
    } catch (error) {
      console.error('⚠ Cato authentication error:', error);
      // Don't throw - allow tests to continue, Cato might not be required
    }
  }

  /**
   * Check if we're on a Cato authentication page
   */
  private async isCatoAuthPage(): Promise<boolean> {
    try {
      // Look for common Cato/Cloudflare Access authentication elements
      const catoSelectors = [
        '[data-testid="login-form"]', // Generic login form
        'input[name="email"]', // Email input
        'form[action*="auth"]', // Auth form
        'button:has-text("Sign in")', // Sign in button
        'h1:has-text("Access Login")', // Cloudflare Access title
        'input[placeholder*="email"]', // Email placeholder
      ];

      for (const selector of catoSelectors) {
        const element = await this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Perform Cato login
   */
  private async login() {
    try {
      // Try email/password login for Cloudflare Access
      const emailInput = this.page.locator('input[name="email"], input[placeholder*="email"]').first();
      const passwordInput = this.page.locator('input[name="password"], input[type="password"]').first();
      const submitButton = this.page.locator('button[type="submit"], button:has-text("Sign in")').first();

      // Fill email
      if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emailInput.fill(this.cato.username);
      }

      // Fill password
      if (await passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await passwordInput.fill(this.cato.password);
      }

      // Submit form
      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitButton.click();
        await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      }

      console.log('✓ Cato login completed');
    } catch (error) {
      console.error('⚠ Cato login error:', error);
      throw error;
    }
  }
}
