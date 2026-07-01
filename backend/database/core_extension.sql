CREATE OR REPLACE FUNCTION fn_calculate_ticket_costs()
RETURNS TRIGGER AS $$
DECLARE
    v_zone_price DECIMAL(10, 2);
BEGIN
    SELECT ticket_price INTO v_zone_price FROM zones WHERE zone_id = NEW.zone_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Configuration Fault: Target safari zone ID % does not exist.', NEW.zone_id;
    END IF;

    NEW.base_cost    := v_zone_price;
    NEW.gst_amount   := ROUND(v_zone_price * 0.18, 2); 
    NEW.total_amount := NEW.base_cost + NEW.gst_amount;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_enforce_enclosure_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_max_cap INT;
    v_curr_occ INT;
BEGIN
    SELECT max_capacity, current_occupancy INTO v_max_cap, v_curr_occ 
    FROM enclosures 
    WHERE enclosure_id = NEW.enclosure_id;

    IF v_curr_occ >= v_max_cap THEN
        RAISE EXCEPTION 'PostgreSQL Integrity Block: Target Enclosure ID % has breached max capacity limits (%/%).', 
            NEW.enclosure_id, v_curr_occ, v_max_cap;
    END IF;

    UPDATE enclosures 
    SET current_occupancy = current_occupancy + 1 
    WHERE enclosure_id = NEW.enclosure_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_sync_visitor_to_staff()
RETURNS TRIGGER AS $$
BEGIN
    -- If a user registers as a RANGER or ADMIN, provision their staff profile automatically
    IF NEW.role IN ('RANGER', 'ADMIN') THEN
        INSERT INTO staff (staff_id, first_name, last_name, role, email)
        VALUES (NEW.visitor_id, NEW.first_name, NEW.last_name, NEW.role::VARCHAR, NEW.email)
        ON CONFLICT (staff_id) DO UPDATE 
        SET role = EXCLUDED.role, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER trg_pre_compute_ticket_billing
BEFORE INSERT ON tickets
FOR EACH ROW EXECUTE FUNCTION fn_calculate_ticket_costs();

CREATE OR REPLACE TRIGGER trg_pre_validate_enclosure_capacity
BEFORE INSERT ON animals
FOR EACH ROW EXECUTE FUNCTION fn_enforce_enclosure_capacity();

CREATE OR REPLACE TRIGGER trg_after_visitor_signup
AFTER INSERT OR UPDATE OF role ON visitors
FOR EACH ROW EXECUTE FUNCTION fn_sync_visitor_to_staff();


CREATE OR REPLACE FUNCTION fn_book_safari_ticket(
    p_visitor_id INT,
    p_zone_id INT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_zone_exists INT;
    v_visitor_exists INT;
BEGIN
    SELECT COUNT(*) INTO v_visitor_exists FROM visitors WHERE visitor_id = p_visitor_id;
    SELECT COUNT(*) INTO v_zone_exists FROM zones WHERE zone_id = p_zone_id;

    IF v_visitor_exists = 0 THEN
        RAISE EXCEPTION 'Transaction Aborted: Invalid Visitor credentials reference.';
    END IF;

    IF v_zone_exists = 0 THEN
        RAISE EXCEPTION 'Transaction Aborted: Target Safari Zone does not exist.';
    END IF;

    INSERT INTO tickets (visitor_id, zone_id, base_cost, gst_amount, total_amount)
    VALUES (p_visitor_id, p_zone_id, 0.00, 0.00, 0.00);

    RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Transaction Aborted: Internal database error. Error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW v_zone_popularity_analytics AS
SELECT 
    z.zone_id,
    z.name AS zone_name,
    z.climate,
    COUNT(t.ticket_id) AS total_bookings_issued,
    COALESCE(SUM(t.total_amount), 0.00) AS total_gross_revenue,
    COALESCE(AVG(t.base_cost), 0.00) AS average_ticket_yield
FROM zones z
LEFT JOIN tickets t ON z.zone_id = t.zone_id
GROUP BY z.zone_id, z.name, z.climate;


CREATE OR REPLACE VIEW v_visitor_age_demographics AS
SELECT 
    CASE 
        WHEN age < 18 THEN 'Juvenile (Under 18)'
        WHEN age BETWEEN 18 AND 35 THEN 'Young Adult (18-35)'
        WHEN age BETWEEN 36 AND 60 THEN 'Prime Adult (36-60)'
        ELSE 'Senior Observer (Above 60)'
    END AS age_demographic_bracket,
    COUNT(*) AS total_registered_count,
    ROUND((COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM visitors)::NUMERIC) * 100, 2) AS population_percentage
FROM visitors
GROUP BY age_demographic_bracket
ORDER BY total_registered_count DESC;


