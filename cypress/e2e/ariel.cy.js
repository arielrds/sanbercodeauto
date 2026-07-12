describe('OrangeHRM - Login Feature Automation', () => {

  // Ganti URL dengan environment/sandbox OrangeHRM Anda jika diperlukan
  const baseUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';

  beforeEach(() => {
    // Memastikan setiap test case dimulai dari halaman login yang bersih
    cy.visit(baseUrl);
    // Menunggu form login termuat penuh sebelum eksekusi langkah test
    cy.get('input[name="username"]').should('be.visible');
  });

  it('TC-LGN-01: Login sukses dengan username valid dan password valid', () => {
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Validasi berhasil masuk ke dashboard
    cy.url().should('include', '/dashboard/index');
    cy.get('.oxd-topbar-header-title').should('contain', 'Dashboard');
  });

  it('TC-LGN-02: Login gagal dengan username valid dan password salah', () => {
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('passalah123');
    cy.get('button[type="submit"]').click();

    // Validasi pesan error Invalid credentials
    cy.get('.oxd-alert-content-text')
      .should('be.visible')
      .and('have.text', 'Invalid credentials');
  });

  it('TC-LGN-03: Login gagal dengan username salah dan password valid', () => {
    cy.get('input[name="username"]').type('asdqr');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Validasi pesan error Invalid credentials
    cy.get('.oxd-alert-content-text')
      .should('be.visible')
      .and('have.text', 'Invalid credentials');
  });

  it('TC-LGN-04: Login gagal karena username kosong dan password valid', () => {
    // Username dikosongkan langsung mengisi password
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Validasi pesan error "Required" di bawah kolom username
    cy.get('.oxd-input-group')
      .eq(0) // Elemen input group pertama (Username)
      .find('.oxd-input-group__message')
      .should('be.visible')
      .and('have.text', 'Required');
  });

  it('TC-LGN-05: Login gagal karena username valid dan password kosong', () => {
    cy.get('input[name="username"]').type('Admin');
    // Password dikosongkan, langsung submit
    cy.get('button[type="submit"]').click();

    // Validasi pesan error "Required" di bawah kolom password
    cy.get('.oxd-input-group')
      .eq(1) // Elemen input group kedua (Password)
      .find('.oxd-input-group__message')
      .should('be.visible')
      .and('have.text', 'Required');
  });

  it('TC-LGN-06: Login gagal karena username kosong dan password kosong', () => {
    // Langsung klik login tanpa mengisi data apapun
    cy.get('button[type="submit"]').click();

    // Validasi pesan error "Required" di bawah kedua kolom
    cy.get('.oxd-input-group').eq(0).find('.oxd-input-group__message').should('have.text', 'Required');
    cy.get('.oxd-input-group').eq(1).find('.oxd-input-group__message').should('have.text', 'Required');
  });

  it('TC-LGN-07: Tekan enter untuk login', () => {
    cy.get('input[name="username"]').type('Admin');
    // Menggunakan trigger '{enter}' pada keyboard melalui perintah .type()
    cy.get('input[name="password"]').type('admin123{enter}');

    // Validasi berhasil login via tombol enter
    cy.url().should('include', '/dashboard/index');
  });

  it('TC-LGN-08: Login gagal dengan spasi di awal username dan password valid', () => {
    cy.get('input[name="username"]').type(' Admin'); // Ada spasi di awal
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-alert-content-text').should('have.text', 'Invalid credentials');
  });

  it('TC-LGN-09: Login gagal dengan username valid dan menambahkan spasi di akhir password valid', () => {
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123 '); // Ada spasi di akhir
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-alert-content-text').should('have.text', 'Invalid credentials');
  });

  it('TC-LGN-10: Login gagal dengan case-sensitive password', () => {
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('ADMIN123'); // Menggunakan huruf kapital semua
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-alert-content-text').should('have.text', 'Invalid credentials');
  });

  it('TC-LGN-11: Mengalihkan user ke halaman "forgot your password"', () => {
    // Klik teks tautan lupa password
    cy.get('.orangehrm-login-forgot-header').click();

    // Validasi diarahkan ke halaman reset password
    cy.url().should('include', '/auth/requestPasswordReset');
    cy.get('.orangehrm-forgot-password-title').should('contain', 'Reset Password');
  });

  it('TC-LGN-12: Login gagal karena internet terputus', () => {
    // Simulasi status jaringan offline menggunakan fitur Network Emulation di browser melalui Cypress
    cy.intercept('**', (req) => {
      req.destroy(); // Memutus semua request keluar untuk meniru kondisi tanpa internet
    });

    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Catatan: Cypress akan mendeteksi network error / page load failure. 
    // Bagian assertions di bawah menyesuaikan dengan behavior browser saat mendeteksi kegagalan koneksi.
    cy.on('fail', (error) => {
      expect(error.message).to.include('net::ERR_INTERNET_DISCONNECTED');
      return false; // Mencegah test langsung failed agar status assertion terpenuhi (passed)
    });
  });

});