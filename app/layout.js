import './globals.css';

export const metadata = {
  title: 'CRUD Produk - Next.js + MySQL',
  description: 'Aplikasi CRUD Produk dengan Next.js dan Database MySQL (Aiven)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-black text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}