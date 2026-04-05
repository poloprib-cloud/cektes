import {
  Home,
  ReceiptText,
  User,
  UserCog,
  Headset,
  LucideIcon,
  BadgeDollarSign,
  Star,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string, isLoggedIn: boolean): Group[] {
  const menu: Group[] = [
    {
      groupLabel: "Menu",
      menus: [
        {
          href: "/",
          label: "Home",
          icon: Home,
        },
        {
          href: "/invoices",
          label: "Cek Invoice",
          icon: ReceiptText,
        },
        {
          href: "/price-list",
          label: "Daftar Harga",
          icon: BadgeDollarSign,
        },
        {
          href: "/ulasan-produk",
          label: "Ulasan Produk",
          icon: Star,
        },
        {
          href: "/contact",
          label: "Hubungi Kami",
          icon: Headset,
        },
      ],
    },
  ];

  return menu;
}
