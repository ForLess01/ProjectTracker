import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Image as ImageIcon, X, Upload, Trash2, Check, User, 
  Sparkles, AlertTriangle, Zap, Rocket, Lightbulb, Bug, ChevronDown, Eye, Copy, UserPlus,
  Filter, Search, ArrowUpDown, RotateCcw, ArrowLeft, Layers
} from 'lucide-react';
import InviteModal from './InviteModal.jsx';

export default function SheetTableApp({ 
  initialView = 'ideas', 
  currentUser,
  activeProject = { id: 'proj-1', name: 'ProjectTracker Core', teamName: 'Engineering Team', neonColor: '#38bdf8' },
  onBackToHub
}) {
  const [currentView, setCurrentView] = useState(initialView);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMasonryItem, setActiveMasonryItem] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState(null);

  // Column Filters State: { [columnKey]: string }
  const [columnFilters, setColumnFilters] = useState({});
  const [activeFilterPopover, setActiveFilterPopover] = useState(null); // columnKey string or null

  // Sync view from URL if changed
  useEffect(() => {
    fetchItems(currentView);
  }, [currentView]);

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
    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    );

    try {
      await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
    } catch (err) {
      console.error('Error updating cell:', err);
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

  // Image Upload Handler (File select or Drag/Paste)
  const uploadImage = async (itemId, file) => {
    if (!file) return;
    setUploadingItemId(itemId);

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
        setItems((prev) =>
          prev.map((item) => {
            if (item.id === itemId) {
              const currentAttachments = item.attachments || [];
              return { ...item, attachments: [...currentAttachments, data.attachment] };
            }
            return item;
          })
        );
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploadingItemId(null);
    }
  };

  // Filter items based on active column filters
  const filteredItems = items.filter((item) => {
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

  const activeFiltersCount = Object.values(columnFilters).filter(Boolean).length;

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
  };

  // Header Cell with Floating Filter Modal Component
  const FilterHeaderTh = ({ colKey, label, className = '', minWidth, width, align = 'left' }) => {
    const isFiltered = Boolean(columnFilters[colKey]);
    const isOpen = activeFilterPopover === colKey;

    // Collect unique values for quick selection suggestions
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
        className={`py-3 px-3 relative select-none ${align === 'center' ? 'text-center' : 'text-left'} ${className}`}
        style={{ minWidth, width }}
      >
        <div className={`flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : 'justify-between'}`}>
          <span className="font-heading font-bold uppercase tracking-wider text-xs">{label}</span>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveFilterPopover(isOpen ? null : colKey);
            }}
            className={`p-1 rounded-md transition-all ${
              isFiltered 
                ? 'text-[#38bdf8] bg-[#38bdf8]/20 shadow-[0_0_8px_rgba(56,189,248,0.4)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={`Filtrar y buscar por ${label}`}
          >
            <Filter className={`w-3 h-3 ${isFiltered ? 'fill-[#38bdf8]' : ''}`} />
          </button>
        </div>

        {/* Floating Modal Popover right next to header */}
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

            {/* Instant Search Input */}
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

            {/* Quick Values Suggestions */}
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

            {/* Footer */}
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
                Listo
              </button>
            </div>
          </div>
        )}
      </th>
    );
  };

  return (
    <div className="sheet-app-container">
      
      {/* Top Project Selector & Action Bar */}
      <div className="sheet-action-bar">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="btn-back-hub"
              title="Volver al Hub de Equipos y Proyectos"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Hub</span>
            </button>
          )}

          <div className="project-badge-pill" style={{ borderColor: `${activeProject.neonColor || '#38bdf8'}50` }}>
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: activeProject.neonColor || '#38bdf8', boxShadow: `0 0 8px ${activeProject.neonColor || '#38bdf8'}` }} 
            />
            <span className="font-heading font-bold text-white text-xs">{activeProject.name}</span>
            <span className="text-[11px] text-slate-400">({activeProject.teamName})</span>
          </div>

          <h2 className="sheet-title">
            {currentView === 'ideas' && <><Lightbulb className="w-4 h-4 text-[#f49d37]" /><span>Hojas de Ideas</span></>}
            {currentView === 'bugs' && <><Bug className="w-4 h-4 text-[#d72638]" /><span>Bugs</span></>}
            {currentView === 'optimizaciones' && <><Zap className="w-4 h-4 text-[#3f88c5]" /><span>Optimizaciones</span></>}
            {currentView === 'implementaciones' && <><Rocket className="w-4 h-4 text-purple-400" /><span>Implementaciones</span></>}
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

        <div className="sheet-actions-right">
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
          <button
            type="submit"
            className="btn-primary"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Liquid Glass Data Sheet Table */}
      <div className="sheet-table-wrapper" onClick={() => setActiveFilterPopover(null)}>
        <table className="sheet-table">
          
          {/* Table Header with Floating Column Filter Modals */}
          <thead>
            <tr className="bg-[#140f2d] text-white text-xs font-heading font-bold uppercase tracking-wider border-b border-white/10 divide-x divide-white/10">
              <FilterHeaderTh colKey="id" label="ID" width="70px" align="center" />
              
              {currentView === 'ideas' && (
                <>
                  <FilterHeaderTh colKey="title" label="Idea" minWidth="200px" />
                  <FilterHeaderTh colKey="context" label="Contexto" minWidth="200px" />
                  <FilterHeaderTh colKey="location" label="Dónde se aplica" minWidth="160px" />
                  <FilterHeaderTh colKey="status" label="Estado" width="140px" align="center" />
                  <th className="py-3 px-4 min-w-[140px] text-left">Capturas / Imágenes</th>
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
                  <th className="py-3 px-4 min-w-[140px] text-left">Capturas / Imágenes</th>
                  <FilterHeaderTh colKey="assignee" label="Responsable" width="140px" align="center" />
                </>
              )}

              {currentView === 'optimizaciones' && (
                <>
                  <FilterHeaderTh colKey="title" label="Mejora" minWidth="240px" />
                  <FilterHeaderTh colKey="impact" label="Impacto" width="120px" align="center" />
                  <FilterHeaderTh colKey="effort" label="Esfuerzo" width="120px" align="center" />
                  <FilterHeaderTh colKey="status" label="Estado" width="140px" align="center" />
                  <th className="py-3 px-4 min-w-[140px] text-left">Capturas / Imágenes</th>
                  <FilterHeaderTh colKey="assignee" label="Responsable" width="140px" align="center" />
                </>
              )}

              {currentView === 'implementaciones' && (
                <>
                  <FilterHeaderTh colKey="title" label="Funcionalidad" minWidth="240px" />
                  <FilterHeaderTh colKey="priority" label="Prioridad" width="120px" align="center" />
                  <FilterHeaderTh colKey="sprint" label="Sprint / Fase" minWidth="160px" />
                  <FilterHeaderTh colKey="status" label="Estado" width="140px" align="center" />
                  <th className="py-3 px-4 min-w-[140px] text-left">Capturas / Imágenes</th>
                  <FilterHeaderTh colKey="assignee" label="Responsable" width="140px" align="center" />
                </>
              )}

              <th className="py-3 px-3 w-12 text-center"></th>
            </tr>
          </thead>

          {/* Table Body */}
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
                  className="hover:bg-white/5 transition-colors group"
                >
                  {/* Row ID */}
                  <td className="py-3 px-4 text-center font-mono text-xs text-slate-400">
                    #{idx + 1}
                  </td>

                  {/* View Specific Columns */}
                  {currentView === 'ideas' && (
                    <>
                      <EditableTextCell
                        value={item.title}
                        onSave={(val) => updateCell(item.id, 'title', val)}
                        placeholder="Escribir idea..."
                        fontWeight="semibold"
                      />
                      <EditableTextCell
                        value={item.context || ''}
                        onSave={(val) => updateCell(item.id, 'context', val)}
                        placeholder="Contexto..."
                      />
                      <EditableTextCell
                        value={item.location || ''}
                        onSave={(val) => updateCell(item.id, 'location', val)}
                        placeholder="Dónde se aplica..."
                      />
                      <StatusDropdownCell
                        value={item.status}
                        onChange={(val) => updateCell(item.id, 'status', val)}
                      />
                      <ImageAttachmentCell
                        item={item}
                        onUpload={(file) => uploadImage(item.id, file)}
                        isUploading={uploadingItemId === item.id}
                        onOpenMasonry={() => setActiveMasonryItem(item)}
                      />
                      <AssigneeCell
                        item={item}
                        users={users}
                        onSelect={(userId) => updateCell(item.id, 'assigneeId', userId)}
                      />
                      <EditableTextCell
                        value={item.notes || ''}
                        onSave={(val) => updateCell(item.id, 'notes', val)}
                        placeholder="Notas..."
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
                      />
                      <EditableTextCell
                        value={item.location || ''}
                        onSave={(val) => updateCell(item.id, 'location', val)}
                        placeholder="Módulo afectado..."
                      />
                      <StatusDropdownCell
                        value={item.status}
                        onChange={(val) => updateCell(item.id, 'status', val)}
                      />
                      <ImageAttachmentCell
                        item={item}
                        onUpload={(file) => uploadImage(item.id, file)}
                        isUploading={uploadingItemId === item.id}
                        onOpenMasonry={() => setActiveMasonryItem(item)}
                      />
                      <AssigneeCell
                        item={item}
                        users={users}
                        onSelect={(userId) => updateCell(item.id, 'assigneeId', userId)}
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
                      />
                      <StatusDropdownCell
                        value={item.status}
                        onChange={(val) => updateCell(item.id, 'status', val)}
                      />
                      <ImageAttachmentCell
                        item={item}
                        onUpload={(file) => uploadImage(item.id, file)}
                        isUploading={uploadingItemId === item.id}
                        onOpenMasonry={() => setActiveMasonryItem(item)}
                      />
                      <AssigneeCell
                        item={item}
                        users={users}
                        onSelect={(userId) => updateCell(item.id, 'assigneeId', userId)}
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
                      />
                      <EditableTextCell
                        value={item.sprint || ''}
                        onSave={(val) => updateCell(item.id, 'sprint', val)}
                        placeholder="Sprint o Fase..."
                      />
                      <StatusDropdownCell
                        value={item.status}
                        onChange={(val) => updateCell(item.id, 'status', val)}
                      />
                      <ImageAttachmentCell
                        item={item}
                        onUpload={(file) => uploadImage(item.id, file)}
                        isUploading={uploadingItemId === item.id}
                        onOpenMasonry={() => setActiveMasonryItem(item)}
                      />
                      <AssigneeCell
                        item={item}
                        users={users}
                        onSelect={(userId) => updateCell(item.id, 'assigneeId', userId)}
                      />
                    </>
                  )}

                  {/* Action / Delete */}
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

      {/* Floating Masonry Grid Modal for Images */}
      {activeMasonryItem && (
        <MasonryModal
          item={activeMasonryItem}
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

    </div>
  );
}

// ----------------------------------------------------
// Sub-components: Cells & Modals
// ----------------------------------------------------

function EditableTextCell({ value, onSave, placeholder, fontWeight = 'normal' }) {
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
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setCurrentVal(value || '');
      setIsEditing(false);
    }
  };

  return (
    <td 
      className={`py-3 px-4 transition-colors cursor-text ${fontWeight === 'semibold' ? 'font-semibold text-white' : 'text-slate-300'}`}
      onClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          type="text"
          value={currentVal}
          onChange={(e) => setCurrentVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full bg-white/10 text-white px-2 py-1 rounded border border-[#3f88c5] focus:outline-none text-sm"
        />
      ) : (
        <span className={!value ? 'text-slate-500 italic' : ''}>
          {value || placeholder}
        </span>
      )}
    </td>
  );
}

function StatusDropdownCell({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const statuses = [
    { id: 'backlog', label: 'Backlog', color: 'bg-slate-800 text-slate-300 border-slate-700' },
    { id: 'todo', label: 'Por Hacer', color: 'bg-blue-950/60 text-blue-400 border-blue-800/40' },
    { id: 'in_progress', label: 'En Progreso', color: 'bg-amber-950/60 text-amber-400 border-amber-800/40' },
    { id: 'review', label: 'En Revisión', color: 'bg-purple-950/60 text-purple-400 border-purple-800/40' },
    { id: 'done', label: 'Completado', color: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' },
  ];

  const currentStatus = statuses.find((s) => s.id === value) || statuses[0];

  return (
    <td className="py-3 px-4 text-center relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1 text-xs font-semibold rounded-lg border ${currentStatus.color} inline-flex items-center gap-1.5 transition-all hover:scale-105`}
      >
        <span>{currentStatus.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-12 z-30 bg-[#140f2d] border border-white/10 rounded-xl shadow-2xl p-1 w-36 flex flex-col gap-1 backdrop-blur-xl">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onChange(s.id);
                setIsOpen(false);
              }}
              className={`px-2.5 py-1.5 text-xs text-left rounded-lg font-medium transition-colors ${
                s.id === value ? 'bg-white/10 text-white font-bold' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </td>
  );
}

function SelectBadgeCell({ value, options, colors, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <td className="py-3 px-4 text-center relative">
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

function ImageAttachmentCell({ item, onUpload, isUploading, onOpenMasonry }) {
  const fileInputRef = useRef(null);
  const attachments = item.attachments || [];

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) onUpload(file);
      }
    }
  };

  return (
    <td className="py-3 px-4" onPaste={handlePaste}>
      <div className="flex items-center gap-2">
        {attachments.length > 0 ? (
          <button
            onClick={onOpenMasonry}
            className="flex items-center gap-1.5 group/img-preview relative focus:outline-none"
            title="Ver capturas en galería Masonry"
          >
            <div className="flex -space-x-2 overflow-hidden py-1">
              {attachments.slice(0, 3).map((att, i) => (
                <img
                  key={att.id || i}
                  src={att.url}
                  alt={att.filename}
                  className="inline-block h-7 w-7 rounded-lg ring-2 ring-[#140f2d] object-cover transition-transform group-hover/img-preview:scale-110"
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover/img-preview:text-[#3f88c5] flex items-center gap-1 ml-1">
              <Eye className="w-3 h-3" />
              <span>{attachments.length}</span>
            </span>
          </button>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-xs text-slate-500 hover:text-slate-300 border border-dashed border-white/10 hover:border-[#3f88c5]/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {isUploading ? (
              <span>Subiendo...</span>
            ) : (
              <>
                <Upload className="w-3 h-3" />
                <span>Arrastrar / Pegar</span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onUpload(e.target.files[0]);
            }
          }}
        />
      </div>
    </td>
  );
}

function AssigneeCell({ item, users, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const assignee = users.find((u) => u.id === item.assigneeId);

  return (
    <td className="py-3 px-4 text-center relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors"
      >
        {assignee ? (
          <>
            <img
              src={assignee.avatarUrl}
              alt={assignee.name}
              className="w-5 h-5 rounded-full object-cover border border-white/20"
            />
            <span className="text-xs text-slate-200">{assignee.name}</span>
          </>
        ) : (
          <>
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500">Sin asignar</span>
          </>
        )}
        <ChevronDown className="w-3 h-3 text-slate-500 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-12 z-30 bg-[#140f2d] border border-white/10 rounded-xl shadow-2xl p-1 w-44 flex flex-col gap-1 backdrop-blur-xl">
          <button
            onClick={() => {
              onSelect(null);
              setIsOpen(false);
            }}
            className="px-3 py-1.5 text-xs text-left text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
          >
            Sin asignar
          </button>
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                onSelect(u.id);
                setIsOpen(false);
              }}
              className="px-3 py-1.5 text-xs text-left text-slate-200 hover:bg-white/10 rounded-lg flex items-center gap-2"
            >
              <img src={u.avatarUrl} alt={u.name} className="w-4 h-4 rounded-full" />
              <span>{u.name}</span>
            </button>
          ))}
        </div>
      )}
    </td>
  );
}

function MasonryModal({ item, onClose, onUpload, isUploading }) {
  const fileInputRef = useRef(null);
  const attachments = item.attachments || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', width: '90%' }}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Capturas / Mockups</h3>
            <p className="text-xs text-slate-400 mt-0.5">{item.title}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.875rem' }}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Subiendo...' : 'Subir Imagen'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) onUpload(e.target.files[0]);
              }}
            />
            <button onClick={onClose} className="modal-close-btn">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="modal-body p-4 max-h-[70vh] overflow-y-auto">
          {attachments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No hay imágenes adjuntas. Haz clic en "Subir Imagen" o pega desde el portapapeles.
            </div>
          ) : (
            <div className="masonry-grid">
              {attachments.map((att, idx) => (
                <div key={att.id || idx} className="masonry-item-card group">
                  <img
                    src={att.url}
                    alt={att.filename}
                    className="w-full rounded-xl object-cover"
                  />
                  <div className="masonry-item-overlay">
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="masonry-item-link"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver original</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
