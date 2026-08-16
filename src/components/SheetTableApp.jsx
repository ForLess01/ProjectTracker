import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { marked } from 'marked';
import { 
  Plus, Image as ImageIcon, X, Upload, Download, Trash2, Check, User, Wrench,
  Sparkles, AlertTriangle, Zap, Rocket, Lightbulb, Bug, ChevronDown, Eye, Copy, UserPlus,
  Filter, Search, ArrowUpDown, RotateCcw, ArrowLeft, Layers, Table, LayoutGrid, CheckCircle2, Clock, Flame, MoreHorizontal,
  ExternalLink, ZoomIn, ClipboardPaste, SlidersHorizontal, ListFilter, FileCode, FileText
} from 'lucide-react';
import InviteModal from './InviteModal.jsx';
import CsvImportModal from './CsvImportModal.jsx';

export function CustomFilterPinIcon({ className = "w-4 h-4", width = 16, height = 16 }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="2" y1="3.5" x2="14" y2="3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="3.75" y1="8" x2="12.25" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="5.75" y1="12.5" x2="10.25" y2="12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export const STATUS_CONFIG = {
  backlog: { key: 'backlog', label: 'Backlog', className: 'glass-pill-slate', dotColor: '#94a3b8' },
  todo: { key: 'todo', label: 'Por Hacer', className: 'glass-pill-cyan', dotColor: '#22d3ee' },
  in_progress: { key: 'in_progress', label: 'En Progreso', className: 'glass-pill-amber', dotColor: '#fbbf24' },
  review: { key: 'review', label: 'En Revisión', className: 'glass-pill-purple', dotColor: '#c084fc' },
  done: { key: 'done', label: 'Completado', className: 'glass-pill-emerald', dotColor: '#34d399' },
};

export const VIEW_STATUS_CONFIG = {
  ideas: {
    backlog: { key: 'backlog', label: 'Borrador', className: 'glass-pill-slate', dotColor: '#94a3b8' },
    todo: { key: 'todo', label: 'En Evaluación', className: 'glass-pill-cyan', dotColor: '#22d3ee' },
    in_progress: { key: 'in_progress', label: 'En Progreso', className: 'glass-pill-amber', dotColor: '#fbbf24' },
    review: { key: 'review', label: 'En Revisión', className: 'glass-pill-purple', dotColor: '#c084fc' },
    done: { key: 'done', label: 'Aprobada', className: 'glass-pill-emerald', dotColor: '#34d399' },
  },
  bugs: {
    backlog: { key: 'backlog', label: 'Reportado', className: 'glass-pill-slate', dotColor: '#94a3b8' },
    todo: { key: 'todo', label: 'Por Investigar', className: 'glass-pill-cyan', dotColor: '#22d3ee' },
    in_progress: { key: 'in_progress', label: 'En Corrección', className: 'glass-pill-amber', dotColor: '#fbbf24' },
    review: { key: 'review', label: 'En Pruebas', className: 'glass-pill-purple', dotColor: '#c084fc' },
    done: { key: 'done', label: 'Resuelto', className: 'glass-pill-emerald', dotColor: '#34d399' },
  },
  optimizaciones: {
    backlog: { key: 'backlog', label: 'Analizando', className: 'glass-pill-slate', dotColor: '#94a3b8' },
    todo: { key: 'todo', label: 'Por Optimizar', className: 'glass-pill-cyan', dotColor: '#22d3ee' },
    in_progress: { key: 'in_progress', label: 'En Optimización', className: 'glass-pill-amber', dotColor: '#fbbf24' },
    review: { key: 'review', label: 'En Pruebas', className: 'glass-pill-purple', dotColor: '#c084fc' },
    done: { key: 'done', label: 'Optimizado', className: 'glass-pill-emerald', dotColor: '#34d399' },
  },
  implementaciones: {
    backlog: { key: 'backlog', label: 'Backlog', className: 'glass-pill-slate', dotColor: '#94a3b8' },
    todo: { key: 'todo', label: 'Por Hacer', className: 'glass-pill-cyan', dotColor: '#22d3ee' },
    in_progress: { key: 'in_progress', label: 'En Desarrollo', className: 'glass-pill-amber', dotColor: '#fbbf24' },
    review: { key: 'review', label: 'En Revisión', className: 'glass-pill-purple', dotColor: '#c084fc' },
    done: { key: 'done', label: 'Desplegado', className: 'glass-pill-emerald', dotColor: '#34d399' },
  },
};

export const normalizeStatus = (statusStr) => {
  if (!statusStr) return 'backlog';
  const s = statusStr.toLowerCase().trim();
  if (s === 'in_progress' || s === 'en progreso' || s === 'en_progreso' || s === 'en optimización' || s === 'en corrección') return 'in_progress';
  if (s === 'todo' || s === 'por hacer' || s === 'por_hacer' || s === 'en evaluación' || s === 'por investigar' || s === 'por optimizar') return 'todo';
  if (s === 'review' || s === 'en revisión' || s === 'en revision' || s === 'en pruebas') return 'review';
  if (s === 'done' || s === 'completado' || s === 'completada' || s === 'aprobada' || s === 'resuelto' || s === 'optimizado' || s === 'desplegado') return 'done';
  return 'backlog';
};

export function LiquidGlassStatusBadge({ status, onChange, readOnly = false, disabled = false, currentView = 'ideas' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, bottom: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [activeHoverKey, setActiveHoverKey] = useState(null);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const holdTimerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const activeHoverKeyRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  const currentConfig = VIEW_STATUS_CONFIG[currentView] || VIEW_STATUS_CONFIG.ideas;
  const normalizedKey = normalizeStatus(status);
  const currentStatusObj = currentConfig[normalizedKey] || currentConfig.backlog;

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left + rect.width / 2,
      });
    }
  };

  const handlePointerDown = (e) => {
    if (readOnly || disabled || (e.button !== undefined && e.button !== 0)) return;
    setIsPressing(true);
    isDraggingRef.current = true;
    activeHoverKeyRef.current = null;
    setActiveHoverKey(null);
    updatePosition();
    
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 120);
  };

  useEffect(() => {
    const handleGlobalPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const targetEl = document.elementFromPoint(e.clientX, e.clientY);
      const pillBtn = targetEl?.closest('[data-status-label]');
      if (pillBtn) {
        const label = pillBtn.getAttribute('data-status-label');
        activeHoverKeyRef.current = label;
        setActiveHoverKey(label);
      } else {
        activeHoverKeyRef.current = null;
        setActiveHoverKey(null);
      }
    };

    const handleGlobalPointerUp = () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      setIsPressing(false);
      
      if (isDraggingRef.current && activeHoverKeyRef.current) {
        onChange(activeHoverKeyRef.current);
        setIsOpen(false);
      }
      isDraggingRef.current = false;
      activeHoverKeyRef.current = null;
      setActiveHoverKey(null);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [onChange]);

  const handleSelect = (newStatus, e) => {
    if (e) e.stopPropagation();
    onChange(newStatus);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        !e.target.closest('.glass-pill-stack-portal')
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => {
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const allStatuses = Object.entries(currentConfig);
  const currentIndex = allStatuses.findIndex(([k]) => k === normalizedKey);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  
  const statusesAbove = allStatuses.slice(0, safeIndex);
  const statusesBelow = allStatuses.slice(safeIndex + 1);

  const stackContent = isOpen && mounted ? (
    <>
      {/* Top Stack: Preceding statuses appearing above the active pill in order */}
      {statusesAbove.length > 0 && (
        <div
          style={{
            position: 'fixed',
            left: `${coords.left}px`,
            bottom: `${window.innerHeight - coords.top + 6}px`,
            transform: 'translateX(-50%)',
            zIndex: 999999,
          }}
          className="glass-pill-stack-portal unfold-above"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="glass-pill-stack-blur-backdrop" />
          <div className="glass-pill-stack-list">
            {statusesAbove.map(([k, cfg], index) => {
              const distanceFromCurrent = statusesAbove.length - 1 - index;
              const isHovered = activeHoverKey === cfg.label;
              return (
                <button
                  key={k}
                  type="button"
                  data-status-label={cfg.label}
                  onClick={(e) => handleSelect(cfg.label, e)}
                  onMouseEnter={() => {
                    activeHoverKeyRef.current = cfg.label;
                    setActiveHoverKey(cfg.label);
                  }}
                  className={`glass-pill ${cfg.className} glass-pill-stack-item ${
                    isHovered ? 'is-selected-hover' : ''
                  }`}
                  style={{
                    animationDelay: `${distanceFromCurrent * 25}ms`,
                  }}
                >
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Stack: Succeeding statuses appearing below the active pill in order */}
      {statusesBelow.length > 0 && (
        <div
          style={{
            position: 'fixed',
            left: `${coords.left}px`,
            top: `${coords.bottom + 6}px`,
            transform: 'translateX(-50%)',
            zIndex: 999999,
          }}
          className="glass-pill-stack-portal unfold-below"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="glass-pill-stack-blur-backdrop" />
          <div className="glass-pill-stack-list">
            {statusesBelow.map(([k, cfg], index) => {
              const isHovered = activeHoverKey === cfg.label;
              return (
                <button
                  key={k}
                  type="button"
                  data-status-label={cfg.label}
                  onClick={(e) => handleSelect(cfg.label, e)}
                  onMouseEnter={() => {
                    activeHoverKeyRef.current = cfg.label;
                    setActiveHoverKey(cfg.label);
                  }}
                  className={`glass-pill ${cfg.className} glass-pill-stack-item ${
                    isHovered ? 'is-selected-hover' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 25}ms`,
                  }}
                >
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  ) : null;

  return (
    <div 
      ref={containerRef} 
      className="relative inline-flex items-center justify-center select-none mx-auto"
    >
      <button
        ref={buttonRef}
        type="button"
        onPointerDown={handlePointerDown}
        onClick={(e) => {
          e.stopPropagation();
          if (readOnly || disabled) return;
          updatePosition();
          setIsOpen((prev) => !prev);
        }}
        disabled={disabled || readOnly}
        className={`glass-pill ${currentStatusObj.className} ${isOpen ? 'ring-2 ring-white/30 brightness-110' : ''} ${isPressing ? 'scale-95' : ''}`}
      >
        <span>{currentStatusObj.label}</span>
      </button>

      {typeof document !== 'undefined' && stackContent ? createPortal(stackContent, document.body) : null}
    </div>
  );
}

export function RowActionsToolPill({ item, onDuplicate, onDelete }) {
  const [isToolHovered, setIsToolHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = (e) => {
    e?.stopPropagation?.();
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsToolHovered(true);
  };

  const handleMouseLeave = (e) => {
    e?.stopPropagation?.();
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsToolHovered(false);
    }, 160);
  };

  return (
    <div 
      className={`row-floating-tool-container ${isToolHovered ? 'is-expanded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        if (e.target.closest('button')) {
          e.stopPropagation();
        }
      }}
    >
      {/* Translucent Frosted Glass Capsule (Auto-adapts to content width) */}
      <div className="row-tool-glass-capsule">
        {/* Action satellites unfolding smoothly in place */}
        {isToolHovered ? (
          <div className="row-tool-actions-drawer">
            {/* Duplicate Action */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.(item);
              }}
              className="row-action-btn action-btn-duplicate"
            >
              <Copy className="w-3.5 h-3.5 text-sky-400" />
              <span className="row-action-tooltip">Duplicar</span>
            </button>

            {/* Direct Delete Action */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsToolHovered(false);
                onDelete?.(item);
              }}
              className="row-action-btn action-btn-delete"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="row-action-tooltip">Eliminar</span>
            </button>
          </div>
        ) : (
          /* Tool Trigger Icon when collapsed */
          <button
            type="button"
            className="row-tool-trigger-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsToolHovered(true);
            }}
          >
            <Wrench className="w-3.5 h-3.5 text-slate-300 hover:text-white transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}

export function LiquidGlassUploader({ itemId, attachments = [], onUpload, isUploading, onOpenGallery }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validateAndUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB.');
      return;
    }
    onUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) validateAndUpload(file);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      onClick={() => fileInputRef.current?.click()}
      className={`table-image-dropzone group ${isDragActive ? 'is-active' : ''}`}
      title="Haz clic para subir o arrastra / pega una imagen (Ctrl+V)"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) validateAndUpload(e.target.files[0]);
        }}
      />

      {isUploading ? (
        <span className="text-[11px] font-semibold text-cyan-400 animate-pulse">Subiendo...</span>
      ) : (
        <div className="table-uploader-icons-row text-slate-400 group-hover:text-slate-200 transition-colors">
          <Upload className="w-4 h-4 text-cyan-400/90 transition-transform group-hover:scale-110 flex-shrink-0" />
          <div className="table-uploader-slash" />
          <ClipboardPaste className="w-4 h-4 text-purple-400/90 transition-transform group-hover:scale-110 flex-shrink-0" />
        </div>
      )}
    </div>
  );
}

export function SummaryMetricsBar({ items, activeFilter, onSelectFilter }) {
  const total = items.length;
  const inProgress = items.filter((i) => normalizeStatus(i.status) === 'in_progress').length;
  const done = items.filter((i) => normalizeStatus(i.status) === 'done').length;
  const highPriority = items.filter(
    (i) =>
      i.priority === 'P1' ||
      i.severity === 'Alta' ||
      i.severity === 'Crítica' ||
      i.impact === 'Alto'
  ).length;

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="summary-metrics-bar mb-5">
      {/* 1. Pill: PROGRESO (Horizontal progress bar line + %) */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'DONE' ? 'ALL' : 'DONE')}
        className={`kpi-pill kpi-pill-progress ${activeFilter === 'DONE' ? 'kpi-pill-active' : ''}`}
        title={`Progreso general: ${done} de ${total} finalizados. Clic para filtrar completados.`}
      >
        <div className="kpi-pill-inner">
          <span className="kpi-pill-label">PROGRESO</span>
          
          {/* Línea horizontal de barra de carga estilo White Neon */}
          <div className="kpi-progress-track-line">
            <div 
              className="kpi-progress-fill-line" 
              style={{ width: `${pct}%` }} 
            />
          </div>

          <span className="kpi-pill-pct text-white">{pct}%</span>
        </div>
      </button>

      {/* 2. Pill: EN CURSO (Clean count, perfectly aligned) */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
        className={`kpi-pill ${activeFilter === 'IN_PROGRESS' ? 'kpi-pill-active' : ''}`}
        title={`En curso: ${inProgress} elementos activos. Clic para filtrar.`}
      >
        <div className="kpi-pill-inner">
          <span className="kpi-pill-label">EN CURSO</span>
          <span className="kpi-pill-number text-amber-300">{inProgress}</span>
        </div>
      </button>

      {/* 3. Pill: ATENCIÓN (Flame / Al Día, perfectly aligned) */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'HIGH_PRIORITY' ? 'ALL' : 'HIGH_PRIORITY')}
        className={`kpi-pill ${highPriority > 0 ? 'kpi-pill-alert' : ''} ${activeFilter === 'HIGH_PRIORITY' ? 'kpi-pill-active' : ''}`}
        title={highPriority > 0 ? `${highPriority} elementos requieren atención urgente. Clic para filtrar.` : 'No hay alertas críticas.'}
      >
        <div className="kpi-pill-inner">
          <div className="kpi-pill-left-group">
            {highPriority > 0 && (
              <Flame className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            )}
            <span className="kpi-pill-label">ATENCIÓN</span>
          </div>
          {highPriority > 0 ? (
            <span className="kpi-pill-number text-red-400">{highPriority}</span>
          ) : (
            <span className="kpi-pill-status-text">Al día</span>
          )}
        </div>
      </button>

      {/* 4. Pill: COMPLETADAS (#completadas/#total) */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'DONE' ? 'ALL' : 'DONE')}
        className={`kpi-pill ${activeFilter === 'DONE' ? 'kpi-pill-active' : ''}`}
        title={`Completadas: ${done} de ${total}. Clic para filtrar.`}
      >
        <div className="kpi-pill-inner">
          <div className="kpi-pill-left-group">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="kpi-pill-label">COMPLETADAS</span>
          </div>
          <span className="kpi-pill-number text-emerald-300">
            {done}/{total}
          </span>
        </div>
      </button>
    </div>
  );
}

const KANBAN_COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: '#94a3b8' },
  { id: 'todo', label: 'Por Hacer', color: '#22d3ee' },
  { id: 'in_progress', label: 'En Progreso', color: '#fbbf24' },
  { id: 'review', label: 'En Revisión', color: '#c084fc' },
  { id: 'done', label: 'Completado', color: '#34d399' },
];

export function KanbanBoardView({ items, users, onStatusChange, onUploadImage, onSelectItem, currentView = 'ideas' }) {
  const [activeDropColumn, setActiveDropColumn] = useState(null);
  const [draggingItemId, setDraggingItemId] = useState(null);

  const handleDragStart = (e, item) => {
    setDraggingItemId(item.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ itemId: item.id, sourceStatus: item.status }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingItemId(null);
    setActiveDropColumn(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== colId) {
      setActiveDropColumn(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    e.preventDefault();
    if (activeDropColumn === colId) {
      setActiveDropColumn(null);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setActiveDropColumn(null);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const { itemId, sourceStatus } = JSON.parse(dataStr);

      if (itemId && sourceStatus !== targetStatus) {
        await onStatusChange(itemId, targetStatus);
      }
    } catch (err) {
      console.error('Error in kanban drop:', err);
    }
  };

  return (
    <div className="kanban-board-container">
      {KANBAN_COLUMNS.map((col) => {
        const columnItems = items.filter((item) => item.status === col.id);
        const isDropActive = activeDropColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`kanban-column ${isDropActive ? 'kanban-column-drop-active' : ''}`}
          >
            {/* Column Header */}
            <div className="kanban-column-header">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: col.color, boxShadow: `0 0 8px ${col.color}` }}
                />
                <h3 className="text-xs font-bold font-heading text-white uppercase tracking-wider">
                  {col.label}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-slate-300">
                {columnItems.length}
              </span>
            </div>

            {/* Column Card List */}
            <div className="kanban-card-list">
              {columnItems.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 italic border border-dashed border-white/5 rounded-xl">
                  Sin elementos
                </div>
              ) : (
                columnItems.map((item) => {
                  const assignee = users.find((u) => u.id === item.assigneeId);
                  const isDragging = draggingItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onSelectItem && onSelectItem(item)}
                      className={`kanban-card ${isDragging ? 'kanban-card-dragging' : ''}`}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white/5 text-slate-400 truncate max-w-[140px]">
                          {item.location || item.context || item.viewType}
                        </span>

                        {item.priority && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.priority === 'P1'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {item.priority}
                          </span>
                        )}
                        {item.severity && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.severity === 'Crítica' || item.severity === 'Alta'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {item.severity}
                          </span>
                        )}
                      </div>

                      {/* Card Title */}
                      <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2">
                        {item.title}
                      </h4>

                      {/* Card Attachments Preview */}
                      {item.attachments && item.attachments.length > 0 && (
                        <div className="flex -space-x-1.5 overflow-hidden py-0.5">
                          {item.attachments.slice(0, 3).map((att, i) => (
                            <img
                              key={att.id || i}
                              src={att.url}
                              alt={att.filename}
                              className="h-6 w-6 rounded-md ring-1 ring-[#140f2d] object-cover"
                            />
                          ))}
                        </div>
                      )}

                      {/* Card Footer */}
                      <div
                        className="flex items-center justify-between gap-2 pt-2 border-t border-white/5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LiquidGlassStatusBadge
                          status={item.status}
                          onChange={(newStatus) => onStatusChange(item.id, newStatus)}
                          currentView={currentView}
                        />

                        {assignee ? (
                          <img
                            src={assignee.avatarUrl}
                            alt={assignee.name}
                            title={assignee.name}
                            className="w-5 h-5 rounded-full object-cover border border-white/20"
                          />
                        ) : (
                          <div
                            title="Sin asignar"
                            className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-slate-400"
                          >
                            <User className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TableCenteredScrollbars({ containerRef }) {
  const [scrollState, setScrollState] = useState({
    canScrollX: false,
    ratioX: 0,
    canScrollY: false,
    ratioY: 0,
  });

  const trackXRef = useRef(null);
  const trackYRef = useRef(null);
  const isDraggingXRef = useRef(false);
  const isDraggingYRef = useRef(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialScrollLeft: 0, initialScrollTop: 0 });

  const updateScrollState = () => {
    const el = containerRef.current;
    if (!el) return;
    const maxScrollX = el.scrollWidth - el.clientWidth;
    const maxScrollY = el.scrollHeight - el.clientHeight;
    const canX = maxScrollX > 2;
    const canY = maxScrollY > 2;
    setScrollState({
      canScrollX: canX,
      ratioX: canX ? Math.min(Math.max(0, el.scrollLeft / maxScrollX), 1) : 0,
      canScrollY: canY,
      ratioY: canY ? Math.min(Math.max(0, el.scrollTop / maxScrollY), 1) : 0,
    });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateScrollState);
      ro.observe(el);
      if (el.firstElementChild) {
        ro.observe(el.firstElementChild);
      }
    }

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      if (ro) ro.disconnect();
    };
  }, [containerRef]);

  // Horizontal Pointer Drag
  const handlePointerDownX = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
    isDraggingXRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      initialScrollLeft: el.scrollLeft,
    };
  };

  const handlePointerMoveX = (e) => {
    if (!isDraggingXRef.current || !containerRef.current || !trackXRef.current) return;
    e.preventDefault();
    const el = containerRef.current;
    const trackWidth = trackXRef.current.clientWidth;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const travelDistance = trackWidth * 0.8; // 20% thumb -> 80% travel
    if (travelDistance <= 0) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const scrollDelta = (deltaX / travelDistance) * maxScroll;
    el.scrollLeft = Math.min(Math.max(0, dragStartRef.current.initialScrollLeft + scrollDelta), maxScroll);
  };

  const handlePointerUpX = (e) => {
    isDraggingXRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // Horizontal Track Click
  const handleTrackClickX = (e) => {
    if (e.target.classList.contains('mini-scrollbar-thumb')) return;
    const track = trackXRef.current;
    const el = containerRef.current;
    if (!track || !el) return;
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.min(Math.max(0, (clickX - rect.width * 0.1) / (rect.width * 0.8)), 1);
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: ratio * maxScroll, behavior: 'smooth' });
  };

  // Vertical Pointer Drag
  const handlePointerDownY = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
    isDraggingYRef.current = true;
    dragStartRef.current = {
      startY: e.clientY,
      initialScrollTop: el.scrollTop,
    };
  };

  const handlePointerMoveY = (e) => {
    if (!isDraggingYRef.current || !containerRef.current || !trackYRef.current) return;
    e.preventDefault();
    const el = containerRef.current;
    const trackHeight = trackYRef.current.clientHeight;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const travelDistance = trackHeight * 0.8;
    if (travelDistance <= 0) return;

    const deltaY = e.clientY - dragStartRef.current.startY;
    const scrollDelta = (deltaY / travelDistance) * maxScroll;
    el.scrollTop = Math.min(Math.max(0, dragStartRef.current.initialScrollTop + scrollDelta), maxScroll);
  };

  const handlePointerUpY = (e) => {
    isDraggingYRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // Vertical Track Click
  const handleTrackClickY = (e) => {
    if (e.target.classList.contains('mini-scrollbar-thumb')) return;
    const track = trackYRef.current;
    const el = containerRef.current;
    if (!track || !el) return;
    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const ratio = Math.min(Math.max(0, (clickY - rect.height * 0.1) / (rect.height * 0.8)), 1);
    const maxScroll = el.scrollHeight - el.clientHeight;
    el.scrollTo({ top: ratio * maxScroll, behavior: 'smooth' });
  };

  if (!scrollState.canScrollX && !scrollState.canScrollY) return null;

  return (
    <>
      {/* Horizontal Centered Scrollbar (30% width, 20% thumb) */}
      {scrollState.canScrollX && (
        <div className="table-mini-scrollbar-wrapper-x">
          <div
            ref={trackXRef}
            className="table-mini-scrollbar-track-x"
            onClick={handleTrackClickX}
            title="Desplazamiento horizontal (30% centrado)"
          >
            <div
              className="table-mini-scrollbar-thumb-x mini-scrollbar-thumb"
              style={{
                left: `${scrollState.ratioX * 80}%`,
              }}
              onPointerDown={handlePointerDownX}
              onPointerMove={handlePointerMoveX}
              onPointerUp={handlePointerUpX}
              onPointerCancel={handlePointerUpX}
            />
          </div>
        </div>
      )}

      {/* Vertical Centered Scrollbar (30% height, 20% thumb) */}
      {scrollState.canScrollY && (
        <div className="table-mini-scrollbar-wrapper-y">
          <div
            ref={trackYRef}
            className="table-mini-scrollbar-track-y"
            onClick={handleTrackClickY}
            title="Desplazamiento vertical (30% centrado)"
          >
            <div
              className="table-mini-scrollbar-thumb-y mini-scrollbar-thumb"
              style={{
                top: `${scrollState.ratioY * 80}%`,
              }}
              onPointerDown={handlePointerDownY}
              onPointerMove={handlePointerMoveY}
              onPointerUp={handlePointerUpY}
              onPointerCancel={handlePointerUpY}
            />
          </div>
        </div>
      )}
    </>
  );
}

export const DEFAULT_VIEW_COLUMNS = {
  ideas: [
    { key: 'title', defaultLabel: 'Idea', minWidth: '200px' },
    { key: 'context', defaultLabel: 'Contexto', minWidth: '200px' },
    { key: 'location', defaultLabel: 'Dónde se aplica', minWidth: '160px' },
    { key: 'status', defaultLabel: 'Estado', width: '140px', align: 'center' },
    { key: 'attachments', defaultLabel: 'Imágenes', width: '180px', align: 'center' },
    { key: 'assignee', defaultLabel: 'Responsables', width: '140px', align: 'center' },
    { key: 'notes', defaultLabel: 'Notas', minWidth: '160px' },
  ],
  bugs: [
    { key: 'title', defaultLabel: 'Problema', minWidth: '240px' },
    { key: 'severity', defaultLabel: 'Severidad', width: '130px', align: 'center' },
    { key: 'location', defaultLabel: 'Módulo', minWidth: '160px' },
    { key: 'status', defaultLabel: 'Estado', width: '140px', align: 'center' },
    { key: 'attachments', defaultLabel: 'Imágenes', width: '180px', align: 'center' },
    { key: 'assignee', defaultLabel: 'Responsable', width: '140px', align: 'center' },
  ],
  optimizaciones: [
    { key: 'title', defaultLabel: 'Mejora', minWidth: '240px' },
    { key: 'impact', defaultLabel: 'Impacto', width: '120px', align: 'center' },
    { key: 'effort', defaultLabel: 'Esfuerzo', width: '120px', align: 'center' },
    { key: 'status', defaultLabel: 'Estado', width: '140px', align: 'center' },
    { key: 'attachments', defaultLabel: 'Imágenes', width: '180px', align: 'center' },
    { key: 'assignee', defaultLabel: 'Responsable', width: '140px', align: 'center' },
  ],
  implementaciones: [
    { key: 'title', defaultLabel: 'Funcionalidad', minWidth: '240px' },
    { key: 'priority', defaultLabel: 'Prioridad', width: '120px', align: 'center' },
    { key: 'sprint', defaultLabel: 'Sprint / Fase', minWidth: '160px' },
    { key: 'status', defaultLabel: 'Estado', width: '140px', align: 'center' },
    { key: 'attachments', defaultLabel: 'Imágenes', width: '180px', align: 'center' },
    { key: 'assignee', defaultLabel: 'Responsable', width: '140px', align: 'center' },
  ],
};

export default function SheetTableApp({ 
  initialView = 'ideas', 
  currentUser,
  activeProject = { id: 'proj-1', name: 'ProjectTracker Core', teamName: 'Engineering Team', neonColor: '#38bdf8' },
  onBackToHub
}) {
  const tableWrapperRef = useRef(null);
  const [currentView, setCurrentView] = useState(initialView);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'board'
  const [activeKpiFilter, setActiveKpiFilter] = useState('ALL'); // 'ALL' | 'IN_PROGRESS' | 'DONE' | 'HIGH_PRIORITY'
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMasonryItem, setActiveMasonryItem] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [activeIoDropdown, setActiveIoDropdown] = useState(null); // 'import' | 'export' | null
  const ioDropdownRef = useRef(null);
  const jsonFileInputRef = useRef(null);
  const [autoFocusItemId, setAutoFocusItemId] = useState(null);
  const [uploadingItemId, setUploadingItemId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [hoveredRowItemId, setHoveredRowItemId] = useState(null);
  const [animatingNewRowId, setAnimatingNewRowId] = useState(null);
  const [showMdTip, setShowMdTip] = useState(false);
  const [undoState, setUndoState] = useState(null); // { item, index, secondsLeft }
  const [activeAssigneeItemId, setActiveAssigneeItemId] = useState(null);
  const undoTimeoutRef = useRef(null);
  const undoIntervalRef = useRef(null);

  // Global click-outside & Escape key to close I/O dropdowns
  useEffect(() => {
    if (!activeIoDropdown) return;
    const handleOutsideClick = (e) => {
      if (ioDropdownRef.current && !ioDropdownRef.current.contains(e.target)) {
        setActiveIoDropdown(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveIoDropdown(null);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIoDropdown]);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    // Show Markdown recommendation toast on entering project
    const timer = setTimeout(() => {
      setShowMdTip(true);
    }, 700);
    const autoHideTimer = setTimeout(() => {
      setShowMdTip(false);
    }, 8500);
    return () => {
      clearTimeout(timer);
      clearTimeout(autoHideTimer);
    };
  }, [activeProject?.id]);

  // Column Renaming State (Double-click on Header)
  const [customHeadersMap, setCustomHeadersMap] = useState(() => {
    if (typeof window === 'undefined') return {};
    const saved = {};
    ['ideas', 'bugs', 'optimizaciones', 'implementaciones'].forEach((v) => {
      try {
        const raw = localStorage.getItem(`pt_custom_headers_${v}`);
        if (raw) saved[v] = JSON.parse(raw);
      } catch {}
    });
    return saved;
  });

  // Helper to generate case-insensitive unique column names
  const generateUniqueColumnName = (baseName = 'Nueva Columna', existingNames = []) => {
    const normalizedExisting = new Set(existingNames.map((n) => (n || '').trim().toLowerCase()));
    const trimmedBase = (baseName || 'Nueva Columna').trim();

    if (!normalizedExisting.has(trimmedBase.toLowerCase())) {
      return trimmedBase;
    }

    let counter = 2;
    while (normalizedExisting.has(`${trimmedBase} ${counter}`.toLowerCase())) {
      counter++;
    }
    return `${trimmedBase} ${counter}`;
  };

  const [editingHeaderColKey, setEditingHeaderColKey] = useState(null);
  const [headerRenameVal, setHeaderRenameVal] = useState('');
  const [hoveredHeaderColKey, setHoveredHeaderColKey] = useState(null);

  const handleSaveHeaderName = (colKey, newName) => {
    const trimmed = (newName || '').trim();
    if (!trimmed) {
      setEditingHeaderColKey(null);
      return;
    }

    // Enforce case-insensitive uniqueness across existing columns in current view
    const otherColumnNames = activeOrderedColumns
      .filter((c) => c.key !== colKey)
      .map((c) => ((customHeadersMap[currentView] && customHeadersMap[currentView][c.key]) || c.defaultLabel || c.key).trim().toLowerCase());

    const idLabel = ((customHeadersMap[currentView] && customHeadersMap[currentView]['id']) || 'ID').trim().toLowerCase();
    if (colKey !== 'id') {
      otherColumnNames.push(idLabel);
    }

    if (otherColumnNames.includes(trimmed.toLowerCase())) {
      showToast(`Ya existe una columna llamada "${trimmed}"`);
      setEditingHeaderColKey(null);
      return;
    }

    setCustomHeadersMap((prev) => {
      const currentViewHeaders = { ...(prev[currentView] || {}) };
      currentViewHeaders[colKey] = trimmed;
      const updated = { ...prev, [currentView]: currentViewHeaders };
      try {
        localStorage.setItem(`pt_custom_headers_${currentView}`, JSON.stringify(currentViewHeaders));
      } catch {}
      return updated;
    });
    setEditingHeaderColKey(null);
  };

  // Column Ordering & Drag & Drop Reordering State
  const [columnOrderMap, setColumnOrderMap] = useState(() => {
    if (typeof window === 'undefined') return {};
    const saved = {};
    ['ideas', 'bugs', 'optimizaciones', 'implementaciones'].forEach((v) => {
      try {
        const raw = localStorage.getItem(`pt_col_order_${v}`);
        if (raw) saved[v] = JSON.parse(raw);
      } catch {}
    });
    return saved;
  });

  // Hidden Columns State
  const [hiddenColumnsMap, setHiddenColumnsMap] = useState(() => {
    if (typeof window === 'undefined') return {};
    const saved = {};
    ['ideas', 'bugs', 'optimizaciones', 'implementaciones'].forEach((v) => {
      try {
        const raw = localStorage.getItem(`pt_hidden_cols_${v}`);
        if (raw) saved[v] = JSON.parse(raw);
      } catch {}
    });
    return saved;
  });

  // Column and Row Drag & Drop Synchronous Refs and Overlay States
  const dragColRef = useRef(null);
  const dragRowRef = useRef(null);
  const [draggedColKey, setDraggedColKey] = useState(null);
  const [draggedRowId, setDraggedRowId] = useState(null);
  const [colDropIndicator, setColDropIndicator] = useState(null); // { left: number, targetKey: string, pos: 'left' | 'right' }
  const [rowDropIndicator, setRowDropIndicator] = useState(null); // { top: number, targetId: string, pos: 'top' | 'bottom' }

  // Custom Columns State (User added columns per view)
  const [customColumnsMap, setCustomColumnsMap] = useState(() => {
    if (typeof window === 'undefined') return {};
    const saved = {};
    ['ideas', 'bugs', 'optimizaciones', 'implementaciones'].forEach((v) => {
      try {
        const raw = localStorage.getItem(`pt_custom_cols_${v}`);
        if (raw) saved[v] = JSON.parse(raw);
      } catch {}
    });
    return saved;
  });

  // Compute active ordered column definitions for current view
  const currentViewDefaultCols = DEFAULT_VIEW_COLUMNS[currentView] || DEFAULT_VIEW_COLUMNS.ideas;
  const currentViewCustomCols = customColumnsMap[currentView] || [];
  const allViewCols = [...currentViewDefaultCols, ...currentViewCustomCols];
  const currentViewSavedOrder = columnOrderMap[currentView] || [];
  
  const activeOrderedColumns = (() => {
    const hidden = new Set(hiddenColumnsMap[currentView] || []);
    const ordered = [];
    currentViewSavedOrder.forEach((key) => {
      if (hidden.has(key)) return;
      const colDef = allViewCols.find((c) => c.key === key);
      if (colDef && !ordered.some((c) => c.key === colDef.key)) {
        ordered.push(colDef);
      }
    });
    allViewCols.forEach((colDef) => {
      if (hidden.has(colDef.key)) return;
      if (!ordered.some((c) => c.key === colDef.key)) {
        ordered.push(colDef);
      }
    });
    return ordered;
  })();

  const handleDropColumn = (sourceColKey, targetColKey, pos = 'right') => {
    const fromKey = sourceColKey || dragColRef.current || draggedColKey;
    if (!fromKey || !targetColKey || fromKey === targetColKey) {
      setColDropIndicator(null);
      dragColRef.current = null;
      setDraggedColKey(null);
      return;
    }

    const currentKeys = activeOrderedColumns.map((c) => c.key);
    const fromIndex = currentKeys.indexOf(fromKey);
    if (fromIndex === -1) {
      setColDropIndicator(null);
      dragColRef.current = null;
      setDraggedColKey(null);
      return;
    }

    const newKeys = [...currentKeys];
    const [moved] = newKeys.splice(fromIndex, 1);

    let insertIndex = newKeys.indexOf(targetColKey);
    if (insertIndex === -1) {
      setColDropIndicator(null);
      dragColRef.current = null;
      setDraggedColKey(null);
      return;
    }

    if (pos === 'right') {
      insertIndex += 1;
    }

    newKeys.splice(insertIndex, 0, moved);

    setColumnOrderMap((prev) => {
      const next = { ...prev, [currentView]: newKeys };
      try {
        localStorage.setItem(`pt_col_order_${currentView}`, JSON.stringify(newKeys));
      } catch {}
      return next;
    });

    setColDropIndicator(null);
    dragColRef.current = null;
    setDraggedColKey(null);
  };

  const handleDropRow = (sourceRowId, targetRowId, pos = 'bottom') => {
    const fromId = sourceRowId || dragRowRef.current || draggedRowId;
    if (!fromId || !targetRowId || fromId === targetRowId) {
      setRowDropIndicator(null);
      dragRowRef.current = null;
      setDraggedRowId(null);
      return;
    }

    const fromIndex = items.findIndex((it) => it.id === fromId);
    if (fromIndex === -1) {
      setRowDropIndicator(null);
      dragRowRef.current = null;
      setDraggedRowId(null);
      return;
    }

    const newItems = [...items];
    const [moved] = newItems.splice(fromIndex, 1);

    let insertIndex = newItems.findIndex((it) => it.id === targetRowId);
    if (insertIndex === -1) {
      setRowDropIndicator(null);
      dragRowRef.current = null;
      setDraggedRowId(null);
      return;
    }

    if (pos === 'bottom') {
      insertIndex += 1;
    }

    newItems.splice(insertIndex, 0, moved);
    setItems(newItems);

    try {
      localStorage.setItem(`pt_items_${currentView}`, JSON.stringify(newItems));
    } catch {}

    setRowDropIndicator(null);
    dragRowRef.current = null;
    setDraggedRowId(null);
  };

  // Default Minimum Column Widths (Prevents content from spilling out or cell from being too narrow)
  const DEFAULT_COL_WIDTHS = {
    id: 44,
    title: 280,
    context: 240,
    location: 180,
    status: 175,
    attachments: 200,
    assignee: 220,
    notes: 240,
    severity: 140,
    impact: 140,
    effort: 140,
    priority: 140,
    sprint: 160,
  };

  // Column Widths & Pinning State
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COL_WIDTHS);

  const getColStyle = (colKey) => {
    const w = columnWidths[colKey] || DEFAULT_COL_WIDTHS[colKey] || 160;
    return {
      width: `${w}px`,
      minWidth: `${w}px`,
      maxWidth: `${w}px`,
    };
  };

  // Add New Column After targetColKey with case-insensitive unique naming
  const handleAddColumnAfter = (targetColKey) => {
    const existingNames = activeOrderedColumns.map(
      (c) => ((customHeadersMap[currentView] && customHeadersMap[currentView][c.key]) || c.defaultLabel || c.key).trim()
    );
    existingNames.push(((customHeadersMap[currentView] && customHeadersMap[currentView]['id']) || 'ID').trim());

    const uniqueLabel = generateUniqueColumnName('Nueva Columna', existingNames);
    const newKey = `col_${Date.now()}`;
    const newCol = {
      key: newKey,
      defaultLabel: uniqueLabel,
      minWidth: '180px',
    };

    setCustomColumnsMap((prev) => {
      const currentCustom = prev[currentView] || [];
      const updatedCustom = [...currentCustom, newCol];
      try {
        localStorage.setItem(`pt_custom_cols_${currentView}`, JSON.stringify(updatedCustom));
      } catch {}
      return { ...prev, [currentView]: updatedCustom };
    });

    setCustomHeadersMap((prev) => {
      const currentHeaders = { ...(prev[currentView] || {}) };
      currentHeaders[newKey] = uniqueLabel;
      try {
        localStorage.setItem(`pt_custom_headers_${currentView}`, JSON.stringify(currentHeaders));
      } catch {}
      return { ...prev, [currentView]: currentHeaders };
    });

    setColumnOrderMap((prev) => {
      const currentKeys = activeOrderedColumns.map((c) => c.key);
      const targetIndex = currentKeys.indexOf(targetColKey);
      const newKeys = [...currentKeys];
      if (targetIndex !== -1) {
        newKeys.splice(targetIndex + 1, 0, newKey);
      } else {
        newKeys.push(newKey);
      }
      try {
        localStorage.setItem(`pt_col_order_${currentView}`, JSON.stringify(newKeys));
      } catch {}
      return { ...prev, [currentView]: newKeys };
    });

    setHoveredHeaderColKey(null);
    setEditingHeaderColKey(newKey);
    setHeaderRenameVal(uniqueLabel);
    showToast(`Columna "${uniqueLabel}" agregada`);
  };

  const handleStartResize = (e, colKey) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = columnWidths[colKey] || 180;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(90, startWidth + deltaX);
      setColumnWidths((prev) => ({ ...prev, [colKey]: newWidth }));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Column Filters State: { [columnKey]: string }
  const [columnFilters, setColumnFilters] = useState({});
  const [activeFilterPopover, setActiveFilterPopover] = useState(null); // columnKey string or null

  // Multi-cell Drag Selection State
  const [selectedCells, setSelectedCells] = useState(new Set()); // Set of "itemId:colKey"
  const [selectionFloatingPos, setSelectionFloatingPos] = useState(null); // { x, y }
  const [showSelectionDeleteConfirm, setShowSelectionDeleteConfirm] = useState(false);
  const dragSelectionStartRef = useRef(null);
  const isDraggingSelectionRef = useRef(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  useEffect(() => {
    fetchItems(currentView);
  }, [currentView]);

  // Global dragend listener to cleanup indicators if drag ends/cancels
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setTimeout(() => {
        dragColRef.current = null;
        dragRowRef.current = null;
        setDraggedColKey(null);
        setDraggedRowId(null);
        setColDropIndicator(null);
        setRowDropIndicator(null);
      }, 50);
    };

    window.addEventListener('dragend', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);

  const fetchItems = async (view) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/items?view=${view}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Inline update item cell
  const updateCell = async (itemId, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    );

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (err) {
      console.error('Error updating cell:', err);
    }
  };

  // Optimistic status update with automatic rollback on error
  const handleStatusChange = async (itemId, newStatus) => {
    const previousItems = [...items];

    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
    );

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error status ${res.status}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setItems(previousItems);
      showToast('Failed to update item status. Reverting changes.');
    }
  };

  // Add new item row immediately and smoothly with elegant entrance animation (no table loading flash)
  const handleAddNewRow = async () => {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewType: currentView,
          title: '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newItem = data.item;
        if (newItem?.id) {
          // Seamlessly append to items state without wiping out or reloading the table
          setItems((prev) => [...prev, newItem]);
          setAutoFocusItemId(newItem.id);
          setAnimatingNewRowId(newItem.id);
          setTimeout(() => setAnimatingNewRowId(null), 1200);

          // Scroll smoothly to reveal the new row at the bottom
          setTimeout(() => {
            if (tableWrapperRef.current) {
              tableWrapperRef.current.scrollTo({
                top: tableWrapperRef.current.scrollHeight,
                behavior: 'smooth',
              });
            }
          }, 40);
        }
      }
    } catch (err) {
      console.error('Error adding row:', err);
    }
  };

  // Delete item row with 4-second undoable countdown window
  const handleDeleteItem = (target) => {
    const itemToDelete = typeof target === 'object' && target !== null 
      ? target 
      : items.find((i) => i.id === target);
    if (!itemToDelete) return;

    const originalIndex = items.findIndex((i) => i.id === itemToDelete.id);

    // If there was a previous pending deletion, commit it now
    if (undoState?.item && undoState.item.id !== itemToDelete.id) {
      fetch(`/api/items/${undoState.item.id}`, { method: 'DELETE' }).catch(() => {});
    }

    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);

    // Remove from UI state immediately
    setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));

    // Setup 4-second countdown
    const initialSeconds = 4;
    setUndoState({
      item: itemToDelete,
      index: originalIndex >= 0 ? originalIndex : 0,
      secondsLeft: initialSeconds,
    });

    let currentSec = initialSeconds;
    undoIntervalRef.current = setInterval(() => {
      currentSec -= 1;
      if (currentSec <= 0) {
        clearInterval(undoIntervalRef.current);
      }
      setUndoState((prev) => (prev ? { ...prev, secondsLeft: Math.max(0, currentSec) } : null));
    }, 1000);

    undoTimeoutRef.current = setTimeout(async () => {
      setUndoState(null);
      try {
        await fetch(`/api/items/${itemToDelete.id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Error committing deletion:', err);
      }
    }, initialSeconds * 1000);
  };

  // Undo delete: Restore item back into state at its original index
  const handleUndoDelete = () => {
    if (!undoState?.item) return;

    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);

    const { item, index } = undoState;
    setItems((prev) => {
      const copy = [...prev];
      const insertAt = Math.min(index, copy.length);
      copy.splice(insertAt, 0, item);
      return copy;
    });

    setUndoState(null);
  };

  // Duplicate item row seamlessly
  const handleDuplicateItem = async (item) => {
    if (!item) return;
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewType: currentView,
          title: item.title ? `${item.title} (Copia)` : 'Nueva Fila (Copia)',
          context: item.context || '',
          location: item.location || '',
          severity: item.severity || 'Media',
          impact: item.impact || 'Medio',
          effort: item.effort || 'Medio',
          priority: item.priority || 'P2',
          sprint: item.sprint || 'Sprint 1',
          status: item.status || 'backlog',
          notes: item.notes || '',
          assigneeId: item.assigneeId || item.assignee?.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.item) {
          setItems((prev) => {
            const index = prev.findIndex((i) => i.id === item.id);
            if (index !== -1) {
              const copy = [...prev];
              copy.splice(index + 1, 0, data.item);
              return copy;
            }
            return [data.item, ...prev];
          });
          setAnimatingNewRowId(data.item.id);
          setTimeout(() => setAnimatingNewRowId(null), 1200);
        }
      }
    } catch (err) {
      console.error('Error duplicating item:', err);
    }
  };

  // Export current table items as CSV to clipboard
  const handleExportCsv = () => {
    if (!items || items.length === 0) {
      showToast('No hay filas para exportar en esta vista.');
      return;
    }

    const currentCols = DEFAULT_VIEW_COLUMNS[currentView] || DEFAULT_VIEW_COLUMNS.ideas;
    const headers = currentCols.map((c) => {
      const customName = customHeadersMap[currentView]?.[c.key];
      return customName || c.defaultLabel;
    });

    const escapeCsvCell = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r') || str.includes(';')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const statusConfig = VIEW_STATUS_CONFIG[currentView] || STATUS_CONFIG;

    const rows = items.map((item) => {
      return currentCols.map((col) => {
        if (col.key === 'status') {
          const statusKey = item.status || 'backlog';
          return escapeCsvCell(statusConfig[statusKey]?.label || statusKey);
        }
        if (col.key === 'assignee') {
          return escapeCsvCell(item.assignee?.name || item.assignee?.email || 'Sin Asignar');
        }
        if (col.key === 'attachments') {
          const count = item.attachments?.length || 0;
          return escapeCsvCell(count > 0 ? `${count} imagen(es)` : '0');
        }
        return escapeCsvCell(item[col.key] || '');
      }).join(',');
    });

    const csvContent = [headers.map(escapeCsvCell).join(','), ...rows].join('\n');

    // Trigger file download
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project_${currentView}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(csvContent)
        .then(() => {
          showToast(`📋 ¡Tabla exportada en CSV! (${items.length} filas)`);
        })
        .catch((err) => {
          console.error('Error copying CSV:', err);
          showToast(`📋 ¡Archivo CSV descargado! (${items.length} filas)`);
        });
    } else {
      showToast(`📋 ¡Archivo CSV descargado! (${items.length} filas)`);
    }
  };

  // Export current table items as formatted JSON file & clipboard
  const handleExportJson = () => {
    if (!items || items.length === 0) {
      showToast('No hay filas para exportar en esta vista.');
      return;
    }

    const currentCols = DEFAULT_VIEW_COLUMNS[currentView] || DEFAULT_VIEW_COLUMNS.ideas;
    const exportData = items.map((item) => {
      const row = {};
      currentCols.forEach((col) => {
        const headerName = customHeadersMap[currentView]?.[col.key] || col.defaultLabel;
        if (col.key === 'assignee') {
          row[headerName] = item.assignee?.name || 'Sin Asignar';
        } else if (col.key === 'attachments') {
          row[headerName] = item.attachments?.map((a) => a.url) || [];
        } else {
          row[headerName] = item[col.key] || '';
        }
      });
      return row;
    });

    const jsonStr = JSON.stringify(exportData, null, 2);

    try {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project_${currentView}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonStr).catch(() => {});
    }
    showToast(`📦 Archivo JSON descargado (${items.length} filas)`);
  };

  // Import items directly from JSON file upload
  const handleImportJsonFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const itemsToInsert = Array.isArray(parsed) ? parsed : (parsed.items || [parsed]);
        if (!Array.isArray(itemsToInsert) || itemsToInsert.length === 0) {
          showToast('El archivo JSON no contiene elementos válidos');
          return;
        }

        let count = 0;
        for (const it of itemsToInsert) {
          const body = {
            viewType: currentView,
            title: it.title || it.Title || it.Idea || it.idea || it.Problema || it.problema || it.Mejora || it.mejora || it.Funcionalidad || it.funcionalidad || it.name || 'Nuevo elemento',
            context: it.context || it.Contexto || it.contexto || it.description || '',
            location: it.location || it['Dónde se aplica'] || it.Ubicación || it.ubicacion || it.Módulo || it.modulo || '',
            severity: it.severity || it.Severidad || it.severidad || 'Media',
            impact: it.impact || it.Impacto || it.impacto || 'Medio',
            effort: it.effort || it.Esfuerzo || it.esfuerzo || 'Medio',
            priority: it.priority || it.Prioridad || it.prioridad || 'P2',
            sprint: it.sprint || it['Sprint / Fase'] || it.sprint || 'Sprint 1',
            status: it.status || it.Estado || it.estado || 'backlog',
            notes: it.notes || it.Notas || it.notas || '',
            assigneeId: it.assigneeId || it.assignee?.id,
          };
          const res = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.item) {
              setItems((prev) => [data.item, ...prev]);
              count++;
            }
          }
        }
        showToast(`¡Se importaron ${count} elementos desde JSON!`);
      } catch (err) {
        console.error('Error importing JSON:', err);
        showToast('Error al parsear el archivo JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Attachment Delete Handler
  const deleteAttachment = async (itemId, attachmentId) => {
    // Optimistic delete
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const current = (item.attachments || []).filter((att) => att.id !== attachmentId);
          return { ...item, attachments: current };
        }
        return item;
      })
    );

    try {
      if (typeof attachmentId === 'string' && !attachmentId.startsWith('temp-')) {
        await fetch(`/api/attachments/${attachmentId}`, { method: 'DELETE' });
      }
    } catch (err) {
      console.error('Error deleting attachment:', err);
    }
  };

  // Image Upload Handler
  const uploadImage = async (itemId, file) => {
    if (!file) return;
    setUploadingItemId(itemId);

    // Create an instant local Blob URL for optimistic 0ms thumbnail display
    const tempObjectUrl = URL.createObjectURL(file);
    const tempAttachment = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      url: tempObjectUrl,
      filename: file.name || 'clipboard-image.png',
      mimeType: file.type || 'image/png',
    };

    // Optimistically insert temp attachment so thumbnail displays instantly
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const current = item.attachments || [];
          return { ...item, attachments: [...current, tempAttachment] };
        }
        return item;
      })
    );

    const formData = new FormData();
    formData.append('itemId', itemId);
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const serverAtt = data.attachment;

        // Immediately update with server attachment
        setItems((prev) =>
          prev.map((item) => {
            if (item.id === itemId) {
              const current = (item.attachments || []).map((att) =>
                att.id === tempAttachment.id ? serverAtt : att
              );
              return { ...item, attachments: current };
            }
            return item;
          })
        );
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Error subiendo imagen.');
      // Rollback temp attachment on failure
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const current = (item.attachments || []).filter((att) => att.id !== tempAttachment.id);
            return { ...item, attachments: current };
          }
          return item;
        })
      );
    } finally {
      setUploadingItemId(null);
    }
  };

  // Filter items based on active column filters & active KPI filter
  const filteredItems = items.filter((item) => {
    if (activeKpiFilter === 'IN_PROGRESS' && item.status !== 'in_progress') {
      return false;
    }
    if (activeKpiFilter === 'DONE' && item.status !== 'done') {
      return false;
    }
    if (activeKpiFilter === 'HIGH_PRIORITY') {
      const isHigh =
        item.priority === 'P1' ||
        item.severity === 'Alta' ||
        item.severity === 'Crítica' ||
        item.impact === 'Alto';
      if (!isHigh) return false;
    }

    for (const [colKey, filterVal] of Object.entries(columnFilters)) {
      if (!filterVal || !filterVal.trim()) continue;
      const cleanFilter = filterVal.toLowerCase().trim();

      if (colKey === 'assignee') {
        const assignee = users.find((u) => u.id === item.assigneeId);
        const name = assignee ? assignee.name.toLowerCase() : 'sin asignar';
        if (!name.includes(cleanFilter)) return false;
      } else if (colKey === 'id') {
        const indexStr = (items.indexOf(item) + 1).toString();
        if (!indexStr.includes(cleanFilter)) return false;
      } else if (colKey === 'attachments') {
        const countStr = item.attachments ? item.attachments.length.toString() : '0';
        if (!countStr.includes(cleanFilter)) return false;
      } else {
        const raw = item[colKey];
        if (raw === null || raw === undefined) return false;
        const fieldVal = typeof raw === 'object' ? JSON.stringify(raw).toLowerCase() : String(raw).toLowerCase();
        if (!fieldVal.includes(cleanFilter)) return false;
      }
    }
    return true;
  });

  const activeFiltersCount =
    Object.values(columnFilters).filter(Boolean).length + (activeKpiFilter !== 'ALL' ? 1 : 0);

  const handleSetColumnFilter = (colKey, val) => {
    setColumnFilters((prev) => ({
      ...prev,
      [colKey]: val,
    }));
  };

  const handleClearColumnFilter = (colKey) => {
    setColumnFilters((prev) => {
      const copy = { ...prev };
      delete copy[colKey];
      return copy;
    });
  };

  const handleClearAllFilters = () => {
    setColumnFilters({});
    setActiveKpiFilter('ALL');
  };

  // Handle Cell Drag Selection
  const handleCellPointerDown = (e, item, colDef, rIdx, cIdx) => {
    if (e.target.closest('button') || e.target.closest('textarea') || e.target.closest('input') || e.target.closest('.cell-editor-container') || e.target.closest('.assignee-popover-portal')) {
      return;
    }
    if (e.button !== 0) return;
    if (colDef.key === 'id') return;

    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }

    dragSelectionStartRef.current = {
      rIdx,
      cIdx,
      itemId: item.id,
      colKey: colDef.key,
      startX: e.clientX,
      startY: e.clientY,
    };
    isDraggingSelectionRef.current = false;
  };

  useEffect(() => {
    const handleGlobalPointerMove = (e) => {
      if (!dragSelectionStartRef.current) return;
      const start = dragSelectionStartRef.current;
      const dist = Math.hypot(e.clientX - start.startX, e.clientY - start.startY);
      if (dist > 6) {
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        }
        isDraggingSelectionRef.current = true;
        const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-cell-anchor="true"]');
        if (el) {
          const targetRIdx = parseInt(el.getAttribute('data-row-idx'), 10);
          const targetCIdx = parseInt(el.getAttribute('data-col-idx'), 10);

          if (!isNaN(targetRIdx) && !isNaN(targetCIdx)) {
            const minR = Math.min(start.rIdx, targetRIdx);
            const maxR = Math.max(start.rIdx, targetRIdx);
            const minC = Math.min(start.cIdx, targetCIdx);
            const maxC = Math.max(start.cIdx, targetCIdx);

            const newSet = new Set();
            for (let r = minR; r <= maxR; r++) {
              const rowItem = filteredItems[r];
              if (!rowItem) continue;
              for (let c = minC; c <= maxC; c++) {
                const col = activeOrderedColumns[c];
                if (!col || col.key === 'id') continue;
                newSet.add(`${rowItem.id}:${col.key}`);
              }
            }
            setSelectedCells(newSet);
          }
        }
      }
    };

    const handleGlobalPointerDown = (e) => {
      if (e.target.closest('.multi-cell-floating-toolbar') || e.target.closest('.comic-balloon-confirm')) {
        return;
      }
      if (!e.target.closest('[data-cell-anchor="true"]')) {
        if (selectedCells.size > 0) {
          setSelectedCells(new Set());
          setSelectionFloatingPos(null);
          setShowSelectionDeleteConfirm(false);
        }
      }
    };

    const handleGlobalPointerUp = (e) => {
      if (dragSelectionStartRef.current) {
        if (isDraggingSelectionRef.current && selectedCells.size >= 1) {
          setSelectionFloatingPos({
            x: Math.min(window.innerWidth - 140, Math.max(140, e.clientX)),
            y: Math.max(70, e.clientY - 20),
          });
        } else if (!isDraggingSelectionRef.current) {
          // If clicked without dragging outside active toolbar, clear selection
          if (!e.target.closest('.multi-cell-floating-toolbar')) {
            setSelectedCells(new Set());
            setSelectionFloatingPos(null);
            setShowSelectionDeleteConfirm(false);
          }
        }
        dragSelectionStartRef.current = null;
        isDraggingSelectionRef.current = false;
      }
    };

    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);

      if (e.key === 'Escape') {
        setSelectedCells(new Set());
        setSelectionFloatingPos(null);
        setShowSelectionDeleteConfirm(false);
        return;
      }

      // Keyboard Shortcut: Cmd+C / Ctrl+C to copy selected cells
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        if (!isInputActive && selectedCells.size > 0) {
          e.preventDefault();
          handleCopySelectedCells();
        }
      }
    };

    // Keyboard Shortcut: Cmd+V / Ctrl+V to paste table data or images
    const handleGlobalPaste = (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }

      // 1. Handle Image Paste
      const clipboardItems = e.clipboardData?.items;
      if (clipboardItems) {
        for (let i = 0; i < clipboardItems.length; i++) {
          if (clipboardItems[i].type.startsWith('image/')) {
            const file = clipboardItems[i].getAsFile();
            if (file && hoveredRowItemId) {
              e.preventDefault();
              uploadImage(hoveredRowItemId, file);
              showToast('Imagen pegada desde el portapapeles.');
              return;
            }
          }
        }
      }

      // 2. Handle Tabular / Excel Text Paste
      const text = e.clipboardData?.getData('text/plain');
      if (text) {
        e.preventDefault();
        let startRIdx = 0;
        let startCIdx = 0;

        if (selectedCells.size > 0) {
          let minR = Infinity;
          let minC = Infinity;
          selectedCells.forEach((cellKey) => {
            const [itemId, colKey] = cellKey.split(':');
            const rIdx = filteredItems.findIndex((it) => it.id === itemId);
            const cIdx = activeOrderedColumns.findIndex((c) => c.key === colKey);
            if (rIdx !== -1 && rIdx < minR) minR = rIdx;
            if (cIdx !== -1 && cIdx < minC) minC = cIdx;
          });
          if (minR !== Infinity) startRIdx = minR;
          if (minC !== Infinity) startCIdx = minC;
        } else if (hoveredRowItemId) {
          const rIdx = filteredItems.findIndex((it) => it.id === hoveredRowItemId);
          if (rIdx !== -1) startRIdx = rIdx;
          startCIdx = 0;
        }

        handlePasteTableData(text, startRIdx, startCIdx);
      }
    };

    window.addEventListener('pointerdown', handleGlobalPointerDown);
    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handleGlobalPaste);

    return () => {
      window.removeEventListener('pointerdown', handleGlobalPointerDown);
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, [filteredItems, activeOrderedColumns, selectedCells, hoveredRowItemId]);

  const handleCopySelectedCells = async () => {
    if (selectedCells.size === 0) return;
    const rowMap = new Map();

    filteredItems.forEach((item, rIdx) => {
      activeOrderedColumns.forEach((colDef) => {
        const key = `${item.id}:${colDef.key}`;
        if (selectedCells.has(key)) {
          if (!rowMap.has(rIdx)) rowMap.set(rIdx, []);
          let val = item[colDef.key] ?? '';
          if (typeof val === 'object') {
            if (Array.isArray(val)) val = val.map((v) => v.name || v.filename || JSON.stringify(v)).join(', ');
            else val = val.name || JSON.stringify(val);
          }
          rowMap.get(rIdx).push(String(val).replace(/\r?\n|\r/g, ' '));
        }
      });
    });

    if (rowMap.size === 0) return;

    const tsvData = Array.from(rowMap.values())
      .map((row) => row.join('\t'))
      .join('\n');

    const htmlData = `<table>${Array.from(rowMap.values())
      .map((row) => `<tr>${row.map((cell) => `<td>${cell.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`)
      .join('')}</table>`;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const textBlob = new Blob([tsvData], { type: 'text/plain' });
        const htmlBlob = new Blob([htmlData], { type: 'text/html' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': textBlob,
            'text/html': htmlBlob,
          }),
        ]);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(tsvData);
      }
      showToast(`${selectedCells.size} celdas copiadas como tabla`);
    } catch (err) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(tsvData);
        showToast(`${selectedCells.size} celdas copiadas al portapapeles`);
      }
    }
  };

  const handlePasteTableData = (text, startRIdx = 0, startCIdx = 0) => {
    if (!text || typeof text !== 'string') return;

    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trimEnd();
    const rawRows = normalized.split('\n');
    if (rawRows.length === 0) return;

    const parsedMatrix = rawRows.map((rowStr) => {
      if (rowStr.includes('\t')) {
        return rowStr.split('\t');
      }
      return [rowStr];
    });

    const updatedSet = new Set();
    let cellsCount = 0;

    parsedMatrix.forEach((rowCols, rOffset) => {
      const targetRIdx = startRIdx + rOffset;
      const targetItem = filteredItems[targetRIdx];
      if (!targetItem) return;

      rowCols.forEach((cellVal, cOffset) => {
        const targetCIdx = startCIdx + cOffset;
        const targetCol = activeOrderedColumns[targetCIdx];
        if (!targetCol || targetCol.key === 'id' || targetCol.key === 'actions') return;

        const cleanVal = cellVal.trim();
        updateCell(targetItem.id, targetCol.key, cleanVal);
        updatedSet.add(`${targetItem.id}:${targetCol.key}`);
        cellsCount++;
      });
    });

    if (cellsCount > 0) {
      setSelectedCells(updatedSet);
      showToast(`Se pegaron datos en ${cellsCount} ${cellsCount === 1 ? 'celda' : 'celdas'}`);
    }
  };

  const handleClearSelectedCells = () => {
    selectedCells.forEach((cellKey) => {
      const [itemId, colKey] = cellKey.split(':');
      if (itemId && colKey) {
        updateCell(itemId, colKey, '');
      }
    });
    showToast(`${selectedCells.size} celdas vaciadas`);
    setSelectedCells(new Set());
    setSelectionFloatingPos(null);
    setShowSelectionDeleteConfirm(false);
  };

  const handleDeleteSelectedRows = async () => {
    const rowIds = new Set();
    selectedCells.forEach((cellKey) => {
      const [itemId] = cellKey.split(':');
      if (itemId) rowIds.add(itemId);
    });

    const rowIdsArr = Array.from(rowIds);
    if (rowIdsArr.length === 0) return;

    setItems((prev) => prev.filter((i) => !rowIds.has(i.id)));
    setSelectedCells(new Set());
    setSelectionFloatingPos(null);
    setShowSelectionDeleteConfirm(false);
    showToast(`Se eliminaron ${rowIdsArr.length} ${rowIdsArr.length === 1 ? 'fila' : 'filas'}`);

    try {
      await Promise.all(rowIdsArr.map((id) => fetch(`/api/items/${id}`, { method: 'DELETE' })));
    } catch (err) {
      console.error('Error deleting rows:', err);
    }
  };

  const handleHideSelectedColumns = () => {
    const colKeys = new Set();
    selectedCells.forEach((cellKey) => {
      const [, colKey] = cellKey.split(':');
      if (colKey && colKey !== 'id' && colKey !== 'actions') colKeys.add(colKey);
    });

    const colKeysArr = Array.from(colKeys);
    if (colKeysArr.length === 0) return;

    setHiddenColumnsMap((prev) => {
      const currentHidden = new Set(prev[currentView] || []);
      colKeysArr.forEach((k) => currentHidden.add(k));
      const updated = { ...prev, [currentView]: Array.from(currentHidden) };
      try {
        localStorage.setItem(`pt_hidden_cols_${currentView}`, JSON.stringify(Array.from(currentHidden)));
      } catch {}
      return updated;
    });

    setSelectedCells(new Set());
    setSelectionFloatingPos(null);
    setShowSelectionDeleteConfirm(false);
    showToast(`Se quitaron ${colKeysArr.length} ${colKeysArr.length === 1 ? 'columna' : 'columnas'}`);
  };



  const renderCellForColumn = (colKey, item, idx, cIdx) => {
    const cellKey = `${item.id}:${colKey}`;
    const isSelected = selectedCells.has(cellKey);
    const colDef = activeOrderedColumns[cIdx] || { key: colKey };
    const isLastColumn = cIdx === activeOrderedColumns.length - 1;
    const colStyle = getColStyle(colKey);

    const commonProps = {
      isSelected,
      onPointerDown: (e) => handleCellPointerDown(e, item, colDef, idx, cIdx),
      'data-cell-anchor': 'true',
      'data-row-idx': idx,
      'data-col-idx': cIdx,
      'data-col-key': colKey,
      'data-item-id': item.id,
      'data-cell-key': cellKey,
      isLastColumn,
      rowActionsPill: isLastColumn ? (
        <RowActionsToolPill 
          item={item} 
          onDuplicate={handleDuplicateItem} 
          onDelete={handleDeleteItem} 
        />
      ) : null,
    };

    switch (colKey) {
      case 'title':
        return (
          <EditableTextCell
            key={`${item.id}-title`}
            value={item.title}
            autoFocusOnMount={autoFocusItemId === item.id}
            onSave={(val) => {
              if (autoFocusItemId === item.id) {
                setAutoFocusItemId(null);
              }
              updateCell(item.id, 'title', val);
            }}
            placeholder={currentView === 'bugs' ? 'Descripción del problema...' : currentView === 'optimizaciones' ? 'Mejora propuesta...' : currentView === 'implementaciones' ? 'Funcionalidad...' : 'Escribir idea...'}
            fontWeight="semibold"
            style={colStyle}
            {...commonProps}
          />
        );
      case 'context':
        return (
          <EditableTextCell
            key={`${item.id}-context`}
            value={item.context || ''}
            onSave={(val) => updateCell(item.id, 'context', val)}
            placeholder="Contexto..."
            style={colStyle}
            {...commonProps}
          />
        );
      case 'location':
        return (
          <EditableTextCell
            key={`${item.id}-location`}
            value={item.location || ''}
            onSave={(val) => updateCell(item.id, 'location', val)}
            placeholder={currentView === 'bugs' ? 'Módulo afectado...' : 'Dónde se aplica...'}
            style={colStyle}
            {...commonProps}
          />
        );
      case 'status':
        return (
          <td 
            key={`${item.id}-status`} 
            className={`text-center align-middle relative ${isSelected ? 'table-cell-selected' : ''}`} 
            style={{ ...colStyle, textAlign: 'center', verticalAlign: 'middle', padding: '0.75rem 0.25rem' }}
            {...commonProps}
          >
            <div className="w-full flex items-center justify-center text-center">
              <LiquidGlassStatusBadge
                status={item.status}
                onChange={(val) => handleStatusChange(item.id, val)}
                currentView={currentView}
              />
            </div>
            {isLastColumn && commonProps.rowActionsPill}
          </td>
        );
      case 'attachments':
        return (
          <ImageAttachmentCell
            key={`${item.id}-attachments`}
            item={item}
            onUpload={(file) => uploadImage(item.id, file)}
            isUploading={uploadingItemId === item.id}
            onOpenMasonry={() => setActiveMasonryItem(item)}
            style={colStyle}
            {...commonProps}
          />
        );
      case 'assignee':
        return (
          <AssigneeCell
            key={`${item.id}-assignee`}
            item={item}
            users={users}
            isOpen={activeAssigneeItemId === item.id}
            onOpen={() => setActiveAssigneeItemId(item.id)}
            onClose={() => setActiveAssigneeItemId(null)}
            onSelect={(userIds) => {
              updateCell(item.id, 'assigneeIds', userIds);
              updateCell(item.id, 'assigneeId', userIds[0] || null);
            }}
            style={colStyle}
            {...commonProps}
          />
        );
      case 'notes':
        return (
          <EditableTextCell
            key={`${item.id}-notes`}
            value={item.notes || ''}
            onSave={(val) => updateCell(item.id, 'notes', val)}
            placeholder="Notas..."
            style={colStyle}
            {...commonProps}
          />
        );
      case 'severity':
        return (
          <SelectBadgeCell
            key={`${item.id}-severity`}
            value={item.severity || 'Media'}
            options={['Baja', 'Media', 'Alta', 'Crítica']}
            colors={{
              Baja: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40',
              Media: 'bg-[#f49d37]/20 text-[#f49d37] border border-[#f49d37]/40',
              Alta: 'bg-[#d72638]/20 text-[#d72638] border border-[#d72638]/40',
              Crítica: 'bg-[#f22b29]/30 text-[#f22b29] border border-[#f22b29]/60 font-bold',
            }}
            onChange={(val) => updateCell(item.id, 'severity', val)}
            style={colStyle}
            {...commonProps}
          />
        );
      case 'impact':
        return (
          <SelectBadgeCell
            key={`${item.id}-impact`}
            value={item.impact || 'Medio'}
            options={['Bajo', 'Medio', 'Alto']}
            colors={{
              Bajo: 'bg-slate-800 text-slate-400',
              Medio: 'bg-[#3f88c5]/20 text-[#3f88c5] border border-[#3f88c5]/40',
              Alto: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-bold',
            }}
            onChange={(val) => updateCell(item.id, 'impact', val)}
            style={colStyle}
            {...commonProps}
          />
        );
      case 'effort':
        return (
          <SelectBadgeCell
            key={`${item.id}-effort`}
            value={item.effort || 'Medio'}
            options={['Bajo', 'Medio', 'Alto']}
            colors={{
              Bajo: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40',
              Media: 'bg-[#f49d37]/20 text-[#f49d37] border border-[#f49d37]/40',
              Alto: 'bg-[#d72638]/20 text-[#d72638] border border-[#d72638]/40',
            }}
            onChange={(val) => updateCell(item.id, 'effort', val)}
            style={colStyle}
            {...commonProps}
          />
        );
      case 'priority':
        return (
          <SelectBadgeCell
            key={`${item.id}-priority`}
            value={item.priority || 'P2'}
            options={['P0', 'P1', 'P2', 'P3']}
            colors={{
              P0: 'bg-[#f22b29]/30 text-[#f22b29] border border-[#f22b29]/60 font-bold',
              P1: 'bg-[#d72638]/20 text-[#d72638] border border-[#d72638]/40',
              P2: 'bg-[#f49d37]/20 text-[#f49d37] border border-[#f49d37]/40',
              P3: 'bg-slate-800 text-slate-400',
            }}
            onChange={(val) => updateCell(item.id, 'priority', val)}
            style={colStyle}
            {...commonProps}
          />
        );
      case 'sprint':
        return (
          <EditableTextCell
            key={`${item.id}-sprint`}
            value={item.sprint || ''}
            onSave={(val) => updateCell(item.id, 'sprint', val)}
            placeholder="Sprint o Fase..."
            style={colStyle}
            {...commonProps}
          />
        );
      default:
        return (
          <EditableTextCell
            key={`${item.id}-${colKey}`}
            value={item[colKey] || ''}
            onSave={(val) => updateCell(item.id, colKey, val)}
            placeholder="Escribir..."
            style={colStyle}
            {...commonProps}
          />
        );
    }
  };

  return (
    <div className="sheet-app-container">
      
      {/* Top Project Selector & Action Bar */}
      <div className="sheet-action-bar">
        
        {/* Left Section: Back Hub + Filter reset */}
        <div className="sheet-header-left">
          <div className="sheet-title-row">
            {onBackToHub && (
              <button
                onClick={onBackToHub}
                className="btn-back-hub"
                data-tooltip="Volver al Hub"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Hub</span>
              </button>
            )}

            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="btn-clear-all-filters"
                data-tooltip="Restablecer todos los filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar filtros ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Subir/Exportar Dropdowns + View Switcher + Expandable Add Row */}
        <div className="sheet-actions-right">
          {/* Subir & Exportar Actions with Vertical Dropdown (CSV / JSON) */}
          <div ref={ioDropdownRef} className="csv-actions-switcher">
            <input
              ref={jsonFileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleImportJsonFile}
            />

            {/* Subir Button + Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveIoDropdown((prev) => (prev === 'import' ? null : 'import'))}
                className={`csv-toggle-btn ${activeIoDropdown === 'import' ? 'active' : ''}`}
                data-tooltip="Subir datos (CSV o JSON)"
              >
                <Upload className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="csv-toggle-label">Subir</span>
              </button>

              {activeIoDropdown === 'import' && (
                <div className="io-dropdown-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIoDropdown(null);
                      setIsCsvImportOpen(true);
                    }}
                    className="io-dropdown-item"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>CSV</span>
                    <span className="io-dropdown-item-badge">.csv</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIoDropdown(null);
                      jsonFileInputRef.current?.click();
                    }}
                    className="io-dropdown-item"
                  >
                    <FileCode className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>JSON</span>
                    <span className="io-dropdown-item-badge">.json</span>
                  </button>
                </div>
              )}
            </div>

            {/* Exportar Button + Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveIoDropdown((prev) => (prev === 'export' ? null : 'export'))}
                className={`csv-toggle-btn ${activeIoDropdown === 'export' ? 'active' : ''}`}
                data-tooltip="Exportar datos (CSV o JSON)"
              >
                <Download className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="csv-toggle-label">Exportar</span>
              </button>

              {activeIoDropdown === 'export' && (
                <div className="io-dropdown-menu align-right">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIoDropdown(null);
                      handleExportCsv();
                    }}
                    className="io-dropdown-item"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>CSV</span>
                    <span className="io-dropdown-item-badge">.csv</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIoDropdown(null);
                      handleExportJson();
                    }}
                    className="io-dropdown-item"
                  >
                    <FileCode className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>JSON</span>
                    <span className="io-dropdown-item-badge">.json</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* View Switcher: Tabla vs Tablero con píldora deslizante animada y hover desplegable */}
          <div className="view-toggle-switcher" data-view={viewMode}>
            <div
              className="view-toggle-slider-pill"
              style={{
                transform: viewMode === 'table' ? 'translateX(0%)' : 'translateX(calc(100% + 0.25rem))',
              }}
            />
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            >
              <Table className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="view-toggle-label">Tabla</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`view-toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
            >
              <LayoutGrid className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="view-toggle-label">Tablero</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddNewRow}
            className="btn-expandable-add-row"
          >
            <span className="btn-icon-box">
              <Plus className="w-4 h-4" />
            </span>
            <span className="btn-expand-label">Agregar Fila</span>
          </button>
        </div>
      </div>

      {/* KPI & Summary Metrics Bar */}
      <SummaryMetricsBar
        items={items}
        currentView={currentView}
        activeFilter={activeKpiFilter}
        onSelectFilter={(filter) => setActiveKpiFilter(filter)}
      />

      {/* View Rendering: Table vs Board with Smooth Fade & Elevation Transition */}
      <div key={viewMode} className="view-mode-transition-container">
        {viewMode === 'table' ? (
          <div className="sheet-table-outer-container">
            <div
              ref={tableWrapperRef}
              className="sheet-table-wrapper relative"
              onClick={() => setActiveFilterPopover(null)}
            >
              {/* Vertical Column Drop Insertion Indicator Overlay */}
              {colDropIndicator && (
                <div 
                  className="col-drop-insertion-line" 
                  style={{ left: `${colDropIndicator.left}px` }}
                >
                  <span className="col-drop-insertion-caret">▼</span>
                </div>
              )}

              {/* Horizontal Row Drop Insertion Indicator Overlay */}
              {rowDropIndicator && (
                <div 
                  className="row-drop-insertion-line" 
                  style={{ top: `${rowDropIndicator.top}px` }}
                >
                  <span className="row-drop-insertion-caret">▶</span>
                </div>
              )}

              <table className="sheet-table">
                <thead>
                  <tr className="bg-[#140f2d] text-white text-xs font-heading font-bold uppercase tracking-wider border-b border-white/10 divide-x divide-white/10">
                    <FilterHeaderTh
                      colKey="id"
                      label="ID"
                      width="auto"
                      align="center"
                      isDraggable={false}
                      className="sticky-col-id sticky-col-id-header"
                      columnFilters={columnFilters}
                      activeFilterPopover={activeFilterPopover}
                      setActiveFilterPopover={setActiveFilterPopover}
                      columnWidths={columnWidths}
                      DEFAULT_COL_WIDTHS={DEFAULT_COL_WIDTHS}
                      editingHeaderColKey={editingHeaderColKey}
                      setEditingHeaderColKey={setEditingHeaderColKey}
                      draggedColKey={draggedColKey}
                      setDraggedColKey={setDraggedColKey}
                      dragColRef={dragColRef}
                      tableWrapperRef={tableWrapperRef}
                      setColDropIndicator={setColDropIndicator}
                      handleDropColumn={handleDropColumn}
                      headerRenameVal={headerRenameVal}
                      setHeaderRenameVal={setHeaderRenameVal}
                      handleSaveHeaderName={handleSaveHeaderName}
                      customHeadersMap={customHeadersMap}
                      currentView={currentView}
                      items={items}
                      users={users}
                      handleAddColumnAfter={handleAddColumnAfter}
                      handleSetColumnFilter={handleSetColumnFilter}
                      handleClearColumnFilter={handleClearColumnFilter}
                      handleStartResize={handleStartResize}
                      hoveredHeaderColKey={hoveredHeaderColKey}
                      setHoveredHeaderColKey={setHoveredHeaderColKey}
                      activeOrderedColumns={activeOrderedColumns}
                    />
                    
                    {activeOrderedColumns.map((colDef) => (
                      <FilterHeaderTh
                        key={colDef.key}
                        colKey={colDef.key}
                        label={colDef.defaultLabel}
                        minWidth={colDef.minWidth}
                        width={colDef.width}
                        align={colDef.align || 'center'}
                        isDraggable={true}
                        columnFilters={columnFilters}
                        activeFilterPopover={activeFilterPopover}
                        setActiveFilterPopover={setActiveFilterPopover}
                        columnWidths={columnWidths}
                        DEFAULT_COL_WIDTHS={DEFAULT_COL_WIDTHS}
                        editingHeaderColKey={editingHeaderColKey}
                        setEditingHeaderColKey={setEditingHeaderColKey}
                        draggedColKey={draggedColKey}
                        setDraggedColKey={setDraggedColKey}
                        dragColRef={dragColRef}
                        tableWrapperRef={tableWrapperRef}
                        setColDropIndicator={setColDropIndicator}
                        handleDropColumn={handleDropColumn}
                        headerRenameVal={headerRenameVal}
                        setHeaderRenameVal={setHeaderRenameVal}
                        handleSaveHeaderName={handleSaveHeaderName}
                        customHeadersMap={customHeadersMap}
                        currentView={currentView}
                        items={items}
                        users={users}
                        handleAddColumnAfter={handleAddColumnAfter}
                        handleSetColumnFilter={handleSetColumnFilter}
                        handleClearColumnFilter={handleClearColumnFilter}
                        handleStartResize={handleStartResize}
                        hoveredHeaderColKey={hoveredHeaderColKey}
                        setHoveredHeaderColKey={setHoveredHeaderColKey}
                        activeOrderedColumns={activeOrderedColumns}
                      />
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={activeOrderedColumns.length + 1} className="py-12 text-center text-slate-400">
                        Cargando elementos...
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={activeOrderedColumns.length + 1} className="py-12 text-center text-slate-400">
                        {items.length === 0 
                          ? 'No hay filas creadas aún. Haz clic en "Agregar Fila".'
                          : 'No se encontraron filas que coincidan con los filtros aplicados.'}
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, idx) => {
                      return (
                        <tr
                          key={item.id}
                          onMouseEnter={() => setHoveredRowItemId(item.id)}
                          onMouseLeave={() => setHoveredRowItemId(null)}
                          onDragOver={(e) => {
                            if (!dragRowRef.current) return;
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            const rect = e.currentTarget.getBoundingClientRect();
                            const wrapper = tableWrapperRef.current;
                            const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : rect;
                            const scrollTop = wrapper ? wrapper.scrollTop : 0;

                            const isTop = e.clientY < rect.top + rect.height / 2;
                            const indicatorTop = (isTop ? rect.top : rect.bottom) - wrapperRect.top + scrollTop;
                            const pos = isTop ? 'top' : 'bottom';

                            setRowDropIndicator((prev) => {
                              if (prev && prev.targetId === item.id && prev.pos === pos && Math.abs(prev.top - indicatorTop) < 1) {
                                return prev;
                              }
                              return {
                                top: indicatorTop,
                                targetId: item.id,
                                pos: pos,
                              };
                            });
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const sourceId = dragRowRef.current || e.dataTransfer.getData('text/plain');
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = e.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom';
                            if (sourceId && sourceId !== item.id) {
                              handleDropRow(sourceId, item.id, pos);
                            } else {
                              setRowDropIndicator(null);
                              dragRowRef.current = null;
                              setDraggedRowId(null);
                            }
                          }}
                          onDragEnd={() => {
                            setRowDropIndicator(null);
                            dragRowRef.current = null;
                            setDraggedRowId(null);
                          }}
                          className={`hover:bg-white/5 transition-colors group relative ${
                            hoveredRowItemId === item.id ? 'bg-white/[0.04]' : ''
                          } ${draggedRowId === item.id ? 'row-is-dragging' : ''} ${
                            animatingNewRowId === item.id ? 'table-row-new-insert' : ''
                          }`}
                        >
                          <td 
                            draggable={!editingHeaderColKey}
                            onDragStart={(e) => {
                              dragRowRef.current = item.id;
                              setDraggedRowId(item.id);
                              e.dataTransfer.setData('text/plain', item.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            className="sticky-col-id text-center align-middle font-mono text-xs text-slate-400 select-none cursor-grab active:cursor-grabbing relative" 
                            style={{ width: '44px', minWidth: '44px', maxWidth: '44px', whiteSpace: 'nowrap', textAlign: 'center', padding: '0.75rem 0' }}
                            data-tooltip="Arrastra para reordenar fila"
                          >
                            <div className="w-full flex items-center justify-center text-center pointer-events-none">
                              <span className="inline-flex items-center justify-center min-w-[20px] px-1 py-0.5 rounded bg-white/5 group-hover:bg-white/10 group-hover:text-white transition-colors text-center font-semibold">
                                {idx + 1}
                              </span>
                            </div>
                            <div className="sticky-col-fade-overlay pointer-events-none" />
                          </td>

                          {activeOrderedColumns.map((colDef, cIdx) => renderCellForColumn(colDef.key, item, idx, cIdx))}
                        </tr>
                      );
                    })
                  )}

                  {/* Interactive Bottom Add Row Overlay / Action Trigger */}
                  {!loading && (
                    <tr 
                      onClick={handleAddNewRow}
                      className="table-bottom-add-row-trigger group"
                    >
                      <td 
                        colSpan={activeOrderedColumns.length + 1} 
                        className="table-bottom-add-row-cell"
                      >
                        <div className="table-bottom-add-row-sticky">
                          <div className="table-bottom-add-row-inner">
                            <Plus className="table-bottom-add-row-icon" />
                            <span className="select-none">
                              Nueva fila...
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <TableCenteredScrollbars containerRef={tableWrapperRef} />
          </div>
        ) : (
          <KanbanBoardView
            items={filteredItems}
            users={users}
            onStatusChange={handleStatusChange}
            onUploadImage={uploadImage}
            onSelectItem={(item) => setActiveMasonryItem(item)}
            currentView={currentView}
          />
        )}
      </div>

      {/* Floating Masonry Grid Modal for Images */}
      {activeMasonryItem && (
        <MasonryModal
          item={items.find((it) => it.id === activeMasonryItem.id) || activeMasonryItem}
          onClose={() => setActiveMasonryItem(null)}
          onUpload={(file) => uploadImage(activeMasonryItem.id, file)}
          onDeleteAttachment={(attId) => deleteAttachment(activeMasonryItem.id, attId)}
          isUploading={uploadingItemId === activeMasonryItem.id}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="modal-overlay" onClick={() => setDeleteTargetId(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 className="modal-title text-red-400">¿Eliminar elemento?</h3>
            <p className="text-sm text-slate-300 mt-2">
              Esta acción no se puede deshacer y borrará todas las capturas asociadas.
            </p>
            <div className="modal-actions mt-6">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteItem(deleteTargetId);
                  setDeleteTargetId(null);
                }}
                className="btn-primary"
                style={{ backgroundColor: '#d72638' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        projectName={activeProject.name}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        currentView={currentView}
        onImportSuccess={() => fetchItems(currentView)}
        showToast={showToast}
      />

      {/* Markdown Tip Notification on Entering Project (Top Right) */}
      {showMdTip && (
        <div className="md-top-tip-notification">
          <div className="md-top-tip-badge">MD</div>
          <div className="md-top-tip-content">
            <div className="md-top-tip-header">
              <span className="md-top-tip-title">Tip de edición</span>
              <button 
                type="button" 
                onClick={() => setShowMdTip(false)} 
                className="md-top-tip-close"
                title="Cerrar recomendación"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="md-top-tip-desc">
              Las celdas de texto soportan formato <strong>Markdown</strong> (<code>**negrita**</code>, <code>*cursiva*</code>, <code>`código`</code> y listas).
            </p>
          </div>
        </div>
      )}

      {/* Toast Banner Notification */}
      {toastMessage && (
        <div className="glass-toast-notification">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom-Left Undo Delete Glass Pill Notification (Portaled to document.body) */}
      {typeof document !== 'undefined' && undoState ? createPortal(
        <div 
          onClick={handleUndoDelete}
          className="undo-bottom-pill-container animate-fade-in"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleUndoDelete();
            }
          }}
        >
          <div className="undo-bottom-pill">
            {/* Circular Progress Countdown Timer with Seconds */}
            <div className="undo-timer-circle-wrapper">
              <svg className="undo-timer-svg" viewBox="0 0 36 36">
                <path
                  className="undo-timer-bg-circle"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="undo-timer-progress-circle"
                  strokeDasharray={`${(undoState.secondsLeft / 4) * 100}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="undo-timer-number">
                {undoState.secondsLeft}
              </span>
            </div>

            {/* Label */}
            <span className="undo-pill-label">
              Fila eliminada
            </span>

            {/* Divider */}
            <div className="undo-pill-divider" />

            {/* Direct Undo Icon (No background or border box) */}
            <RotateCcw className="undo-pill-icon" />
          </div>
        </div>,
        document.body
      ) : null}

      {/* Floating Toolbar for Multi-Cell Selection */}
      {selectedCells.size > 0 && selectionFloatingPos && (
        <div 
          className="multi-cell-floating-toolbar"
          style={{
            position: 'fixed',
            left: `${selectionFloatingPos.x}px`,
            top: `${selectionFloatingPos.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Organic Feathered Gaussian Blur Backdrop */}
          <div className="multi-cell-blur-backdrop" />

          <div className="multi-cell-toolbar-content">
            <span className="multi-cell-count-badge">
              {selectedCells.size} {selectedCells.size === 1 ? 'celda' : 'celdas'}
            </span>

            {/* Copy Icon Button */}
            <button
              type="button"
              onClick={handleCopySelectedCells}
              className="multi-cell-action-btn action-btn-copy"
              data-tooltip="Copiar celdas"
            >
              <Copy className="w-4 h-4 text-sky-400" />
            </button>

            {/* Delete / Clear Icon Button with Comic Balloon Confirm */}
            <div className="relative inline-flex items-center">
              <button
                type="button"
                onClick={() => setShowSelectionDeleteConfirm((prev) => !prev)}
                className="multi-cell-action-btn action-btn-delete"
                data-tooltip="Opciones de eliminación"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
              </button>

              {showSelectionDeleteConfirm && (
                <div className="comic-balloon-confirm" onClick={(e) => e.stopPropagation()} style={{ minWidth: '170px' }}>
                  <div className="comic-balloon-tail" />
                  <div className="comic-balloon-body">
                    <span className="comic-balloon-title">Opciones de Eliminación</span>
                    <div className="comic-balloon-actions" style={{ flexDirection: 'column', gap: '0.35rem', width: '100%', marginTop: '0.2rem' }}>
                      <button
                        type="button"
                        onClick={handleClearSelectedCells}
                        className="comic-btn-action"
                      >
                        Vaciar celdas ({selectedCells.size})
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteSelectedRows}
                        className="comic-btn-delete"
                      >
                        Eliminar filas
                      </button>

                      <button
                        type="button"
                        onClick={handleHideSelectedColumns}
                        className="comic-btn-action"
                      >
                        Quitar columnas
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSelectionDeleteConfirm(false)}
                        className="comic-btn-cancel"
                        style={{ marginTop: '0.1rem' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------
// Auxiliary Table Cells & Modals
// ----------------------------------------------------

function EditableTextCell({ value, onSave, placeholder, fontWeight = 'normal', style, className = '', isSelected, onPointerDown, isLastColumn, rowActionsPill, autoFocusOnMount, ...rest }) {
  const [isEditing, setIsEditing] = useState(Boolean(autoFocusOnMount));
  const [currentVal, setCurrentVal] = useState(value || '');
  const textareaRef = useRef(null);

  useEffect(() => {
    setCurrentVal(value || '');
  }, [value]);

  useEffect(() => {
    if (autoFocusOnMount) {
      setIsEditing(true);
    }
  }, [autoFocusOnMount]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentVal !== value) {
      onSave(currentVal);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setCurrentVal(value || '');
      setIsEditing(false);
    }
  };

  const handleInput = (e) => {
    setCurrentVal(e.target.value);
  };

  const handleCellClick = (e) => {
    if (isEditing) return;
    // If clicked on an action button, delete confirm dialog, or tool trigger, don't enter edit mode
    if (e.target.closest('.row-action-btn') || e.target.closest('.comic-balloon-confirm') || e.target.closest('.row-tool-trigger-btn')) {
      return;
    }
    setIsEditing(true);
  };

  const getMarkdownHtml = (text) => {
    if (!text) return '';
    try {
      let s = String(text);
      // Pre-process and normalize whitespace / accidental newlines inside Markdown delimiters
      s = s.replace(/\*\*\s*([^*\r\n]+?)\s*\*\*/g, '**$1**');
      s = s.replace(/(^|[^*])\*\s*([^*\r\n]+?)\s*\*(?!\*)/g, '$1*$2*');
      s = s.replace(/__\s*([^_\r\n]+?)\s*__/g, '__$1__');
      s = s.replace(/~~\s*([^~\r\n]+?)\s*~~/g, '~~$1~~');
      const parsed = marked.parse(s, { gfm: true, breaks: true, async: false });
      return typeof parsed === 'string' ? parsed : text;
    } catch {
      return text;
    }
  };

  return (
    <td 
      className={`table-editable-cell ${isSelected ? 'table-cell-selected' : ''} ${isEditing ? 'is-editing-mode' : ''} ${fontWeight === 'semibold' ? 'font-semibold text-white' : 'text-slate-200'} ${className}`}
      onClick={handleCellClick}
      onPointerDown={onPointerDown}
      style={style}
      {...rest}
    >
      {isEditing ? (
        <div className="cell-editor-container" onClick={(e) => e.stopPropagation()}>
          <textarea
            ref={textareaRef}
            value={currentVal}
            onChange={handleInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Escribe aquí..."}
            className="cell-editor-textarea"
          />
        </div>
      ) : (
        <div className="markdown-cell-content">
          {value && String(value).trim() ? (
            <div dangerouslySetInnerHTML={{ __html: getMarkdownHtml(value) }} />
          ) : (
            <div className="w-full flex items-center justify-center text-center">
              <span className="text-slate-500 font-mono font-medium text-sm select-none opacity-60">-</span>
            </div>
          )}
        </div>
      )}
      {!isEditing && isLastColumn && rowActionsPill}
    </td>
  );
}

function SelectBadgeCell({ value, options, colors, onChange, style, className = '', isSelected, onPointerDown, isLastColumn, rowActionsPill, ...rest }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <td 
      className={`py-3 px-4 text-center relative ${isSelected ? 'table-cell-selected' : ''} ${className}`} 
      style={style}
      onPointerDown={onPointerDown}
      {...rest}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1 text-xs font-semibold rounded-lg ${colors[value] || 'bg-slate-800 text-slate-300'} inline-flex items-center gap-1.5 transition-transform hover:scale-105`}
      >
        <span>{value}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-12 z-30 bg-[#140f2d] border border-white/10 rounded-xl shadow-2xl p-1 w-32 flex flex-col gap-1 backdrop-blur-xl">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`px-2.5 py-1.5 text-xs text-left rounded-lg font-medium transition-colors ${
                opt === value ? 'bg-white/10 text-white font-bold' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      {isLastColumn && rowActionsPill}
    </td>
  );
}

function ImageAttachmentCell({ item, onUpload, isUploading, onOpenMasonry, style, className = '', isSelected, onPointerDown, isLastColumn, rowActionsPill, ...rest }) {
  const attachments = item.attachments || [];

  if (attachments.length > 0) {
    return (
      <td 
        className={`py-3 px-4 text-center relative cursor-pointer hover:bg-white/5 transition-colors ${isSelected ? 'table-cell-selected' : ''} ${className}`} 
        style={{ minWidth: '180px', ...style }}
        onClick={onOpenMasonry}
        onPointerDown={onPointerDown}
        {...rest}
      >
        <div
          className="image-attachment-btn"
          title={`Ver ${attachments.length} imágenes en galería`}
        >
          {/* Horizontal Stack of Up to 3 Image Thumbnails with Left-on-Top Overlap */}
          <div className="image-attachment-stack">
            {attachments.slice(0, 3).map((att, i) => (
              <img
                key={att.id || i}
                src={att.url}
                alt={att.filename}
                style={{ zIndex: 10 - i }}
                onError={(e) => {
                  if (!e.currentTarget.dataset.retried) {
                    e.currentTarget.dataset.retried = 'true';
                    e.currentTarget.src = att.url.includes('?') ? att.url : `${att.url}?t=${Date.now()}`;
                  }
                }}
                className="image-attachment-img"
              />
            ))}
          </div>

          {/* Truncation Icon (...) to the RIGHT side when > 3 Attachments */}
          {attachments.length > 3 && (
            <div 
              className="assignee-more-dots"
              title={`Ver las ${attachments.length} imágenes`}
            >
              <MoreHorizontal className="w-5 h-5" />
            </div>
          )}
        </div>
        {isLastColumn && rowActionsPill}
      </td>
    );
  }

  return (
    <td 
      className={`p-0 m-0 text-center relative ${isSelected ? 'table-cell-selected' : ''} ${className}`} 
      style={{ minWidth: '180px', height: '48px', padding: 0, ...style }}
      onPointerDown={onPointerDown}
      {...rest}
    >
      <LiquidGlassUploader
        itemId={item.id}
        attachments={attachments}
        onUpload={onUpload}
        isUploading={isUploading}
        onOpenGallery={onOpenMasonry}
      />
      {isLastColumn && rowActionsPill}
    </td>
  );
}

// Standalone Header Cell with Floating Filter Tray, Column Reorder Drag & Drop, and Double-Click Rename
function FilterHeaderTh({
  colKey,
  label,
  className = '',
  minWidth,
  width,
  align = 'center',
  isDraggable = true,
  columnFilters,
  activeFilterPopover,
  setActiveFilterPopover,
  columnWidths,
  DEFAULT_COL_WIDTHS,
  editingHeaderColKey,
  setEditingHeaderColKey,
  draggedColKey,
  setDraggedColKey,
  dragColRef,
  tableWrapperRef,
  setColDropIndicator,
  handleDropColumn,
  headerRenameVal,
  setHeaderRenameVal,
  handleSaveHeaderName,
  customHeadersMap,
  currentView,
  items,
  users,
  handleAddColumnAfter,
  handleSetColumnFilter,
  handleClearColumnFilter,
  handleStartResize,
  hoveredHeaderColKey,
  setHoveredHeaderColKey,
  activeOrderedColumns,
}) {
  const isFiltered = Boolean(columnFilters[colKey]);
  const isOpen = activeFilterPopover === colKey;
  const currentWidth = columnWidths[colKey] || DEFAULT_COL_WIDTHS[colKey] || 160;
  const isEditing = editingHeaderColKey === colKey;
  const isHovered = hoveredHeaderColKey === colKey;

  const thRef = useRef(null);
  const [isNearRightDivider, setIsNearRightDivider] = useState(false);
  const [thRect, setThRect] = useState(null);
  const hoverLeaveTimeoutRef = useRef(null);

  const updateThRect = () => {
    if (thRef.current) {
      setThRect(thRef.current.getBoundingClientRect());
    }
  };

  const handleCheckDividerProximity = (e) => {
    if (!thRef.current) return;
    const rect = thRef.current.getBoundingClientRect();
    // Distance from the right boundary edge (in px)
    const distFromRight = rect.right - e.clientX;
    const isNear = distFromRight >= -16 && distFromRight <= 36;
    setIsNearRightDivider(isNear);
  };

  // Calculate thRect on mount, column updates, and listen to window/table scroll & resize
  useEffect(() => {
    updateThRect();
    const handleScrollOrResize = () => {
      updateThRect();
    };
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [columnWidths, activeOrderedColumns]);

  // Global click-outside & Escape key listener to close filter popover reliably
  useEffect(() => {
    if (!isOpen) return;
    updateThRect();

    const handleGlobalClickOutside = (e) => {
      if (e.target.closest('.column-filter-floating-tray') || e.target.closest('.comic-balloon-portal-container')) {
        return;
      }
      setActiveFilterPopover(null);
    };

    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveFilterPopover(null);
      }
    };

    document.addEventListener('mousedown', handleGlobalClickOutside, true);
    document.addEventListener('touchstart', handleGlobalClickOutside, true);
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleGlobalClickOutside, true);
      document.removeEventListener('touchstart', handleGlobalClickOutside, true);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isOpen]);

  const currentLabel = (customHeadersMap[currentView] && customHeadersMap[currentView][colKey]) || label || colKey;

  const uniqueValues = Array.from(
    new Set(
      items.map((it) => {
        if (colKey === 'assignee') {
          const u = users.find((usr) => usr.id === it.assigneeId);
          return u ? u.name : 'Sin asignar';
        }
        if (colKey === 'attachments') {
          return (it.attachments && it.attachments.length > 0) ? `${it.attachments.length} archivo(s)` : 'Sin archivos';
        }
        const raw = it[colKey];
        if (raw === null || raw === undefined) return '';
        if (typeof raw === 'object') {
          if (Array.isArray(raw)) return `${raw.length} elementos`;
          return '';
        }
        return String(raw).trim();
      }).filter(Boolean)
    )
  ).slice(0, 6);

  const thStyle = colKey === 'id'
    ? { width: '44px', minWidth: '44px', maxWidth: '44px', whiteSpace: 'nowrap', height: '48px', padding: 0 }
    : { width: `${currentWidth}px`, minWidth: `${currentWidth}px`, maxWidth: `${currentWidth}px`, height: '48px', padding: 0 };

  return (
    <th 
      ref={thRef}
      className={`relative select-none group/th text-center ${className}`}
      style={thStyle}
      draggable={isDraggable && !isEditing}
      onMouseEnter={(e) => {
        if (hoverLeaveTimeoutRef.current) clearTimeout(hoverLeaveTimeoutRef.current);
        updateThRect();
        setHoveredHeaderColKey(colKey);
        handleCheckDividerProximity(e);
      }}
      onMouseMove={(e) => {
        updateThRect();
        handleCheckDividerProximity(e);
      }}
      onMouseLeave={() => {
        if (hoverLeaveTimeoutRef.current) clearTimeout(hoverLeaveTimeoutRef.current);
        hoverLeaveTimeoutRef.current = setTimeout(() => {
          if (hoveredHeaderColKey === colKey) {
            setHoveredHeaderColKey(null);
          }
          setIsNearRightDivider(false);
        }, 150);
      }}
      onDragStart={(e) => {
        if (!isDraggable || isEditing) return;
        if (e.target.closest('button, input, .col-resizer-arrows, .column-filter-floating-tray')) return;
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        }
        dragColRef.current = colKey;
        setDraggedColKey(colKey);
        e.dataTransfer.setData('text/plain', colKey);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        if (!isDraggable || isEditing || !dragColRef.current) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = e.currentTarget.getBoundingClientRect();
        const wrapper = tableWrapperRef.current;
        const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : rect;
        const scrollLeft = wrapper ? wrapper.scrollLeft : 0;

        const isLeft = e.clientX < rect.left + rect.width / 2;
        const indicatorLeft = (isLeft ? rect.left : rect.right) - wrapperRect.left + scrollLeft;
        const pos = isLeft ? 'left' : 'right';

        setColDropIndicator((prev) => {
          if (prev && prev.targetKey === colKey && prev.pos === pos && Math.abs(prev.left - indicatorLeft) < 1) {
            return prev;
          }
          return {
            left: indicatorLeft,
            targetKey: colKey,
            pos: pos,
          };
        });
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const sourceCol = dragColRef.current || e.dataTransfer.getData('text/plain');
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = e.clientX < rect.left + rect.width / 2 ? 'left' : 'right';
        if (sourceCol && sourceCol !== colKey) {
          handleDropColumn(sourceCol, colKey, pos);
        } else {
          setColDropIndicator(null);
          dragColRef.current = null;
          setDraggedColKey(null);
        }
      }}
      onDragEnd={() => {
        setColDropIndicator(null);
        dragColRef.current = null;
        setDraggedColKey(null);
      }}
    >
      {isEditing ? (
        <div className="w-full h-full flex items-center justify-center p-0 m-0" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={headerRenameVal}
            onChange={(e) => setHeaderRenameVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveHeaderName(colKey, headerRenameVal);
              } else if (e.key === 'Escape') {
                setEditingHeaderColKey(null);
              }
            }}
            onBlur={() => handleSaveHeaderName(colKey, headerRenameVal)}
            autoFocus
            onFocus={(e) => e.target.select()}
            className="header-rename-input"
          />
        </div>
      ) : (
        <div 
          className={`w-full h-full flex items-center justify-center gap-1.5 header-title-wrapper select-none ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onDoubleClick={(e) => {
            if (colKey === 'id') return;
            e.stopPropagation();
            setEditingHeaderColKey(colKey);
            setHeaderRenameVal(currentLabel);
          }}
          data-tooltip={isDraggable ? "Doble clic para renombrar • Arrastra para reordenar" : "Doble clic para renombrar"}
        >
          <span className="font-heading font-bold uppercase tracking-wider text-xs truncate select-none pointer-events-none">
            {currentLabel}
          </span>
          {isFiltered && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] flex-shrink-0 pointer-events-none" />
          )}
        </div>
      )}

      {/* Floating Comic Balloons Group (Portaled to document.body with continuous Hitbox Bridge) */}
      {typeof document !== 'undefined' && thRect && !isEditing && (isHovered || isOpen) && colKey !== 'id' && createPortal(
        <div
          className="comic-balloon-portal-container"
          style={{
            position: 'fixed',
            top: `${thRect.top - 36}px`,
            left: `${thRect.left}px`,
            width: `${thRect.width}px`,
            height: `52px`,
            zIndex: 99999,
            pointerEvents: 'none',
          }}
          onMouseEnter={() => {
            if (hoverLeaveTimeoutRef.current) clearTimeout(hoverLeaveTimeoutRef.current);
            setHoveredHeaderColKey(colKey);
          }}
          onMouseMove={handleCheckDividerProximity}
          onMouseLeave={() => {
            if (hoverLeaveTimeoutRef.current) clearTimeout(hoverLeaveTimeoutRef.current);
            hoverLeaveTimeoutRef.current = setTimeout(() => {
              if (hoveredHeaderColKey === colKey) {
                setHoveredHeaderColKey(null);
              }
              setIsNearRightDivider(false);
            }, 150);
          }}
        >
          {/* Seamless Hitbox bridge connecting the floating pins down into the <th> header cell */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'auto',
            }}
          />

          {/* Balloon 1: Filter Pin (Centered horizontally) */}
          <div
            className="comic-balloon-portal-filter"
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              pointerEvents: 'auto',
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateThRect();
                setActiveFilterPopover(isOpen ? null : colKey);
              }}
              className={`unified-pin-btn filter-pin ${isFiltered ? 'is-filtered' : ''}`}
              data-tooltip={`Filtrar ${currentLabel}`}
            >
              <svg className="unified-pin-svg" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  className="unified-pin-bg"
                  d="M 3 15 A 13 13 0 1 1 29 15 C 29 22.5, 17.8 33.5, 16 37 C 14.2 33.5, 3 22.5, 3 15 Z"
                />
              </svg>
              <span className="unified-pin-icon">
                <CustomFilterPinIcon className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          {/* Balloon 2: Add Column (+) Pin (Centered on the right column boundary, only when hovering near the intersection divider) */}
          {isHovered && isNearRightDivider && (
            <div
              className="comic-balloon-portal-add-col"
              style={{
                position: 'absolute',
                top: 0,
                left: '100%',
                transform: 'translateX(-50%)',
                pointerEvents: 'auto',
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddColumnAfter(colKey);
                }}
                className="unified-pin-btn add-col-pin"
                data-tooltip="Crear columna (+)"
              >
                <svg className="unified-pin-svg" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    className="unified-pin-bg"
                    d="M 3 15 A 13 13 0 1 1 29 15 C 29 22.5, 17.8 33.5, 16 37 C 14.2 33.5, 3 22.5, 3 15 Z"
                  />
                </svg>
                <span className="unified-pin-icon">
                  <Plus className="w-5 h-5 text-sky-400" />
                </span>
              </button>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Multi-Cell Floating Filter Toolbar Tray (Centered directly under the header column & teardrop pin) */}
      {isOpen && typeof document !== 'undefined' && thRect && createPortal(
        <div 
          className="multi-cell-floating-toolbar column-filter-floating-tray animate-fade-in"
          style={{
            position: 'fixed',
            top: `${thRect.bottom + 8}px`,
            left: `${thRect.left + thRect.width / 2}px`,
            transform: 'translateX(-50%)',
            zIndex: 100000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Organic Feathered Gaussian Blur Backdrop */}
          <div className="multi-cell-blur-backdrop" />

          <div className="multi-cell-toolbar-content">
            {/* Filter Tag / Badge */}
            <span className="multi-cell-count-badge">
              Filtro
            </span>

            {/* Integrated Pill Search Box */}
            <div className="filter-tray-search-box">
              <Search className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Buscar..."
                value={columnFilters[colKey] || ''}
                onChange={(e) => handleSetColumnFilter(colKey, e.target.value)}
                autoFocus
                className="filter-tray-search-input"
              />
              {columnFilters[colKey] && (
                <button
                  type="button"
                  onClick={() => handleClearColumnFilter(colKey)}
                  className="filter-clear-icon"
                  title="Limpiar"
                >
                  <X className="w-3 h-3 text-slate-400 hover:text-white" />
                </button>
              )}
            </div>

            {/* Horizontal Chips Carousel */}
            {uniqueValues.length > 0 && (
              <div className="filter-tray-chips-carousel">
                {uniqueValues.map((val, idx) => {
                  const isChipActive = columnFilters[colKey] === val;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (isChipActive) {
                          handleClearColumnFilter(colKey);
                        } else {
                          handleSetColumnFilter(colKey, val);
                        }
                      }}
                      className={`filter-val-chip ${isChipActive ? 'active' : ''}`}
                    >
                      {isChipActive && <Check className="w-2.5 h-2.5 text-sky-300 stroke-[3]" />}
                      <span>{String(val)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Clear Filter Reset Button if filtered */}
            {isFiltered && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter(colKey)}
                className="multi-cell-action-btn action-btn-delete"
                data-tooltip="Restablecer filtro"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

      {colKey !== 'id' && (
        <div
          onMouseDown={(e) => handleStartResize(e, colKey)}
          className="col-resizer-zone"
          title="Arrastrar para redimensionar columna (◁ ▷)"
        >
          <div className="col-resizer-line" />
        </div>
      )}
      {colKey === 'id' && (
        <div className="sticky-col-fade-overlay pointer-events-none" />
      )}
    </th>
  );
}

export function getHighResAvatarUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('photo-1517841905240-472988babdf9')) {
    return 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&h=200&q=85';
  }
  if (url.includes('images.unsplash.com')) {
    return url.replace(/w=\d+/, 'w=200').replace(/h=\d+/, 'h=200').replace(/q=\d+/, 'q=85');
  }
  return url;
}

const DEMO_TEAM_USERS = [
  { id: 'usr-1', name: 'Alex Rivera', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=85' },
  { id: 'usr-2', name: 'Sofia Chen', avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&h=200&q=85' },
  { id: 'usr-3', name: 'Mateo Torres', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=85' },
  { id: 'usr-4', name: 'Elena Rostova', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=85' },
  { id: 'usr-5', name: 'Lucas Vance', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=85' },
  { id: 'usr-6', name: 'Carlos Gomez', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=85' },
  { id: 'usr-7', name: 'Camila Silva', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=85' },
];

function AssigneeCell({ 
  item, 
  users, 
  isOpen, 
  onOpen, 
  onClose, 
  onSelect, 
  style, 
  className = '', 
  isSelected, 
  onPointerDown, 
  isLastColumn, 
  rowActionsPill, 
  ...rest 
}) {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const cellRef = useRef(null);
  const trayRef = useRef(null);
  const avatarsScrollRef = useRef(null);
  const trayTrackRef = useRef(null);
  const [trayScrollRatio, setTrayScrollRatio] = useState(0);
  const [canScrollTray, setCanScrollTray] = useState(false);

  // Available team pool
  const teamUsers = users && users.length >= 4 ? users : DEMO_TEAM_USERS;

  // Normalize assignees list
  let assignedUsers = [];
  if (Array.isArray(item.assigneeIds) && item.assigneeIds.length > 0) {
    assignedUsers = teamUsers.filter((u) => item.assigneeIds.includes(u.id));
  } else if (item.assigneeId) {
    const single = teamUsers.find((u) => u.id === item.assigneeId);
    if (single) assignedUsers = [single];
  }

  const handleToggleUser = (userId) => {
    let currentIds = assignedUsers.map((u) => u.id);
    if (currentIds.includes(userId)) {
      currentIds = currentIds.filter((id) => id !== userId);
    } else {
      currentIds.push(userId);
    }

    onSelect(currentIds);
  };

  const handleOpenCell = (e) => {
    e.stopPropagation();
    if (isOpen) {
      onClose();
      return;
    }

    const targetElement = cellRef.current;
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const popoverHeight = 85;
      const spaceBelow = window.innerHeight - rect.bottom;
      
      let top = rect.bottom + 8;
      if (spaceBelow < popoverHeight && rect.top > popoverHeight) {
        top = rect.top - popoverHeight - 8;
      }

      setCoords({
        top: Math.max(20, top),
        left: rect.left + rect.width / 2,
      });
    }
    setSearchQuery('');
    setIsSearchOpen(false);
    onOpen();
  };

  // Robust global click-outside and escape key listener using capture phase
  useEffect(() => {
    if (!isOpen) return;

    const handleDocumentMouseDown = (e) => {
      if (trayRef.current && trayRef.current.contains(e.target)) {
        return;
      }
      if (cellRef.current && cellRef.current.contains(e.target)) {
        return;
      }
      onClose();
    };

    const handleDocumentKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown, true);
    document.addEventListener('touchstart', handleDocumentMouseDown, true);
    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown, true);
      document.removeEventListener('touchstart', handleDocumentMouseDown, true);
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [isOpen, onClose]);

  // Convert natural vertical wheel motion into horizontal scrolling without requiring Shift
  useEffect(() => {
    if (!isOpen) return;
    const el = avatarsScrollRef.current;
    if (!el) return;

    const handleWheelScroll = (e) => {
      if (Math.abs(e.deltaY) >= Math.abs(e.deltaX) && e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheelScroll, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheelScroll);
    };
  }, [isOpen]);

  const filteredTeamUsers = teamUsers.filter((u) => 
    !searchQuery.trim() || u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Synchronize custom table-mini-scrollbar-track-x with avatars container scroll
  useEffect(() => {
    if (!isOpen) return;
    const el = avatarsScrollRef.current;
    if (!el) return;

    const updateScrollState = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll > 2) {
        setCanScrollTray(true);
        setTrayScrollRatio(Math.min(1, Math.max(0, el.scrollLeft / maxScroll)));
      } else {
        setCanScrollTray(false);
        setTrayScrollRatio(0);
      }
    };

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [isOpen, filteredTeamUsers.length]);

  const handleTrayTrackClick = (e) => {
    const track = trayTrackRef.current;
    const el = avatarsScrollRef.current;
    if (!track || !el) return;
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.min(Math.max(0, (clickX - rect.width * 0.15) / (rect.width * 0.7)), 1);
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: ratio * maxScroll, behavior: 'smooth' });
  };

  return (
    <td 
      ref={cellRef}
      className={`py-3 px-4 text-center align-middle relative cursor-pointer hover:bg-white/5 transition-colors ${isSelected ? 'table-cell-selected' : ''} ${className}`} 
      style={{ minWidth: '180px', textAlign: 'center', ...style }}
      onClick={handleOpenCell}
      onPointerDown={onPointerDown}
      {...rest}
    >
      <div className="w-full flex items-center justify-center text-center">
        {assignedUsers.length === 0 ? (
          <div className="assignee-empty-pill" data-tooltip="Asignar responsables">
            <UserPlus className="w-3.5 h-3.5 text-slate-400" />
            <span>Sin asignar</span>
          </div>
        ) : (
          <div
            className="assignee-avatar-btn"
            data-tooltip={assignedUsers.map((u) => u.name).join(', ')}
          >
            {/* Horizontal Stack of Up to 5 Circular Avatars with Left-on-Top Overlap */}
            <div className="assignee-avatar-stack">
              {assignedUsers.slice(0, 5).map((u, i) => {
                const borderColors = [
                  '#fb7185',
                  '#f49d37',
                  '#38bdf8',
                  '#34d399',
                  '#a78bfa',
                ];
                const borderColor = borderColors[i % borderColors.length];
                return (
                  <img
                    key={u.id || i}
                    src={getHighResAvatarUrl(u.avatarUrl)}
                    alt={u.name}
                    width={200}
                    height={200}
                    loading="eager"
                    decoding="async"
                    style={{ zIndex: 10 - i, borderColor }}
                    className="assignee-avatar-img"
                  />
                );
              })}
            </div>

            {/* Truncation Icon (...) to the RIGHT side when > 5 Assignees */}
            {assignedUsers.length > 5 && (
              <div className="assignee-more-dots">
                <MoreHorizontal className="w-5 h-5" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Multi-Select Team Floating Horizontal Tray (Closes on outside click, only 1 open at a time) */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={trayRef}
          className="multi-cell-floating-toolbar assignee-floating-tray animate-fade-in"
          style={{ 
            position: 'fixed',
            top: `${coords.top}px`, 
            left: `${coords.left}px`,
            transform: 'translateX(-50%)',
            zIndex: 99999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Organic Feathered Gaussian Blur Backdrop */}
          <div className="multi-cell-blur-backdrop" />

          <div className="multi-cell-toolbar-content">
            {/* Badge indicating team / selected count */}
            <span className="multi-cell-count-badge">
              {assignedUsers.length === 0 ? 'Equipo' : `${assignedUsers.length} resp.`}
            </span>

            {/* Search Lupa Button / Expandable Input */}
            <div className={`assignee-tray-search-box ${isSearchOpen ? 'is-expanded' : ''}`}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchOpen((prev) => {
                    const next = !prev;
                    if (next) {
                      setTimeout(() => searchInputRef.current?.focus(), 60);
                    } else {
                      setSearchQuery('');
                    }
                    return next;
                  });
                }}
                className="multi-cell-action-btn action-btn-search"
                data-tooltip="Buscar miembro"
              >
                <Search className="w-3.5 h-3.5 text-sky-400" />
              </button>

              {isSearchOpen && (
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="assignee-tray-search-input"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>

            {/* Horizontal Scrollable Avatars Carousel + Exact table-mini-scrollbar-track-x */}
            <div className="flex flex-col items-center gap-1">
              <div className="assignee-tray-avatars-scroll" ref={avatarsScrollRef}>
                {filteredTeamUsers.map((u) => {
                  const isUserAssigned = assignedUsers.some((au) => au.id === u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleUser(u.id);
                      }}
                      className={`assignee-tray-avatar-item ${isUserAssigned ? 'is-assigned' : ''}`}
                      data-tooltip={`${u.name} ${isUserAssigned ? '(Asignado)' : ''}`}
                    >
                      <div className="assignee-tray-avatar-wrap">
                        <img 
                          src={getHighResAvatarUrl(u.avatarUrl)} 
                          alt={u.name}
                          width={200}
                          height={200}
                          loading="eager"
                          decoding="async"
                          className="assignee-tray-avatar-img" 
                        />
                        {isUserAssigned && (
                          <div className="assignee-tray-check-badge">
                            <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="assignee-tray-user-firstname">
                        {u.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}

                {filteredTeamUsers.length === 0 && (
                  <span className="text-xs text-slate-400 px-3 py-1 whitespace-nowrap">
                    Sin resultados
                  </span>
                )}
              </div>

              {/* EXACT table-mini-scrollbar-track-x component */}
              {canScrollTray && (
                <div
                  ref={trayTrackRef}
                  className="table-mini-scrollbar-track-x assignee-tray-mini-track"
                  onClick={handleTrayTrackClick}
                  title="Desplazamiento horizontal"
                >
                  <div
                    className="table-mini-scrollbar-thumb-x"
                    style={{
                      left: `${trayScrollRatio * 75}%`,
                      width: '25%',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {isLastColumn && rowActionsPill}
    </td>
  );
}

function MasonryModal({ item, onClose, onUpload, onDeleteAttachment, isUploading }) {
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const attachments = item.attachments || [];

  const handleValidateAndUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP, etc.).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no debe superar los 10MB.');
      return;
    }
    onUpload(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleValidateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e) => {
    const clipItems = e.clipboardData?.items;
    if (!clipItems) return;
    for (let i = 0; i < clipItems.length; i++) {
      if (clipItems[i].type.startsWith('image/')) {
        const file = clipItems[i].getAsFile();
        if (file) handleValidateAndUpload(file);
      }
    }
  };

  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      handlePaste(e);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (lightboxImg) setLightboxImg(null);
        else onClose();
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('paste', handleGlobalPaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxImg]);

  const handleCopyLink = (att) => {
    if (!att?.url) return;
    navigator.clipboard?.writeText(att.url);
    setCopiedId(att.id || att.url);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [colCount, setColCount] = useState(3);

  useEffect(() => {
    const updateColCount = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 560) setColCount(1);
        else if (window.innerWidth < 900) setColCount(2);
        else setColCount(3);
      }
    };
    updateColCount();
    window.addEventListener('resize', updateColCount);
    return () => window.removeEventListener('resize', updateColCount);
  }, []);

  const columns = Array.from({ length: colCount }, () => []);
  attachments.forEach((att, idx) => {
    columns[idx % colCount].push({ item: att, index: idx });
  });

  const modalContent = (
    <div className="masonry-modal-overlay" onClick={onClose}>
      <div
        className="masonry-modal-card"
        onClick={(e) => e.stopPropagation()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Full-Modal Drag & Drop Blur Overlay */}
        {isDragActive && (
          <div className="masonry-modal-drag-overlay">
            <div className="masonry-modal-drag-content">
              <div className="masonry-modal-drag-icon-pulse">
                <Upload style={{ width: '38px', height: '38px' }} />
              </div>
              <p className="masonry-modal-drag-title">Suelta tus imágenes aquí</p>
              <p className="masonry-modal-drag-subtitle">Se agregarán automáticamente a este elemento</p>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="masonry-modal-header">
          <div className="masonry-modal-header-info">
            <div className="masonry-modal-tag-row">
              <span className="masonry-modal-tag">Galería de Imágenes</span>
              <span className="masonry-modal-counter">
                • {attachments.length} {attachments.length === 1 ? 'elemento' : 'elementos'}
              </span>
            </div>
            <h3 className="masonry-modal-title" title={item.title}>
              {item.title}
            </h3>
          </div>

          <div className="masonry-modal-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) handleValidateAndUpload(e.target.files[0]);
              }}
            />

            <button
              type="button"
              onClick={onClose}
              className="masonry-close-btn"
              title="Cerrar modal (Esc)"
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="masonry-modal-body">
          {/* Clean Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="masonry-dropzone"
          >
            <div className="masonry-dropzone-icon">
              <Upload style={{ width: '28px', height: '28px' }} />
            </div>
            <div>
              <p className="masonry-dropzone-title">
                {isUploading ? 'Subiendo archivo...' : 'Arrastra y suelta imágenes aquí, o haz clic para explorar'}
              </p>
              <p className="masonry-dropzone-subtitle">
                Soporta PNG, JPG, WebP y pegado directo desde el portapapeles (<span className="masonry-dropzone-kbd">Ctrl+V / <span className="masonry-cmd-symbol">⌘</span>+V</span>)
              </p>
            </div>
          </div>

          {/* Masonry / Gallery Grid */}
          {attachments.length > 0 ? (
            <div className="masonry-grid-container">
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="masonry-column">
                  {col.map(({ item: att, index: idx }) => (
                    <div key={att.id || idx} className="masonry-item-card">
                      {/* Thumbnail Image Container */}
                      <div
                        className="masonry-item-media-wrap"
                        onClick={() => setLightboxImg(att)}
                      >
                        <img
                          src={att.url}
                          alt={att.filename || `Imagen ${idx + 1}`}
                          className="masonry-item-image"
                          loading="eager"
                          onError={(e) => {
                            if (!e.currentTarget.dataset.retried) {
                              e.currentTarget.dataset.retried = 'true';
                              e.currentTarget.src = att.url.includes('?') ? att.url : `${att.url}?t=${Date.now()}`;
                            }
                          }}
                        />

                        {/* Image Overlay with Quick Action Buttons */}
                        <div className="masonry-item-overlay">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxImg(att);
                            }}
                            className="masonry-overlay-btn"
                            title="Ver en pantalla completa"
                          >
                            <ZoomIn style={{ width: '16px', height: '16px' }} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(att.url, '_blank');
                            }}
                            className="masonry-overlay-btn"
                            title="Abrir en pestaña nueva"
                          >
                            <ExternalLink style={{ width: '16px', height: '16px' }} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(att);
                            }}
                            className="masonry-overlay-btn"
                            title="Copiar enlace"
                          >
                            {copiedId === (att.id || att.url) ? (
                              <Check style={{ width: '16px', height: '16px', color: '#34d399' }} />
                            ) : (
                              <Copy style={{ width: '16px', height: '16px' }} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('¿Deseas eliminar esta imagen?')) {
                                onDeleteAttachment?.(att.id || att.url);
                              }
                            }}
                            className="masonry-overlay-btn masonry-overlay-delete-btn"
                            title="Eliminar imagen"
                          >
                            <Trash2 style={{ width: '15px', height: '15px' }} />
                          </button>
                        </div>

                        {/* Counter Badge */}
                        <div className="masonry-item-badge">
                          #{idx + 1}
                        </div>
                      </div>

                      {/* Card Caption / Meta Footer (Centered & Truncated) */}
                      <div className="masonry-item-footer">
                        <p className="masonry-item-filename" title={att.filename}>
                          {att.filename || `captura_${idx + 1}.png`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="masonry-empty-state">
              <div className="masonry-empty-icon">
                <ImageIcon style={{ width: '28px', height: '28px' }} />
              </div>
              <p className="masonry-empty-title">No hay imágenes en este elemento</p>
              <p className="masonry-empty-subtitle">
                Sube capturas de pantalla, diagramas o mockups para mantener documentado este requerimiento.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxImg && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxImg(null)}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImg.url}
              alt={lightboxImg.filename}
              className="lightbox-image"
            />
            <div className="lightbox-bar">
              <span className="lightbox-filename">{lightboxImg.filename}</span>
              <div className="lightbox-actions">
                <a
                  href={lightboxImg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lightbox-link-btn"
                >
                  <ExternalLink style={{ width: '14px', height: '14px' }} /> Abrir original
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImg(null)}
                  className="lightbox-close-btn"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
