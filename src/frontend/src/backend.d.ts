import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Child {
    id: bigint;
    name: string;
    joiningDate: Time;
    mobile: string;
}
export type Time = bigint;
export interface Payment {
    month: bigint;
    paid: boolean;
    year: bigint;
    childId: bigint;
    paidDate?: Time;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addChild(name: string, mobile: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteChild(id: bigint): Promise<void>;
    getAllPayments(): Promise<Array<[bigint, Array<Payment>]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChild(id: bigint): Promise<Child | null>;
    getChildren(): Promise<Array<Child>>;
    getPayments(childId: bigint): Promise<Array<Payment>>;
    getPaymentsDue(year: bigint, month: bigint): Promise<Array<bigint>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordPayment(childId: bigint, year: bigint, month: bigint, paid: boolean): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateChild(id: bigint, name: string, mobile: string): Promise<void>;
}
