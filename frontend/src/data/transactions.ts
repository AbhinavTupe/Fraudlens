import type { Transaction } from '../types/fraud';

export const transactions: Transaction[] = [
{
  id: 'txn_9f2b41',
  reference: 'TXN-9F2B41',
  timestamp: '2026-08-04T09:42:00Z',
  amount: 4820.0,
  merchant: 'Northwind Electronics',
  merchantCategory: 'Consumer electronics',
  customer: 'Amara Osei',
  customerId: 'CUS-40192',
  channel: 'E-commerce',
  country: 'United States',
  device: 'Chrome · Windows 11',
  riskScore: 94,
  decision: 'block',
  status: 'escalated',
  assignee: 'Priya Raman',
  flags: [
  { id: 'f1', label: 'Velocity spike', description: '7 attempts across 3 cards in 11 minutes.', severity: 'danger' },
  { id: 'f2', label: 'New shipping address', description: 'Address added 4 minutes before checkout.', severity: 'danger' },
  { id: 'f3', label: 'High-risk BIN', description: 'Issuer BIN linked to 18 confirmed fraud cases.', severity: 'warning' }],

  shap: [
  { feature: 'card_velocity_10m', label: 'Unusual card testing pattern', impact: 0.31, direction: 'increase', explanation: 'This customer tried 3 different cards in under 11 minutes — behaviour seen in 89% of confirmed card-testing fraud.' },
  { feature: 'ship_bill_mismatch', label: 'Shipping address does not match billing', impact: 0.22, direction: 'increase', explanation: 'The delivery address was created minutes before checkout and is 1,900 miles from the billing address.' },
  { feature: 'amount_vs_history', label: 'Order value far above customer norm', impact: 0.18, direction: 'increase', explanation: 'The basket is 11x this customer’s median order of $430.' },
  { feature: 'device_reputation', label: 'Device seen on other fraud attempts', impact: 0.12, direction: 'increase', explanation: 'The device fingerprint appeared on 4 blocked transactions in the last 30 days.' },
  { feature: 'account_age', label: 'Long-standing account', impact: 0.09, direction: 'decrease', explanation: 'The account is 3 years old with 41 clean orders, which slightly lowers risk.' }],

  policies: [
  { id: 'p1', name: 'Block score ≥ 90', result: 'triggered', detail: 'Score 94 exceeds the hard-block threshold of 90.' },
  { id: 'p2', name: 'Card testing guard', result: 'triggered', detail: '3+ distinct cards within 15 minutes from one session.' },
  { id: 'p3', name: 'Trusted customer bypass', result: 'skipped', detail: 'Bypass unavailable when card-testing guard fires.' }],

  recommendation: 'Block the payment and lock the customer session. Contact the cardholder through a verified channel before re-enabling checkout.',
  recommendationConfidence: 96,
  timeline: [
  { id: 't1', title: 'Transaction received', detail: 'Authorization request from Northwind Electronics.', timestamp: '09:42:01', actor: 'Payments gateway', kind: 'system' },
  { id: 't2', title: 'Model scored 94/100', detail: 'FraudLens Sentinel v4.2 · 38ms', timestamp: '09:42:01', actor: 'Sentinel v4.2', kind: 'model' },
  { id: 't3', title: 'Policy “Block score ≥ 90” triggered', detail: 'Automatic block applied.', timestamp: '09:42:01', actor: 'Policy engine', kind: 'policy' },
  { id: 't4', title: 'Escalated to Tier 2', detail: 'Assigned to Priya Raman for cardholder outreach.', timestamp: '09:51:14', actor: 'M. Alvarez', kind: 'analyst' }]

},
{
  id: 'txn_7c1a08',
  reference: 'TXN-7C1A08',
  timestamp: '2026-08-04T09:31:00Z',
  amount: 1290.5,
  merchant: 'Halcyon Travel',
  merchantCategory: 'Travel & booking',
  customer: 'Dmitri Volkov',
  customerId: 'CUS-88231',
  channel: 'Mobile app',
  country: 'Netherlands',
  device: 'iOS 19 · iPhone 17',
  riskScore: 78,
  decision: 'review',
  status: 'open',
  assignee: null,
  flags: [
  { id: 'f1', label: 'Impossible travel', description: 'Login from Amsterdam 40 min after Lagos session.', severity: 'warning' },
  { id: 'f2', label: 'Same-day departure', description: 'Flight departs in under 6 hours.', severity: 'warning' }],

  shap: [
  { feature: 'geo_velocity', label: 'Two logins too far apart to be the same person', impact: 0.27, direction: 'increase', explanation: 'Sessions in Lagos and Amsterdam 40 minutes apart cannot be physically travelled.' },
  { feature: 'same_day_travel', label: 'Last-minute travel booking', impact: 0.19, direction: 'increase', explanation: 'Same-day departures are 4.6x more likely to be fraudulent in this merchant category.' },
  { feature: 'payment_method_age', label: 'Card added recently', impact: 0.11, direction: 'increase', explanation: 'The payment method was added 2 days ago.' },
  { feature: 'prior_chargebacks', label: 'No history of disputes', impact: 0.14, direction: 'decrease', explanation: 'The customer has zero chargebacks across 19 prior bookings.' }],

  policies: [
  { id: 'p1', name: 'Review band 70–89', result: 'triggered', detail: 'Score 78 lands inside the manual review band.' },
  { id: 'p2', name: 'Travel same-day rule', result: 'triggered', detail: 'Departure within 6 hours requires identity check.' },
  { id: 'p3', name: 'Block score ≥ 90', result: 'passed', detail: 'Score below hard-block threshold.' }],

  recommendation: 'Hold for a step-up identity check. If the customer passes 3-D Secure re-authentication, release the booking automatically.',
  recommendationConfidence: 81,
  timeline: [
  { id: 't1', title: 'Transaction received', detail: 'Booking authorization from Halcyon Travel.', timestamp: '09:31:04', actor: 'Payments gateway', kind: 'system' },
  { id: 't2', title: 'Model scored 78/100', detail: 'FraudLens Sentinel v4.2 · 34ms', timestamp: '09:31:04', actor: 'Sentinel v4.2', kind: 'model' },
  { id: 't3', title: 'Queued for manual review', detail: 'Added to Tier 1 queue, SLA 30 minutes.', timestamp: '09:31:05', actor: 'Policy engine', kind: 'policy' }]

},
{
  id: 'txn_4de552',
  reference: 'TXN-4DE552',
  timestamp: '2026-08-04T09:18:00Z',
  amount: 219.99,
  merchant: 'Verda Grocery',
  merchantCategory: 'Grocery',
  customer: 'Lena Fischer',
  customerId: 'CUS-11804',
  channel: 'Card present',
  country: 'Germany',
  device: 'POS terminal 4412',
  riskScore: 12,
  decision: 'approve',
  status: 'cleared',
  assignee: null,
  flags: [],
  shap: [
  { feature: 'known_terminal', label: 'Familiar store and terminal', impact: 0.24, direction: 'decrease', explanation: 'The customer has paid at this exact terminal 22 times before.' },
  { feature: 'amount_vs_history', label: 'Typical basket size', impact: 0.18, direction: 'decrease', explanation: 'The amount is within 8% of the customer’s weekly grocery average.' },
  { feature: 'chip_verified', label: 'Chip and PIN verified', impact: 0.16, direction: 'decrease', explanation: 'Physical card with successful PIN entry.' }],

  policies: [
  { id: 'p1', name: 'Auto-approve score ≤ 30', result: 'triggered', detail: 'Score 12 is comfortably inside the auto-approve band.' },
  { id: 'p2', name: 'Review band 70–89', result: 'passed', detail: 'Not applicable.' }],

  recommendation: 'Approve. No analyst action required — this pattern matches the customer’s established behaviour.',
  recommendationConfidence: 99,
  timeline: [
  { id: 't1', title: 'Transaction received', detail: 'Card present authorization.', timestamp: '09:18:22', actor: 'Payments gateway', kind: 'system' },
  { id: 't2', title: 'Model scored 12/100', detail: 'FraudLens Sentinel v4.2 · 29ms', timestamp: '09:18:22', actor: 'Sentinel v4.2', kind: 'model' },
  { id: 't3', title: 'Auto-approved', detail: 'Settled without analyst review.', timestamp: '09:18:22', actor: 'Policy engine', kind: 'policy' }]

},
{
  id: 'txn_82ba19',
  reference: 'TXN-82BA19',
  timestamp: '2026-08-04T08:57:00Z',
  amount: 12750.0,
  merchant: 'Meridian Capital',
  merchantCategory: 'Wire transfer',
  customer: 'Orion Holdings LLC',
  customerId: 'CUS-70055',
  channel: 'Wire',
  country: 'United Kingdom',
  device: 'Business portal',
  riskScore: 88,
  decision: 'review',
  status: 'pending',
  assignee: 'Marcus Alvarez',
  flags: [
  { id: 'f1', label: 'First-time beneficiary', description: 'Beneficiary account never used before.', severity: 'danger' },
  { id: 'f2', label: 'Out-of-pattern amount', description: '6x the account’s median wire.', severity: 'warning' },
  { id: 'f3', label: 'Executive impersonation language', description: 'Memo mentions “urgent, confidential”.', severity: 'warning' }],

  shap: [
  { feature: 'new_beneficiary', label: 'Money is going somewhere brand new', impact: 0.29, direction: 'increase', explanation: 'First payment ever to this beneficiary, a hallmark of business email compromise.' },
  { feature: 'amount_vs_history', label: 'Much larger than usual wires', impact: 0.21, direction: 'increase', explanation: 'The amount is 6x the account’s median wire of $2,120.' },
  { feature: 'memo_urgency', label: 'Urgency wording in the memo', impact: 0.13, direction: 'increase', explanation: 'Language patterns match known invoice-redirection attempts.' },
  { feature: 'approver_verified', label: 'Approved by a verified signer', impact: 0.1, direction: 'decrease', explanation: 'The initiating user passed hardware-key authentication.' }],

  policies: [
  { id: 'p1', name: 'Wire > $10,000 dual control', result: 'triggered', detail: 'Requires a second approver before release.' },
  { id: 'p2', name: 'Review band 70–89', result: 'triggered', detail: 'Score 88 requires analyst adjudication.' },
  { id: 'p3', name: 'Block score ≥ 90', result: 'passed', detail: 'Just below the block threshold.' }],

  recommendation: 'Do not release. Call the client on the number of record to confirm the beneficiary before approving, then require dual authorization.',
  recommendationConfidence: 92,
  timeline: [
  { id: 't1', title: 'Wire instruction received', detail: 'Initiated from Orion Holdings business portal.', timestamp: '08:57:10', actor: 'Payments gateway', kind: 'system' },
  { id: 't2', title: 'Model scored 88/100', detail: 'FraudLens Sentinel v4.2 · 41ms', timestamp: '08:57:10', actor: 'Sentinel v4.2', kind: 'model' },
  { id: 't3', title: 'Dual control required', detail: 'Wire held pending second approver.', timestamp: '08:57:11', actor: 'Policy engine', kind: 'policy' },
  { id: 't4', title: 'Customer callback attempted', detail: 'Left voicemail with treasury contact.', timestamp: '09:12:40', actor: 'Marcus Alvarez', kind: 'analyst' }]

},
{
  id: 'txn_1a77f3',
  reference: 'TXN-1A77F3',
  timestamp: '2026-08-04T08:40:00Z',
  amount: 89.4,
  merchant: 'Pulse Streaming',
  merchantCategory: 'Digital subscription',
  customer: 'Tomas Rivera',
  customerId: 'CUS-33410',
  channel: 'E-commerce',
  country: 'Mexico',
  device: 'Safari · macOS',
  riskScore: 41,
  decision: 'approve',
  status: 'cleared',
  assignee: null,
  flags: [{ id: 'f1', label: 'VPN detected', description: 'Connection routed through a commercial VPN.', severity: 'info' }],
  shap: [
  { feature: 'proxy_usage', label: 'Traffic routed through a VPN', impact: 0.14, direction: 'increase', explanation: 'VPN usage is common for streaming customers, so it raises risk only slightly.' },
  { feature: 'recurring_pattern', label: 'Matches a recurring subscription', impact: 0.22, direction: 'decrease', explanation: 'Same merchant, same amount, same day of month for 9 cycles.' },
  { feature: 'account_age', label: 'Established account', impact: 0.12, direction: 'decrease', explanation: 'Account open 26 months with no disputes.' }],

  policies: [
  { id: 'p1', name: 'Auto-approve score ≤ 30', result: 'passed', detail: 'Score 41 sits above auto-approve.' },
  { id: 'p2', name: 'Recurring subscription allowance', result: 'triggered', detail: 'Verified recurring pattern permits approval up to score 55.' }],

  recommendation: 'Approve. The VPN signal is offset by a nine-cycle recurring payment history.',
  recommendationConfidence: 94,
  timeline: [
  { id: 't1', title: 'Transaction received', detail: 'Subscription renewal.', timestamp: '08:40:02', actor: 'Payments gateway', kind: 'system' },
  { id: 't2', title: 'Model scored 41/100', detail: 'FraudLens Sentinel v4.2 · 31ms', timestamp: '08:40:02', actor: 'Sentinel v4.2', kind: 'model' },
  { id: 't3', title: 'Approved by allowance policy', detail: 'Recurring subscription allowance applied.', timestamp: '08:40:02', actor: 'Policy engine', kind: 'policy' }]

},
{
  id: 'txn_63cc90',
  reference: 'TXN-63CC90',
  timestamp: '2026-08-04T08:22:00Z',
  amount: 2340.0,
  merchant: 'Atlas Luxury Goods',
  merchantCategory: 'Luxury retail',
  customer: 'Sofia Marchetti',
  customerId: 'CUS-59128',
  channel: 'E-commerce',
  country: 'Italy',
  device: 'Chrome · Android',
  riskScore: 91,
  decision: 'block',
  status: 'confirmed_fraud',
  assignee: 'Priya Raman',
  flags: [
  { id: 'f1', label: 'Account takeover signals', description: 'Password and email changed 9 minutes prior.', severity: 'danger' },
  { id: 'f2', label: 'Reshipper address', description: 'Address matches a known freight forwarder.', severity: 'danger' }],

  shap: [
  { feature: 'credential_change', label: 'Account credentials just changed', impact: 0.34, direction: 'increase', explanation: 'Email and password were changed 9 minutes before the order — the strongest account-takeover indicator.' },
  { feature: 'reshipper_address', label: 'Delivering to a parcel forwarder', impact: 0.24, direction: 'increase', explanation: 'The address is a known reshipping warehouse used to move stolen goods.' },
  { feature: 'high_resale_category', label: 'Easily resold merchandise', impact: 0.15, direction: 'increase', explanation: 'Luxury handbags have a 92% resale rate in confirmed fraud cases.' }],

  policies: [
  { id: 'p1', name: 'Block score ≥ 90', result: 'triggered', detail: 'Score 91 exceeds the hard-block threshold.' },
  { id: 'p2', name: 'ATO credential-change guard', result: 'triggered', detail: 'Credential change within 30 minutes of high-value order.' }],

  recommendation: 'Confirmed fraud. Keep the block, force a full account recovery, and file a SAR referral for the reshipping address.',
  recommendationConfidence: 98,
  timeline: [
  { id: 't1', title: 'Transaction received', detail: 'Order placed at Atlas Luxury Goods.', timestamp: '08:22:15', actor: 'Payments gateway', kind: 'system' },
  { id: 't2', title: 'Model scored 91/100', detail: 'FraudLens Sentinel v4.2 · 36ms', timestamp: '08:22:15', actor: 'Sentinel v4.2', kind: 'model' },
  { id: 't3', title: 'Blocked automatically', detail: 'ATO guard and score threshold both fired.', timestamp: '08:22:15', actor: 'Policy engine', kind: 'policy' },
  { id: 't4', title: 'Customer confirmed fraud', detail: 'Cardholder verified they did not place the order.', timestamp: '08:49:02', actor: 'Priya Raman', kind: 'customer' }]

},
{
  id: 'txn_55e410',
  reference: 'TXN-55E410',
  timestamp: '2026-08-04T08:05:00Z',
  amount: 640.0,
  merchant: 'Cobalt Hardware',
  merchantCategory: 'Home improvement',
  customer: 'Grace Nakamura',
  customerId: 'CUS-20874',
  channel: 'Card present',
  country: 'United States',
  device: 'POS terminal 8890',
  riskScore: 33,
  decision: 'approve',
  status: 'cleared',
  assignee: null,
  flags: [],
  shap: [
  { feature: 'chip_verified', label: 'Chip and PIN verified', impact: 0.2, direction: 'decrease', explanation: 'Physical card present with successful PIN.' },
  { feature: 'merchant_risk', label: 'Low-risk merchant category', impact: 0.15, direction: 'decrease', explanation: 'Home improvement has a 0.04% fraud rate on this portfolio.' },
  { feature: 'amount_vs_history', label: 'Slightly above usual spend', impact: 0.09, direction: 'increase', explanation: 'The amount is 1.6x the customer’s median in-store purchase.' }],

  policies: [
  { id: 'p1', name: 'Auto-approve score ≤ 30', result: 'passed', detail: 'Score 33 slightly above auto-approve.' },
  { id: 'p2', name: 'Card present relaxation', result: 'triggered', detail: 'Chip and PIN raises auto-approve ceiling to 45.' }],

  recommendation: 'Approve. Chip and PIN verification makes fraud highly unlikely at this amount.',
  recommendationConfidence: 97,
  timeline: [
  { id: 't1', title: 'Transaction received', detail: 'Card present authorization.', timestamp: '08:05:33', actor: 'Payments gateway', kind: 'system' },
  { id: 't2', title: 'Model scored 33/100', detail: 'FraudLens Sentinel v4.2 · 28ms', timestamp: '08:05:33', actor: 'Sentinel v4.2', kind: 'model' },
  { id: 't3', title: 'Approved', detail: 'Card present relaxation applied.', timestamp: '08:05:33', actor: 'Policy engine', kind: 'policy' }]

},
{
  id: 'txn_31fa76',
  reference: 'TXN-31FA76',
  timestamp: '2026-08-04T07:48:00Z',
  amount: 7420.0,
  merchant: 'Vertex Crypto Exchange',
  merchantCategory: 'Crypto on-ramp',
  customer: 'Julian Beck',
  customerId: 'CUS-91002',
  channel: 'Open banking',
  country: 'Singapore',
  device: 'Chrome · macOS',
  riskScore: 85,
  decision: 'review',
  status: 'open',
  assignee: null,
  flags: [
  { id: 'f1', label: 'First crypto purchase', description: 'No prior digital asset activity.', severity: 'warning' },
  { id: 'f2', label: 'Scam-pattern amount', description: 'Amount matches known investment-scam ladder.', severity: 'warning' }],

  shap: [
  { feature: 'first_crypto', label: 'First-ever crypto purchase at high value', impact: 0.25, direction: 'increase', explanation: 'New crypto buyers moving over $5,000 are frequently victims of investment scams.' },
  { feature: 'scam_ladder', label: 'Amount matches a known scam pattern', impact: 0.2, direction: 'increase', explanation: 'The value sits on a payment ladder seen in 60+ reported romance-investment scams.' },
  { feature: 'session_duration', label: 'Rushed session', impact: 0.12, direction: 'increase', explanation: 'Checkout completed in 44 seconds with no product browsing.' },
  { feature: 'kyc_level', label: 'Fully KYC-verified customer', impact: 0.13, direction: 'decrease', explanation: 'Identity verified to tier 3 with a government ID match.' }],

  policies: [
  { id: 'p1', name: 'Crypto on-ramp scrutiny', result: 'triggered', detail: 'All first crypto purchases above $5,000 need review.' },
  { id: 'p2', name: 'Review band 70–89', result: 'triggered', detail: 'Score 85 requires analyst adjudication.' }],

  recommendation: 'Hold and run a scam-victim outreach script. If the customer cannot name the destination wallet owner, decline and educate.',
  recommendationConfidence: 87,
  timeline: [
  { id: 't1', title: 'Transaction received', detail: 'Open banking payment initiation.', timestamp: '07:48:09', actor: 'Payments gateway', kind: 'system' },
  { id: 't2', title: 'Model scored 85/100', detail: 'FraudLens Sentinel v4.2 · 39ms', timestamp: '07:48:09', actor: 'Sentinel v4.2', kind: 'model' },
  { id: 't3', title: 'Queued for review', detail: 'Crypto scrutiny policy routed to Tier 2 queue.', timestamp: '07:48:10', actor: 'Policy engine', kind: 'policy' }]

},
{
  id: 'txn_27bd05',
  reference: 'TXN-27BD05',
  timestamp: '2026-08-04T07:29:00Z',
  amount: 158.25,
  merchant: 'Lumen Pharmacy',
  merchantCategory: 'Health',
  customer: 'Ravi Chandran',
  customerId: 'CUS-66431',
  channel: 'Mobile app',
  country: 'India',
  device: 'Android 16 · Pixel 10',
  riskScore: 24,
  decision: 'approve',
  status: 'cleared',
  assignee: null,
  flags: [],
  shap: [
  { feature: 'known_device', label: 'Trusted device', impact: 0.19, direction: 'decrease', explanation: 'Device has been used for 31 successful payments.' },
  { feature: 'merchant_history', label: 'Repeat merchant', impact: 0.14, direction: 'decrease', explanation: 'Fifth purchase at this pharmacy in six months.' },
  { feature: 'amount_vs_history', label: 'Typical amount', impact: 0.08, direction: 'decrease', explanation: 'Within the customer’s normal spend range.' }],

  policies: [{ id: 'p1', name: 'Auto-approve score ≤ 30', result: 'triggered', detail: 'Score 24 auto-approved.' }],
  recommendation: 'Approve. Trusted device and repeat merchant with no anomalies.',
  recommendationConfidence: 99,
  timeline: [
  { id: 't1', title: 'Transaction received', detail: 'Mobile app checkout.', timestamp: '07:29:47', actor: 'Payments gateway', kind: 'system' },
  { id: 't2', title: 'Model scored 24/100', detail: 'FraudLens Sentinel v4.2 · 27ms', timestamp: '07:29:47', actor: 'Sentinel v4.2', kind: 'model' },
  { id: 't3', title: 'Auto-approved', detail: 'Settled without analyst review.', timestamp: '07:29:47', actor: 'Policy engine', kind: 'policy' }]

},
{
  id: 'txn_18aa62',
  reference: 'TXN-18AA62',
  timestamp: '2026-08-04T07:11:00Z',
  amount: 3105.0,
  merchant: 'Skyline Ticketing',
  merchantCategory: 'Events',
  customer: 'Elena Petrova',
  customerId: 'CUS-77320',
  channel: 'E-commerce',
  country: 'Poland',
  device: 'Firefox · Linux',
  riskScore: 72,
  decision: 'review',
  status: 'pending',
  assignee: 'Dana Whitfield',
  flags: [
  { id: 'f1', label: 'Bulk ticket purchase', description: '18 tickets in a single order.', severity: 'warning' },
  { id: 'f2', label: 'Disposable email', description: 'Email domain registered 3 days ago.', severity: 'warning' }],

  shap: [
  { feature: 'bulk_quantity', label: 'Unusually large ticket quantity', impact: 0.23, direction: 'increase', explanation: '18 tickets in one order matches resale-fraud behaviour for this merchant.' },
  { feature: 'email_reputation', label: 'Throwaway email address', impact: 0.17, direction: 'increase', explanation: 'The email domain was registered three days ago and has no history.' },
  { feature: 'card_bin_match', label: 'Card issuer matches billing country', impact: 0.11, direction: 'decrease', explanation: 'Issuer country and billing country align, lowering risk.' }],

  policies: [
  { id: 'p1', name: 'Review band 70–89', result: 'triggered', detail: 'Score 72 requires analyst adjudication.' },
  { id: 'p2', name: 'Bulk quantity guard', result: 'triggered', detail: 'Orders over 10 tickets require verification.' }],

  recommendation: 'Request a card verification document. Approve for a reduced quantity if the customer verifies identity.',
  recommendationConfidence: 76,
  timeline: [
  { id: 't1', title: 'Transaction received', detail: 'Order placed at Skyline Ticketing.', timestamp: '07:11:22', actor: 'Payments gateway', kind: 'system' },
  { id: 't2', title: 'Model scored 72/100', detail: 'FraudLens Sentinel v4.2 · 33ms', timestamp: '07:11:22', actor: 'Sentinel v4.2', kind: 'model' },
  { id: 't3', title: 'Assigned to analyst', detail: 'Picked up by Dana Whitfield.', timestamp: '07:26:03', actor: 'Dana Whitfield', kind: 'analyst' }]

}];


export const highRiskTransactions = transactions.
filter((t) => t.riskScore >= 70).
sort((a, b) => b.riskScore - a.riskScore);