import Link from "next/link";

const links = {
  Shop: [
    { label: "All Products", href: "/" },
    { label: "Electronics", href: "/?category=Electronics" },
    { label: "Fashion", href: "/?category=Fashion" },
    { label: "Home", href: "/?category=Home" },
  ],
  Account: [
    { label: "Sign In", href: "/auth/sign-in" },
    { label: "Create Account", href: "/auth/sign-up" },
    { label: "My Orders", href: "/orders" },
    { label: "Cart", href: "/cart" },
  ],
  Support: [
    { label: "FAQ", href: "#" },
    { label: "Shipping Policy", href: "#" },
    { label: "Returns", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-screen-xl px-4 py-14 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
                S
              </div>
              <span className="font-display text-lg tracking-tight text-foreground">
                ShopBot
              </span>
            </Link>
            <p className="max-w-[200px] text-sm leading-relaxed text-muted-foreground">
              AI-curated shopping. Find exactly what you need, faster.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-foreground/60 transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 ShopBot. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Built with Next.js &middot; Powered by Claude AI
          </p>
        </div>
      </div>
    </footer>
  );
}
