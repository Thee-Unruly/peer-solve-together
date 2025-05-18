
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const navItems = [
    { name: "Communities", path: "/communities" },
    { name: "Ask Question", path: "/ask" },
    { name: "My Questions", path: "/my-questions" },
    { name: "Study Paths", path: "/study-paths" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-glass">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 mr-6">
            <span className="text-2xl font-bold bg-gradient-to-r from-peersolve-purple to-peersolve-blue-DEFAULT bg-clip-text text-transparent">
              PeerSolve
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link to="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
