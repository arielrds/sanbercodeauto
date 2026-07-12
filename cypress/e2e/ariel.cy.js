describe('Skenario Login dan Fitur Belanja Sauce Demo', () => {

  // Skenario 1 (Yang tadi sudah kita buat)
  it('Harus berhasil login dengan user yang valid', () => {
    cy.visit('https://www.saucedemo.com/')
    cy.get('[data-test="username"]').type('standard_user')
    cy.get('[data-test="password"]').type('secret_sauce')
    cy.get('[data-test="login-button"]').click()
    
    cy.url().should('include', '/inventory.html')
    cy.get('.title').should('contain', 'Products')
  })

  // Skenario 2: Fitur Keranjang Belanja (Baru!)
  it('Harus berhasil menambahkan produk ke dalam keranjang', () => {
    // 1. Alur login terlebih dahulu
    cy.visit('https://www.saucedemo.com/')
    cy.get('[data-test="username"]').type('standard_user')
    cy.get('[data-test="password"]').type('secret_sauce')
    cy.get('[data-test="login-button"]').click()

    // 2. Klik tombol "Add to cart" pada produk pertama (Sauce Labs Backpack)
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()

    // 3. Assert: Pastikan tombolnya berubah tulisan menjadi "Remove"
    cy.get('[data-test="remove-sauce-labs-backpack"]').should('be.visible')

    // 4. Assert: Pastikan ada angka '1' muncul di ikon keranjang belanja (badge)
    cy.get('[data-test="shopping-cart-badge"]')
      .should('be.visible')
      .and('contain', '1')
  })

})