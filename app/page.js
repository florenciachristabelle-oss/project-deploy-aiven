'use client';

import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  // Fetch data saat halaman dimuat
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setErrorMsg(data.message || 'Gagal memuat data produk.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server backend.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
  };

  // Mencegah input karakter koma, titik, minus, dan 'e' secara real-time pada kolom harga
  const handlePriceKeyDown = (e) => {
    if (e.key === ',' || e.key === '.' || e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  // Handle Pilih Produk untuk Di-Edit
  const handleEditSelect = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Handle Simpan / Update Produk
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !description.trim() || !price) {
      setErrorMsg('Semua kolom (Nama, Deskripsi, Harga) wajib diisi!');
      return;
    }

    if (isNaN(price) || Number(price) <= 0 || price.includes('.') || price.includes(',')) {
      setErrorMsg('Harga harus berupa angka bulat positif (tanpa koma/desimal)!');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parseInt(price, 10),
    };

    try {
      let res, result;

      if (editingId) {
        // Mode Edit (PUT)
        res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        result = await res.json();

        if (result.success) {
          setSuccessMsg('Produk berhasil diperbarui!');
          resetForm();
          fetchProducts();
        } else {
          setErrorMsg(result.message || 'Gagal memperbarui produk.');
        }
      } else {
        // Mode Tambah Baru (POST)
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        result = await res.json();

        if (result.success) {
          setSuccessMsg('Produk berhasil ditambahkan ke database!');
          resetForm();
          fetchProducts();
        } else {
          setErrorMsg(result.message || 'Gagal menyimpan produk.');
        }
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat mengirim data ke server.');
    }
  };

  // Handle Hapus Produk
  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const result = await res.json();

      if (result.success) {
        setSuccessMsg('Produk berhasil dihapus.');
        if (editingId === id) resetForm();
        fetchProducts();
      } else {
        setErrorMsg(result.message || 'Gagal menghapus produk.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server saat menghapus produk.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #222222', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>
          CRUD Produk - Next.js & MySQL (Aiven)
        </h1>
        <p style={{ color: '#888888', fontSize: '14px', marginTop: '6px' }}>
          Sistem manajemen produk dan deskripsi berbasis database MySQL Aiven.
        </p>
      </div>

      {/* Pesan Alert Error / Sukses */}
      {errorMsg && (
        <div style={{ backgroundColor: '#1a0505', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ backgroundColor: '#051a0b', border: '1px solid #14532d', color: '#86efac', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* Form Tambah / Edit Produk */}
        <div style={{ backgroundColor: '#111111', border: '1px solid #222222', padding: '24px', borderRadius: '8px', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
              {editingId ? '✏️ Edit Produk' : '+ Tambah Produk Baru'}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                style={{ backgroundColor: '#222', color: '#aaa', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                Batal
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaaaaa', marginBottom: '6px' }}>
                Nama Produk / Kategori
              </label>
              <input
                type="text"
                placeholder="Contoh: Laptop Gaming"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#000000', border: '1px solid #333333', color: '#ffffff', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaaaaa', marginBottom: '6px' }}>
                Deskripsi
              </label>
              <textarea
                placeholder="Tulis deskripsi singkat produk..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px', backgroundColor: '#000000', border: '1px solid #333333', color: '#ffffff', borderRadius: '6px', fontSize: '14px', resize: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaaaaa', marginBottom: '6px' }}>
                Harga (Rp) <span style={{ color: '#666666', fontSize: '11px' }}>(Tanpa koma/desimal)</span>
              </label>
              <input
                type="number"
                placeholder="Contoh: 1500000"
                value={price}
                onKeyDown={handlePriceKeyDown}
                onChange={(e) => setPrice(e.target.value)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#000000', border: '1px solid #333333', color: '#ffffff', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: editingId ? '#3b82f6' : '#ffffff',
                color: editingId ? '#ffffff' : '#000000',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {editingId ? 'Update Produk' : 'Simpan Produk'}
            </button>
          </form>
        </div>

        {/* Tabel Daftar Produk */}
        <div style={{ backgroundColor: '#111111', border: '1px solid #222222', padding: '24px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#ffffff' }}>
            Daftar Produk
          </h2>

          {loading ? (
            <p style={{ color: '#666666', fontSize: '14px' }}>Memuat data dari MySQL Aiven...</p>
          ) : products.length === 0 ? (
            <p style={{ color: '#666666', fontSize: '14px' }}>Belum ada produk yang tersimpan di database.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222222', color: '#888888' }}>
                    <th style={{ padding: '10px' }}>Nama</th>
                    <th style={{ padding: '10px' }}>Deskripsi</th>
                    <th style={{ padding: '10px' }}>Harga</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '12px 10px', color: '#ffffff', fontWeight: '500' }}>{item.name}</td>
                      <td style={{ padding: '12px 10px', color: '#aaaaaa' }}>{item.description}</td>
                      <td style={{ padding: '12px 10px', color: '#4ade80', fontWeight: '500' }}>
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleEditSelect(item)}
                          style={{ backgroundColor: '#0a192f', color: '#60a5fa', border: '1px solid #1e3a8a', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{ backgroundColor: '#220a0a', color: '#f87171', border: '1px solid #451a1a', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}