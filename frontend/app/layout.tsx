import type { Metadata } from "next";
import "./globals.css";
import GlobalHeader from "./components/GlobalHeader";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "FreelanceHub",
  description: "Referral-first freelance hiring platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlobalHeader />
        {children}
        <Footer />
      </body>
    </html>
  );
}
