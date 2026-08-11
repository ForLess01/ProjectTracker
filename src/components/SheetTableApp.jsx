import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Image as ImageIcon, X, Upload, Trash2, Check, User, 
  Sparkles, AlertTriangle, Zap, Rocket, Lightbulb, Bug, ChevronDown, Eye, Copy, UserPlus
} from 'lucide-react';
import InviteModal from './InviteModal.jsx';

export default function SheetTableApp({ initialView = 'ideas', currentUser }) {
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
        // Update local items state with new attachment
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

  return (
    <div className="sheet-app-container">
      
      {/* Top Action Bar & Add Row Button */}
      <div className="sheet-action-bar">
        <div className="flex items-center gap-3">
          <h2 className="sheet-title">
            {currentView === 'ideas' && <><Lightbulb className="w-5 h-5 text-[#f49d37]" /><span>Hojas de Ideas</span></>}
            {currentView === 'bugs' && <><Bug className="w-5 h-5 text-[#d72638]" /><span>Gestión de Bugs y Problemas</span></>}
            {currentView === 'optimizaciones' && <><Zap className="w-5 h-5 text-[#3f88c5]" /><span>Plan de Optimizaciones</span></>}
            {currentView === 'implementaciones' && <><Rocket className="w-5 h-5 text-purple-400" /><span>Implementaciones y Sprints</span></>}
          </h2>
          <span className="sheet-badge-count">
            {items.length} filas
          </span>
        </div>

        <div className="sheet-actions-right">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
          >
            <UserPlus className="w-4 h-4" />
            <span>Invitar Equipo</span>
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
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
            placeholder={`Nombre para esta ${currentView.slice(0, -1)}...`}
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
      <div className="sheet-table-wrapper">
        <table className="sheet-table">
          
          {/* Table Header matching exact user screenshots color tone */}
          <thead>
            <tr className="bg-[#140f2d] text-white text-xs font-heading font-bold uppercase tracking-wider border-b border-white/10 divide-x divide-white/10">
              <th className="py-3.5 px-4 w-16 text-center text-slate-400">ID</th>
              
              {currentView === 'ideas' && (
                <>
                  <th className="py-3.5 px-4 min-w-[200px]">Idea</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Contexto</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Dónde se aplica</th>
                  <th className="py-3.5 px-4 w-36 text-center">Estado</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Capturas / Imágenes</th>
                  <th className="py-3.5 px-4 w-32 text-center">Responsables</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Notas</th>
                </>
              )}

              {currentView === 'bugs' && (
                <>
                  <th className="py-3.5 px-4 min-w-[240px]">Problema</th>
                  <th className="py-3.5 px-4 w-36 text-center">Severidad</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Módulo</th>
                  <th className="py-3.5 px-4 w-36 text-center">Estado</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Capturas / Imágenes</th>
                  <th className="py-3.5 px-4 w-36 text-center">Responsable</th>
                </>
              )}

              {currentView === 'optimizaciones' && (
                <>
                  <th className="py-3.5 px-4 min-w-[240px]">Mejora</th>
                  <th className="py-3.5 px-4 w-32 text-center">Impacto</th>
                  <th className="py-3.5 px-4 w-32 text-center">Esfuerzo</th>
                  <th className="py-3.5 px-4 w-36 text-center">Estado</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Capturas / Imágenes</th>
                  <th className="py-3.5 px-4 w-32 text-center">Responsable</th>
                </>
              )}

              {currentView === 'implementaciones' && (
                <>
                  <th className="py-3.5 px-4 min-w-[240px]">Funcionalidad</th>
                  <th className="py-3.5 px-4 w-32 text-center">Prioridad</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Sprint / Fase</th>
                  <th className="py-3.5 px-4 w-36 text-center">Estado</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Capturas / Imágenes</th>
                  <th className="py-3.5 px-4 w-32 text-center">Responsable</th>
                </>
              )}

              <th className="py-3.5 px-3 w-12 text-center"></th>
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
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  No hay filas creadas aún. Haz clic en "Agregar Fila".
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
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
                          Medio: 'bg-[#f49d37]/20 text-[#f49d37] border border-[#f49d37]/40',
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
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#f22b29] p-1.5 rounded-lg hover:bg-white/5 transition-all"
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

      {/* Central Floating Masonry Grid Image Modal */}
      {activeMasonryItem && (
        <MasonryModal
          item={activeMasonryItem}
          onClose={() => setActiveMasonryItem(null)}
          onUpload={(file) => uploadImage(activeMasonryItem.id, file)}
        />
      )}

      {/* Custom Liquid Glass Confirm Delete Modal */}
      {deleteTargetId && (
        <ConfirmDeleteModal
          onConfirm={() => {
            handleDeleteItem(deleteTargetId);
            setDeleteTargetId(null);
          }}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}

      {/* Multi-User Team Invite Modal */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
}

// 1. Inline Editable Text Cell Component
function EditableTextCell({ value, onSave, placeholder, fontWeight = 'normal' }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleBlur = () => {
    setEditing(false);
    if (text !== value) {
      onSave(text);
    }
  };

  if (editing) {
    return (
      <td className="py-2 px-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          className="w-full px-2 py-1 text-sm bg-[#140f2d] border border-[#3f88c5] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f88c5]"
          autoFocus
        />
      </td>
    );
  }

  return (
    <td
      onClick={() => setEditing(true)}
      className={`py-3 px-4 cursor-pointer hover:bg-white/5 transition-colors ${
        fontWeight === 'semibold' ? 'font-semibold text-white' : ''
      }`}
    >
      {text || <span className="text-slate-500 italic text-xs">{placeholder}</span>}
    </td>
  );
}

// 2. Status Dropdown Select Cell
function StatusDropdownCell({ value, onChange }) {
  const statusConfig = {
    backlog: { label: 'Backlog', bg: 'bg-slate-800 text-slate-400' },
    todo: { label: 'Por Hacer', bg: 'bg-[#f49d37]/20 text-[#f49d37] border border-[#f49d37]/40' },
    in_progress: { label: 'En Progreso', bg: 'bg-[#3f88c5]/20 text-[#3f88c5] border border-[#3f88c5]/40' },
    review: { label: 'En Revisión', bg: 'bg-purple-950/60 text-purple-300 border border-purple-800/40' },
    done: { label: 'Completado', bg: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' },
  };

  const current = statusConfig[value] || statusConfig.backlog;

  return (
    <td className="py-2 px-3 text-center">
      <select
        value={value || 'backlog'}
        onChange={(e) => onChange(e.target.value)}
        className={`px-3 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-[#3f88c5] transition-all bg-[#140f2d] ${current.bg}`}
      >
        <option value="backlog">Backlog</option>
        <option value="todo">Por Hacer</option>
        <option value="in_progress">En Progreso</option>
        <option value="review">En Revisión</option>
        <option value="done">Completado</option>
      </select>
    </td>
  );
}

// 3. Generic Select Badge Cell
function SelectBadgeCell({ value, options, colors, onChange }) {
  const badgeClass = colors[value] || 'bg-slate-800 text-slate-400';

  return (
    <td className="py-2 px-3 text-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`px-3 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-[#3f88c5] transition-all bg-[#140f2d] ${badgeClass}`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </td>
  );
}

// 4. Image Attachment Dropzone Cell
function ImageAttachmentCell({ item, onUpload, isUploading, onOpenMasonry }) {
  const fileInputRef = useRef(null);
  const attachments = item.attachments || [];

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e) => {
    if (e.clipboardData.files && e.clipboardData.files[0]) {
      onUpload(e.clipboardData.files[0]);
    }
  };

  return (
    <td
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
      className="py-2 px-3 focus:outline-none focus:bg-white/5"
    >
      <div className="sheet-thumbnail-group">
        {/* Thumbnails list */}
        {attachments.length > 0 ? (
          <div className="sheet-thumbnail-group" onClick={onOpenMasonry}>
            <div className="sheet-thumbnail-stack">
              {attachments.slice(0, 3).map((att, i) => (
                <img
                  key={att.id || i}
                  src={att.url}
                  alt="Attachment"
                  className="sheet-thumbnail-img"
                />
              ))}
            </div>
            <span className="sheet-badge-count">
              <Eye className="w-3 h-3" />
              {attachments.length}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="sheet-upload-btn"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Subiendo...' : 'Arrastrar / Pegar'}</span>
          </button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          accept="image/*"
          className="sheet-hidden-file-input"
          style={{ display: 'none' }}
        />
      </div>
    </td>
  );
}

// 5. Assignee Avatar Dropdown Cell
function AssigneeCell({ item, users, onSelect }) {
  const assignedUser = users.find((u) => u.id === item.assigneeId) || item.assignee;

  return (
    <td className="py-2 px-3 text-center">
      <div className="relative inline-block text-left group">
        <select
          value={assignedUser?.id || ''}
          onChange={(e) => onSelect(e.target.value)}
          className="appearance-none bg-transparent opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
        >
          <option value="">Sin asignar</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-center gap-1.5 p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer">
          {assignedUser ? (
            <img
              src={assignedUser.avatarUrl}
              alt={assignedUser.name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-[#3f88c5]/50"
              title={`Asignado a: ${assignedUser.name}`}
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-white/10">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </td>
  );
}

// 6. Central Floating Masonry Modal Component for Image Preview
function MasonryModal({ item, onClose, onUpload }) {
  const fileInputRef = useRef(null);
  const attachments = item.attachments || [];

  return (
    <div className="masonry-modal-overlay">
      <div className="masonry-modal-card">
        
        {/* Header */}
        <div className="masonry-modal-header">
          <div className="masonry-modal-header-info">
            <span className="masonry-modal-subtitle">
              Capturas & Adjuntos
            </span>
            <h3 className="masonry-modal-title">
              {item.title}
            </h3>
          </div>

          <div className="masonry-modal-actions">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.875rem' }}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Nueva</span>
            </button>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '0.375rem' }}
            >
              <X className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
              accept="image/*"
              className="sheet-hidden-file-input"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Masonry Image Grid Content */}
        <div className="masonry-modal-body">
          {attachments.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#3f88c5]" />
              <p className="text-sm font-medium">No hay capturas adjuntas aún.</p>
              <p className="text-xs text-slate-500 mt-1">
                Puedes subir una seleccionándola o pegándola directamente en la celda.
              </p>
            </div>
          ) : (
            <div className="masonry-grid-container">
              {attachments.map((att) => (
                <div key={att.id} className="masonry-item-card">
                  <img
                    src={att.url}
                    alt={att.filename}
                    className="masonry-item-image"
                  />
                  <div className="masonry-item-info">
                    <span className="masonry-item-filename">
                      {att.filename}
                    </span>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="masonry-item-link"
                    >
                      Abrir en alta resolución ↗
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

// 7. Custom Liquid Glass Confirm Delete Modal
function ConfirmDeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-card">
        <div className="confirm-modal-icon">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="confirm-modal-title">¿Eliminar esta fila?</h3>
        <p className="confirm-modal-text">
          Esta acción no se puede deshacer. Todos los datos y adjuntos asociados a esta fila serán eliminados permanentemente.
        </p>
        <div className="confirm-modal-actions">
          <button onClick={onCancel} className="btn-secondary" style={{ padding: '0.625rem 1.25rem' }}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn-primary" style={{ backgroundColor: 'var(--color-racing-red)', padding: '0.625rem 1.25rem' }}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
