import { Button } from "@/components/ui/button";
import { BookOpen, IndianRupee, Users, UtensilsCrossed } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const FEATURES = [
  { id: "info", icon: <Users size={20} />, text: "मुलांची माहिती ठेवा" },
  { id: "payment", icon: <IndianRupee size={20} />, text: "दरमहा देयक नोंद करा" },
  { id: "ledger", icon: <BookOpen size={20} />, text: "खाते पुस्तक सहज पाहा" },
];

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background pattern-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl shadow-warm border border-border overflow-hidden"
        >
          {/* Top band */}
          <div className="bg-sidebar px-8 py-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
              className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5"
            >
              <UtensilsCrossed size={40} className="text-sidebar-primary" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-sidebar-foreground leading-tight">
              डबेवाला
            </h1>
            <h2 className="font-display text-xl font-semibold text-sidebar-foreground/80 mt-1">
              खाते पुस्तक
            </h2>
            <p className="text-sm text-sidebar-foreground/60 mt-3">
              मुलांचे जेवण डबा व देयके व्यवस्थापित करा
            </p>
          </div>

          {/* Features list */}
          <div className="px-8 py-6">
            <ul className="space-y-3 mb-8">
              {FEATURES.map((f, i) => (
                <motion.li
                  key={f.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 text-sm text-foreground/80"
                >
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    {f.icon}
                  </span>
                  {f.text}
                </motion.li>
              ))}
            </ul>

            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-base rounded-xl"
              data-ocid="login.primary_button"
            >
              {isLoggingIn ? "लॉगिन होत आहे..." : "आत या / लॉगिन करा"}
            </Button>
          </div>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} डबेवाला खाते पुस्तक ·{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
