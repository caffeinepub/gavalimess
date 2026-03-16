import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module YearMonth {
    public type YearMonth = { year : Nat; month : Nat };

    public func compare(a : YearMonth, b : YearMonth) : Order.Order {
      switch (Nat.compare(a.year, b.year)) {
        case (#equal) { Nat.compare(a.month, b.month) };
        case (order) { order };
      };
    };
  };

  module Child {
    public type Child = {
      id : Nat;
      name : Text;
      mobile : Text;
      joiningDate : Time.Time;
    };
  };

  module Payment {
    public type Payment = {
      childId : Nat;
      year : Nat;
      month : Nat;
      paid : Bool;
      paidDate : ?Time.Time;
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextChildId = 1;
  let children = Map.empty<Nat, Child.Child>();
  let payments = Map.empty<Nat, Set.Set<Payment.Payment>>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Child Management Functions
  public shared ({ caller }) func addChild(name : Text, mobile : Text) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add children");
    };
    let child = {
      id = nextChildId;
      name;
      mobile;
      joiningDate = Time.now();
    };
    children.add(nextChildId, child);
    payments.add(nextChildId, Set.empty<Payment.Payment>());
    nextChildId += 1;
    (child.id);
  };

  public shared ({ caller }) func updateChild(id : Nat, name : Text, mobile : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update children");
    };
    switch (children.get(id)) {
      case (null) { Runtime.trap("Child not found: " # id.toText()) };
      case (?existing) {
        let updated = {
          id;
          name;
          mobile;
          joiningDate = existing.joiningDate;
        };
        children.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteChild(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete children");
    };
    children.remove(id);
    payments.remove(id);
  };

  public query ({ caller }) func getChildren() : async [Child.Child] {
    children.values().toArray();
  };

  public query ({ caller }) func getChild(id : Nat) : async ?Child.Child {
    children.get(id);
  };

  // Payment Management Functions
  public shared ({ caller }) func recordPayment(childId : Nat, year : Nat, month : Nat, paid : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can record payments");
    };
    switch (payments.get(childId)) {
      case (null) { Runtime.trap("Child not found: " # childId.toText()) };
      case (?existing) {
        let payment = {
          childId;
          year;
          month;
          paid;
          paidDate = if (paid) { ?Time.now() } else { null };
        };
        existing.add(payment);
      };
    };
  };

  public query ({ caller }) func getPayments(childId : Nat) : async [Payment.Payment] {
    switch (payments.get(childId)) {
      case (null) { [] };
      case (?p) { p.toArray() };
    };
  };

  public query ({ caller }) func getAllPayments() : async [(Nat, [Payment.Payment])] {
    let result = List.empty<(Nat, [Payment.Payment])>();
    for ((childId, paymentSet) in payments.entries()) {
      result.add((childId, paymentSet.toArray()));
    };
    result.toArray();
  };

  public query ({ caller }) func getPaymentsDue(year : Nat, month : Nat) : async [Nat] {
    let list = List.empty<Nat>();
    for ((id, _) in children.entries()) {
      switch (payments.get(id)) {
        case (null) { list.add(id) };
        case (?paymentSet) {
          let hasPayment = paymentSet.toArray().any(func(p : Payment.Payment) : Bool { p.year == year and p.month == month and p.paid });
          if (not hasPayment) {
            list.add(id);
          };
        };
      };
    };
    list.toArray();
  };
};
