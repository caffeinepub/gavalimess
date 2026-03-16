import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import ProfileSetup from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import ChildrenPage from "./pages/ChildrenPage";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import PaymentsPage from "./pages/PaymentsPage";

type Page = "dashboard" | "children" | "payments";

export default function App() {
  const { identity, clear } = useInternetIdentity();
  const qc = useQueryClient();
  const isAuthenticated = !!identity;
  const [page, setPage] = useState<Page>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  const handleLogout = async () => {
    await clear();
    qc.clear();
    setPage("dashboard");
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  const navItems: { key: Page; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "मुख्यपान", icon: <LayoutDashboard size={18} /> },
    { key: "children", label: "मुलांची यादी", icon: <Users size={18} /> },
    { key: "payments", label: "देयके", icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-background pattern-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-sidebar text-sidebar-foreground shadow-warm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <UtensilsCrossed size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-tight text-sidebar-foreground">
                डबेवाला खाते पुस्तक
              </h1>
              <p className="text-xs text-sidebar-foreground/60 hidden sm:block">
                {userProfile?.name ?? ""}
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.key}
                data-ocid={`nav.${item.key}.link`}
                onClick={() => setPage(item.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  page === item.key
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent text-sidebar-foreground/80"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              data-ocid="nav.logout.button"
            >
              <LogOut size={16} />
              बाहेर पडा
            </Button>
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-sidebar-accent"
              onClick={() => setMenuOpen(!menuOpen)}
              data-ocid="nav.menu.toggle"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-sidebar-border overflow-hidden"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => {
                      setPage(item.key);
                      setMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${
                      page === item.key
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "hover:bg-sidebar-accent text-sidebar-foreground/80"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent"
                >
                  <LogOut size={18} />
                  बाहेर पडा
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {page === "dashboard" && <Dashboard onNavigate={setPage} />}
            {page === "children" && <ChildrenPage />}
            {page === "payments" && <PaymentsPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </footer>

      {/* Profile Setup Modal */}
      {showProfileSetup && <ProfileSetup />}
      <Toaster />
    </div>
  );
}
