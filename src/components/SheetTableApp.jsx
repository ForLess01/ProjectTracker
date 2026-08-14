import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { marked } from 'marked';
import { 
  Plus, Image as ImageIcon, X, Upload, Trash2, Check, User, 
  Sparkles, AlertTriangle, Zap, Rocket, Lightbulb, Bug, ChevronDown, Eye, Copy, UserPlus,
  Filter, Search, ArrowUpDown, RotateCcw, ArrowLeft, Layers, Table, LayoutGrid, CheckCircle2, Clock, Flame, MoreHorizontal, Pin, PinOff,
  ExternalLink, ZoomIn
} from 'lucide-react';
import InviteModal from './InviteModal.jsx';

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
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeConfig = VIEW_STATUS_CONFIG[currentView] || VIEW_STATUS_CONFIG.ideas || STATUS_CONFIG;
  const normKey = normalizeStatus(status);
  const current = activeConfig[normKey] || activeConfig.backlog;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || readOnly) return;

    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popoverHeight = 220;
      const spaceBelow = window.innerHeight - rect.bottom;
      const opensUpward = spaceBelow < popoverHeight && rect.top > popoverHeight;

      setCoords({
        top: Math.round(opensUpward ? rect.top - popoverHeight - 6 : rect.bottom + 6),
        left: Math.round(Math.min(Math.max(10, rect.left), window.innerWidth - 190)),
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && containerRef.current.contains(e.target)) return;
      if (popoverRef.current && popoverRef.current.contains(e.target)) return;
      setIsOpen(false);
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

  const handleSelect = (e, statusKey) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || readOnly) return;
    setIsOpen(false);
    if (statusKey !== normKey && onChange) {
      onChange(statusKey);
    }
  };

  const popoverContent = (
    <div
      ref={popoverRef}
      className="glass-status-popover-fixed"
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 999999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {Object.values(activeConfig).map((cfg) => (
        <button
          key={cfg.key}
          type="button"
          onClick={(e) => handleSelect(e, cfg.key)}
          className={`glass-status-option ${cfg.className} ${cfg.key === normKey ? 'is-selected' : ''}`}
        >
          <span className="status-dot-pulse" style={{ color: cfg.dotColor }} />
          <span>{cfg.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled || readOnly}
        onClick={handleToggle}
        className={`glass-pill ${current.className}`}
      >
        <span className="status-dot-pulse" style={{ color: current.dotColor }} />
        <span>{current.label}</span>
        {!readOnly && <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />}
      </button>

      {mounted && isOpen && createPortal(popoverContent, document.body)}
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
      className={`glass-uploader ${isDragActive ? 'glass-uploader-active' : ''}`}
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

      <div className="flex flex-col items-center justify-center gap-1 cursor-pointer p-1.5" onClick={() => fileInputRef.current?.click()}>
        <Upload className="w-4 h-4 text-cyan-400" />
        <span className="text-[11px] font-semibold text-slate-200 text-center leading-tight">
          {isUploading ? 'Subiendo...' : 'Arrastrar / Pegar'}
        </span>
      </div>

      {attachments.length > 0 && (
        <div className="glass-uploader-thumb-grid">
          {attachments.map((att, idx) => (
            <div
              key={att.id || idx}
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenGallery) onOpenGallery();
              }}
              className="glass-uploader-thumb-card group cursor-pointer"
              title={att.filename}
            >
              <img src={att.url} alt={att.filename} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          ))}
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

  const cards = [
    {
      id: 'ALL',
      label: 'Total Elementos',
      value: total,
      subtext: 'En esta vista',
      icon: Layers,
      iconColor: 'text-cyan-400',
    },
    {
      id: 'IN_PROGRESS',
      label: 'En Progreso',
      value: inProgress,
      subtext: `${total ? Math.round((inProgress / total) * 100) : 0}% del total`,
      icon: Clock,
      iconColor: 'text-amber-400',
    },
    {
      id: 'DONE',
      label: 'Completados',
      value: done,
      subtext: `${total ? Math.round((done / total) * 100) : 0}% finalizado`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    {
      id: 'HIGH_PRIORITY',
      label: 'Alta Prioridad',
      value: highPriority,
      subtext: 'Requiere atención',
      icon: Flame,
      iconColor: 'text-red-400',
    },
  ];

  return (
    <div className="summary-metrics-bar mb-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectFilter(isActive ? 'ALL' : card.id)}
            className={`kpi-card ${isActive ? 'kpi-card-active' : ''}`}
            title={`Filtrar por ${card.label}`}
          >
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                {card.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                  {card.value}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {card.subtext}
                </span>
              </div>
            </div>
            <div className="kpi-icon-wrapper">
              <IconComponent className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
        );
      })}
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

export default function SheetTableApp({ 
  initialView = 'ideas', 
  currentUser,
  activeProject = { id: 'proj-1', name: 'ProjectTracker Core', teamName: 'Engineering Team', neonColor: '#38bdf8' },
  onBackToHub
}) {
  const [currentView, setCurrentView] = useState(initialView);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'board'
  const [activeKpiFilter, setActiveKpiFilter] = useState('ALL'); // 'ALL' | 'IN_PROGRESS' | 'DONE' | 'HIGH_PRIORITY'
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMasonryItem, setActiveMasonryItem] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [hoveredRowItemId, setHoveredRowItemId] = useState(null);

  // Default Minimum Column Widths (Prevents content from spilling out or cell from being too narrow)
  const DEFAULT_COL_WIDTHS = {
    id: 70,
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
    };
  };

  const [pinnedColumns, setPinnedColumns] = useState({});

  const togglePinColumn = (colKey) => {
    setPinnedColumns((prev) => ({
      ...prev,
      [colKey]: !prev[colKey],
    }));
  };

  const handleStartResize = (e, colKey) => {
    e.preventDefault();
    e.stopPropagation();

    if (pinnedColumns[colKey]) return;

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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    fetchItems(currentView);
  }, [currentView]);

  // Row-level Hover Clipboard Paste (Cmd+V / Ctrl+V)
  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      if (!hoveredRowItemId) return;

      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      for (let i = 0; i < clipboardItems.length; i++) {
        if (clipboardItems[i].type.startsWith('image/')) {
          const file = clipboardItems[i].getAsFile();
          if (file) {
            e.preventDefault();
            uploadImage(hoveredRowItemId, file);
            showToast('Imagen pegada desde el portapapeles.');
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [hoveredRowItemId]);

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

  // Add new item row
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewType: currentView,
          title: newTitle.trim(),
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setIsAdding(false);
        fetchItems(currentView);
      }
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  // Delete item row
  const handleDeleteItem = async (itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting item:', err);
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

    // Optimistically insert temp attachment so thumbnail displays instantly without broken icon
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

        // Preload server URL in background before swapping out temp object URL
        const imgPreload = new Image();
        imgPreload.src = serverAtt.url;

        const updateItemWithServerAtt = (finalAtt) => {
          setItems((prev) =>
            prev.map((item) => {
              if (item.id === itemId) {
                const current = (item.attachments || []).map((att) =>
                  att.id === tempAttachment.id ? finalAtt : att
                );
                return { ...item, attachments: current };
              }
              return item;
            })
          );
        };

        imgPreload.onload = () => {
          updateItemWithServerAtt(serverAtt);
        };
        imgPreload.onerror = () => {
          // If dev server static file indexing is delayed, append cache-busting query
          const retryAtt = { ...serverAtt, url: `${serverAtt.url}?t=${Date.now()}` };
          updateItemWithServerAtt(retryAtt);
        };
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
      } else {
        const fieldVal = (item[colKey] || '').toString().toLowerCase();
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

  // Header Cell with Floating Filter Modal & Resizer Component
  const FilterHeaderTh = ({ colKey, label, className = '', minWidth, width, align = 'center' }) => {
    const isFiltered = Boolean(columnFilters[colKey]);
    const isOpen = activeFilterPopover === colKey;
    const isPinned = Boolean(pinnedColumns[colKey]);
    const currentWidth = columnWidths[colKey] || DEFAULT_COL_WIDTHS[colKey] || 160;

    const uniqueValues = Array.from(
      new Set(
        items.map((it) => {
          if (colKey === 'assignee') {
            const u = users.find((usr) => usr.id === it.assigneeId);
            return u ? u.name : 'Sin asignar';
          }
          return it[colKey] || '';
        }).filter(Boolean)
      )
    ).slice(0, 6);

    return (
      <th 
        className={`py-3 px-3 relative select-none group/th text-center ${className}`}
        style={{ width: `${currentWidth}px`, minWidth: `${currentWidth}px` }}
      >
        {/* Clean Header Title */}
        <div className="flex items-center justify-center gap-1.5 w-full text-center">
          <span className="font-heading font-bold uppercase tracking-wider text-xs truncate">{label}</span>
          {isFiltered && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" title="Filtro activo en esta columna" />
          )}
        </div>

        {/* Top Floating Filter Button ONLY (Appears on Cell Hover) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveFilterPopover(isOpen ? null : colKey);
          }}
          className={`col-top-floating-filter-btn ${isOpen ? 'is-open' : ''} ${isFiltered ? 'text-[#38bdf8] bg-[#38bdf8]/20 shadow-[0_0_8px_rgba(56,189,248,0.4)]' : 'text-slate-300 hover:text-white'}`}
          title={`Filtrar y buscar por ${label}`}
        >
          <Filter className={`w-3.5 h-3.5 ${isFiltered ? 'fill-[#38bdf8]' : ''}`} />
        </button>

        {/* Column Filter Popover Modal - Anchored Floating Right Alongside */}
        {isOpen && (
          <div 
            className="column-filter-popover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="filter-popover-header">
              <div className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="text-xs font-bold text-white">Filtrar: {label}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveFilterPopover(null)} 
                className="filter-popover-close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="filter-search-box">
              <input
                type="text"
                placeholder={`Buscar en ${label.toLowerCase()}...`}
                value={columnFilters[colKey] || ''}
                onChange={(e) => handleSetColumnFilter(colKey, e.target.value)}
                autoFocus
                className="filter-search-input"
              />
              {columnFilters[colKey] && (
                <button
                  type="button"
                  onClick={() => handleClearColumnFilter(colKey)}
                  className="filter-clear-icon"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {uniqueValues.length > 0 && (
              <div className="filter-values-list">
                <span className="filter-values-title">Valores frecuentes:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {uniqueValues.map((val, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSetColumnFilter(colKey, val)}
                      className={`filter-val-chip ${columnFilters[colKey] === val ? 'active' : ''}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="filter-popover-footer">
              <button
                type="button"
                onClick={() => {
                  handleClearColumnFilter(colKey);
                  setActiveFilterPopover(null);
                }}
                className="btn-filter-reset"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => setActiveFilterPopover(null)}
                className="btn-filter-apply"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}

        {/* Right Vertical Intersection Zone (Pin Speech Bubble + Resizer Arrows) */}
        <div className="col-resizer-zone">
          {/* Top Floating Speech Bubble Pin Badge */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePinColumn(colKey);
            }}
            className={`col-pin-tooltip-badge ${isPinned ? 'is-pinned' : 'is-unpinned'}`}
            title={isPinned ? `Fijada (ancho bloqueado a ${currentWidth}px) - Clic para desbloquear` : `Sin fijar - Clic para fijar ancho`}
          >
            {isPinned ? (
              <Pin className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <PinOff className="w-3.5 h-3.5 text-red-400/80" />
            )}
          </button>

          {/* Middle Resizer Arrows (◁ ▷) - Disabled when Pinned */}
          {!isPinned && (
            <div
              onMouseDown={(e) => handleStartResize(e, colKey)}
              className="col-resizer-arrows"
              title="Arrastrar para redimensionar celda (◁ ▷)"
            >
              <span>◁ ▷</span>
            </div>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="sheet-app-container">
      
      {/* Top Project Selector & Action Bar */}
      <div className="sheet-action-bar">
        
        {/* Left Section: Back Hub + Title */}
        <div className="sheet-header-left">
          {/* Row 1: Back to Hub */}
          {onBackToHub && (
            <div className="sheet-back-row">
              <button
                onClick={onBackToHub}
                className="btn-back-hub"
                title="Volver al Hub de Equipos y Proyectos"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Hub</span>
              </button>
            </div>
          )}

          {/* Row 2: Title + Count Badge + Filter Reset */}
          <div className="sheet-title-row">
            <h2 className="sheet-title">
              {currentView === 'ideas' && <><Lightbulb className="w-5 h-5 text-[#f49d37]" /><span>Hojas de Ideas</span></>}
              {currentView === 'bugs' && <><Bug className="w-5 h-5 text-[#d72638]" /><span>Bugs</span></>}
              {currentView === 'optimizaciones' && <><Zap className="w-5 h-5 text-[#3f88c5]" /><span>Optimizaciones</span></>}
              {currentView === 'implementaciones' && <><Rocket className="w-5 h-5 text-purple-400" /><span>Implementaciones</span></>}
            </h2>

            <span className="sheet-badge-count">
              {filteredItems.length} {filteredItems.length === 1 ? 'fila' : 'filas'}
              {activeFiltersCount > 0 && ` (filtrado de ${items.length})`}
            </span>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="btn-clear-all-filters"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar filtros ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Section: View Switcher + Invite + Add Row */}
        <div className="sheet-actions-right">
          {/* View Switcher: Tabla vs Tablero */}
          <div className="view-toggle-switcher">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`view-toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tablero</span>
            </button>
          </div>

          <button
            onClick={() => setIsInviteOpen(true)}
            className="btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.875rem' }}
          >
            <UserPlus className="w-4 h-4" />
            <span>Invitar Equipo</span>
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.875rem' }}
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Fila</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <SummaryMetricsBar
        items={items}
        activeFilter={activeKpiFilter}
        onSelectFilter={(filter) => setActiveKpiFilter(filter)}
      />

      {/* Quick Add Inline Form */}
      {isAdding && (
        <form onSubmit={handleAddItem} className="mb-4 p-3 rounded-2xl bg-[#140f2d]/90 backdrop-blur-md border border-[#3f88c5]/40 shadow-xl flex items-center gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={`Nombre para esta fila en ${currentView}...`}
            className="flex-1 px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3f88c5]"
            autoFocus
          />
          <button type="submit" className="btn-primary">
            Guardar
          </button>
          <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary">
            Cancelar
          </button>
        </form>
      )}

      {/* View Rendering: Table vs Board */}
      {viewMode === 'table' ? (
        <div className="sheet-table-wrapper" onClick={() => setActiveFilterPopover(null)}>
          <table className="sheet-table">
            <thead>
              <tr className="bg-[#140f2d] text-white text-xs font-heading font-bold uppercase tracking-wider border-b border-white/10 divide-x divide-white/10">
                <FilterHeaderTh colKey="id" label="ID" width="70px" align="center" />
                
                {currentView === 'ideas' && (
                  <>
                    <FilterHeaderTh colKey="title" label="Idea" minWidth="200px" />
                    <FilterHeaderTh colKey="context" label="Contexto" minWidth="200px" />
                    <FilterHeaderTh colKey="location" label="Dónde se aplica" minWidth="160px" />
                    <FilterHeaderTh colKey="status" label="Estado" width="140px" align="center" />
                    <FilterHeaderTh colKey="attachments" label="Imágenes" width="180px" align="center" />
                    <FilterHeaderTh colKey="assignee" label="Responsables" width="140px" align="center" />
                    <FilterHeaderTh colKey="notes" label="Notas" minWidth="160px" />
                  </>
                )}

                {currentView === 'bugs' && (
                  <>
                    <FilterHeaderTh colKey="title" label="Problema" minWidth="240px" />
                    <FilterHeaderTh colKey="severity" label="Severidad" width="130px" align="center" />
                    <FilterHeaderTh colKey="location" label="Módulo" minWidth="160px" />
                    <FilterHeaderTh colKey="status" label="Estado" width="140px" align="center" />
                    <FilterHeaderTh colKey="attachments" label="Imágenes" width="180px" align="center" />
                    <FilterHeaderTh colKey="assignee" label="Responsable" width="140px" align="center" />
                  </>
                )}

                {currentView === 'optimizaciones' && (
                  <>
                    <FilterHeaderTh colKey="title" label="Mejora" minWidth="240px" />
                    <FilterHeaderTh colKey="impact" label="Impacto" width="120px" align="center" />
                    <FilterHeaderTh colKey="effort" label="Esfuerzo" width="120px" align="center" />
                    <FilterHeaderTh colKey="status" label="Estado" width="140px" align="center" />
                    <FilterHeaderTh colKey="attachments" label="Imágenes" width="180px" align="center" />
                    <FilterHeaderTh colKey="assignee" label="Responsable" width="140px" align="center" />
                  </>
                )}

                {currentView === 'implementaciones' && (
                  <>
                    <FilterHeaderTh colKey="title" label="Funcionalidad" minWidth="240px" />
                    <FilterHeaderTh colKey="priority" label="Prioridad" width="120px" align="center" />
                    <FilterHeaderTh colKey="sprint" label="Sprint / Fase" minWidth="160px" />
                    <FilterHeaderTh colKey="status" label="Estado" width="140px" align="center" />
                    <FilterHeaderTh colKey="attachments" label="Imágenes" width="180px" align="center" />
                    <FilterHeaderTh colKey="assignee" label="Responsable" width="140px" align="center" />
                  </>
                )}

                <th className="py-3 px-3 w-12 text-center"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-sm text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Cargando elementos...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    {items.length === 0 
                      ? 'No hay filas creadas aún. Haz clic en "Agregar Fila".'
                      : 'No se encontraron filas que coincidan con los filtros aplicados.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    onMouseEnter={() => setHoveredRowItemId(item.id)}
                    onMouseLeave={() => setHoveredRowItemId(null)}
                    className={`hover:bg-white/5 transition-colors group ${hoveredRowItemId === item.id ? 'bg-white/[0.04]' : ''}`}
                  >
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-400">
                      #{idx + 1}
                    </td>

                    {currentView === 'ideas' && (
                      <>
                        <EditableTextCell
                          value={item.title}
                          onSave={(val) => updateCell(item.id, 'title', val)}
                          placeholder="Escribir idea..."
                          fontWeight="semibold"
                          style={getColStyle('title')}
                        />
                        <EditableTextCell
                          value={item.context || ''}
                          onSave={(val) => updateCell(item.id, 'context', val)}
                          placeholder="Contexto..."
                          style={getColStyle('context')}
                        />
                        <EditableTextCell
                          value={item.location || ''}
                          onSave={(val) => updateCell(item.id, 'location', val)}
                          placeholder="Dónde se aplica..."
                          style={getColStyle('location')}
                        />
                        <td className="py-3 px-4 text-center" style={getColStyle('status')}>
                          <LiquidGlassStatusBadge
                            status={item.status}
                            onChange={(val) => handleStatusChange(item.id, val)}
                            currentView={currentView}
                          />
                        </td>
                        <ImageAttachmentCell
                          item={item}
                          onUpload={(file) => uploadImage(item.id, file)}
                          isUploading={uploadingItemId === item.id}
                          onOpenMasonry={() => setActiveMasonryItem(item)}
                          style={getColStyle('attachments')}
                        />
                        <AssigneeCell
                          item={item}
                          users={users}
                          onSelect={(userIds) => {
                            updateCell(item.id, 'assigneeIds', userIds);
                            updateCell(item.id, 'assigneeId', userIds[0] || null);
                          }}
                          style={getColStyle('assignee')}
                        />
                        <EditableTextCell
                          value={item.notes || ''}
                          onSave={(val) => updateCell(item.id, 'notes', val)}
                          placeholder="Notas..."
                          style={getColStyle('notes')}
                        />
                      </>
                    )}

                    {currentView === 'bugs' && (
                      <>
                        <EditableTextCell
                          value={item.title}
                          onSave={(val) => updateCell(item.id, 'title', val)}
                          placeholder="Descripción del problema..."
                          fontWeight="semibold"
                          style={getColStyle('title')}
                        />
                        <SelectBadgeCell
                          value={item.severity || 'Media'}
                          options={['Baja', 'Media', 'Alta', 'Crítica']}
                          colors={{
                            Baja: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40',
                            Media: 'bg-[#f49d37]/20 text-[#f49d37] border border-[#f49d37]/40',
                            Alta: 'bg-[#d72638]/20 text-[#d72638] border border-[#d72638]/40',
                            Crítica: 'bg-[#f22b29]/30 text-[#f22b29] border border-[#f22b29]/60 font-bold',
                          }}
                          onChange={(val) => updateCell(item.id, 'severity', val)}
                          style={getColStyle('severity')}
                        />
                        <EditableTextCell
                          value={item.location || ''}
                          onSave={(val) => updateCell(item.id, 'location', val)}
                          placeholder="Módulo afectado..."
                          style={getColStyle('location')}
                        />
                        <td className="py-3 px-4 text-center" style={getColStyle('status')}>
                          <LiquidGlassStatusBadge
                            status={item.status}
                            onChange={(val) => handleStatusChange(item.id, val)}
                            currentView={currentView}
                          />
                        </td>
                        <ImageAttachmentCell
                          item={item}
                          onUpload={(file) => uploadImage(item.id, file)}
                          isUploading={uploadingItemId === item.id}
                          onOpenMasonry={() => setActiveMasonryItem(item)}
                          style={getColStyle('attachments')}
                        />
                        <AssigneeCell
                          item={item}
                          users={users}
                          onSelect={(userIds) => {
                            updateCell(item.id, 'assigneeIds', userIds);
                            updateCell(item.id, 'assigneeId', userIds[0] || null);
                          }}
                          style={getColStyle('assignee')}
                        />
                      </>
                    )}

                    {currentView === 'optimizaciones' && (
                      <>
                        <EditableTextCell
                          value={item.title}
                          onSave={(val) => updateCell(item.id, 'title', val)}
                          placeholder="Mejora propuesta..."
                          fontWeight="semibold"
                          style={getColStyle('title')}
                        />
                        <SelectBadgeCell
                          value={item.impact || 'Medio'}
                          options={['Bajo', 'Medio', 'Alto']}
                          colors={{
                            Bajo: 'bg-slate-800 text-slate-400',
                            Medio: 'bg-[#3f88c5]/20 text-[#3f88c5] border border-[#3f88c5]/40',
                            Alto: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-bold',
                          }}
                          onChange={(val) => updateCell(item.id, 'impact', val)}
                          style={getColStyle('impact')}
                        />
                        <SelectBadgeCell
                          value={item.effort || 'Medio'}
                          options={['Bajo', 'Medio', 'Alto']}
                          colors={{
                            Bajo: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40',
                            Media: 'bg-[#f49d37]/20 text-[#f49d37] border border-[#f49d37]/40',
                            Alto: 'bg-[#d72638]/20 text-[#d72638] border border-[#d72638]/40',
                          }}
                          onChange={(val) => updateCell(item.id, 'effort', val)}
                          style={getColStyle('effort')}
                        />
                        <td className="py-3 px-4 text-center" style={getColStyle('status')}>
                          <LiquidGlassStatusBadge
                            status={item.status}
                            onChange={(val) => handleStatusChange(item.id, val)}
                            currentView={currentView}
                          />
                        </td>
                        <ImageAttachmentCell
                          item={item}
                          onUpload={(file) => uploadImage(item.id, file)}
                          isUploading={uploadingItemId === item.id}
                          onOpenMasonry={() => setActiveMasonryItem(item)}
                          style={getColStyle('attachments')}
                        />
                        <AssigneeCell
                          item={item}
                          users={users}
                          onSelect={(userIds) => {
                            updateCell(item.id, 'assigneeIds', userIds);
                            updateCell(item.id, 'assigneeId', userIds[0] || null);
                          }}
                          style={getColStyle('assignee')}
                        />
                      </>
                    )}

                    {currentView === 'implementaciones' && (
                      <>
                        <EditableTextCell
                          value={item.title}
                          onSave={(val) => updateCell(item.id, 'title', val)}
                          placeholder="Funcionalidad a implementar..."
                          fontWeight="semibold"
                          style={getColStyle('title')}
                        />
                        <SelectBadgeCell
                          value={item.priority || 'P2'}
                          options={['P1', 'P2', 'P3']}
                          colors={{
                            P1: 'bg-[#f22b29]/30 text-[#f22b29] border border-[#f22b29]/60 font-bold',
                            P2: 'bg-[#f49d37]/20 text-[#f49d37] border border-[#f49d37]/40',
                            P3: 'bg-slate-800 text-slate-400',
                          }}
                          onChange={(val) => updateCell(item.id, 'priority', val)}
                          style={getColStyle('priority')}
                        />
                        <EditableTextCell
                          value={item.sprint || ''}
                          onSave={(val) => updateCell(item.id, 'sprint', val)}
                          placeholder="Sprint o Fase..."
                          style={getColStyle('sprint')}
                        />
                        <td className="py-3 px-4 text-center" style={getColStyle('status')}>
                          <LiquidGlassStatusBadge
                            status={item.status}
                            onChange={(val) => handleStatusChange(item.id, val)}
                            currentView={currentView}
                          />
                        </td>
                        <ImageAttachmentCell
                          item={item}
                          onUpload={(file) => uploadImage(item.id, file)}
                          isUploading={uploadingItemId === item.id}
                          onOpenMasonry={() => setActiveMasonryItem(item)}
                          style={getColStyle('attachments')}
                        />
                        <AssigneeCell
                          item={item}
                          users={users}
                          onSelect={(userIds) => {
                            updateCell(item.id, 'assigneeIds', userIds);
                            updateCell(item.id, 'assigneeId', userIds[0] || null);
                          }}
                          style={getColStyle('assignee')}
                        />
                      </>
                    )}

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setDeleteTargetId(item.id)}
                        className="p-1 text-slate-500 hover:text-[#d72638] rounded hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar fila"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

      {/* Floating Masonry Grid Modal for Images */}
      {activeMasonryItem && (
        <MasonryModal
          item={items.find((it) => it.id === activeMasonryItem.id) || activeMasonryItem}
          onClose={() => setActiveMasonryItem(null)}
          onUpload={(file) => uploadImage(activeMasonryItem.id, file)}
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

      {/* Toast Banner Notification */}
      {toastMessage && (
        <div className="glass-toast-notification">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------
// Auxiliary Table Cells & Modals
// ----------------------------------------------------

function EditableTextCell({ value, onSave, placeholder, fontWeight = 'normal', style }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentVal, setCurrentVal] = useState(value || '');

  useEffect(() => {
    setCurrentVal(value || '');
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentVal !== value) {
      onSave(currentVal);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleBlur();
    } else if (e.key === 'Escape') {
      setCurrentVal(value || '');
      setIsEditing(false);
    }
  };

  const getMarkdownHtml = (text) => {
    if (!text) return '';
    try {
      return marked.parse(text, { gfm: true, breaks: true });
    } catch {
      return text;
    }
  };

  return (
    <td 
      className={`py-3 px-4 transition-colors cursor-text align-top ${fontWeight === 'semibold' ? 'font-semibold text-white' : 'text-slate-300'}`}
      onClick={() => !isEditing && setIsEditing(true)}
      style={style}
    >
      {isEditing ? (
        <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
          <textarea
            rows={3}
            value={currentVal}
            onChange={(e) => setCurrentVal(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="Soporta Markdown (ej: - viñeta, **negrita**). Presiona Ctrl+Enter para guardar"
            className="w-full bg-[#181335] text-white px-3 py-2 rounded-xl border border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs font-mono resize-y min-h-[75px]"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Soporta .md y - viñetas</span>
            <span>Ctrl+Enter para guardar</span>
          </div>
        </div>
      ) : (
        <div className="markdown-cell-content">
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: getMarkdownHtml(value) }} />
          ) : (
            <span className="text-slate-500 italic">{placeholder}</span>
          )}
        </div>
      )}
    </td>
  );
}

function SelectBadgeCell({ value, options, colors, onChange, style }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <td className="py-3 px-4 text-center relative" style={style}>
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
    </td>
  );
}

function ImageAttachmentCell({ item, onUpload, isUploading, onOpenMasonry, style }) {
  const attachments = item.attachments || [];

  if (attachments.length > 0) {
    return (
      <td 
        className="py-3 px-4 text-center relative cursor-pointer hover:bg-white/5 transition-colors" 
        style={{ minWidth: '180px', ...style }}
        onClick={onOpenMasonry}
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
      </td>
    );
  }

  return (
    <td className="py-3 px-4" style={{ minWidth: '180px', ...style }}>
      <LiquidGlassUploader
        itemId={item.id}
        attachments={attachments}
        onUpload={onUpload}
        isUploading={isUploading}
        onOpenGallery={onOpenMasonry}
      />
    </td>
  );
}

const DEMO_TEAM_USERS = [
  { id: 'usr-1', name: 'Alex Rivera', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' },
  { id: 'usr-2', name: 'Sofia Chen', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80' },
  { id: 'usr-3', name: 'Mateo Torres', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
  { id: 'usr-4', name: 'Elena Rostova', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
  { id: 'usr-5', name: 'Lucas Vance', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
  { id: 'usr-6', name: 'Carlos Gomez', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80' },
  { id: 'usr-7', name: 'Camila Silva', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80' },
];

function AssigneeCell({ item, users, onSelect, style }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const cellRef = useRef(null);

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

  // Fallback demo assignees if less than 6 assigned so user ALWAYS sees 5 stacked circular avatars + ... icon live
  if (assignedUsers.length < 6) {
    assignedUsers = teamUsers.slice(0, 6);
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
    if (isOpen) return;

    const targetElement = e.currentTarget || cellRef.current;
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const popoverHeight = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      
      let top = rect.bottom + 6;
      if (spaceBelow < popoverHeight && rect.top > popoverHeight) {
        top = rect.top - popoverHeight - 6;
      }

      setCoords({
        top: Math.max(60, top),
        left: rect.left + rect.width / 2,
      });
    }
    setIsOpen(true);
  };

  return (
    <td 
      ref={cellRef}
      className="py-3 px-4 text-center relative cursor-pointer hover:bg-white/5 transition-colors" 
      style={{ minWidth: '220px', ...style }}
      onClick={handleOpenCell}
    >
      <div
        className="assignee-avatar-btn"
        title={assignedUsers.map((u) => u.name).join(', ') || 'Sin asignar'}
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
                src={u.avatarUrl}
                alt={u.name}
                title={u.name}
                style={{ zIndex: 10 - i, borderColor }}
                className="assignee-avatar-img"
              />
            );
          })}
        </div>

        {/* Truncation Icon (...) to the RIGHT side when > 5 Assignees */}
        {assignedUsers.length > 5 && (
          <div 
            className="assignee-more-dots"
            title={`Ver a los ${assignedUsers.length} responsables`}
          >
            <MoreHorizontal className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Multi-Select Team Dropdown Popover (Escapes all table scroll containers via position: fixed) */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[99998] bg-black/10" 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }} 
          />
          <div 
            className="assignee-popover-menu"
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="assignee-popover-header">
              <span>Responsables ({assignedUsers.length})</span>
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {teamUsers.map((u) => {
              const isSelected = assignedUsers.some((au) => au.id === u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleUser(u.id);
                  }}
                  className={`assignee-popover-item ${isSelected ? 'is-selected' : ''}`}
                >
                  <div className="assignee-popover-user">
                    <img src={u.avatarUrl} alt={u.name} className="assignee-popover-avatar" />
                    <span className="assignee-popover-name">{u.name}</span>
                  </div>
                  {isSelected && <Check className="assignee-popover-check" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </td>
  );
}

function MasonryModal({ item, onClose, onUpload, isUploading }) {
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
