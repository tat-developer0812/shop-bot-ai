import Link from "next/link";
import { SignUpForm } from "./SignUpForm";

export default function SignUpPage() {
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] md:grid-cols-2">
      {/* Left: Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-card p-10 md:flex">
        <div className="pointer-events-none absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-primary/[0.06] blur-3xl" />

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
            Join the future
            <br />
            <span className="text-gold">of shopping.</span>
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Create an account and start exploring hundreds of products with the
            help of our AI assistant.
          </p>
          <ul className="space-y-3">
            {[
              "Free account, no credit card required",
              "AI-powered product search",
              "Track orders in real-time",
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
              Create an account
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Start your AI shopping journey today
            </p>
          </div>
          <SignUpForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="font-medium text-primary transition-colors hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
