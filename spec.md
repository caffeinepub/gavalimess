# डबेवाला खाते पुस्तक (Lunch Box Ledger)

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Admin login system
- Child records: name, mobile number, joining date, monthly payment status
- Dashboard showing all children with payment status
- Add/edit/delete child records
- Monthly payment tracking (mark paid/unpaid per month)
- Alert list: children whose month is complete (30 days since joining or last payment) but haven't paid
- Marathi language throughout UI

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Backend: Child record CRUD (name, mobile, joiningDate), monthly payment records (childId, month, year, paid)
2. Backend: Query for children whose payment is due (30+ days since joining month)
3. Frontend: Marathi UI with login, dashboard, add/edit child, payment tracking table, due-payment alert section
