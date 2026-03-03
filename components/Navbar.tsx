"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { ShoppingCart, LogOut, LayoutDashboard, Menu, X, Sparkles } from "lucide-react";
import { useCart } from "@/store/useCart";
import { SearchBar } from "./SearchBar";
import { useCartDrawer } from "@/store/useCartDrawer";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID;
  const { itemCount, open: openCart } = { ...useCart(), open: useCartDrawer((s) => s.open) };
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.refresh();
    router.push("/");
  };

  const count = itemCount();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-4 px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex flex-shrink-0 items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
              S
            </div>
            <span className="font-display text-lg tracking-tight text-foreground">
              ShopBot
            </span>
          </Link>

          {/* Search */}
          <div className="mx-4 hidden flex-1 md:block md:max-w-xs">
            <Suspense fallback={<div className="h-9 w-full rounded-lg bg-secondary" />}>
              <SearchBar />
            </Suspense>
          </div>

          {/* Desktop nav */}
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            <Link
              href="/chat"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-primary transition-colors hover:text-primary/80"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Chat
            </Link>
            <Link
              href="/orders"
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Orders
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-primary transition-colors hover:text-primary/80"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}

            <div className="mx-2 h-4 w-px bg-border" />

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                  {initials}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/sign-in"
                className="ml-1 rounded-md border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary/20"
              >
                Sign in
              </Link>
            )}
          </nav>

          {/* Mobile */}
          <div className="ml-auto flex items-center gap-1 md:hidden">
            <button
              onClick={openCart}
              className="relative flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-secondary"
            >
              <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-secondary"
            >
              {mobileOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-border bg-background px-4 py-3 md:hidden">
            <div className="mb-3">
              <Suspense fallback={<div className="h-9 w-full rounded-lg bg-secondary" />}>
                <SearchBar />
              </Suspense>
            </div>
            <nav className="flex flex-col gap-1">
              <Link
                href="/chat"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-primary hover:bg-primary/10"
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Chat
              </Link>
              <Link
                href="/orders"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                My Orders
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-primary hover:bg-primary/10"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}
              <div className="my-1 border-t border-border" />
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
