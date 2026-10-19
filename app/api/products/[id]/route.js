import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// PUT /api/products/[id] -> Update/Edit produk berdasarkan ID
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID produk tidak terdeteksi' },
        { status: 400 }
      );
    }

    // Validasi input
    if (!name?.trim() || !description?.trim() || price === undefined || price === '') {
      return NextResponse.json(
        { success: false, message: 'Semua kolom (Nama, Deskripsi, Harga) wajib diisi!' },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);
    if (!Number.isInteger(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { success: false, message: 'Harga harus berupa angka bulat positif (tanpa koma/desimal)!' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?',
      [name.trim(), description.trim(), parsedPrice, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diperbarui!',
    });
  } catch (error) {
    console.error('Error PUT product:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui produk', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] -> Hapus produk berdasarkan ID
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID produk tidak terdeteksi' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Produk tidak ditemukan atau sudah dihapus' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus dari database',
    });
  } catch (error) {
    console.error('Error DELETE product:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus produk', error: error.message },
      { status: 500 }
    );
  }
}