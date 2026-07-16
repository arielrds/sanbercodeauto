import LoginPage from '../page-objects/LoginPage';
import DashboardPage from '../page-objects/DashboardPage';

describe('OrangeHRM Login Automated Tests - POM Format', () => {
  let data;

  before(() => {
    // Memuat data pengujian dari fixtures sebelum pengujian dimulai
    cy.fixture('loginData').then((fixtureData) => {
      data = fixtureData;
    });
  });

  beforeEach(() => {
    LoginPage.visitPage(data.baseUrl);
  });

  it('TC-01: Login sukses dengan kredensial valid', () => {
    LoginPage.login(data.validUser.username, data.validUser.password);
    DashboardPage.verifyOnDashboard();
  });

  it('TC-02: Login gagal karena password salah', () => {
    LoginPage.login(data.invalidPassword.username, data.invalidPassword.password);
    LoginPage.getErrorMessageAlert()
      .should('be.visible')
      .and('have.text', data.errorMessages.invalidCredentials);
  });

  it('TC-03: Login gagal karena username belum terdaftar', () => {
    LoginPage.login(data.invalidUsername.username, data.invalidUsername.password);
    LoginPage.getErrorMessageAlert()
      .should('be.visible')
      .and('have.text', data.errorMessages.invalidCredentials);
  });

  it('TC-04: Login gagal karena username dan password dikosongkan', () => {
    LoginPage.clickSubmit();
    
    // Verifikasi pesan "Required" muncul di kedua bidang
    LoginPage.getInputFieldError(0).should('be.visible').and('have.text', data.errorMessages.required);
    LoginPage.getInputFieldError(1).should('be.visible').and('have.text', data.errorMessages.required);
  });

  it('TC-05: Login gagal karena password dikosongkan', () => {
    LoginPage.typeUsername(data.validUser.username);
    LoginPage.clickSubmit();
    
    // Hanya kolom password yang memunculkan pesan error "Required"
    LoginPage.getInputFieldError(1).should('be.visible').and('have.text', data.errorMessages.required);
  });

  it('TC-06: Login gagal karena username dikosongkan', () => {
    LoginPage.typePassword(data.validUser.password);
    LoginPage.clickSubmit();
    
    // Hanya kolom username yang memunculkan pesan error "Required"
    LoginPage.getInputFieldError(0).should('be.visible').and('have.text', data.errorMessages.required);
  });

  it('TC-07: Login sukses dengan menggunakan tombol ENTER', () => {
    LoginPage.typeUsername(data.validUser.username);
    // Menambahkan aksi menekan Enter {enter} di bagian password
    LoginPage.getPasswordInput().type(`${data.validUser.password}{enter}`);
    DashboardPage.verifyOnDashboard();
  });

  it('TC-08: Pengamanan dasar dari upaya SQL Injection pada form Login', () => {
    LoginPage.login(data.sqlInjection.username, data.sqlInjection.password);
    LoginPage.getErrorMessageAlert()
      .should('be.visible')
      .and('have.text', data.errorMessages.invalidCredentials);
  });
});