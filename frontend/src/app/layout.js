import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BaseLayout from "../components/BaseLayout";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Chat Assistant",
  description:
    "Full-stack chat application with JWT authentication and a locally hosted LLM served through Ollama.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            <BaseLayout>{children}</BaseLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
