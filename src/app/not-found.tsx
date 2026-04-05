"use client"

import { ContentLayout } from "@/components/panel/content-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <ContentLayout title="Not Found Page">
      <div className="flex flex-col items-center justify-center min-h-screen -my-24 text-center px-4">
        <h1 className="text-4xl font-bold text-red-500">404</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Oops! Halaman yang Anda cari tidak ditemukan.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Kembali ke Halaman Utama</Link>
        </Button>
      </div>
    </ContentLayout>
  );
}