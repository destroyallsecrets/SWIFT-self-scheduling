import { TaxRates } from './types';

export const HOURLY_RATE = 13.50;

export interface CityTaxPreset {
  name: string;
  totalRate: number;
  description: string;
}

// Estimates for CSC typical operational cities (Federal + FICA + State + Local)
export const CITY_TAX_PRESETS: CityTaxPreset[] = [
  { 
    name: "Indianapolis, IN", 
    totalRate: 0.2262, 
    description: "Marion Co (2.02%) + IN State (2.95%)" 
  },
  { 
    name: "Chicago, IL", 
    totalRate: 0.2650, 
    description: "Cook Co + IL State (4.95%)" 
  },
  { 
    name: "Nashville, TN", 
    totalRate: 0.1765, 
    description: "No State Income Tax (Federal/FICA only)" 
  },
  { 
    name: "Louisville, KY", 
    totalRate: 0.2415, 
    description: "Jefferson Co (2.2%) + KY State (4.0%)" 
  },
  { 
    name: "Cincinnati, OH", 
    totalRate: 0.2375, 
    description: "City Tax (2.1%) + OH State (2.75%)" 
  },
  { 
    name: "Columbus, OH", 
    totalRate: 0.2450, 
    description: "City Tax (2.5%) + OH State (2.75%)" 
  }
];

export const DEFAULT_TAX_RATE = CITY_TAX_PRESETS[0].totalRate;
export const LOCAL_STORAGE_KEY = 'swift_app_schedule_v1';
export const TAX_STORAGE_KEY = 'swift_app_tax_settings';