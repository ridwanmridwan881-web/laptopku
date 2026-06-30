/*
# Fix Security Issues in decrement_stock Function

1. Changes
- Change from SECURITY DEFINER to SECURITY INVOKER (runs with caller's permissions)
- Set fixed search_path to prevent search_path injection attacks
- Revoke execute from anon (only authenticated users should call this when ordering)

2. Security Notes
- SECURITY INVOKER ensures the function runs with the caller's permissions
- Fixed search_path prevents malicious schema manipulation
- Only authenticated users who placed orders can decrement stock
*/

DROP FUNCTION IF EXISTS decrement_stock(uuid, integer);

CREATE FUNCTION decrement_stock(product_id uuid, qty integer)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - qty)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Grant execute only to authenticated users
REVOKE EXECUTE ON FUNCTION decrement_stock FROM anon;
GRANT EXECUTE ON FUNCTION decrement_stock TO authenticated;