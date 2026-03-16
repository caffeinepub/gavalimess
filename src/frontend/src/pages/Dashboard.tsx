import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, Clock, Phone, Users } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import type { Child } from "../backend.d";
import {
  useGetAllPayments,
  useGetChildren,
  useGetPaymentsDue,
} from "../hooks/useQueries";

type Page = "dashboard" | "children" | "payments";

interface Props {
  onNavigate: (p: Page) => void;
}

function formatDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleDateString("mr-IN");
}

export default function Dashboard({ onNavigate }: Props) {
  const now = new Date();
  const currentYear = BigInt(now.getFullYear());
  const currentMonth = BigInt(now.getMonth() + 1);

  const { data: children = [], isLoading: childLoading } = useGetChildren();
  const { data: dueIds = [], isLoading: dueLoading } = useGetPaymentsDue(
    currentYear,
    currentMonth,
  );
  const { data: allPayments = [], isLoading: paymentsLoading } =
    useGetAllPayments();

  const isLoading = childLoading || dueLoading || paymentsLoading;

  const paidThisMonth = useMemo(() => {
    let count = 0;
    for (const [, payments] of allPayments) {
      const hasPaid = payments.some(
        (p) => p.year === currentYear && p.month === currentMonth && p.paid,
      );
      if (hasPaid) count++;
    }
    return count;
  }, [allPayments, currentYear, currentMonth]);

  const dueChildren: Child[] = useMemo(() => {
    return children.filter((c) => dueIds.includes(c.id));
  }, [children, dueIds]);

  const unpaidCount = dueChildren.length;

  const marathiMonths = [
    "",
    "जानेवारी",
    "फेब्रुवारी",
    "मार्च",
    "एप्रिल",
    "मे",
    "जून",
    "जुलै",
    "ऑगस्ट",
    "सप्टेंबर",
    "ऑक्टोबर",
    "नोव्हेंबर",
    "डिसेंबर",
  ];
  const currentMonthName = marathiMonths[now.getMonth() + 1];

  const stats = [
    {
      label: "एकूण मुले",
      value: children.length,
      icon: <Users size={22} />,
      color: "bg-accent/10 text-accent",
      loading: childLoading,
    },
    {
      label: "या महिन्यात भरले",
      value: paidThisMonth,
      icon: <CheckCircle2 size={22} />,
      color: "bg-success/10 text-success",
      loading: isLoading,
    },
    {
      label: "बाकी आहे",
      value: unpaidCount,
      icon: <Clock size={22} />,
      color: "bg-destructive/10 text-destructive",
      loading: isLoading,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          मुख्यपान
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {currentMonthName} {now.getFullYear()} — सद्यस्थिती
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              className="border-border shadow-xs hover:shadow-warm transition-shadow"
              data-ocid="dashboard.stat.card"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {s.label}
                    </p>
                    {s.loading ? (
                      <Skeleton
                        className="h-8 w-12 mt-1"
                        data-ocid="dashboard.loading_state"
                      />
                    ) : (
                      <p className="text-3xl font-display font-bold text-foreground mt-1">
                        {s.value}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}
                  >
                    {s.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Due payments alert */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <AlertTriangle size={18} className="text-destructive" />
              या महिन्यात पैसे न भरलेली मुले
              {!dueLoading && (
                <Badge variant="destructive" className="ml-auto">
                  {unpaidCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div
                className="space-y-3"
                data-ocid="dashboard.due.loading_state"
              >
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : dueChildren.length === 0 ? (
              <div
                className="text-center py-10 text-muted-foreground"
                data-ocid="dashboard.due.empty_state"
              >
                <CheckCircle2
                  size={40}
                  className="mx-auto mb-3 text-success opacity-70"
                />
                <p className="font-medium text-foreground">
                  🎉 सर्व मुलांनी पैसे भरले आहेत!
                </p>
                <p className="text-sm mt-1">
                  {currentMonthName} महिन्यातील सर्व देयके भरली गेली.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {dueChildren.map((child, idx) => (
                  <motion.div
                    key={child.id.toString()}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                    data-ocid={`dashboard.due.item.${idx + 1}`}
                  >
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {child.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        प्रवेश: {formatDate(child.joiningDate)}
                      </p>
                    </div>
                    <a
                      href={`tel:${child.mobile}`}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors"
                    >
                      <Phone size={14} />
                      {child.mobile}
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onNavigate("children")}
          className="p-4 rounded-xl border border-border bg-card text-left hover:shadow-warm transition-all hover:border-primary/40"
          data-ocid="dashboard.children.link"
        >
          <Users size={20} className="text-accent mb-2" />
          <p className="font-semibold text-sm">मुलांची यादी</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            मुले जोडा, बदला, हटवा
          </p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("payments")}
          className="p-4 rounded-xl border border-border bg-card text-left hover:shadow-warm transition-all hover:border-primary/40"
          data-ocid="dashboard.payments.link"
        >
          <CheckCircle2 size={20} className="text-primary mb-2" />
          <p className="font-semibold text-sm">देयके</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            देयक भरले / न भरले नोंद करा
          </p>
        </button>
      </div>
    </div>
  );
}
