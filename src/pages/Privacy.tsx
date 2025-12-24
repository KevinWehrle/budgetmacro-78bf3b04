import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 pt-safe">
        <div className="flex items-center gap-3 px-4 h-16 max-w-md mx-auto">
          <Link
            to="/?tab=menu"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="font-semibold">Privacy Policy</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto">
        <div className="prose prose-invert prose-sm">
          <p className="text-muted-foreground">
            Last updated: December 24, 2024
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">
            1. Information We Collect
          </h2>
          <p className="text-muted-foreground">
            BudgetMacro collects the following information to provide our services:
          </p>
          <ul className="text-muted-foreground list-disc pl-4 space-y-1">
            <li>Food entries you log (stored locally on your device)</li>
            <li>Daily nutrition and spending goals</li>
            <li>Anonymous usage analytics to improve the app</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-6">
            2. How We Use Your Information
          </h2>
          <p className="text-muted-foreground">
            We use your information to:
          </p>
          <ul className="text-muted-foreground list-disc pl-4 space-y-1">
            <li>Track your daily macros and spending</li>
            <li>Provide AI-powered food analysis</li>
            <li>Improve our services and user experience</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-6">
            3. Data Storage
          </h2>
          <p className="text-muted-foreground">
            Your food entries and personal data are stored locally on your device. We do not store personal information on external servers unless you create an account.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">
            4. Third-Party Services
          </h2>
          <p className="text-muted-foreground">
            We may use third-party services including:
          </p>
          <ul className="text-muted-foreground list-disc pl-4 space-y-1">
            <li>Google AdSense for advertisements</li>
            <li>Analytics services to understand app usage</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-6">
            5. Your Rights
          </h2>
          <p className="text-muted-foreground">
            You have the right to:
          </p>
          <ul className="text-muted-foreground list-disc pl-4 space-y-1">
            <li>Access your personal data</li>
            <li>Delete your data at any time</li>
            <li>Opt out of analytics tracking</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-6">
            6. Contact Us
          </h2>
          <p className="text-muted-foreground">
            If you have questions about this Privacy Policy, please contact us at support@budgetmacro.app
          </p>
        </div>
      </main>
    </div>
  );
}
