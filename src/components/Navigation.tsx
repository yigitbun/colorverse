
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon } from "lucide-react";

export const Navigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-gray-900 font-mono">
            ColorVerse
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 font-mono transition-colors">
              Home
            </Link>
            <Link to="/explore" className="text-gray-600 hover:text-gray-900 font-mono transition-colors">
              Explore
            </Link>
            <Link to="/community" className="text-gray-600 hover:text-gray-900 font-mono transition-colors">
              Community
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-gray-900 font-mono transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-mono transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link to="/account">
                  <Button variant="ghost" size="sm" className="font-mono">
                    <UserIcon className="w-4 h-4 mr-2" />
                    {user.email?.split('@')[0]}
                  </Button>
                </Link>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="font-mono">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" className="font-mono">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="font-mono">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
