import { QuotationProduct } from 'api/quotations';
import { parse } from 'path';

export interface Totals {
  SubTotal: number;
  Tax: number; 
  Total: number;
  TotalRevenue: number;
  TotalCommission: number;
  MarginPercent: number; // porcentaje utilidad sobre subtotal
}

export const COMMISSION_RATE = 0.10; // 10%
export const TAX_RATE = 0.16; // IVA 16%

export const calculateProductTotal = <T extends Partial<QuotationProduct>>(product: T) => {
  const quantity = parseFloat(product.Quantity as any) || 0;
  const vendorCost = parseFloat(product.VendorCost as any) || 0;
  const printCost = parseFloat(product.PrintCost as any) || 0;
  const profitMargin = (product as any).ProfitMargin !== undefined ? parseFloat((product as any).ProfitMargin) : 30; // Default 30%
  const extraProfit = (product as any).ExtraProfit || false;
  
  // Calcular precio unitario basado en el switch de utilidad extra
  let unitPrice: number;
  if (extraProfit) {
    // Escenario 1: Con utilidad extra
    // ((COSTO * 1.3) + COSTO DE IMPRESION) * (1 + PORCENTAJE DE UTILIDAD / 100)
    unitPrice = ((vendorCost * 1.03) + printCost) * (1 + profitMargin / 100);
  } else {
    // Escenario 2: Sin utilidad extra  
    // (COSTO + COSTO DE IMPRESION) * (1 + PORCENTAJE DE UTILIDAD / 100)
    unitPrice = (vendorCost + printCost) * (1 + profitMargin / 100);
  }
  
  const total = quantity * unitPrice;
  const totalCost = quantity * vendorCost + quantity * printCost;
  const revenue = total - totalCost;
  const commission = revenue * COMMISSION_RATE;
  
  return {
    ...product,
    Quantity: quantity,
    UnitPrice: unitPrice,
    VendorCost: vendorCost,
    PrintCost: printCost,
    Total: total,
    Revenue: revenue,
    Commission: commission
  } as T & { Total: number; Revenue: number; Commission: number };
};

export const calculateTotals = (products: Array<Partial<QuotationProduct> & { Total?: number; Revenue?: number; Commission?: number }>): Totals => {
  const SubTotal = products.reduce((s, p) => s + (parseFloat(p.Total as any) || 0), 0);
  const Tax = SubTotal * TAX_RATE;
  const Total = SubTotal + Tax;
  const TotalRevenue = products.reduce((s, p) => s + (parseFloat(p.Revenue as any) || 0), 0);
  const TotalCommission = products.reduce((s, p) => s + (parseFloat(p.Commission as any) || 0), 0);
  const MarginPercent = SubTotal > 0 ? (TotalRevenue / SubTotal) * 100 : 0;
    console.log({SubTotal, TotalRevenue, MarginPercent});
  return { SubTotal, Tax, Total, TotalRevenue, TotalCommission, MarginPercent };
};

export const formatCurrencyMXN = (value: number | undefined | null) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(value || 0);
