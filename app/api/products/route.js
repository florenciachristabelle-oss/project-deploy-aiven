import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// GET /api/products -> Ambil daftar produk
export async function GET() {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, name, description, price, created_at FROM products ORDER BY id DESC'
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data produk', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/products -> Tambah produk baru dengan validasi
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, price } = body;

    // 1. Validasi: Semua field (Nama, Deskripsi, Harga) wajib diisi
    if (!name?.trim() || !description?.trim() || price === undefined || price === '') {
      return NextResponse.json(
        { success: false, message: 'Semua kolom (Nama, Deskripsi, Harga) wajib diisi!' },
        { status: 400 }
      );
    }

    // 2. Validasi: Harga harus angka bulat positif (tanpa koma/desimal)
    const parsedPrice = Number(price);
    if (!Number.isInteger(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { success: false, message: 'Harga harus berupa angka bulat positif (tanpa koma/desimal)!' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price) VALUES (?, ?, ?)',
      [name.trim(), description.trim(), parsedPrice]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Produk berhasil ditambahkan!',
        data: { id: result.insertId, name: name.trim(), description: description.trim(), price: parsedPrice },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan produk ke database', error: error.message },
      { status: 500 }
    );
  }
}