import DirectoryPage from '../page-objects/DirectoryPage';
import HrmLoginPage from '../page-objects/HrmLoginPage';

describe('OrangeHRM - Directory Feature (POM + Intercept)', () => {
  beforeEach(() => {
    HrmLoginPage.visitPage();
    HrmLoginPage.fillUsername('Admin');
    HrmLoginPage.fillPassword('admin123');
    HrmLoginPage.submitLogin();
    DirectoryPage.visitPage();
  });

  it('TC_DIR_001: Mencari data karyawan dengan nama lengkap', () => {
    cy.intercept('GET', '**/directory/employees*').as('getEmployees');
    DirectoryPage.searchByName('Peter Mac Anderson'); 
    DirectoryPage.clickSearch();
    cy.wait('@getEmployees');
    DirectoryPage.getRecordList().should('be.visible');
  });

// =========================================================================
  // TC 002: BASIC - VALIDASI TOMBOL SEARCH UTAMA (POM & INTERCEPT)
  // =========================================================================
  it('TC_DIR_002: Validasi pencarian dasar sukses memuat ulang daftar karyawan', () => {
    // 1. Siapkan jaring intercept untuk menangkap API directory dari server
    cy.intercept('GET', '**/api/v2/directory/employees*').as('searchDirectoryBasic');

    // 2. Klik tombol Search menggunakan method dari POM
    DirectoryPage.clickSearch();

    // 3. Tunggu hingga server selesai merespons data dengan HTTP status 200
    cy.wait('@searchDirectoryBasic').its('response.statusCode').should('eq', 200);

    // 4. Validasi UI: Pastikan list kartu karyawan sukses dirender menggunakan method dari POM
    DirectoryPage.getRecordList().should('be.visible');
  });

// TC 003: Filter berdasarkan Location
  it('TC_DIR_003: Filter berdasarkan Location', () => {
    cy.get('.oxd-select-text').eq(1).click();
    cy.contains('.oxd-select-dropdown .oxd-select-option', 'Texas R&D').click();
    DirectoryPage.clickSearch();
    DirectoryPage.getRecordList().should('be.visible');
  });

  it('TC_DIR_004: Reset filter kembali seperti semula', () => {
    DirectoryPage.selectJobTitle('Account Assistant');
    DirectoryPage.clickReset();
    cy.get('.oxd-select-text-input').eq(0).should('have.text', '-- Select --');
  });

  it('TC_DIR_005: Menampilkan No Records Found', () => {
    cy.get('input[placeholder="Type for hints..."]').first().type('Karyawan Fiktif');
    DirectoryPage.clickSearch();
    DirectoryPage.getNoRecordsMessage().should('be.visible');
  });

  it('TC_DIR_006: Intercept Mocking daftar kosong (Empty State)', () => {
    cy.intercept('GET', '**/directory/employees*', {
      statusCode: 200,
      body: { data: [], meta: { total: 0 } }
    }).as('emptyDir');
    DirectoryPage.clickSearch();
    cy.wait('@emptyDir');
  });

  // TC 007: VALIDASI KLIK KARTU PROFIL UNTUK MEMUNCUKKAN DETAIL
  it('TC_DIR_007: Klik kartu profil untuk memunculkan detail di panel kanan', () => {
    // 1. Jalankan pencarian agar kartu karyawan muncul
    DirectoryPage.clickSearch();

    // 2. Ambil nama dari kartu pertama untuk dijadikan bahan validasi
    DirectoryPage.getRecordList().first().find('.orangehrm-directory-card-header')
      .invoke('text')
      .then((employeeName) => {
        const cleanName = employeeName.trim();
        
        // 3. Klik kartu profil karyawan pertama
        DirectoryPage.getRecordList().first().click();

        // 4. PERBAIKAN: Beri jeda/tunggu agar request API detail selesai di-render
        cy.wait(1000); 

        // 5. VALIDASI UTAMA: Cari teks nama karyawan yang harusnya terpampang di panel kanan secara global
        // Kita gunakan pencarian berbasis teks karena teks nama di panel kanan pasti terdaftar di DOM
        cy.contains('.oxd-text', cleanName, { timeout: 10000 }).should('be.visible');

        // 6. VALIDASI PANEL: Memastikan tombol ikon panah (->) penutup panel kanan juga ikut muncul
        cy.get('.bi-arrow-right').should('be.visible');
      });
  });
  it('TC_DIR_008: Validasi Payload API pencarian Directory', () => {
    cy.intercept('GET', '**/directory/employees*').as('apiCheck');
    DirectoryPage.clickSearch();
    cy.wait('@apiCheck').then((xhr) => {
      expect(xhr.response.statusCode).to.equal(200);
    });
  });
});