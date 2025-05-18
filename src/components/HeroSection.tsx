
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-peersolve-purple-light dark:bg-black/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in">
              Learn Better, Together
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              PeerSolve helps students solve academic questions collaboratively, guiding each other to understand and learn.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link to="/communities">Browse Communities</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/ask">Ask a Question</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
