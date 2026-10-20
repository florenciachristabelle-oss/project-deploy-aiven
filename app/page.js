'use client';

import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');


  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

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

  const handlePriceKeyDown = (e) => {
    if (e.key === ',' || e.key === '.' || e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  const handleEditSelect = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setErrorMsg('');
    setSuccessMsg('');
  };

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
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
      

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f1f2e', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>📦</span>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
              Katalog Produk
            </h1>
          </div>
          <p style={{ color: '#8b8d9e', fontSize: '14px', marginTop: '4px' }}>
            Manajemen inventaris barang terhubung dengan MySQL Aiven
          </p>
        </div>
        <div style={{ backgroundColor: '#161622', border: '1px solid #28283d', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', color: '#a0a2b6' }}>
          Total Items: <strong style={{ color: '#60a5fa' }}>{products.length}</strong>
        </div>
      </div>


      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '14px 18px', borderRadius: '10px', marginBottom: '24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#86efac', padding: '14px 18px', borderRadius: '10px', marginBottom: '24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Form Card */}
        <div style={{ backgroundColor: '#121218', border: '1px solid #22222e', borderRadius: '14px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', tracking: '0.5px' }}>
              {editingId ? '✏️ Edit Produk' : '➕ Tambah Produk'}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                style={{ backgroundColor: '#222230', color: '#a0a2b6', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
              >
                Batal
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#a0a2b6', marginBottom: '8px' }}>
                NAMA PRODUK / KATEGORI
              </label>
              <input
                type="text"
                placeholder="Contoh: Laptop Gaming"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', backgroundColor: '#09090d', border: '1px solid #252535', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#a0a2b6', marginBottom: '8px' }}>
                DESKRIPSI
              </label>
              <textarea
                placeholder="Tulis deskripsi singkat produk..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '11px 14px', backgroundColor: '#09090d', border: '1px solid #252535', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#a0a2b6', marginBottom: '8px' }}>
                HARGA (RP)
              </label>
              <input
                type="number"
                placeholder="Contoh: 1500000"
                value={price}
                onKeyDown={handlePriceKeyDown}
                onChange={(e) => setPrice(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', backgroundColor: '#09090d', border: '1px solid #252535', color: '#ffffff', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              />
              <p style={{ fontSize: '11px', color: '#525266', marginTop: '6px' }}>Hanya angka bulat positif tanpa koma/desimal.</p>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: editingId ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#ffffff',
                fontWeight: '700',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </form>
        </div>

        {/* Table Card */}
        <div style={{ backgroundColor: '#121218', border: '1px solid #22222e', borderRadius: '14px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', marginBottom: '20px', textTransform: 'uppercase', tracking: '0.5px' }}>
            Daftar Produk Terdaftar
          </h2>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
              ⏳ Memuat data dari database...
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
              Belum ada data produk tersimpan.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '8px 12px' }}>Nama Produk</th>
                    <th style={{ padding: '8px 12px' }}>Deskripsi</th>
                    <th style={{ padding: '8px 12px' }}>Harga</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id} style={{ backgroundColor: '#0b0b10', borderRadius: '8px' }}>
                      <td style={{ padding: '14px 12px', color: '#ffffff', fontWeight: '600', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '14px 12px', color: '#9ca3af', maxWidth: '240px' }}>
                        {item.description}
                      </td>
                      <td style={{ padding: '14px 12px', color: '#4ade80', fontWeight: '700', whiteSpace: 'nowrap' }}>
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right', whiteSpace: 'nowrap', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                        <button
                          onClick={() => handleEditSelect(item)}
                          style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginRight: '8px', fontWeight: '600' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
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