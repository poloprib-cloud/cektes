"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { BookOpenText, KeyRound, LogOut, LayoutDashboard, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
  const { data: session } = useSession();

  const getBadgeClass = (role?: string | null) => {
    switch (role) {
      case "gold":
        return "bg-yellow-500 text-white";
      case "platinum":
        return "bg-gray-400 text-black";
      case "basic":
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const role = session?.user?.role ?? "basic";
  const subtitle = session?.user?.whatsapp || session?.user?.email || "";

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                  <AvatarFallback className="bg-transparent">{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Akun</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal space-y-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{subtitle}</p>
          </div>
          <Badge className={`w-fit ${getBadgeClass(role)}`}>{role}</Badge>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center">
              <LayoutDashboard className="w-4 h-4 mr-3 text-muted-foreground" />
              Dashboard
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/account-settings" className="flex items-center">
              <Settings2 className="w-4 h-4 mr-3 text-muted-foreground" />
              Pengaturan Akun
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/account-settings/api" className="flex items-center">
              <KeyRound className="w-4 h-4 mr-3 text-muted-foreground" />
              Pengaturan API
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/developer/api" className="flex items-center">
              <BookOpenText className="w-4 h-4 mr-3 text-muted-foreground" />
              Dokumentasi API
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="hover:cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
