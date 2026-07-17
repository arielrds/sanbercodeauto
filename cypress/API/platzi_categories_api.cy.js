describe('Platzi Fake Store API - Categories Automation Tests (12 Requests)', () => {
  const baseUrl = 'https://api.escuelajs.co/api/v1/categories';
  let createdCategoryId; // Variabel untuk menyimpan ID dari kategori yang baru dibuat

  // 1. GET REQUESTS (Membaca Data)

  it('REQ-01: GET All Categories - Verifikasi semua kategori berhasil diambil', () => {
    cy.request('GET', baseUrl).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      expect(response.body[0]).to.have.property('id');
      expect(response.body[0]).to.have.property('name');
    });
  });

  it('REQ-02: GET Single Category Valid - Verifikasi kategori dengan ID 1 ditemukan', () => {
    cy.request('GET', `${baseUrl}/1`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body.id).to.eq(1);
      expect(response.body).to.have.property('name');
      expect(response.body).to.have.property('image');
    });
  });

  it('REQ-03: GET Single Category Invalid - Verifikasi error 400/404 jika ID tidak ada', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/999999`,
      failOnStatusCode: false // Agar tes tidak langsung stop saat menerima error code
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 404, 500]);
    });
  });

  it('REQ-04: GET Categories with Limit - Verifikasi query parameter limit berfungsi', () => {
    cy.request('GET', `${baseUrl}?limit=5`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.at.most(5);
    });
  });

  // 2. POST REQUESTS (Membuat Data Baru)

  it('REQ-05: POST Create Category Valid - Berhasil membuat kategori baru', () => {
    const uniqueName = `Category Testing ${Math.floor(Math.random() * 10000)}`;
    cy.request('POST', baseUrl, {
      name: uniqueName,
      image: 'https://placeimg.com/640/480/any'
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body.name).to.eq(uniqueName);
      
      // Simpan ID untuk pengujian PUT dan DELETE nanti
      createdCategoryId = response.body.id;
    });
  });

  it('REQ-06: POST Create Category Invalid (Missing Image) - Gagal jika field image kosong', () => {
    cy.request({
      method: 'POST',
      url: baseUrl,
      body: {
        name: 'Invalid Category No Image'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 422, 500]);
    });
  });

  it('REQ-07: POST Create Category Invalid (Missing Name) - Gagal jika field name kosong', () => {
    cy.request({
      method: 'POST',
      url: baseUrl,
      body: {
        image: 'https://placeimg.com/640/480/any'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 422, 500]);
    });
  });

  // 3. PUT REQUESTS (Mengubah Data)

  it('REQ-08: PUT Update Category Valid - Berhasil memperbarui nama kategori yang baru dibuat', () => {
    // Pastikan ID kategori hasil REQ-05 tersedia
    expect(createdCategoryId).to.not.be.undefined;

    const updatedName = 'Category Updated POM';
    cy.request('PUT', `${baseUrl}/${createdCategoryId}`, {
      name: updatedName
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.id).to.eq(createdCategoryId);
      expect(response.body.name).to.eq(updatedName);
    });
  });

  it('REQ-09: PUT Update Category Invalid ID - Gagal memperbarui jika ID tidak valid', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/999999`,
      body: {
        name: 'New Name Try'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 404, 500]);
    });
  });

  it('REQ-10: PUT Update Category Invalid Body - Gagal jika memperbarui dengan format salah', () => {
    expect(createdCategoryId).to.not.be.undefined;
    
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/${createdCategoryId}`,
      body: {
        name: '' // Mengosongkan nama
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 422, 500]);
    });
  });

  // 4. DELETE REQUESTS (Menghapus Data)

  it('REQ-11: DELETE Category Valid - Berhasil menghapus kategori yang dibuat di REQ-05', () => {
    expect(createdCategoryId).to.not.be.undefined;

    cy.request('DELETE', `${baseUrl}/${createdCategoryId}`).then((response) => {
      // API ini biasanya mengembalikan status 200 dengan nilai true atau 204 No Content
      expect(response.status).to.be.oneOf([200, 204]);
    });
  });

  it('REQ-12: DELETE Category Invalid ID - Gagal menghapus ID kategori yang sudah tidak ada', () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/999999`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 404]);
    });
  });
});
