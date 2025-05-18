
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navItems = [
    { name: "Communities", path: "/communities" },
    { name: "Ask Question", path: "/ask" },
    { name: "My Questions", path: "/my-questions" },
    { name: "Study Paths", path: "/study-paths" },
  ];
  
  const handleSignOut = async () => {
    try {
      await signOut();
      setOpen(false);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

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
            {user ? (
              <>
                <div className="text-sm font-medium p-2">{user.email}</div>
                <Link
                  to="/profile"
                  className="text-sm font-medium p-2 hover:bg-accent rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
                <Button 
                  onClick={handleSignOut}
                  className="text-sm font-medium text-left justify-start gap-2 p-2"
                  variant="ghost"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-sm font-medium p-2 hover:bg-accent rounded-md"
                  onClick={() => setOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/auth"
                  className="text-sm font-medium p-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-center"
                  onClick={() => setOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
