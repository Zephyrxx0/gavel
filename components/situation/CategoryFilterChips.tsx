'use client';

import React from 'react';
import { DisputeCategory } from '@/lib/schemas/situation';
import {
  Sparkles,
  Home,
  Briefcase,
  ShoppingBag,
  Scale,
  Users,
  Landmark,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export type CategoryFilterValue = 'auto' | DisputeCategory;

export interface CategoryOption {
  value: CategoryFilterValue;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'auto', label: 'Auto-Detect', icon: Sparkles, accentColor: 'text-[#D4AF37]' },
  { value: 'tenancy', label: 'Tenancy & Housing', icon: Home, accentColor: 'text-sky-400' },
  { value: 'employment', label: 'Employment & Labor', icon: Briefcase, accentColor: 'text-indigo-400' },
  { value: 'consumer', label: 'Consumer & Commerce', icon: ShoppingBag, accentColor: 'text-emerald-400' },
  { value: 'civil', label: 'Civil & Contractual', icon: Scale, accentColor: 'text-amber-400' },
  { value: 'family', label: 'Family & Matrimonial', icon: Users, accentColor: 'text-rose-400' },
  { value: 'property', label: 'Property & Real Estate', icon: Landmark, accentColor: 'text-orange-400' },
  { value: 'financial', label: 'Financial & Debt', icon: DollarSign, accentColor: 'text-teal-400' },
  { value: 'other', label: 'General Dispute', icon: AlertCircle, accentColor: 'text-slate-400' },
];

export interface CategoryFilterChipsProps {
  selectedCategory: CategoryFilterValue;
  onSelectCategory: (category: CategoryFilterValue) => void;
}

export function CategoryFilterChips({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterChipsProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-mono uppercase tracking-wider text-stone-500 block">
        Dispute Category (Optional Pre-Filter)
      </label>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Dispute Categories">
        {CATEGORY_OPTIONS.map((opt) => {
          const isSelected = selectedCategory === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectCategory(opt.value)}
              data-testid={`category-chip-${opt.value}`}
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 font-semibold shadow-sm'
                  : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 border border-stone-200/80 shadow-sm'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#D4AF37]' : 'text-stone-500'}`} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
