"use client";

import { SessionProvider } from "next-auth/react";
import { Footer } from "@/components/panel/footer";
import { WhatsAppBubble } from "@/components/panel/whatsapp-bubble";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="w-full max-w-5xl mx-auto">
        <main>{children}</main>
        <footer>
          <Footer />
        </footer>
      </div>
      <WhatsAppBubble />
    </SessionProvider>
  );
}