
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Communities", path: "/communities" },
    { name: "Ask Question", path: "/ask" },
    { name: "My Questions", path: "/my-questions" },
    { name: "Study Paths", path: "/study-paths" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link
          to="/"
          className="flex items-center gap-2 mb-8"
          onClick={() => setOpen(false)}
        >
          <span className="text-2xl font-bold bg-gradient-to-r from-peersolve-purple to-peersolve-blue-DEFAULT bg-clip-text text-transparent">
            PeerSolve
          </span>
        </Link>
        <div className="grid gap-2 py-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-sm font-medium p-2 hover:bg-accent rounded-md"
              onClick={() => setOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="border-t mt-4 pt-4 grid gap-2">
            <Link
              to="/login"
              className="text-sm font-medium p-2 hover:bg-accent rounded-md"
              onClick={() => setOpen(false)}
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium p-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-center"
              onClick={() => setOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
