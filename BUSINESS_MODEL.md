# FARMVILLA — Business & Operations Model
Version 1 · 12 November 2026 · Sri Lanka

## Positioning
FARMVILLA begins with a single one-bedroom farm retreat for couples, quiet weekend stays and small pre-approved celebrations. The public site is deliberately text-led and photo-free. Future individual pools, additional villas and a farm/BYOB dining concept are **ideas only** and must not be marketed as available amenities.

## Digital architecture
- Guest site: https://auto-0.github.io/farmvilla/
- Owner console: https://auto-0.github.io/farmvilla/admin/
- Source repository: https://github.com/AUTO-0/farmvilla
- The owner console in Version 1 is **local-only** and stores records in browser localStorage. It is an operational prototype, not a private authenticated production system. On a different device its database will be empty. Clearing browsing data may delete records. It does not transmit guest enquiries from the public site. Do not enter real customer personal information until a secure backend and access control are provisioned.
- To enable live bookings: create a separate dedicated villa project in an approved backend; set up staff authentication, row-level security, private customer data, server-side availability and booking transactions, audit log, automated confirmation email or WhatsApp via an approved service, invoice numbering and payment verification. Do NOT connect this to FIELDZERO records.

## Service and guest journey
1. Customer sees marketing, concept details, honest amenities and price/terms; chooses check-in and check-out dates.
2. Guest submits enquiry via a verified channel. Until the live booking backend exists, website contact enquiry is **not** transmitted.
3. Staff checks availability and guest count, acknowledges enquiry, shares total price and house rules.
4. Confirm only after customer agrees to terms and deposit/payment policy, and payment has been independently verified.
5. Assign a unique booking reference; record due balance, deposit, payment receipts and cancellations.
6. Before arrival, send directions and check-in instructions; confirm cleaning and inspection.
7. Check-in and check-out: inventory checklist, damage/deposit handling, cleaning, guest feedback.
8. Post-stay: request permission-based review and track referral/repeat booking sources.

## Villa 01 scope
- One bedroom; private bathroom; wardrobe; compact kitchenette; shaded sitting space. Verify each amenity before claiming it is ready.
- Two-person default occupancy for a premium couples-oriented proposition. Additional guests/parties only by explicit approval after assessing legal occupancy, noise, neighbours, sanitation, safety and insurance.
- Display occupancy limits, smoking/pet rules, check-in/out windows and cancellation policy before launching.
- Pools and food service require their own safety/operational approvals and separate economics.

## Example economics — illustrative, NOT current rates
All amounts LKR. User should replace all sample assumptions with real quotations and records.

Assumptions:
- Published average daily rate (ADR): 14,000 / sold night
- Variable cost per occupied night (cleaning, laundry, consumables, utilities): 2,500
- Booking/distribution fees assumed: 12% of gross revenue (1,680/night); this is just a planning assumption, direct bookings may cost less.
- Fixed monthly costs (maintenance reserve, connectivity, caretaking/marketing): 35,000.
- Initial capital scenario: 1,000,000 for illustration only; obtain a detailed construction and furnishing BOQ.
- One villa has up to 30 saleable nights in a typical 30-day month.

| Sold nights/month | Occupancy | Gross sales | Variable + distribution | Fixed costs | Illustrative operating surplus |
|---:|---:|---:|---:|---:|---:|
| 8 | 26.7% | 112,000 | 33,440 | 35,000 | 43,560 |
| 12 | 40.0% | 168,000 | 50,160 | 35,000 | 82,840 |
| 16 | 53.3% | 224,000 | 66,880 | 35,000 | 122,120 |

Contribution per occupied night: 14,000 - 2,500 - 1,680 = 9,820.
Illustrative operating break-even: ceil(35,000/9,820) = **4 booked nights/month**.
At 12 booked nights/month, simple initial-capital payback: 1,000,000 / 82,840 ≈ **12.1 months** (only a scenario, not a forecast).
This surplus excludes financing, income taxes, permitting/insurance, large repairs, owner labour, depreciation, land costs not included in fixed cost, and changes in room rates/commissions. True payback may be much longer. A 1m construction cap may not be sufficient for full fit-out.

## Pricing architecture
- Weekday base stay (Mon–Thu) and weekend base stay (Fri–Sun).
- Holiday uplift and minimum-night conditions where justified by demand.
- Romantic getaway / picnic upgrades only if supplied safely and at known cost.
- Small events charged separately based on guest count, cleaning, time and noise restrictions; avoid unapproved large parties.
- Direct enquiry discount should not undercut operating cost or conflict with marketplace agreements.
- Quote separate cleaning charges transparently and disclose refundable deposits/cancellation terms before payment.
- No dates or prices should appear as confirmed until published and verified by the owner.

## Owner dashboard KPIs
Daily: new enquiries, status, check-ins/out, amount due, cleaning, maintenance.
Weekly: enquiry-to-booking conversion, sources, cancellation reasons, occupied nights, realized average daily rate, unpaid balances.
Monthly: gross revenue, verified receipts, expense categories, net cash movement, occupancy, profit margin after full costs, repeat bookings, reviews.
Quarterly: seasonal pricing changes, capital reserve, expansion gate and feasibility.

## Control procedures
- Never treat an enquiry as a confirmed reservation.
- Confirmations should be transactionally protected against double bookings once backend is live.
- Reconcile manual deposit records to actual bank receipts; do not infer payment from guest screenshots alone.
- Invoice number, amount, tax, refunds and issued/void status require an immutable audit trail in production.
- Use least-privilege staff accounts, multi-factor authentication where available and role-based permissions.
- Guest data handling: collect only necessary details, establish retention/deletion procedures, publish privacy terms and confirm Sri Lankan legal requirements before launch.
- Export admin demo data periodically while local-only. No cross-device syncing exists.

## Revenue channels and marketing
1. Direct social: Instagram/Facebook/TikTok reels that explain the villa experience, progress and opening timeline; clear contact CTA.
2. Google Business Profile once location and eligibility are verified; accurate map pin and opening status.
3. Referral and permitted user reviews after stays.
4. Online travel platforms once operations, availability synchronisation and cleaning process are proven.
5. Partnerships with local photographers, farm experiences or tour operators only when arrangements are agreed.

## Pre-opening launch gates
- [ ] Property completed; guest safety inspection, insurance and permits addressed
- [ ] Beds, bathroom, water, power, mosquito prevention, lighting and emergency equipment tested
- [ ] Accurate address, photos (if ever desired), amenities, rules and contact details approved
- [ ] Real prices, deposits, cancellation terms, tax and invoice format agreed
- [ ] Dedicated secure booking backend, staff accounts and privacy policy
- [ ] Payment confirmation, availability lock and confirmation workflow tested
- [ ] Cleaning turnaround and maintenance stock checklist
- [ ] 3–5 test reservations with different dates and cancellations reconciled end-to-end

## Expansion triggers
Add Villa 02 only after six months of reliable operating data, strong guest reviews, positive cash flow after reserves and verified land/legal feasibility. Pools and a restaurant require separate business cases and regulatory checks.
