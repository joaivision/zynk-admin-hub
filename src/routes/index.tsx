import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import logo from "@/assets/zynking-logo.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Zynk.ing" className="h-10 w-10 object-contain" />
          <div>
            <div className="font-bold tracking-tight">Zynk.ing</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Discover · Connect · Grow
            </div>
          </div>
        </div>
        <Button asChild className="gap-2">
          <Link to="/admin">
            <ShieldCheck className="h-4 w-4" />
            Open Admin Panel
          </Link>
        </Button>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium">
          <Sparkles className="h-3 w-3 text-primary" />
          Business networking, reimagined
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          The networking OS for founders, investors & experts.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground">
          Match, raise, hire and grow — all in one platform. Manage everything
          from a single, powerful admin console.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild className="gap-2">
            <Link to="/admin">
              Go to Admin Panel <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline">
            Learn more
          </Button>
        </div>
      </main>
    </div>
  );
}
