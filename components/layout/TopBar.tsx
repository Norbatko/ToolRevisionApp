"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface TopBarProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export function TopBar({ title, showBack = false, rightElement }: TopBarProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 print:hidden">
      <div className="max-w-lg mx-auto flex items-center h-14 px-4 gap-2">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 shrink-0"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}

        <h1 className="flex-1 font-semibold text-base truncate">{title}</h1>

        {rightElement}

        {!showBack && user && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            title="Odhlásit se"
          >
            <LogOut className="w-4 h-4 text-gray-500" />
          </Button>
        )}
      </div>
    </header>
  );
}
