import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Child, Payment, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useGetChildren() {
  const { actor, isFetching } = useActor();
  return useQuery<Child[]>({
    queryKey: ["children"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChildren();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<[bigint, Payment[]][]>({
    queryKey: ["allPayments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPayments(childId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Payment[]>({
    queryKey: ["payments", childId?.toString()],
    queryFn: async () => {
      if (!actor || childId === null) return [];
      return actor.getPayments(childId);
    },
    enabled: !!actor && !isFetching && childId !== null,
  });
}

export function useGetPaymentsDue(year: bigint, month: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["paymentsDue", year.toString(), month.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPaymentsDue(year, month);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddChild() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, mobile }: { name: string; mobile: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addChild(name, mobile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["children"] });
      qc.invalidateQueries({ queryKey: ["paymentsDue"] });
    },
  });
}

export function useUpdateChild() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      mobile,
    }: { id: bigint; name: string; mobile: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateChild(id, name, mobile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["children"] });
    },
  });
}

export function useDeleteChild() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteChild(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["children"] });
      qc.invalidateQueries({ queryKey: ["allPayments"] });
      qc.invalidateQueries({ queryKey: ["paymentsDue"] });
    },
  });
}

export function useRecordPayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      childId,
      year,
      month,
      paid,
    }: { childId: bigint; year: bigint; month: bigint; paid: boolean }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.recordPayment(childId, year, month, paid);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["payments", vars.childId.toString()] });
      qc.invalidateQueries({ queryKey: ["allPayments"] });
      qc.invalidateQueries({ queryKey: ["paymentsDue"] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
