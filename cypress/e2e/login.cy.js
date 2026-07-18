
import HrmLoginPage from '../page-objects/HrmLoginPage';

describe('OrangeHRM - Login Feature with Distinct Intercepts & Waits (POM + Intercept)', () => {

  beforeEach(() => {
    HrmLoginPage.visitPage();
  });

  it('TC-LGN-01: Login sukses dengan username valid dan password valid', () => {
    cy.intercept('GET', '**/*dashboard/shortcuts*').as('getDashboardShortcuts');

    HrmLoginPage.fillUsername('Admin');
    HrmLoginPage.fillPassword('admin123');
    HrmLoginPage.submitLogin();

    cy.wait('@getDashboardShortcuts').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/dashboard/index');
  });

  it('TC-LGN-02: Login gagal dengan username valid dan password salah', () => {
    cy.intercept('POST', '**/*auth/validate*').as('authValidation');

    HrmLoginPage.fillUsername('Admin');
    HrmLoginPage.fillPassword('passalah123');
    HrmLoginPage.submitLogin();

    cy.wait('@authValidation').its('response.statusCode').should('eq', 302);
    
    HrmLoginPage.getErrorMessage().should('have.text', 'Invalid credentials');
  });

  it('TC-LGN-03: Login gagal dengan username salah dan password valid', () => {
    cy.intercept('GET', '**/*core/i18n/messages*').as('getI18nMessages');

    HrmLoginPage.fillUsername('asdqr');
    HrmLoginPage.fillPassword('admin123');
    HrmLoginPage.submitLogin();

    cy.wait('@getI18nMessages').its('response.statusCode').should('eq', 304);
    HrmLoginPage.getErrorMessage().should('have.text', 'Invalid credentials');
  });

  it('TC-LGN-04: Login gagal karena username kosong dan password valid', () => {
    cy.intercept('GET', '**/*core/i18n/messages*').as('getI18nMessages');

    cy.reload();
    cy.wait('@getI18nMessages').its('response.statusCode').should('be.oneOf', [200, 304]);

    HrmLoginPage.fillPassword('admin123');
    HrmLoginPage.submitLogin();

    HrmLoginPage.getValidationMessage('Username')
      .should('be.visible')
      .and('have.text', 'Required');
  });

  it('TC-LGN-05: Login gagal karena username valid dan password kosong', () => {
    cy.intercept('GET', '**/*core/i18n/messages*').as('forgotPasswordSection');

    HrmLoginPage.visitPage();
    cy.wait('@forgotPasswordSection').its('response.statusCode').should('be.oneOf', [200, 304]);

    HrmLoginPage.fillUsername('Admin');
    HrmLoginPage.submitLogin();

    HrmLoginPage.getValidationMessage('Password')
      .should('be.visible')
      .and('have.text', 'Required');
  });

  it('TC-LGN-06: Login gagal karena username dan password kosong', () => {
    HrmLoginPage.submitLogin();

    HrmLoginPage.getValidationMessage('Username').should('be.visible').and('have.text', 'Required');
    HrmLoginPage.getValidationMessage('Password').should('be.visible').and('have.text', 'Required');
  });

  it('TC-LGN-07: Tekan enter untuk login', () => {
    cy.intercept('GET', '**/*action-summary*').as('getDashboardSummary');

    HrmLoginPage.fillUsername('Admin');
    
    cy.get('input[name="password"]').type('admin123{enter}');

    cy.wait('@getDashboardSummary').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/dashboard/index');
  });

  it('TC-LGN-11: Mengalihkan user ke halaman "forgot your password"', () => {
    cy.intercept('GET', '**/*requestPasswordReset*').as('getResetPasswordPage');

    cy.get('.orangehrm-login-forgot-header').click();
    
    cy.wait('@getResetPasswordPage').its('response.statusCode').should('eq', 200);
    cy.get('.orangehrm-forgot-password-title').should('contain', 'Reset Password');
  });

});