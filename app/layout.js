import './globals.css';

export const metadata = {
  title: 'Vortex Stock - Manajemen Inventaris Produk',
  description: 'Aplikasi CRUD produk modern terintegrasi dengan MySQL Aiven',
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