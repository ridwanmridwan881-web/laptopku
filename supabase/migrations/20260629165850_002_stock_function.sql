/*
# Stock Management Function

1. New Functions
- `decrement_stock(product_id, qty)` - Decrements product stock safely

2. Notes
- Used when orders are placed to reduce available stock
- Prevents negative stock
*/

CREATE OR REPLACE FUNCTION decrement_stock(product_id uuid, qty integer)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - qty)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION decrement_stock TO authenticated;
