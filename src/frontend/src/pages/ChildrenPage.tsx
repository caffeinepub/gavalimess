import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Child } from "../backend.d";
import {
  useAddChild,
  useDeleteChild,
  useGetChildren,
  useUpdateChild,
} from "../hooks/useQueries";
import { useGetPaymentsDue } from "../hooks/useQueries";

function formatDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleDateString("mr-IN");
}

type FormData = { name: string; mobile: string };

export default function ChildrenPage() {
  const now = new Date();
  const currentYear = BigInt(now.getFullYear());
  const currentMonth = BigInt(now.getMonth() + 1);

  const { data: children = [], isLoading } = useGetChildren();
  const { data: dueIds = [] } = useGetPaymentsDue(currentYear, currentMonth);

  const addChild = useAddChild();
  const updateChild = useUpdateChild();
  const deleteChild = useDeleteChild();

  const [addOpen, setAddOpen] = useState(false);
  const [editChild, setEditChild] = useState<Child | null>(null);
  const [deleteChild_, setDeleteChild] = useState<Child | null>(null);
  const [form, setForm] = useState<FormData>({ name: "", mobile: "" });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "नाव आवश्यक आहे";
    if (!form.mobile.trim()) e.mobile = "मोबाइल नंबर आवश्यक आहे";
    else if (!/^[6-9]\d{9}$/.test(form.mobile.trim()))
      e.mobile = "योग्य मोबाइल नंबर टाका";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    setForm({ name: "", mobile: "" });
    setErrors({});
    setAddOpen(true);
  };

  const openEdit = (child: Child) => {
    setForm({ name: child.name, mobile: child.mobile });
    setErrors({});
    setEditChild(child);
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (editChild) {
        await updateChild.mutateAsync({
          id: editChild.id,
          name: form.name.trim(),
          mobile: form.mobile.trim(),
        });
        toast.success("माहिती अद्यतनित केली!");
        setEditChild(null);
      } else {
        await addChild.mutateAsync({
          name: form.name.trim(),
          mobile: form.mobile.trim(),
        });
        toast.success("मूल यशस्वीपणे जोडले!");
        setAddOpen(false);
      }
    } catch {
      toast.error("काहीतरी चूक झाली. पुन्हा प्रयत्न करा.");
    }
  };

  const handleDelete = async () => {
    if (!deleteChild_) return;
    try {
      await deleteChild.mutateAsync(deleteChild_.id);
      toast.success("मूल हटवले!");
      setDeleteChild(null);
    } catch {
      toast.error("हटवताना चूक झाली.");
    }
  };

  const isSaving = addChild.isPending || updateChild.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            मुलांची यादी
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            एकूण {children.length} मुले नोंदणीकृत
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-primary text-primary-foreground"
          data-ocid="children.add.open_modal_button"
        >
          <Plus size={16} className="mr-2" /> मूल जोडा
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3" data-ocid="children.loading_state">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-12 w-full" />
            ))}
          </div>
        ) : children.length === 0 ? (
          <div className="text-center py-16" data-ocid="children.empty_state">
            <Users
              size={48}
              className="mx-auto mb-4 text-muted-foreground/40"
            />
            <p className="font-semibold text-foreground">
              अजून कोणतीही मुले जोडलेली नाहीत
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              वर &ldquo;मूल जोडा&rdquo; बटण दाबा
            </p>
          </div>
        ) : (
          <Table data-ocid="children.table">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold text-foreground">
                  नाव
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  मोबाइल नंबर
                </TableHead>
                <TableHead className="font-semibold text-foreground hidden sm:table-cell">
                  प्रवेश तारीख
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  स्थिती
                </TableHead>
                <TableHead className="font-semibold text-foreground text-right">
                  क्रिया
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {children.map((child, idx) => {
                const isDue = dueIds.includes(child.id);
                return (
                  <TableRow
                    key={child.id.toString()}
                    className="ledger-row"
                    data-ocid={`children.item.${idx + 1}`}
                  >
                    <TableCell className="font-medium">{child.name}</TableCell>
                    <TableCell>
                      <a
                        href={`tel:${child.mobile}`}
                        className="text-accent hover:underline"
                      >
                        {child.mobile}
                      </a>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {formatDate(child.joiningDate)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          isDue
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-success/10 text-success border-success/20"
                        }
                        variant="outline"
                      >
                        {isDue ? "बाकी आहे" : "भरले"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(child)}
                          className="h-8 w-8 p-0"
                          data-ocid={`children.edit_button.${idx + 1}`}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteChild(child)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          data-ocid={`children.delete_button.${idx + 1}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={addOpen || !!editChild}
        onOpenChange={(o) => {
          if (!o) {
            setAddOpen(false);
            setEditChild(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" data-ocid="children.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editChild ? "माहिती बदला" : "नवीन मूल जोडा"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="child-name">नाव *</Label>
              <Input
                id="child-name"
                placeholder="मुलाचे नाव टाका"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="children.name.input"
              />
              {errors.name && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="children.name.error_state"
                >
                  {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="child-mobile">मोबाइल नंबर *</Label>
              <Input
                id="child-mobile"
                placeholder="१०-अंकी मोबाइल नंबर"
                value={form.mobile}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mobile: e.target.value }))
                }
                maxLength={10}
                data-ocid="children.mobile.input"
              />
              {errors.mobile && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="children.mobile.error_state"
                >
                  {errors.mobile}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAddOpen(false);
                setEditChild(null);
              }}
              data-ocid="children.dialog.cancel_button"
            >
              रद्द करा
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-primary-foreground"
              data-ocid="children.dialog.submit_button"
            >
              {isSaving ? "जतन होत आहे..." : "जतन करा"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteChild_}
        onOpenChange={(o) => {
          if (!o) setDeleteChild(null);
        }}
      >
        <AlertDialogContent data-ocid="children.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>हटवायचे का?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteChild_?.name}</strong> यांची सर्व माहिती आणि देयके
              कायमची हटवली जातील.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="children.delete.cancel_button">
              रद्द करा
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              data-ocid="children.delete.confirm_button"
            >
              हटवा
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
