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


CREATE OR REPLACE TRIGGER trg_pre_compute_ticket_billing
BEFORE INSERT ON tickets
FOR EACH ROW EXECUTE FUNCTION fn_calculate_ticket_costs();

CREATE OR REPLACE TRIGGER trg_pre_validate_enclosure_capacity
BEFORE INSERT ON animals
FOR EACH ROW EXECUTE FUNCTION fn_enforce_enclosure_capacity();


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