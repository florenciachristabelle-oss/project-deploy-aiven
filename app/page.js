'use client';

import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
        setProducts(data.data || []);
      } else {
        setErrorMsg(data.message || 'Gagal memuat data buku.');
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
    setName(product.name || '');
    setDescription(product.description || '');
    setPrice(product.price ? product.price.toString() : '');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !description.trim() || !price) {
      setErrorMsg('Semua kolom (Judul, Penulis/Sinopsis, Jumlah Stok) wajib diisi!');
      return;
    }

    if (isNaN(price) || Number(price) <= 0 || price.includes('.') || price.includes(',')) {
      setErrorMsg('Jumlah stok harus berupa angka bulat positif!');
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
          setSuccessMsg('Data buku berhasil diperbarui!');
          resetForm();
          fetchProducts();
        } else {
          setErrorMsg(result.message || 'Gagal memperbarui data buku.');
        }
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        result = await res.json();

        if (result.success) {
          setSuccessMsg('Buku baru berhasil ditambahkan ke katalog!');
          resetForm();
          fetchProducts();
        } else {
          setErrorMsg(result.message || 'Gagal menyimpan buku.');
        }
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat mengirim data ke server.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus buku ini dari katalog?')) return;

    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const result = await res.json();

      if (result.success) {
        setSuccessMsg('Buku berhasil dihapus dari katalog.');
        if (editingId === id) resetForm();
        fetchProducts();
      } else {
        setErrorMsg(result.message || 'Gagal menghapus buku.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server saat menghapus buku.');
    }
  };

  const totalStockCount = products.reduce((acc, curr) => acc + Number(curr.price || 0), 0);

  const filteredProducts = products.filter(p => {
    const itemName = p.name ? p.name.toLowerCase() : '';
    const itemDesc = p.description ? p.description.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    return itemName.includes(query) || itemDesc.includes(query);
  });

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 24px' }}>
      
      <header style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px 28px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              backgroundColor: '#0f766e',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '800',
              padding: '3px 8px',
              borderRadius: '6px',
              letterSpacing: '1px'
            }}>
              LIBRARY
            </span>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>
              Lumina Shelf
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '3px' }}>
            Katalog Perpustakaan & Manajemen Koleksi Buku
          </p>
        </div>

        <div style={{
          backgroundColor: '#f1f5f9',
          padding: '8px 18px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>TOTAL JUDUL</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{products.length} Buku</div>
        </div>
      </header>

      {errorMsg && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 18px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 18px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px' }}>
          ✅ {successMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '28px', alignItems: 'start' }}>
        
        <aside style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
              {editingId ? '📖 Edit Data Buku' : '📚 Tambah Buku Baru'}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
              >
                Batal
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: '700' }}>
                Judul Buku
              </label>
              <input
                type="text"
                placeholder="e.g. Laskar Pelangi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: '700' }}>
                Penulis / Sinopsis Singkat
              </label>
              <textarea
                placeholder="Penulis & rangkuman cerita..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: '700' }}>
                Jumlah Stok
              </label>
              <input
                type="number"
                placeholder="e.g. 15"
                value={price}
                onKeyDown={handlePriceKeyDown}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>Jumlah fisik buku yang tersedia.</p>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: editingId ? '#0284c7' : '#0f766e',
                color: '#ffffff',
                fontWeight: '700',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
              }}
            >
              {editingId ? 'Simpan Perubahan' : 'Simpan ke Katalog'}
            </button>
          </form>
        </aside>

        <section>
          
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0 12px'
            }}>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>🔍</span>
              <input
                type="text"
                placeholder="Cari judul buku atau penulis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#0f172a',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{
              backgroundColor: '#f1f5f9',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              color: '#334155',
              whiteSpace: 'nowrap',
              fontWeight: '600'
            }}>
              Total Stok: <strong style={{ color: '#0f766e' }}>{totalStockCount.toLocaleString('id-ID')}</strong>
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                📖 Daftar Koleksi Buku ({filteredProducts.length})
              </h3>
            </div>

            {loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                Memuat daftar katalog buku...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                Belum ada koleksi buku yang sesuai.
              </div>
            ) : (
              <div style={{
                maxHeight: '420px',
                overflowY: 'auto',
                paddingRight: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {filteredProducts.map((item) => (
                  <div key={item.id} style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #0f766e',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                          📘 {item.name}
                        </span>
                        <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                          BOOK-{item.id}
                        </span>
                      </div>
                      
                      <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', maxWidth: '400px', lineHeight: '1.4' }}>
                        {item.description}
                      </p>

                      <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: '700', color: '#0f766e', backgroundColor: '#f0fdf4', padding: '3px 10px', borderRadius: '6px', display: 'inline-block', border: '1px solid #bbf7d0' }}>
                        Stok: {Number(item.price || 0)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditSelect(item)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          backgroundColor: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          color: '#0284c7',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

      </div>
    </div>
  );
}