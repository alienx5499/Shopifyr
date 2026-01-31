import type { Metadata } from "next";
import "./globals.css";
import { ProfessionalNavbar } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BackendBanner } from "@/components/BackendBanner";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Shopifyr - Your One-Stop E-commerce Shop",
  description: "Discover amazing products at unbeatable prices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-50">
        <AuthProvider>
          <CartProvider>
            <BackendBanner />
            <ProfessionalNavbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#fff',
                  color: '#0f172a',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
