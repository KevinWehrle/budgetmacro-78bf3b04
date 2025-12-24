import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Target, DollarSign } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 pt-safe">
        <div className="flex items-center gap-3 px-4 h-16 max-w-md mx-auto">
          <Link
            to="/"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h1 className="font-semibold">About BudgetMacro</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4 neon-glow">
            <Zap className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Budget<span className="text-primary neon-glow-text">Macro</span>
          </h2>
          <p className="text-muted-foreground mt-2">
            Track macros. Save money. Get gains.
          </p>
        </div>

        <div className="space-y-4">
          <div className="cyber-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-progress-protein" />
              <h3 className="font-semibold text-foreground">Our Mission</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              We built BudgetMacro for college students who want to hit their protein goals without breaking the bank. Because being broke shouldn't mean being weak.
            </p>
          </div>

          <div className="cyber-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-progress-money" />
              <h3 className="font-semibold text-foreground">Budget-First Approach</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Unlike other macro trackers, we focus on the protein-per-dollar ratio. Our Value Foods list helps you maximize gains while minimizing spending.
            </p>
          </div>

          <div className="cyber-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">AI-Powered Entry</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Just type what you ate in plain English. Our AI estimates the protein content and cost automatically, making logging effortless.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Built for broke college students.</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </main>
    </div>
  );
}
