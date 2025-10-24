// Utility to duplicate a product line for quotations
// Returns a deep-cloned product WITHOUT the `Id` field so the backend treats it as a new row
export function duplicateProductLine(product: any) {
  if (!product) return null;
  // Simple deep clone
  const copy = JSON.parse(JSON.stringify(product));
  // Ensure no DB identifier is carried over
  if (copy.Id) delete copy.Id;
  // If product had nested identifiers, remove them as well (defensive)
  if (copy.IdProduct) delete copy.IdProduct;
  // Reset any front-end only flags that should not be duplicated
  if (copy._temp) delete copy._temp;
  return copy;
}

export default duplicateProductLine;
