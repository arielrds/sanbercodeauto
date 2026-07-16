describe('OrangeHRM - Login Feature with Distinct Intercepts & Waits', () => {

  const baseUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';

  beforeEach(() => {
    cy.visit(baseUrl);
    cy.get('input[name="username"]').should('be.visible');
  });

  it('TC-LGN-01: Login sukses dengan username valid dan password valid', () => {
    // INTERCEPT 1: Menangkap request shortcut menu di dashboard saat login berhasil
    cy.intercept('GET', '**/*dashboard/shortcuts*').as('getDashboardShortcuts');

    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // WAITING 1: Menunggu data dashboard ter-load sempurna
    cy.wait('@getDashboardShortcuts').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/dashboard/index');
  });

  it('TC-LGN-02: Login gagal dengan username valid dan password salah', () => {
    // INTERCEPT 2: Menangkap request POST otentikasi login ke server
    cy.intercept('POST', '**/*auth/validate*').as('authValidation');

    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('passalah123');
    cy.get('button[type="submit"]').click();

    // WAITING 2: Menunggu response gagal (302 redirect kembali ke login)
    cy.wait('@authValidation').its('response.statusCode').should('eq', 302);
    cy.get('.oxd-alert-content-text').should('have.text', 'Invalid credentials');
  });

  it('TC-LGN-03: Login gagal dengan username salah dan password valid', () => {
    // INTERCEPT 3: Menangkap request file bahasa/i18n saat halaman memuat ulang akibat gagal login
    cy.intercept('GET', '**/*core/i18n/messages*').as('getI18nMessages');

    cy.get('input[name="username"]').type('asdqr');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // WAITING 3: Menunggu reload halaman memanggil file enkripsi bahasa selesai
    cy.wait('@getI18nMessages').its('response.statusCode').should('eq', 304);
    cy.get('.oxd-alert-content-text').should('have.text', 'Invalid credentials');
  });

  it('TC-LGN-04: Login gagal karena username kosong dan password valid', () => {
    cy.intercept('GET', '**/*core/i18n/messages*').as('getI18nMessages');

    cy.reload();

    cy.wait('@getI18nMessages').its('response.statusCode').should('be.oneOf', [200, 304]);

    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // 5. Validasi hanya sampai pesan error "Required" muncul
    cy.get('.oxd-input-field-error-message')
      .should('be.visible')
      .and('have.text', 'Required');
  });

  it('TC-LGN-05: Login gagal karena username valid dan password kosong', () => {
    // 1. INTERCEPT: Menangkap request i18n messages dan menamainya sebagai alias penanda halaman siap
    cy.intercept('GET', '**/*core/i18n/messages*').as('forgotPasswordSection');

    // 2. Load halaman login
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');

    // 3. CY WAIT: Menunggu intercept jaringan selesai memuat sebelum berinteraksi dengan form
    cy.wait('@forgotPasswordSection').its('response.statusCode').should('be.oneOf', [200, 304]);

    // 4. Jalankan skenario: isi username saja, kosongkan password, lalu submit
    cy.get('input[name="username"]').type('Admin');
    cy.get('button[type="submit"]').click();

    // 5. Validasi: Cari elemen "Forgot your password?" di UI, lalu verifikasi pesan error di atasnya
    cy.contains('.orangehrm-login-forgot-header', 'Forgot your password?')
      .closest('.orangehrm-login-form')
      .find('.oxd-input-field-error-message')
      .should('be.visible')
      .and('have.text', 'Required');
  });

 it('TC-LGN-06: Login gagal karena username dan password kosong', () => {
    cy.intercept('POST', '**/web/index.php/auth/validate*').as('authValidateRoute');
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');

    cy.get('button[type="submit"]').click();

    cy.get('.oxd-input-group')
      .eq(0)
      .find('.oxd-input-field-error-message')
      .should('be.visible')
      .and('have.text', 'Required');

    // Kolom Password (index ke-1, di atas tombol "Forgot your password")
    cy.get('.oxd-input-group')
      .eq(1)
      .find('.oxd-input-field-error-message')
      .should('be.visible')
      .and('have.text', 'Required');
  });

  it('TC-LGN-07: Tekan enter untuk login', () => {
    // INTERCEPT 7: Menangkap request summary karyawan di dashboard yang dipicu tombol enter
    cy.intercept('GET', '**/*action-summary*').as('getDashboardSummary');

    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123{enter}');

    // WAITING 7: Memastikan data summary dashboard berhasil ditarik
    cy.wait('@getDashboardSummary').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/dashboard/index');
  });

  it('TC-LGN-11: Mengalihkan user ke halaman "forgot your password"', () => {
    // INTERCEPT 8: Menangkap request navigasi ke endpoint halaman reset password
    cy.intercept('GET', '**/*requestPasswordReset*').as('getResetPasswordPage');

    cy.get('.orangehrm-login-forgot-header').click();

    // WAITING 8: Menunggu halaman forgot password terbuka secara tuntas
    cy.wait('@getResetPasswordPage').its('response.statusCode').should('eq', 200);
    cy.get('.orangehrm-forgot-password-title').should('contain', 'Reset Password');
  });

});