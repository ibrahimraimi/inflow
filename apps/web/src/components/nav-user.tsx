"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@inflow/core/lib/auth-client";
import { Button } from "@inflow/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@inflow/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@inflow/ui";

export function UserNav({
  user,
  isMobile = false,
}: {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  isMobile?: boolean;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  // Mobile version
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-3 border rounded-lg bg-card">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || ""} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <Link href="/dashboard">
          <Button variant="ghost" className="w-full justify-between">
            <span>Dashboard</span>
            <span className="text-xs text-muted-foreground">⇧⌘P</span>
          </Button>
        </Link>

        <Link href="/dashboard/settings">
          <Button variant="ghost" className="w-full justify-between">
            <span>Settings</span>
            <span className="text-xs text-muted-foreground">⌘S</span>
          </Button>
        </Link>

        {/* Sign Out */}
        <Button
          variant="ghost"
          className="w-full justify-between text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <span>Log out</span>
          <span className="text-xs text-muted-foreground">⇧⌘Q</span>
        </Button>
      </div>
    );
  }

  // Desktop version - dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image || ""} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{user.name}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard")}>
            Dashboard
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
