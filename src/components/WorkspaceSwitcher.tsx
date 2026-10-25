import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Store, Laptop, Globe, ShoppingBag, Settings2, Check } from 'lucide-react';
import { Workspace } from '../types.ts';

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  onSwitchWorkspace: (workspaceId: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (ws: Workspace) => void;
  variant?: 'sidebar' | 'header';
}

const getMoedaBadge = (moeda: string = 'MT') => {
  switch (moeda.toUpperCase()) {
    case 'USD': return { symbol: '$', flag: '🇺🇸', label: 'USD' };
    case 'BRL': return { symbol: 'R$', flag: '🇧🇷', label: 'BRL' };
    case 'ZAR': return { symbol: 'R', flag: '🇿🇦', label: 'ZAR' };
    case 'EUR': return { symbol: '€', flag: '🇪🇺', label: 'EUR' };
    case 'MT':
    default:
      return { symbol: 'MT', flag: '🇲🇿', label: 'MT' };
  }
};

const getTipoBadge = (tipo: string) => {
  switch (tipo) {
    case 'plr_infoproduto': return { label: 'PLR / Digital', icon: Laptop, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200/50' };
    case 'plataforma': return { label: 'Plataforma', icon: Globe, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200/50' };
    case 'servicos': return { label: 'Próprio / Serviços', icon: ShoppingBag, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200/50' };
    case 'ecommerce_drop':
    default:
      return { label: 'Drop / E-commerce', icon: Store, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/50' };
  }
};

export default function WorkspaceSwitcher({
  workspaces,
  activeWorkspace,
  onSwitchWorkspace,
  onOpenCreateModal,
  onOpenEditModal,
  variant = 'sidebar'
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentMoeda = getMoedaBadge(activeWorkspace?.moeda);
  const currentTipo = getTipoBadge(activeWorkspace?.tipo || 'ecommerce_drop');
  const IconCurrent = currentTipo.icon;

  if (variant === 'header') {
    return (
      <div className="relative" ref={dropdownRef} id="header_workspace_switcher">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/70 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer text-left"
        >
          <div 
            className="w-5 h-5 rounded-lg flex items-center justify-center text-white text-[10px] shadow-xs shrink-0"
            style={{ backgroundColor: activeWorkspace?.cor || '#10B981' }}
          >
            <IconCurrent className="w-3 h-3" />
          </div>
          <div className="min-w-0 max-w-[110px] sm:max-w-[160px]">
            <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate leading-none">
              {activeWorkspace?.nome || 'Meu Negócio'}
            </p>
          </div>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md font-black bg-white dark:bg-slate-900 text-emerald-600 border border-slate-200/50 dark:border-slate-700">
            {currentMoeda.symbol}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Alternar Negócio</span>
              <span className="text-[10px] text-slate-500 font-bold">{workspaces.length} activos</span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 py-1">
              {workspaces.map((ws) => {
                const isSelected = activeWorkspace?.id === ws.id;
                const wsMoeda = getMoedaBadge(ws.moeda);
                const wsTipo = getTipoBadge(ws.tipo);
                const Icon = wsTipo.icon;
                return (
                  <div
                    key={ws.id}
                    onClick={() => {
                      onSwitchWorkspace(ws.id);
                      setIsOpen(false);
                    }}
                    className={`group w-full p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: ws.cor || '#10B981' }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {ws.nome}
                          </span>
                          {isSelected && <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[3]" />}
                        </div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[9px] text-slate-400 truncate">{wsTipo.label}</span>
                          <span className="text-[9px] text-slate-300">•</span>
                          <span className="text-[9px] font-black text-emerald-600">{wsMoeda.flag} {wsMoeda.symbol}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        onOpenEditModal(ws);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-opacity"
                      title="Editar configurações deste workspace"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenCreateModal();
                }}
                className="w-full py-2 px-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Adicionar Novo Negócio</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Sidebar variant
  return (
    <div className="relative my-1" ref={dropdownRef} id="sidebar_workspace_switcher">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer flex items-center justify-between shadow-xs group"
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: activeWorkspace?.cor || '#10B981' }}
          >
            <IconCurrent className="w-4 h-4" />
          </div>
          <div className="min-w-0 text-left">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate block">
                {activeWorkspace?.nome || 'Meu Negócio'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-[10px] text-slate-500 truncate">{currentTipo.label}</span>
              <span className="text-[10px] text-slate-300">•</span>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                {currentMoeda.flag} {currentMoeda.symbol}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0 pl-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (activeWorkspace) onOpenEditModal(activeWorkspace);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 opacity-60 group-hover:opacity-100 transition-opacity"
            title="Configurar este negócio"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Alternar Negócio</span>
            <span className="text-[10px] text-slate-500 font-bold">{workspaces.length} activos</span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1 py-1">
            {workspaces.map((ws) => {
              const isSelected = activeWorkspace?.id === ws.id;
              const wsMoeda = getMoedaBadge(ws.moeda);
              const wsTipo = getTipoBadge(ws.tipo);
              const Icon = wsTipo.icon;
              return (
                <div
                  key={ws.id}
                  onClick={() => {
                    onSwitchWorkspace(ws.id);
                    setIsOpen(false);
                  }}
                  className={`group w-full p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: ws.cor || '#10B981' }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {ws.nome}
                        </span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[3]" />}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[9px] text-slate-400 truncate">{wsTipo.label}</span>
                        <span className="text-[9px] text-slate-300">•</span>
                        <span className="text-[9px] font-black text-emerald-600">{wsMoeda.flag} {wsMoeda.symbol}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      onOpenEditModal(ws);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-opacity"
                    title="Configurações do negócio"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCreateModal();
              }}
              className="w-full py-2 px-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Adicionar Novo Negócio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
