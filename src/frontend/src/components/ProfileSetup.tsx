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
import { UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

export default function ProfileSetup() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const save = useSaveCallerUserProfile();

  const handleSave = async () => {
    if (!name.trim()) {
      setError("नाव आवश्यक आहे");
      return;
    }
    try {
      await save.mutateAsync({ name: name.trim() });
      toast.success("स्वागत आहे! प्रोफाइल जतन झाला.");
    } catch {
      toast.error("प्रोफाइल जतन होऊ शकला नाही.");
    }
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-sm" data-ocid="profile.dialog">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UtensilsCrossed size={20} className="text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">
              स्वागत आहे!
            </DialogTitle>
          </div>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2 mb-4">
          डबेवाला खाते पुस्तकात पहिल्यांदा आलात. कृपया आपले नाव द्या.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">आपले नाव</Label>
          <Input
            id="profile-name"
            placeholder="नाव टाका"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            data-ocid="profile.name.input"
          />
          {error && (
            <p
              className="text-xs text-destructive"
              data-ocid="profile.name.error_state"
            >
              {error}
            </p>
          )}
        </div>
        <DialogFooter className="mt-4">
          <Button
            onClick={handleSave}
            disabled={save.isPending}
            className="w-full bg-primary text-primary-foreground"
            data-ocid="profile.submit_button"
          >
            {save.isPending ? "जतन होत आहे..." : "सुरू करा"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
