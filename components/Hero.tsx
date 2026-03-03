"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const categories = [
  { label: "Electronics", icon: "01", desc: "Latest tech & gadgets" },
  { label: "Fashion", icon: "02", desc: "Curated styles" },
  { label: "Home", icon: "03", desc: "Interior essentials" },
  { label: "Sports", icon: "04", desc: "Gear & equipment" },
];

export function Hero() {
  const openChat = () => {
    window.dispatchEvent(
      new CustomEvent("open-chat", { detail: { message: "What are your best products?" } })
    );
  };

  return (
    <section className="relative overflow-hidden border-b border-border/40">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-3xl" />

      <div className="mx-auto max-w-screen-xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
          {/* Text */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3.5 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              AI-Curated Shopping
            </div>

            <h1 className="text-4xl leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[3.5rem]">
              Discover what&apos;s
              <br />
              <span className="text-gold">worth having.</span>
            </h1>

            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              Our AI assistant knows every product intimately. Ask anything &mdash;
              find, compare, and decide with confidence.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="#products"
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow"
              >
                Explore Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                onClick={openChat}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-primary/[0.06]"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Ask the AI
              </button>
            </div>

            <div className="flex items-center gap-8 border-t border-border/60 pt-6 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">500+</strong> Products
              </span>
              <span>
                <strong className="text-primary">AI</strong> Powered
              </span>
              <span>
                <strong className="text-foreground">Free</strong> Shipping $50+
              </span>
            </div>
          </div>

          {/* Category grid */}
          <div className="hidden grid-cols-2 gap-3 md:grid">
            {categories.map((cat, i) => (
              <Link
                key={cat.label}
                href={`/?category=${cat.label}`}
                className={`group flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover ${
                  i % 2 === 1 ? "mt-6" : ""
                }`}
              >
                <span className="text-xs font-mono text-primary/60">{cat.icon}</span>
                <div className="mt-8">
                  <p className="text-base font-medium text-foreground">{cat.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{cat.desc}</p>
                </div>
                <ArrowRight className="mt-3 h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
