import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BaseLayout from "../components/BaseLayout";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";

// aqui cargamos las fuentes globales de next para no tener que ir pensando en esto
// en cada pagina
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// aqui igual pero con la fuente mono, se mete una vez y ya queda disponible
// en toda la app
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// esto lo usa next para el titulo y la descripcion general del sitio
export const metadata = {
  title: "Agile But Fragile",
  description: "Proyecto desarrollado para la asignatura de DAS 2026 por Jorge Carnicero Príncipe y Andrés Gil Vicente",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/*
          aqui envolvemos toda la app con los providers globales
          si quisieramos meter otro estado compartido este seria de los primeros
          sitios a tocar
        */}
        <ThemeProvider>
          {/*
            authprovider deja disponible el token y el usuario a cualquier
            componente hijo sin ir pasando props todo el rato
          */}
          <AuthProvider>
            {/*
              baselayout mete la estructura comun de header contenido y footer
              las paginas de verdad entran por children
            */}
            <BaseLayout>{children}</BaseLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
