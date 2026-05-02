import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BaseLayout from "../components/BaseLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Agile But Fragile",
  description: "Proyecto desarrollado para la asignatura de DAS 2026 por Jorge Carnicero Príncipe y Andrés Gil Vicente",
};

import { AuthProvider } from "../context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <BaseLayout>{children}</BaseLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
