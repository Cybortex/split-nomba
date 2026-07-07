import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold text-gold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
          <p className="text-sm text-muted mt-1.5">
            Sign in to access your dashboard
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-surface border border-border rounded-xl shadow-none w-full",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "hidden",
              dividerRow: "hidden",
              formButtonPrimary:
                "bg-gold text-black font-semibold hover:brightness-110 transition-all duration-200 rounded-xl py-2.5 text-sm",
              formFieldInput:
                "w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold transition-all duration-200",
              formFieldLabel: "text-sm font-medium text-secondary mb-1.5",
              footerActionLink: "text-gold hover:text-gold-royal transition-colors",
              footer: "bg-surface border-t border-border rounded-b-xl",
              identityPreviewText: "text-primary",
              identityPreviewEditButton: "text-gold",
            },
          }}
        />

        <p className="text-xs text-center text-muted-dark leading-relaxed">
          This is a private platform. Accounts are created by your institution administrator.
        </p>
      </div>
    </div>
  );
}
