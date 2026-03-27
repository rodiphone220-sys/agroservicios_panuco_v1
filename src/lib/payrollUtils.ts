/**
 * Payroll utilities for Mexico (Simplified for business logic)
 */

export interface PayrollResult {
  baseSalary: number;
  commissions: number;
  grossSalary: number;
  isr: number;
  imss: number;
  infonavit: number;
  netSalary: number;
}

/**
 * Calculates ISR (Simplified Monthly Table 2024 approximation)
 */
export const calculateISR = (grossSalary: number): number => {
  if (grossSalary <= 746.04) return grossSalary * 0.0192;
  if (grossSalary <= 6332.05) return 14.32 + (grossSalary - 746.05) * 0.064;
  if (grossSalary <= 11128.01) return 371.83 + (grossSalary - 6332.06) * 0.1088;
  if (grossSalary <= 12935.82) return 893.63 + (grossSalary - 11128.02) * 0.16;
  if (grossSalary <= 15487.71) return 1182.88 + (grossSalary - 12935.83) * 0.1792;
  if (grossSalary <= 31236.49) return 1640.18 + (grossSalary - 15487.72) * 0.2136;
  if (grossSalary <= 49233.00) return 5004.12 + (grossSalary - 31236.50) * 0.2352;
  if (grossSalary <= 93993.90) return 9236.89 + (grossSalary - 49233.01) * 0.30;
  if (grossSalary <= 125325.45) return 22665.17 + (grossSalary - 93993.91) * 0.32;
  if (grossSalary <= 375976.38) return 32691.18 + (grossSalary - 125325.46) * 0.34;
  return 117912.43 + (grossSalary - 375976.39) * 0.35;
};

/**
 * Calculates IMSS (Workers portion approximation ~2.375% + fixed fee)
 */
export const calculateIMSS = (grossSalary: number): number => {
  // Very simplified: approx 2.5% of salary for the worker part
  return grossSalary * 0.0275;
};

/**
 * Calculates INFONAVIT (Approximation ~5% - usually employer paid but for demo we show it as deduction if applicable)
 */
export const calculateInfonavit = (grossSalary: number, hasCredit: boolean): number => {
  return hasCredit ? grossSalary * 0.05 : 0;
};

export const processPayroll = (baseSalary: number, commissions: number, hasInfonavit: boolean = false): PayrollResult => {
  const grossSalary = baseSalary + commissions;
  const isr = calculateISR(grossSalary);
  const imss = calculateIMSS(grossSalary);
  const infonavit = calculateInfonavit(grossSalary, hasInfonavit);
  const netSalary = grossSalary - isr - imss - infonavit;

  return {
    baseSalary,
    commissions,
    grossSalary,
    isr,
    imss,
    infonavit,
    netSalary
  };
};
