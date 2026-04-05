"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calculator, ChevronDown, Percent, Sparkles, Star, BookOpen } from "lucide-react";

import { useSettings } from "@/context/settings-context";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/panel/user-nav";
import { SheetMenu } from "@/components/panel/sheet-menu";
import { Search } from "@/components/panel/search";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getMenuList } from "@/lib/menu-list";
import { cn } from "@/lib/utils";

export function Navbar() {
  interface Settings {
    data: Record<string, any>;
  }

  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const settings = useSettings() as unknown as Settings | null;
  const logoUrl = settings?.data?.["general.logo"] as string | undefined;
  const logoTitle = settings?.data?.["general.title"] as string | undefined;

  const allowThemeToggle = settings?.data?.["theme.allow_toggle"] !== false;

  const enableWinrate = Boolean(settings?.data?.["enable_kalkulator_winrate"]);
  const enableMagicWheel = Boolean(settings?.data?.["enable_kalkulator_magic_wheel"]);
  const enableZodiac = Boolean(settings?.data?.["enable_kalkulator_zodiac"]);

  const kalkulatorItems = [
    { href: "/kalkulator/winrate", label: "Cek Winrate", icon: Percent, enabled: enableWinrate },
    { href: "/kalkulator/magic-wheel", label: "Cek Magic Wheel", icon: Sparkles, enabled: enableMagicWheel },
    { href: "/kalkulator/zodiac", label: "Cek Zodiac", icon: Star, enabled: enableZodiac },
  ].filter((x) => x.enabled);

  const pathname = usePathname();
  const kalkulatorActive = pathname === "/kalkulator" || pathname.startsWith("/kalkulator/");
  const menuList = getMenuList(pathname, isLoggedIn);

  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex h-16 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <Link href="/">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={logoTitle || "logo"}
                width={120}
                height={40}
                priority
                className="w-32 h-auto"
              />
            ) : (
              <Skeleton className="w-32 h-10 sm:hidden" />
            )}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Search />
          <div className="hidden lg:block">
            {!isLoggedIn && (
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="shadow-none">
                  <Link href="/signin">Masuk</Link>
                </Button>
                <Button asChild size="sm" className="shadow-none">
                  <Link href="/signup">Daftar</Link>
                </Button>
              </div>
            )}
          </div>
          {allowThemeToggle && <ModeToggle />}
          {session && <UserNav />}
        </div>
      </div>

      <nav className="mx-4 sm:mx-8 border-t border-border pt-2 pb-3 overflow-x-auto hidden md:flex items-center">
        <ul className="flex items-center gap-3">
          {menuList.flatMap(({ menus }) =>
            menus.flatMap(({ href, label, icon: Icon, active }) => {
              const nodes: React.ReactNode[] = [];

              nodes.push(
                <li key={href}>
                  <Link href={href}>
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      className={cn(
                        "gap-2",
                        pathname === href || pathname.startsWith(`${href}/`) ? "text-primary" : ""
                      )}
                    >
                      <Icon size={16} />
                      <span className="text-sm">{label}</span>
                    </Button>
                  </Link>
                </li>
              );

              if (href === "/price-list" && kalkulatorItems.length > 0) {
                nodes.push(
                  <li key="kalkulator-dropdown-desktop">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant={kalkulatorActive ? "secondary" : "ghost"}
                          className={cn("gap-2", kalkulatorActive ? "text-primary" : "")}
                        >
                          <Calculator size={16} />
                          <span className="text-sm">Kalkulator</span>
                          <ChevronDown size={14} className="opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[220px]">
                        {kalkulatorItems.map((item) => (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href} className="w-full px-2 py-1.5 text-sm flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                );
              }

              return nodes;
            })
          )}

          <li>
            <Link href="/developer/api">
              <Button
                variant={pathname === "/developer/api" ? "secondary" : "ghost"}
                className={cn("gap-2", pathname === "/developer/api" ? "text-primary" : "")}
              >
                <BookOpen size={16} />
                <span className="text-sm">API Docs</span>
              </Button>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}