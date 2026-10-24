/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Building2, Smartphone, Wallet } from 'lucide-react';

export type BankType = 'mpesa' | 'emola' | 'bim' | 'bci' | 'standard' | 'moza' | 'absa' | 'outro';

export function detectBankType(nameOrBanco?: string, tipo?: string): BankType {
  const str = (nameOrBanco || '').toLowerCase().trim();
  if (str.includes('mpesa') || str.includes('m-pesa') || str.includes('m pesa')) return 'mpesa';
  if (str.includes('emola') || str.includes('e-mola') || str.includes('e mola')) return 'emola';
  if (str.includes('bim') || str.includes('millennium')) return 'bim';
  if (str.includes('bci')) return 'bci';
  if (str.includes('standard') || str.includes('sb')) return 'standard';
  if (str.includes('moza')) return 'moza';
  if (str.includes('absa')) return 'absa';
  return 'outro';
}

interface BankLogoProps {
  nome?: string;
  banco?: string;
  tipo?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BankLogo: React.FC<BankLogoProps> = ({
  nome,
  banco,
  tipo,
  className = '',
  size = 'md'
}) => {
  const bank = detectBankType(`${nome || ''} ${banco || ''}`, tipo);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[9px]',
    md: 'w-9 h-9 text-[10px]',
    lg: 'w-12 h-12 text-xs'
  }[size];

  switch (bank) {
    case 'mpesa':
      return (
        <div 
          className={`${sizeClasses} rounded-xl bg-[#E60000] text-white flex flex-col items-center justify-center font-black shadow-md shadow-red-500/20 shrink-0 select-none ${className}`}
          title="M-Pesa Moçambique"
        >
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-5 19c-.83 0-1.5-.67-1.5-1.5S11.17 17 12 17s1.5.67 1.5 1.5S12.83 20 12 20zm5.5-4h-11V4h11v12z"/>
            </svg>
          </div>
          <span className="text-[7px] tracking-tighter uppercase font-black -mt-0.5">M-PESA</span>
        </div>
      );

    case 'emola':
      return (
        <div 
          className={`${sizeClasses} rounded-xl bg-[#FF6600] text-white flex flex-col items-center justify-center font-black shadow-md shadow-orange-500/20 shrink-0 select-none ${className}`}
          title="e-Mola Movitel"
        >
          <span className="font-extrabold text-[11px] tracking-tight lowercase leading-none">e</span>
          <span className="text-[7px] uppercase font-black tracking-tighter -mt-0.5">mola</span>
        </div>
      );

    case 'bim':
      return (
        <div 
          className={`${sizeClasses} rounded-xl bg-[#C30045] text-white flex flex-col items-center justify-center font-black shadow-md shadow-rose-900/30 shrink-0 select-none border border-rose-300/20 ${className}`}
          title="Millennium BIM"
        >
          <span className="text-[6px] tracking-wider font-extrabold uppercase opacity-90 leading-tight">★</span>
          <span className="text-[10px] tracking-tight font-black leading-none uppercase">bim</span>
        </div>
      );

    case 'bci':
      return (
        <div 
          className={`${sizeClasses} rounded-xl bg-[#002D62] text-[#F4B223] flex flex-col items-center justify-center font-black shadow-md shadow-blue-900/30 shrink-0 select-none border border-amber-400/30 ${className}`}
          title="BCI - Banco Comercial e de Investimentos"
        >
          <span className="text-[11px] tracking-tight font-black leading-none text-white">BCI</span>
          <div className="w-3.5 h-0.5 bg-[#F4B223] rounded-full mt-0.5" />
        </div>
      );

    case 'standard':
      return (
        <div 
          className={`${sizeClasses} rounded-xl bg-[#0033A1] text-white flex flex-col items-center justify-center font-black shadow-md shadow-blue-600/20 shrink-0 select-none ${className}`}
          title="Standard Bank Moçambique"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.14 8.78-7 9.9-3.86-1.12-7-5.36-7-9.9V6.3l7-3.12z" />
          </svg>
          <span className="text-[6px] uppercase font-black tracking-tighter -mt-0.5">STANDARD</span>
        </div>
      );

    case 'moza':
      return (
        <div 
          className={`${sizeClasses} rounded-xl bg-[#5C1D8D] text-white flex flex-col items-center justify-center font-black shadow-md shadow-purple-900/30 shrink-0 select-none ${className}`}
          title="Moza Banco"
        >
          <span className="text-[10px] tracking-tighter font-black lowercase leading-none">moza</span>
          <span className="text-[6px] uppercase font-bold tracking-widest opacity-80">BANCO</span>
        </div>
      );

    case 'absa':
      return (
        <div 
          className={`${sizeClasses} rounded-xl bg-[#DC0032] text-white flex flex-col items-center justify-center font-black shadow-md shadow-red-700/20 shrink-0 select-none ${className}`}
          title="Absa Bank Moçambique"
        >
          <span className="text-[11px] tracking-tight font-black lowercase leading-none">absa</span>
        </div>
      );

    default:
      if (tipo === 'carteira_movel') {
        return (
          <div className={`${sizeClasses} rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shrink-0 ${className}`}>
            <Smartphone className="w-4 h-4" />
          </div>
        );
      }
      if (tipo === 'caixa_fisico') {
        return (
          <div className={`${sizeClasses} rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0 ${className}`}>
            <Wallet className="w-4 h-4" />
          </div>
        );
      }
      return (
        <div className={`${sizeClasses} rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0 ${className}`}>
          <Building2 className="w-4 h-4" />
        </div>
      );
  }
};

export default BankLogo;
