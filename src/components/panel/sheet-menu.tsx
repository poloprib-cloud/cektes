import Link from "next/link";
import { MenuIcon, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/panel/menu";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle
} from "@/components/ui/sheet";
import Image from "next/image";
import { useSettings } from "@/context/settings-context";

export function SheetMenu() {
  interface Settings {
    data: {
      ["general.logo"]?: string;
    };
  }
  const settings = useSettings() as unknown as Settings | null;
  const logoUrl = settings?.data?.["general.logo"] ?? "/default-logo.png";
  
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button
            className="flex justify-center items-center pb-2 pt-1"
            variant="link"
            asChild
          >
            <Link href="/" className="flex items-center">
              <SheetTitle>
                <Image 
                src={logoUrl}
                alt="Logo"
                width={120}
                height={40}
                className="w-32 h-auto sm:hidden" />
              </SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
