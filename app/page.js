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

  const totalPriceValue = products.reduce((acc, curr) => acc + Number(curr.price || 0), 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' }}>
      
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        paddingBottom: '20px',
        marginBottom: '28px',
        borderBottom: '1px solid #e7e5e4'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#fff',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            ❖
          </div>
          <span style={{ fontSize: '24px', fontWeight: '800', color: '#1c1917', letterSpacing: '-0.5px' }}>
            Vortex<span style={{ color: '#2563eb' }}>Stock</span>.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#78716c' }}>
          <span style={{ fontWeight: '500' }}>✨ Your Smart Inventory System</span>
          <span style={{
            backgroundColor: '#ffffff',
            padding: '5px 12px',
            borderRadius: '20px',
            color: '#1c1917',
            fontSize: '12px',
            fontWeight: '600',
            border: '1px solid #e7e5e4',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            🟢 Connected Aiven
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '18px',
          padding: '22px 26px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)'
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
              TOTAL ARSIP PRODUK
            </div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff', marginTop: '4px' }}>
              {products.length}
            </div>
          </div>
          <div style={{
            width: '52px',
            height: '52px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#ffffff'
          }}>
            📦
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          borderRadius: '18px',
          padding: '22px 26px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(37, 99, 235, 0.2)'
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#bfdbfe', letterSpacing: '0.5px' }}>
              TOTAL NILAI INVENTARIS
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', marginTop: '8px' }}>
              Rp {totalPriceValue.toLocaleString('id-ID')}
            </div>
          </div>
          <div style={{
            width: '52px',
            height: '52px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#ffffff'
          }}>
            💎
          </div>
        </div>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>
          ✅ {successMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '28px', alignItems: 'start' }}>
        
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e7e5e4',
          borderRadius: '20px',
          padding: '26px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1c1917', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#2563eb' }}>⊕</span> {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                style={{ backgroundColor: '#f5f5f4', color: '#57534e', border: '1px solid #e7e5e4', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
              >
                Batal
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#57534e', marginBottom: '6px', fontWeight: '700' }}>
                Nama Produk
              </label>
              <input
                type="text"
                placeholder="e.g. Laptop Gaming ROG"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#f5f5f4',
                  border: '1px solid #e7e5e4',
                  color: '#1c1917',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#57534e', marginBottom: '6px', fontWeight: '700' }}>
                Deskripsi
              </label>
              <textarea
                placeholder="Tuliskan keterangan ringkas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#f5f5f4',
                  border: '1px solid #e7e5e4',
                  color: '#1c1917',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#57534e', marginBottom: '6px', fontWeight: '700' }}>
                Harga (Rp)
              </label>
              <input
                type="number"
                placeholder="e.g. 15000000"
                value={price}
                onKeyDown={handlePriceKeyDown}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#f5f5f4',
                  border: '1px solid #e7e5e4',
                  color: '#1c1917',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <p style={{ fontSize: '11px', color: '#78716c', marginTop: '6px' }}>Hanya angka bulat positif tanpa koma/desimal.</p>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: editingId
                  ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                  : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                fontWeight: '700',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.25)'
              }}
            >
              {editingId ? 'Update Produk' : 'Simpan Produk'}
            </button>
          </form>
        </div>

        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #e7e5e4',
              borderRadius: '12px',
              padding: '0 14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <span style={{ color: '#78716c', fontSize: '14px' }}>🔍</span>
              <input
                type="text"
                placeholder="Cari produk atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#1c1917',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>All</button>
              <button style={{ backgroundColor: '#ffffff', color: '#57534e', border: '1px solid #e7e5e4', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Active</button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#78716c', fontSize: '14px' }}>
              ⏳ Memuat data produk...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#78716c', fontSize: '14px', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e7e5e4' }}>
              Belum ada produk yang cocok ditemukan.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredProducts.map((item) => (
                <div key={item.id} style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e7e5e4',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '14px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: '#2563eb'
                    }}>
                      📦
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#1c1917' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#78716c', marginTop: '2px', maxWidth: '320px' }}>
                        {item.description}
                      </div>
                      <div style={{ display: 'inline-block', marginTop: '6px', backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditSelect(item)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#f5f5f4',
                        border: '1px solid #e7e5e4',
                        color: '#d97706',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px'
                      }}
                      title="Edit Produk"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px'
                      }}
                      title="Hapus Produk"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}