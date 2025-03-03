
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in based on current route
    setIsLoggedIn(location.pathname.includes('volunteer-dashboard') || location.pathname.includes('profile'));

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Define different nav links based on login status
  const getNavLinks = () => {
    const baseLinks = [{ path: '/', name: 'Home' }];
    
    if (isLoggedIn) {
      return [
        ...baseLinks,
        { path: '/donate', name: 'Donate' },
        { path: '/volunteer-dashboard', name: 'Dashboard' }
      ];
    } else {
      return [
        ...baseLinks,
        { path: '/donate', name: 'Donate' },
        { path: '/volunteer-login', name: 'Volunteer Login' }
      ];
    }
  };

  const navLinks = getNavLinks();

  const handleSignOut = () => {
    // Clear any user session data from localStorage
    localStorage.removeItem('volunteer');
    // Redirect to home page
    window.location.href = '/';
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out py-4',
        {
          'bg-white/80 backdrop-blur-md shadow-sm': scrolled,
          'bg-transparent': !scrolled
        }
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-cause-400" />
          <span className="font-medium text-xl">Cause Together</span>
        </Link>

        <div className="hidden md:flex items-center justify-end flex-grow ml-10">
          <nav className="flex items-center gap-6 mr-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-cause-500 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-cause-400 after:transition-all after:duration-300 after:ease-in-out',
                  location.pathname === link.path 
                    ? 'text-cause-600 after:w-full' 
                    : 'text-foreground after:w-0 hover:after:w-full'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <User className="w-4 h-4 mr-1" />
                    <span>My Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 w-full cursor-pointer">
                      <User className="w-4 h-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Removed login button from here as requested
              <div></div>
            )}
          </div>
        </div>

        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-md py-4 animate-slide-down">
          <nav className="container mx-auto flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-sm font-medium py-2 px-4 rounded-md transition-colors',
                  location.pathname === link.path 
                    ? 'bg-cause-200 text-cause-600' 
                    : 'text-foreground hover:bg-cause-100 hover:text-cause-500'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {isLoggedIn ? (
              <>
                <div className="pt-2 pb-1 px-4">
                  <div className="text-sm font-medium text-muted-foreground">My Account</div>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-md transition-colors hover:bg-cause-100"
                >
                  <User className="w-4 h-4" />
                  View Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-md w-full text-left text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              // Removed login button from mobile menu as requested
              <div></div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
