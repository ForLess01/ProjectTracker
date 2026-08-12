import React from 'react';
import { Wrench, Pencil, Trash2, Archive, Users, Layers, Check, X } from 'lucide-react';

export default function FloatingToolsDock({
  activeTool,
  onSelectTool,
  selectedTeamIds = [],
  selectedProjectIds = [],
  isAllTeamsSelected = false,
  isAllProjectsSelected = false,
  onToggleAllTeams,
  onToggleAllProjects,
  showArchivedOnly = false,
  onToggleViewArchived,
  onClearSelection,
}) {
  const tools = [
    {
      id: 'edit',
      label: 'Editar',
      icon: Pencil,
      color: '#38bdf8', // Cyan
      hoverBg: 'rgba(56, 189, 248, 0.18)',
      borderColor: 'rgba(56, 189, 248, 0.45)',
    },
    {
      id: 'archive',
      label: 'Archivar',
      icon: Archive,
      color: '#f59e0b', // Amber
      hoverBg: 'rgba(245, 158, 11, 0.18)',
      borderColor: 'rgba(245, 158, 11, 0.45)',
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: Trash2,
      color: '#f43f5e', // Rose
      hoverBg: 'rgba(244, 63, 94, 0.18)',
      borderColor: 'rgba(244, 63, 94, 0.45)',
    },
  ];

  const totalSelected = selectedTeamIds.length + selectedProjectIds.length;
  const showMassSelection = Boolean(activeTool) && activeTool !== 'edit';

  return (
    <div className="floating-tools-container" role="toolbar" aria-label="Herramientas rápidas">
      {/* Floating Vertical Mass Selection Menu */}
      {showMassSelection && (
        <div className="floating-mass-select-menu">
          <div className="mass-select-header">
            <span className="mass-select-counter">{totalSelected} seleccionados</span>
          </div>

          <div className="mass-select-buttons-list">
            <button
              type="button"
              onClick={onToggleAllTeams}
              className={`mass-select-btn ${isAllTeamsSelected ? 'is-active-toggle' : ''}`}
              title={isAllTeamsSelected ? 'Deseleccionar todos los equipos' : 'Seleccionar todos los equipos'}
            >
              <span>Todos</span>
              <Users className="w-4 h-4 text-[#3f88c5]" />
            </button>

            <button
              type="button"
              onClick={onToggleAllProjects}
              className={`mass-select-btn ${isAllProjectsSelected ? 'is-active-toggle' : ''}`}
              title={isAllProjectsSelected ? 'Deseleccionar todos los proyectos' : 'Seleccionar todos los proyectos'}
            >
              <span>Todos</span>
              <Layers className="w-4 h-4 text-[#f49d37]" />
            </button>

            {activeTool === 'archive' && (
              <button
                type="button"
                onClick={onToggleViewArchived}
                className={`mass-select-btn ${showArchivedOnly ? 'is-active-toggle' : ''}`}
                title={showArchivedOnly ? 'Ver activos' : 'Ver archivados'}
              >
                <span>Archivados</span>
                <Archive className="w-4 h-4 text-[#f59e0b]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Floating Tools Pill */}
      <div className={`floating-tools-pill group ${activeTool ? 'is-tool-active' : ''}`}>
        {/* Central Indicator / Trigger Icon */}
        <div 
          className="floating-tools-trigger" 
          title={activeTool ? `Herramienta activa: ${activeTool}` : 'Herramientas'}
        >
          <Wrench className="tools-trigger-icon" />
        </div>

        {/* Expanded Tools Items (Reveal from center outward on hover) */}
        <div className="floating-tools-list">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isCurrentActive = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onSelectTool(isCurrentActive ? null : tool.id)}
                className={`floating-tool-item ${isCurrentActive ? 'is-selected-tool' : ''}`}
                style={{
                  '--tool-color': tool.color,
                  '--tool-hover-bg': tool.hoverBg,
                  '--tool-border-color': tool.borderColor,
                }}
                title={tool.label}
              >
                <div className="floating-tool-icon-wrapper">
                  <Icon className="floating-tool-icon" />
                </div>
                <span className="floating-tool-label">{tool.label}</span>
              </button>
            );
          })}

          {/* Close/Cancel Selection Button when in tool mode */}
          {activeTool && (
            <button
              type="button"
              onClick={onClearSelection}
              className="floating-tool-close-btn"
              title="Cancelar selección"
            >
              <X className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
