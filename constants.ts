import { TaxRates } from './types';

export const HOURLY_RATE = 13.50;

// 2026 Tax Rates (Indianapolis/Marion County)
export const TAX_RATES: TaxRates = {
  federal: 0.10,        // 10% Bracket Estimate
  socialSecurity: 0.062, // 6.2%
  medicare: 0.0145,      // 1.45%
  state: 0.0295,         // Indiana 2.95% (2026 reduced)
  local: 0.0202          // Marion County 2.02%
};

export const TOTAL_TAX_RATE = 
  TAX_RATES.federal + 
  TAX_RATES.socialSecurity + 
  TAX_RATES.medicare + 
  TAX_RATES.state + 
  TAX_RATES.local; // ~0.2262

export const LOCAL_STORAGE_KEY = 'swift_app_schedule_v1';