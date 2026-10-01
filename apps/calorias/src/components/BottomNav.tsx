"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SettingsIcon } from "./icons";

const TABS = [
  { href: "/", label: "Hoy", Icon: HomeIcon },
  { href: "/settings", label: "Ajustes", Icon: SettingsIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom sticky bottom-0 z-10 border-t border-neutral-200 bg-white/95 backdrop-blur">
      <div className="grid grid-cols-2">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                active ? "text-emerald-600" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <Icon className="h-6 w-6" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
