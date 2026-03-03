import Link from "next/link";
import { SignInForm } from "./SignInForm";

export default function SignInPage() {
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] md:grid-cols-2">
      {/* Left: Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-card p-10 md:flex">
        {/* Gold gradient accent */}
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-primary/[0.06] blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
            S
          </div>
          <span className="font-display text-lg tracking-tight text-foreground">
            ShopBot
          </span>
        </Link>

        <div className="relative space-y-6">
          <h2
            className="text-3xl leading-tight text-foreground"

          >
            Your AI shopping
            <br />
            <span className="text-gold">assistant awaits.</span>
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Sign in to track orders, get personalized recommendations, and chat
            with our AI to find exactly what you need.
          </p>
          <ul className="space-y-3">
            {[
              "AI-powered product recommendations",
              "Order tracking & history",
              "Personalized shopping experience",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-foreground/70">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] text-primary">
                  &#10003;
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground/50">&copy; 2026 ShopBot</p>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1
              className="text-2xl text-foreground"
  
            >
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
          <SignInForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="font-medium text-primary transition-colors hover:text-primary/80">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
