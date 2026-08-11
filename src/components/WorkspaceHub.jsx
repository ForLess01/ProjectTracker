import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { 
  Users, Layers, Plus, Sparkles, MoreHorizontal, Shield, Crown, User, 
  ArrowRight, X, ChevronRight, Hash, UserPlus, FolderPlus, Workflow, Search
} from 'lucide-react';

export default function WorkspaceHub({ onSelectProject, currentUser }) {
  // Teams adhering to the Liquid Glass design palette
  const [teams, setTeams] = useState([
    {
      id: 'team-eng',
      name: 'Engineering Team',
      role: 'owner', // 'owner' | 'admin' | 'member'
      description: 'Equipo central de arquitectura, infraestructura y APIs.',
      memberCount: 8,
      accentColor: '#3f88c5', // Steel Blue
      projectsCount: 3,
    },
    {
      id: 'team-design',
      name: 'Product & Design',
      role: 'member',
      description: 'Diseño UX/UI, sistema de diseño Liquid Glass y prototipos.',
      memberCount: 5,
      accentColor: '#f49d37', // Carrot Orange
      projectsCount: 2,
    },
    {
      id: 'team-mobile',
      name: 'Mobile App Team',
      role: 'member',
      description: 'Desarrollo de aplicaciones nativas iOS y Android.',
      memberCount: 6,
      accentColor: '#8b5cf6', // Iris Purple
      projectsCount: 2,
    },
    {
      id: 'team-growth',
      name: 'Growth & Marketing',
      role: 'member',
      description: 'Métricas de retención, landing pages y campañas.',
      memberCount: 4,
      accentColor: '#d72638', // Classic Crimson
      projectsCount: 2,
    },
  ]);

  // Projects assigned to teams with consistent Liquid Glass accents
  const [projects, setProjects] = useState([
    {
      id: 'proj-1',
      name: 'ProjectTracker Core',
      teamId: 'team-eng',
      teamName: 'Engineering Team',
      accentColor: '#3f88c5',
      itemCount: 24,
      isFrequent: true,
      lastActive: 'Hace 5m',
    },
    {
      id: 'proj-2',
      name: 'Design System & Glass UI',
      teamId: 'team-design',
      teamName: 'Product & Design',
      accentColor: '#f49d37',
      itemCount: 16,
      isFrequent: true,
      lastActive: 'Hace 1h',
    },
    {
      id: 'proj-3',
      name: 'Mobile SDK Native',
      teamId: 'team-mobile',
      teamName: 'Mobile App Team',
      accentColor: '#8b5cf6',
      itemCount: 19,
      isFrequent: true,
      lastActive: 'Hace 3h',
    },
    {
      id: 'proj-4',
      name: 'API Gateway Backend',
      teamId: 'team-eng',
      teamName: 'Engineering Team',
      accentColor: '#3f88c5',
      itemCount: 31,
      isFrequent: true,
      lastActive: 'Ayer',
    },
    {
      id: 'proj-5',
      name: 'Landing Page & Onboarding',
      teamId: 'team-growth',
      teamName: 'Growth & Marketing',
      accentColor: '#d72638',
      itemCount: 12,
      isFrequent: true,
      lastActive: 'Hace 2d',
    },
    {
      id: 'proj-6',
      name: 'Figma Token Sync',
      teamId: 'team-design',
      teamName: 'Product & Design',
      accentColor: '#f49d37',
      itemCount: 8,
      isFrequent: true,
      lastActive: 'Hace 3d',
    },
    {
      id: 'proj-7',
      name: 'Push Notification Service',
      teamId: 'team-mobile',
      teamName: 'Mobile App Team',
      accentColor: '#8b5cf6',
      itemCount: 14,
      isFrequent: true,
      lastActive: 'Hace 4d',
    },
    {
      id: 'proj-8',
      name: 'Analytics Dashboard',
      teamId: 'team-growth',
      teamName: 'Growth & Marketing',
      accentColor: '#d72638',
      itemCount: 17,
      isFrequent: true,
      lastActive: 'Hace 5d',
    },
    {
      id: 'proj-9',
      name: 'Database Sharding & Cache',
      teamId: 'team-eng',
      teamName: 'Engineering Team',
      accentColor: '#3f88c5',
      itemCount: 9,
      isFrequent: true,
      lastActive: 'Hace 1sem',
    },
    {
      id: 'proj-10',
      name: 'Dark Mode Liquid Theme',
      teamId: 'team-design',
      teamName: 'Product & Design',
      accentColor: '#f49d37',
      itemCount: 11,
      isFrequent: true,
      lastActive: 'Hace 1sem',
    },
  ]);

  // Top 5 frequent projects
  const visibleFrequents = projects.filter((p) => p.isFrequent).slice(0, 5);

  const [selectedTeamForModal, setSelectedTeamForModal] = useState(null);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isClosingTeam, setIsClosingTeam] = useState(false);

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isClosingProject, setIsClosingProject] = useState(false);

  const closeTeamModal = () => {
    setIsClosingTeam(true);
    setTimeout(() => {
      setIsCreateTeamOpen(false);
      setIsClosingTeam(false);
    }, 380);
  };

  const closeProjectModal = () => {
    setIsClosingProject(true);
    setTimeout(() => {
      setIsCreateProjectOpen(false);
      setIsClosingProject(false);
    }, 380);
  };

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut listener: Cmd/Ctrl + F to open search, Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        if (isCreateTeamOpen) {
          e.preventDefault();
          closeTeamModal();
        } else if (isCreateProjectOpen) {
          e.preventDefault();
          closeProjectModal();
        } else if (isSearchOpen) {
          e.preventDefault();
          setIsSearchOpen(false);
          setSearchQuery('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isCreateTeamOpen, isCreateProjectOpen]);

  const filteredProjects = selectedTeamFilter
    ? projects.filter((p) => p.teamId === selectedTeamFilter.id)
    : projects;

  const displayTeams = searchQuery.trim()
    ? teams.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : teams;

  const displayProjects = searchQuery.trim()
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.teamName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProjects;

  // Group hover state & connected SVG curves
  const containerRef = useRef(null);
  const [showConnections, setShowConnections] = useState(true);
  const [hoveredTeamId, setHoveredTeamId] = useState(null);
  const [connectorLines, setConnectorLines] = useState([]);

  useLayoutEffect(() => {
    if (!showConnections || !hoveredTeamId || !containerRef.current) {
      setConnectorLines([]);
      return;
    }

    const updateLines = () => {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      const teamCard = container.querySelector(`[data-team-card-id="${hoveredTeamId}"]`);
      const projCards = container.querySelectorAll(`[data-proj-team-id="${hoveredTeamId}"]`);

      if (!teamCard || projCards.length === 0) {
        setConnectorLines([]);
        return;
      }

      const teamRect = teamCard.getBoundingClientRect();
      const x1 = teamRect.right - containerRect.left;
      const y1 = teamRect.top + teamRect.height / 2 - containerRect.top;

      const activeTeam = teams.find((t) => t.id === hoveredTeamId);
      const color = activeTeam?.accentColor || '#3f88c5';

      const lines = [];
      projCards.forEach((projCard) => {
        const projRect = projCard.getBoundingClientRect();
        const x2 = projRect.left - containerRect.left;
        const y2 = projRect.top + projRect.height / 2 - containerRect.top;

        const dx = Math.max(40, Math.abs(x2 - x1) * 0.45);
        const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

        lines.push({ x1, y1, x2, y2, path, color });
      });

      setConnectorLines(lines);
    };

    updateLines();

    window.addEventListener('resize', updateLines);
    window.addEventListener('scroll', updateLines, true);

    return () => {
      window.removeEventListener('resize', updateLines);
      window.removeEventListener('scroll', updateLines, true);
    };
  }, [hoveredTeamId, showConnections, teams, projects]);

  // New team form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#3f88c5');

  // New project form state
  const [newProjName, setNewProjName] = useState('');
  const [newProjTeamId, setNewProjTeamId] = useState(teams[0]?.id || '');

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const newTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      role: 'owner',
      description: newTeamDesc.trim() || 'Nuevo espacio de trabajo colaborativo.',
      memberCount: 1,
      accentColor: newTeamColor,
      projectsCount: 0,
    };
    setTeams((prev) => [newTeam, ...prev]);
    setNewTeamName('');
    setNewTeamDesc('');
    closeTeamModal();
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    const parentTeam = teams.find((t) => t.id === newProjTeamId) || teams[0];
    const newProject = {
      id: `proj-${Date.now()}`,
      name: newProjName.trim(),
      teamId: parentTeam.id,
      teamName: parentTeam.name,
      accentColor: parentTeam.accentColor,
      itemCount: 0,
      isFrequent: true,
      lastActive: 'Justo ahora',
    };
    setProjects((prev) => [newProject, ...prev]);
    setTeams((prev) =>
      prev.map((t) =>
        t.id === parentTeam.id ? { ...t, projectsCount: t.projectsCount + 1 } : t
      )
    );
    setNewProjName('');
    closeProjectModal();
  };

  const getRoleBadge = (role) => {
    if (role === 'owner') {
      return (
        <div className="role-badge-corner role-badge-owner" title="Propietario">
          <Crown className="w-3.5 h-3.5 text-[#f49d37]" />
        </div>
      );
    }
    return (
      <div className="role-badge-corner role-badge-member" title="Miembro">
        <User className="w-3.5 h-3.5 text-slate-300" />
      </div>
    );
  };

  return (
    <div className="workspace-hub-wrapper">
      
      {/* 1. Top Horizontal Row: Controls (Left) + Centered Frecuentes Bar / Search Glass Overlay */}
      <div className="hub-frequents-wrapper">
        <div className="hub-left-controls">
          {/* Connections Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setShowConnections(!showConnections)}
            className={`btn-toggle-connections-expandable ${showConnections ? 'active' : ''}`}
            title={showConnections ? "Desactivar líneas de conexión al pasar el mouse" : "Activar líneas de conexión al pasar el mouse"}
          >
            <div className="btn-toggle-icon-box">
              <Workflow className="w-4 h-4" />
            </div>
            <span className="btn-toggle-expand-label">Conexiones</span>
          </button>

          {/* Search Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen) setSearchQuery('');
            }}
            className={`btn-toggle-connections-expandable ${isSearchOpen ? 'active' : ''}`}
            title={isSearchOpen ? "Cerrar búsqueda" : "Buscar proyectos o equipos"}
          >
            <div className="btn-toggle-icon-box">
              <Search className="w-4 h-4" />
            </div>
            <span className="btn-toggle-expand-label">Buscar</span>
          </button>
        </div>

        {/* Center: Either Frecuentes Bar or Glass Gradient Search Overlay */}
        {!isSearchOpen ? (
          <div className="hub-frequents-bar">
            <div className="frequents-label-box">
              <Sparkles className="w-4 h-4 text-[#f49d37]" />
              <span>Frecuentes:</span>
            </div>

            <div className="frequents-chips-scroll">
              {visibleFrequents.map((item) => {
                const isChipHovered = showConnections && hoveredTeamId === item.teamId;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectProject && onSelectProject(item)}
                    onMouseEnter={() => showConnections && setHoveredTeamId(item.teamId)}
                    onMouseLeave={() => setHoveredTeamId(null)}
                    className={`hub-frequent-chip ${isChipHovered ? 'is-frequent-highlighted' : ''}`}
                    style={isChipHovered ? { borderColor: item.accentColor, boxShadow: `0 0 14px ${item.accentColor}66` } : {}}
                  >
                    <div 
                      className="frequent-dot"
                      style={{ backgroundColor: item.accentColor }}
                    />
                    <span className="frequent-name">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="hub-search-overlay-mist">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Escribe para buscar proyectos o equipos..."
              className="hub-search-input"
            />
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="search-frameless-icon-btn"
              title="Cerrar búsqueda (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="hub-columns-container" ref={containerRef}>
        
        {/* Dynamic Curved SVG Connector Overlay */}
        {showConnections && hoveredTeamId && connectorLines.length > 0 && (
          <svg className="hub-connection-svg-overlay">
            <defs>
              <filter id="hubLineGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {connectorLines.map((line, idx) => (
              <g key={idx}>
                {/* Thick glow background line */}
                <path
                  d={line.path}
                  stroke={line.color}
                  strokeWidth="6"
                  strokeOpacity="0.45"
                  fill="none"
                  filter="url(#hubLineGlow)"
                />
                {/* Crisp animated dashed line */}
                <path
                  d={line.path}
                  stroke={line.color}
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  fill="none"
                  className="animated-connector-path"
                />
              </g>
            ))}
          </svg>
        )}

        {/* Column 1: Equipos (Teams) */}
        <div className="hub-column">
          <div className="hub-column-header">
            <div className="column-header-title">
              <div className="column-icon-badge">
                <Users className="w-4.5 h-4.5 text-[#3f88c5]" />
              </div>
              <h3 className="column-title">
                {searchQuery.trim() ? `Equipos "${searchQuery}"` : 'Tus Equipos'}
                <span className="column-title-tag tag-blue">{displayTeams.length}</span>
              </h3>
            </div>

            <button
              onClick={() => setIsCreateTeamOpen(true)}
              className="notched-header-trigger notched-header-trigger-team"
              title="Crear equipo"
            >
              <svg 
                className="notched-trigger-svg" 
                width="64" 
                height="50" 
                viewBox="0 0 64 50" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="headerNotchTeamGrad" x1="0" y1="0" x2="64" y2="50" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 0 0 C 0 6, 6 12, 12 12 H 48 C 56 12, 62 18, 62 25 C 62 32, 56 38, 48 38 H 12 C 6 38, 0 44, 0 50 Z" 
                  fill="url(#headerNotchTeamGrad)" 
                  stroke="none" 
                />
              </svg>
              <div className="notched-trigger-content">
                <UserPlus className="w-5 h-5 text-[#3f88c5]" />
              </div>
            </button>
          </div>

          {/* Teams List */}
          <div className="hub-cards-list">
            {displayTeams.map((team) => {
              const isHighlighted = showConnections && hoveredTeamId === team.id;
              const isDimmed = showConnections && hoveredTeamId !== null && hoveredTeamId !== team.id;
              const isSelected = selectedTeamFilter?.id === team.id;

              return (
                <div
                  key={team.id}
                  data-team-card-id={team.id}
                  onClick={() => setSelectedTeamFilter((prev) => (prev?.id === team.id ? null : team))}
                  onMouseEnter={() => showConnections && setHoveredTeamId(team.id)}
                  onMouseLeave={() => setHoveredTeamId(null)}
                  className={`hub-card team-card ${isHighlighted ? 'is-highlighted-group' : ''} ${isDimmed ? 'is-dimmed-group' : ''} ${isSelected ? 'is-team-selected' : ''}`}
                  style={{ '--active-accent': team.accentColor }}
                >
                  {/* Top-Right Corner Role Ribbon/Badge */}
                  {getRoleBadge(team.role)}

                  {/* Card Header: Icon + Name */}
                  <div className="card-top-row">
                    <div className="card-header-identity">
                      <Users 
                        className="card-header-icon"
                        style={{ color: team.accentColor }} 
                      />
                      <div className="card-title-group">
                        <h4 className="card-title">{team.name}</h4>
                        <span className="card-subtext">{team.memberCount} miembros</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body: Description */}
                  <p className="card-desc">{team.description}</p>

                  {/* Card Footer: Stats & Action Arrow */}
                  <div className="card-footer-row">
                    <div className="card-stat-pill">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{team.projectsCount} {team.projectsCount === 1 ? 'proyecto' : 'proyectos'}</span>
                    </div>

                    <ChevronRight className="card-arrow-icon" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider between sections */}
        <div className="hub-columns-divider" />

        {/* Column 2: Proyectos (Projects) */}
        <div className="hub-column">
          <div className="hub-column-header">
            <div className="column-header-title">
              <div className="column-icon-badge">
                <Layers className="w-4.5 h-4.5 text-[#f49d37]" />
              </div>
              <h3 className="column-title">
                {searchQuery.trim()
                  ? `Proyectos "${searchQuery}"`
                  : selectedTeamFilter
                  ? `Proyectos de ${selectedTeamFilter.name}`
                  : 'Todos los Proyectos'}
                <span className="column-title-tag tag-orange">{displayProjects.length}</span>
                {selectedTeamFilter && !searchQuery.trim() && (
                  <button
                    onClick={() => setSelectedTeamFilter(null)}
                    className="btn-clear-team-filter"
                    title="Mostrar todos los proyectos"
                  >
                    <X className="w-3 h-3" />
                    <span>Ver todos</span>
                  </button>
                )}
              </h3>
            </div>

            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="notched-header-trigger notched-header-trigger-proj"
              title="Crear proyecto"
            >
              <svg 
                className="notched-trigger-svg" 
                width="64" 
                height="50" 
                viewBox="0 0 64 50" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="headerNotchProjGrad" x1="64" y1="0" x2="0" y2="50" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 64 0 C 64 6, 58 12, 52 12 H 16 C 8 12, 2 18, 2 25 C 2 32, 8 38, 16 38 H 52 C 58 38, 64 44, 64 50 Z" 
                  fill="url(#headerNotchProjGrad)" 
                  stroke="none" 
                />
              </svg>
              <div className="notched-trigger-content">
                <FolderPlus className="w-5 h-5 text-[#f49d37]" />
              </div>
            </button>
          </div>

          {/* Projects List with Liquid Glass Style */}
          <div className="hub-cards-list">
            {displayProjects.map((proj) => {
              const isHighlighted = showConnections && hoveredTeamId === proj.teamId;
              const isDimmed = showConnections && hoveredTeamId !== null && hoveredTeamId !== proj.teamId;

              return (
                <div
                  key={proj.id}
                  data-proj-card-id={proj.id}
                  data-proj-team-id={proj.teamId}
                  onClick={() => onSelectProject && onSelectProject(proj)}
                  onMouseEnter={() => showConnections && setHoveredTeamId(proj.teamId)}
                  onMouseLeave={() => setHoveredTeamId(null)}
                  className={`hub-card project-card ${isHighlighted ? 'is-highlighted-group' : ''} ${isDimmed ? 'is-dimmed-group' : ''}`}
                  style={{ '--active-accent': proj.accentColor }}
                >
                  {/* Card Header: Icon + Title & Team */}
                  <div className="card-top-row">
                    <div className="card-header-identity">
                      <Hash 
                        className="card-header-icon"
                        style={{ color: proj.accentColor }} 
                      />
                      <div className="card-title-group">
                        <h4 className="card-title">{proj.name}</h4>
                        <div className="card-team-inline">
                          <span 
                            className="team-indicator-dot" 
                            style={{ backgroundColor: proj.accentColor }} 
                          />
                          <span className="card-subtext">{proj.teamName}</span>
                        </div>
                      </div>
                    </div>

                    <span className="card-time-badge">{proj.lastActive}</span>
                  </div>

                  {/* Card Body: Tracking Metric */}
                  <div className="card-metric-box">
                    <span className="metric-count">{proj.itemCount}</span>
                    <span className="metric-label">filas en seguimiento</span>
                  </div>

                  {/* Card Footer: Status & Action Arrow */}
                  <div className="card-footer-row">
                    <div className="card-status-indicator">
                      <span className="status-dot-pulse" />
                      <span>Activo</span>
                    </div>

                    <ArrowRight className="card-arrow-icon card-arrow-primary" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Floating Modal: Team Projects on Click */}
      {selectedTeamForModal && (
        <div className="modal-overlay" onClick={() => setSelectedTeamForModal(null)}>
          <div className="modal-content-card team-projects-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedTeamForModal.accentColor }}
                />
                <div>
                  <h3 className="modal-title">{selectedTeamForModal.name}</h3>
                  <p className="text-xs text-slate-400">Proyectos asociados a este equipo</p>
                </div>
              </div>

              <button onClick={() => setSelectedTeamForModal(null)} className="modal-close-btn">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body">
              <div className="team-projects-grid">
                {projects
                  .filter((p) => p.teamId === selectedTeamForModal.id)
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedTeamForModal(null);
                        if (onSelectProject) onSelectProject(p);
                      }}
                      className="team-project-item-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-heading font-bold text-sm text-white">{p.name}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{p.itemCount} elementos</span>
                        <span className="text-[11px] text-slate-500">{p.lastActive}</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Crear Nuevo Equipo (Notched Side Dock — Izquierda) */}
      {isCreateTeamOpen && (
        <div className={`marfil-drawer-layer marfil-drawer-layer-left ${isClosingTeam ? 'is-closing' : ''}`}>
          <div className="marfil-drawer-backdrop" onClick={closeTeamModal} />
          <div className={`single-notch-dock single-notch-dock-left ${isClosingTeam ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <svg 
              className="single-notch-svg single-notch-svg-left" 
              width="440" 
              height="580" 
              viewBox="0 0 440 580" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="singleNotchLeftGrad" x1="0" y1="0" x2="440" y2="580" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.07)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
                </linearGradient>
              </defs>
              <path 
                d="M 0 0 C 0 18, 18 36, 36 36 H 408 C 424 36, 440 48, 440 64 V 516 C 440 532, 424 544, 408 544 H 36 C 18 544, 0 562, 0 580 Z" 
                fill="url(#singleNotchLeftGrad)" 
                stroke="none" 
              />
            </svg>

            <div className="single-notch-content">
              <div className="modal-header-glass">
                <div className="modal-header-badge modal-header-badge-team">
                  <Users className="w-5 h-5 text-[#3f88c5]" />
                </div>
                <div>
                  <h3 className="modal-title">Crear Nuevo Equipo</h3>
                  <p className="modal-subtitle">Organizá colaboradores y asigná proyectos</p>
                </div>
              </div>

              <form onSubmit={handleCreateTeam} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Nombre del Equipo</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Mobile Growth, Data Science"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    placeholder="Propósito u objetivos de este equipo..."
                    value={newTeamDesc}
                    onChange={(e) => setNewTeamDesc(e.target.value)}
                    className="form-input form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Color de Identidad</label>
                  <div className="flex items-center gap-3 pt-1">
                    {['#3f88c5', '#f49d37', '#d72638', '#8b5cf6', '#10b981'].map((col) => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setNewTeamColor(col)}
                        className={`w-7 h-7 rounded-full transition-all ${newTeamColor === col ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#140f2d]' : 'opacity-70 hover:opacity-100 hover:scale-110'}`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>

                <div className="modal-actions pt-2">
                  <button type="button" onClick={closeTeamModal} className="btn-secondary inline-flex items-center gap-1.5">
                    <span>Cancelar</span>
                  </button>
                  <button type="submit" className="btn-primary inline-flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    <span>Crear Equipo</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Crear Nuevo Proyecto (Notched Side Dock — Derecha) */}
      {isCreateProjectOpen && (
        <div className={`marfil-drawer-layer marfil-drawer-layer-right ${isClosingProject ? 'is-closing' : ''}`}>
          <div className="marfil-drawer-backdrop" onClick={closeProjectModal} />
          <div className={`single-notch-dock single-notch-dock-right ${isClosingProject ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <svg 
              className="single-notch-svg single-notch-svg-right" 
              width="440" 
              height="500" 
              viewBox="0 0 440 500" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="singleNotchRightGrad" x1="440" y1="0" x2="0" y2="500" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.07)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
                </linearGradient>
              </defs>
              <path 
                d="M 440 0 C 440 18, 422 36, 404 36 H 32 C 16 36, 0 48, 0 64 V 436 C 0 452, 16 464, 32 464 H 404 C 422 464, 440 482, 440 500 Z" 
                fill="url(#singleNotchRightGrad)" 
                stroke="none" 
              />
            </svg>

            <div className="single-notch-content">
              <div className="modal-header-glass">
                <div className="modal-header-badge modal-header-badge-proj">
                  <Layers className="w-5 h-5 text-[#f49d37]" />
                </div>
                <div>
                  <h3 className="modal-title">Crear Nuevo Proyecto</h3>
                  <p className="modal-subtitle">Iniciá un espacio de seguimiento para tu equipo</p>
                </div>
              </div>

              <form onSubmit={handleCreateProject} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Nombre del Proyecto</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Rediseño Checkout, API v2"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Equipo Responsable</label>
                  <select
                    value={newProjTeamId}
                    onChange={(e) => setNewProjTeamId(e.target.value)}
                    className="form-input form-select"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#140f2d] text-white">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-actions pt-4">
                  <button type="button" onClick={closeProjectModal} className="btn-secondary inline-flex items-center gap-1.5">
                    <span>Cancelar</span>
                  </button>
                  <button type="submit" className="btn-primary inline-flex items-center gap-1.5">
                    <FolderPlus className="w-4 h-4" />
                    <span>Crear Proyecto</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
