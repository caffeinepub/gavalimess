import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarDays, CreditCard } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useGetChildren,
  useGetPayments,
  useRecordPayment,
} from "../hooks/useQueries";

const MARATHI_MONTHS = [
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

function generateMonthRange(): { year: number; month: number }[] {
  const rows: { year: number; month: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    rows.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return rows;
}

export default function PaymentsPage() {
  const { data: children = [], isLoading: childLoading } = useGetChildren();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const recordPayment = useRecordPayment();

  const selectedChild =
    children.find((c) => c.id.toString() === selectedId) ?? null;
  const { data: payments = [], isLoading: paymentsLoading } = useGetPayments(
    selectedChild ? selectedChild.id : null,
  );

  const monthRows = useMemo(() => generateMonthRange(), []);

  const getPaymentStatus = (year: number, month: number): boolean => {
    return payments.some(
      (p) => p.year === BigInt(year) && p.month === BigInt(month) && p.paid,
    );
  };

  const handleToggle = async (
    year: number,
    month: number,
    currentPaid: boolean,
  ) => {
    if (!selectedChild) return;
    try {
      await recordPayment.mutateAsync({
        childId: selectedChild.id,
        year: BigInt(year),
        month: BigInt(month),
        paid: !currentPaid,
      });
      toast.success(
        !currentPaid ? "देयक भरले म्हणून नोंदवले!" : "देयक बाकी म्हणून नोंदवले.",
      );
    } catch {
      toast.error("नोंद करताना चूक झाली.");
    }
  };

  const paidCount = monthRows.filter(({ year, month }) =>
    getPaymentStatus(year, month),
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">देयके</h2>
        <p className="text-sm text-muted-foreground mt-1">
          मुलाची मासिक देयक स्थिती पाहा व नोंदवा
        </p>
      </div>

      {/* Child selector */}
      <div className="max-w-sm">
        <Label className="mb-2 block">मूल निवडा</Label>
        {childLoading ? (
          <Skeleton
            className="h-10 w-full"
            data-ocid="payments.loading_state"
          />
        ) : (
          <Select value={selectedId ?? ""} onValueChange={setSelectedId}>
            <SelectTrigger data-ocid="payments.child.select">
              <SelectValue placeholder="— मूल निवडा —" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem
                  key={child.id.toString()}
                  value={child.id.toString()}
                >
                  {child.name} — {child.mobile}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {!selectedChild ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="payments.empty_state"
        >
          <CreditCard size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium text-foreground">वरून एक मूल निवडा</p>
          <p className="text-sm mt-1">निवडल्यानंतर मासिक देयक इतिहास दिसेल</p>
        </div>
      ) : (
        <motion.div
          key={selectedId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-primary" />
                  {selectedChild.name} — गेल्या १२ महिन्यांचा इतिहास
                </div>
                <Badge
                  className="bg-success/10 text-success border-success/20"
                  variant="outline"
                >
                  {paidCount}/१२ भरले
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div
                  className="space-y-3"
                  data-ocid="payments.history.loading_state"
                >
                  {[1, 2, 3].map((n) => (
                    <Skeleton key={n} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table data-ocid="payments.table">
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="font-semibold text-foreground">
                        महिना
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        वर्ष
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        स्थिती
                      </TableHead>
                      <TableHead className="font-semibold text-foreground text-right">
                        भरले / बाकी
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...monthRows].reverse().map(({ year, month }, idx) => {
                      const paid = getPaymentStatus(year, month);
                      return (
                        <TableRow
                          key={`${year}-${month}`}
                          className="ledger-row"
                          data-ocid={`payments.item.${idx + 1}`}
                        >
                          <TableCell className="font-medium">
                            {MARATHI_MONTHS[month]}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {year}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                paid
                                  ? "bg-success/10 text-success border-success/20"
                                  : "bg-destructive/10 text-destructive border-destructive/20"
                              }
                              variant="outline"
                            >
                              {paid ? "भरले ✓" : "बाकी आहे"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Label
                                htmlFor={`pay-${year}-${month}`}
                                className="text-xs text-muted-foreground"
                              >
                                {paid ? "भरले" : "बाकी"}
                              </Label>
                              <Switch
                                id={`pay-${year}-${month}`}
                                checked={paid}
                                onCheckedChange={() =>
                                  handleToggle(year, month, paid)
                                }
                                disabled={recordPayment.isPending}
                                data-ocid={`payments.switch.${idx + 1}`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