CREATE OR REPLACE VIEW vw_zone_summary AS
SELECT
    z.zone_id,
    z.name                                              AS zone_name,
    z.climate,
    z.camera_traps_count,
    z.ticket_price,

    COUNT(DISTINCT e.enclosure_id)                      AS enclosure_count,
    COUNT(DISTINCT a.animal_id)                         AS total_animals,
    COALESCE(SUM(e.max_capacity), 0)                    AS total_capacity,
    COALESCE(SUM(e.current_occupancy), 0)               AS total_occupancy,

    -- Occupancy % rounded to 1 decimal place
    CASE
        WHEN COALESCE(SUM(e.max_capacity), 0) = 0 THEN 0
        ELSE ROUND(
            (COALESCE(SUM(e.current_occupancy), 0)::NUMERIC
             / SUM(e.max_capacity)::NUMERIC) * 100, 1
        )
    END                                                 AS occupancy_pct,

    COUNT(DISTINCT t.ticket_id)                         AS tickets_sold,
    COALESCE(SUM(t.total_amount), 0)                   AS total_revenue

FROM zones z
LEFT JOIN enclosures     e ON e.zone_id      = z.zone_id
LEFT JOIN animals        a ON a.enclosure_id = e.enclosure_id
LEFT JOIN tickets        t ON t.zone_id      = z.zone_id
GROUP BY z.zone_id, z.name, z.climate, z.camera_traps_count, z.ticket_price;


CREATE OR REPLACE VIEW vw_animal_health_overview AS
SELECT
    a.animal_id,
    a.species,
    a.scientific_name,
    a.nickname,
    a.health_status,
    a.birth_date,
    a.date_joined,

    e.enclosure_id,
    e.code_name                                         AS enclosure_name,

    z.zone_id,
    z.name                                              AS zone_name,
    z.climate,

    COUNT(DISTINCT hl.log_id)                           AS health_log_count,
    COUNT(DISTINCT s.survey_id)                         AS survey_count,
    MAX(hl.logged_at)                                   AS last_health_check

FROM animals a
LEFT JOIN enclosures     e  ON e.enclosure_id = a.enclosure_id
LEFT JOIN zones          z  ON z.zone_id      = e.zone_id
LEFT JOIN health_logs    hl ON hl.animal_id   = a.animal_id
LEFT JOIN animal_surveys s  ON s.animal_id    = a.animal_id
GROUP BY
    a.animal_id, a.species, a.scientific_name, a.nickname,
    a.health_status, a.birth_date, a.date_joined,
    e.enclosure_id, e.code_name,
    z.zone_id, z.name, z.climate;


CREATE OR REPLACE VIEW vw_health_alerts AS
SELECT
    a.animal_id,
    a.species,
    a.nickname,
    a.health_status,

    e.code_name                                         AS enclosure_name,
    z.zone_id,
    z.name                                              AS zone_name,

    hl_latest.logged_at                                 AS last_logged_at,
    hl_latest.diagnosis                                 AS last_diagnosis,
    hl_latest.treatment                                 AS last_treatment,
    hl_latest.require_isolation,

    CONCAT(st.first_name, ' ', st.last_name)            AS attending_vet

FROM animals a
LEFT JOIN enclosures e ON e.enclosure_id = a.enclosure_id
LEFT JOIN zones      z ON z.zone_id      = e.zone_id

LEFT JOIN LATERAL (
    SELECT hl.log_id, hl.logged_at, hl.diagnosis,
           hl.treatment, hl.require_isolation, hl.veterinarian_id
    FROM   health_logs hl
    WHERE  hl.animal_id = a.animal_id
    ORDER BY hl.logged_at DESC
    LIMIT  1
) hl_latest ON TRUE

LEFT JOIN staff st ON st.staff_id = hl_latest.veterinarian_id

WHERE a.health_status IN ('CRITICAL', 'UNDER_CARE');


CREATE OR REPLACE VIEW vw_visitor_booking_summary AS
SELECT
    v.visitor_id,
    v.first_name,
    v.last_name,
    v.email,
    v.role,
    v.created_at                                        AS member_since,

    COUNT(DISTINCT t.ticket_id)                         AS total_bookings,
    COUNT(DISTINCT t.zone_id)                           AS zones_visited,
    COALESCE(SUM(t.total_amount),  0)                  AS total_spent,
    COALESCE(AVG(t.total_amount),  0)                  AS avg_ticket_cost,
    MAX(t.booking_date)                                 AS last_booking_date

FROM visitors v
LEFT JOIN tickets t ON t.visitor_id = v.visitor_id
GROUP BY v.visitor_id, v.first_name, v.last_name, v.email, v.role, v.created_at;