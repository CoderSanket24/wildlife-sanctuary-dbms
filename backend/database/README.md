# Core Database Extensions

This directory contains the PostgreSQL extension layer that sits on top of the Prisma-managed schema. The SQL script defines trigger functions, a ticket-booking helper function, and dashboard views for pricing, capacity enforcement, visitor sync, and analytics.

## Objects Defined in [core_extension.sql](core_extension.sql)

| Object Name | Type | Target Layer | Purpose |
| :--- | :--- | :--- | :--- |
| `fn_calculate_ticket_costs` | Trigger Function | `tickets` | Loads the active zone price, sets `base_cost`, calculates 18% GST, and writes `total_amount` before insert. |
| `trg_pre_compute_ticket_billing` | Trigger | `tickets` | Fires `BEFORE INSERT` to call `fn_calculate_ticket_costs`. |
| `fn_enforce_enclosure_capacity` | Trigger Function | `animals` | Checks enclosure capacity, blocks inserts when the enclosure is full, and increments `current_occupancy` for accepted rows. |
| `trg_pre_validate_enclosure_capacity` | Trigger | `animals` | Fires `BEFORE INSERT` to call `fn_enforce_enclosure_capacity`. |
| `fn_sync_visitor_to_staff` | Trigger Function | `visitors` / `staff` | Auto-creates or updates a staff record when a visitor is registered as `RANGER` or `ADMIN`. |
| `trg_after_visitor_signup` | Trigger | `visitors` | Fires `AFTER INSERT OR UPDATE OF role` to keep staff records in sync. |
| `fn_book_safari_ticket` | Function | Transactions | Validates the visitor and zone, then inserts a ticket record inside the database transaction. |
| `v_zone_popularity_analytics` | View | Dashboards | Summarizes bookings, revenue, and average ticket yield per zone. |
| `v_visitor_age_demographics` | View | Dashboards | Groups visitors into age brackets and calculates population percentages. |

## Initialization Steps

Run the baseline Prisma migration first so the tables referenced by the SQL objects already exist.

```bash
npx prisma migrate dev
```

After the schema is in place, apply [core_extension.sql](core_extension.sql) to the same PostgreSQL database.

If you are using `psql`, a typical local workflow looks like this:

```bash
psql -U <user> -d <database> -f core_extension.sql
```

## Notes

- `fn_book_safari_ticket` is a function, not a stored procedure.
- `fn_enforce_enclosure_capacity` updates `enclosures.current_occupancy` as part of the insert flow.
- `fn_sync_visitor_to_staff` only provisions staff rows for `RANGER` and `ADMIN` roles.