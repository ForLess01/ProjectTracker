import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { 
  Users, Layers, Plus, Sparkles, MoreHorizontal, Shield, Crown, User, 
  CornerRightUp, X, ChevronRight, Hash, UserPlus, FolderPlus, Workflow, Search, Check, Link as LinkIcon,
  Pencil, Lock, Archive, SlidersHorizontal, Clock
} from 'lucide-react';
import FloatingToolsDock from './FloatingToolsDock.jsx';

export default function WorkspaceHub({ onSelectProject, currentUser }) {
  // Multi-selection tool mode states
  const [activeTool, setActiveTool] = useState(null); // 'edit' | 'archive' | 'delete' | null
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

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
      description: 'Backend de seguimiento, autenticación y API REST principal.',
      teamId: 'team-eng',
      teamName: 'Engineering Team',
      accentColor: '#3f88c5',
      itemCount: 24,
      isFrequent: true,
      lastActive: '5m',
    },
    {
      id: 'proj-2',
      name: 'Design System & Glass UI',
      description: 'Tokens, componentes Liquid Glass y guía de estilo unificada.',
      teamId: 'team-design',
      teamName: 'Product & Design',
      accentColor: '#f49d37',
      itemCount: 16,
      isFrequent: true,
      lastActive: '1h',
    },
    {
      id: 'proj-3',
      name: 'Mobile SDK Native',
      description: 'SDK para iOS y Android con soporte offline y sincronización.',
      teamId: 'team-mobile',
      teamName: 'Mobile App Team',
      accentColor: '#8b5cf6',
      itemCount: 19,
      isFrequent: true,
      lastActive: '3h',
    },
    {
      id: 'proj-4',
      name: 'API Gateway Backend',
      description: 'Gateway de microservicios con rate limiting, logging y caché.',
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
      description: 'Flujo de incorporación, A/B tests y conversión de leads.',
      teamId: 'team-growth',
      teamName: 'Growth & Marketing',
      accentColor: '#d72638',
      itemCount: 12,
      isFrequent: true,
      lastActive: '2d',
    },
    {
      id: 'proj-6',
      name: 'Figma Token Sync',
      description: 'Pipeline de sincronización automática de tokens de diseño a código.',
      teamId: 'team-design',
      teamName: 'Product & Design',
      accentColor: '#f49d37',
      itemCount: 8,
      isFrequent: true,
      lastActive: '3d',
    },
    {
      id: 'proj-7',
      name: 'Push Notification Service',
      description: 'Infraestructura de notificaciones push multicanal con FCM y APNs.',
      teamId: 'team-mobile',
      teamName: 'Mobile App Team',
      accentColor: '#8b5cf6',
      itemCount: 14,
      isFrequent: true,
      lastActive: '4d',
    },
    {
      id: 'proj-8',
      name: 'Analytics Dashboard',
      description: 'Panel de métricas de retención, embudo y cohortes en tiempo real.',
      teamId: 'team-growth',
      teamName: 'Growth & Marketing',
      accentColor: '#d72638',
      itemCount: 17,
      isFrequent: true,
      lastActive: '5d',
    },
    {
      id: 'proj-9',
      name: 'Database Sharding & Cache',
      description: 'Estrategia de sharding, Redis cache y optimización de queries.',
      teamId: 'team-eng',
      teamName: 'Engineering Team',
      accentColor: '#3f88c5',
      itemCount: 9,
      isFrequent: true,
      lastActive: '1sem',
    },
    {
      id: 'proj-10',
      name: 'Dark Mode Liquid Theme',
      description: 'Tema oscuro premium con variables CSS y modo alto contraste.',
      teamId: 'team-design',
      teamName: 'Product & Design',
      accentColor: '#f49d37',
      itemCount: 11,
      isFrequent: true,
      lastActive: '1sem',
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
      setEditingTeam(null);
      setJustCreatedTeam(null);
    }, 380);
  };

  const closeProjectModal = () => {
    setIsProjTeamDropOpen(false);
    setIsClosingProject(true);
    setTimeout(() => {
      setIsCreateProjectOpen(false);
      setIsClosingProject(false);
      setEditingProject(null);
    }, 380);
  };

  const openCreateTeamModal = () => {
    setEditingTeam(null);
    setJustCreatedTeam(null);
    setNewTeamName('');
    setNewTeamDesc('');
    setNewTeamColor('#3f88c5');
    setIsCreateTeamOpen(true);
  };

  const openCreateProjectModal = () => {
    setEditingProject(null);
    setNewProjName('');
    setNewProjTeamId(selectedTeamFilter ? selectedTeamFilter.id : null);
    setIsCreateProjectOpen(true);
  };

  // Permissions logic for Edit Tool
  const canUserEditTeam = (team) => {
    return team.role === 'owner';
  };

  const canUserEditProject = (proj) => {
    // If project has no team assigned, any user in workspace is owner
    if (!proj.teamId) return true;
    const parentTeam = teams.find((t) => t.id === proj.teamId);
    return !parentTeam || parentTeam.role === 'owner';
  };

  // Search state & Time Filter state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const timeFilterDropdownRef = useRef(null);

  const timeFilterOptions = [
    { id: 'all', label: 'Todo', desc: 'Mostrar todos los proyectos' },
    { id: 'today', label: '24 hrs', desc: 'Actividad en las últimas 24h' },
    { id: 'week', label: 'Semana', desc: 'Actividad en los últimos 7 días' },
    { id: 'month', label: 'Mes', desc: 'Actividad en los últimos 30 días' },
  ];

  const matchesTimeFilter = (item, filter) => {
    if (!filter || filter === 'all') return true;
    const last = (item.lastActive || '').toLowerCase();
    if (filter === 'today') {
      return last.includes('m') || last.includes('h') || last.includes('ahora') || last.includes('justo');
    }
    if (filter === 'week') {
      return last.includes('m') || last.includes('h') || last.includes('ayer') || last.includes('d') || last.includes('ahora');
    }
    if (filter === 'month') {
      return last.includes('m') || last.includes('h') || last.includes('ayer') || last.includes('d') || last.includes('sem') || last.includes('ahora');
    }
    return true;
  };

  // Close time filter dropdown on click outside
  useEffect(() => {
    if (!isTimeFilterOpen) return;
    const handleClickOutside = (e) => {
      if (timeFilterDropdownRef.current && !timeFilterDropdownRef.current.contains(e.target)) {
        setIsTimeFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTimeFilterOpen]);

  // Truncate a string to `max` chars for display labels
  const truncateLabel = (str, max = 24) =>
    str.length > max ? str.slice(0, max) + '\u2026' : str;

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
        } else if (isTimeFilterOpen) {
          e.preventDefault();
          setIsTimeFilterOpen(false);
        } else if (isSearchOpen) {
          e.preventDefault();
          setIsSearchOpen(false);
          setSearchQuery('');
          setTimeFilter('all');
          setIsTimeFilterOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isCreateTeamOpen, isCreateProjectOpen, isTimeFilterOpen]);

  const baseTeams = teams.filter((t) => (showArchivedOnly ? Boolean(t.isArchived) : !t.isArchived));
  const baseProjects = projects.filter((p) => (showArchivedOnly ? Boolean(p.isArchived) : !p.isArchived));

  const filteredProjects = selectedTeamFilter
    ? baseProjects.filter((p) => p.teamId === selectedTeamFilter.id)
    : baseProjects;

  const displayTeams = searchQuery.trim()
    ? baseTeams.filter(
        (t) =>
          (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : baseTeams;

  const displayProjects = (searchQuery.trim()
    ? baseProjects.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.teamName || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProjects).filter((p) => matchesTimeFilter(p, timeFilter));

  // Multi-select mass selection handlers (Toggle All / Deselect All)
  const isAllTeamsSelected = displayTeams.length > 0 && displayTeams.every((t) => selectedTeamIds.includes(t.id));
  const isAllProjectsSelected = displayProjects.length > 0 && displayProjects.every((p) => selectedProjectIds.includes(p.id));

  const handleToggleAllTeams = () => {
    setSelectedTeamIds((prev) => {
      const allTeamIds = displayTeams.map((t) => t.id);
      const allSelected = allTeamIds.length > 0 && allTeamIds.every((id) => prev.includes(id));
      return allSelected ? [] : allTeamIds;
    });
  };

  const handleToggleAllProjects = () => {
    setSelectedProjectIds((prev) => {
      const allProjIds = displayProjects.map((p) => p.id);
      const allSelected = allProjIds.length > 0 && allProjIds.every((id) => prev.includes(id));
      return allSelected ? [] : allProjIds;
    });
  };

  const handleCommitArchive = () => {
    if (selectedTeamIds.length === 0 && selectedProjectIds.length === 0) return;
    const newArchivedStatus = !showArchivedOnly;

    if (selectedTeamIds.length > 0) {
      setTeams((prev) =>
        prev.map((t) =>
          selectedTeamIds.includes(t.id) ? { ...t, isArchived: newArchivedStatus } : t
        )
      );
    }

    if (selectedProjectIds.length > 0) {
      setProjects((prev) =>
        prev.map((p) =>
          selectedProjectIds.includes(p.id) ? { ...p, isArchived: newArchivedStatus } : p
        )
      );
    }
  };

  const handleCommitDelete = () => {
    if (selectedTeamIds.length === 0 && selectedProjectIds.length === 0) return;

    if (selectedTeamIds.length > 0) {
      setTeams((prev) => prev.filter((t) => !selectedTeamIds.includes(t.id)));
      setProjects((prev) => prev.filter((p) => !selectedTeamIds.includes(p.teamId)));
    }

    if (selectedProjectIds.length > 0) {
      setProjects((prev) => prev.filter((p) => !selectedProjectIds.includes(p.id)));
    }
  };

  const handleSelectTool = (tool) => {
    if (activeTool === 'archive' && (selectedTeamIds.length > 0 || selectedProjectIds.length > 0)) {
      handleCommitArchive();
    } else if (activeTool === 'delete' && (selectedTeamIds.length > 0 || selectedProjectIds.length > 0)) {
      handleCommitDelete();
    }
    setActiveTool(tool);
    setSelectedTeamIds([]);
    setSelectedProjectIds([]);
  };

  const handleClearSelection = () => {
    setActiveTool(null);
    setSelectedTeamIds([]);
    setSelectedProjectIds([]);
  };

  // Group hover state & connected SVG curves
  const containerRef = useRef(null);
  const [showConnections, setShowConnections] = useState(true);
  const [hoveredTeamId, setHoveredTeamId] = useState(null);
  const [connectorLines, setConnectorLines] = useState([]);

  useEffect(() => {
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
    const rafId = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame(updateLines) : null;
    const tId1 = setTimeout(updateLines, 60);
    const tId2 = setTimeout(updateLines, 200);

    const container = containerRef.current;
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      resizeObserver = new ResizeObserver(() => updateLines());
      resizeObserver.observe(container);
    }

    window.addEventListener('resize', updateLines);
    window.addEventListener('scroll', updateLines, true);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(tId1);
      clearTimeout(tId2);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateLines);
      window.removeEventListener('scroll', updateLines, true);
    };
  }, [hoveredTeamId, showConnections, selectedTeamFilter, displayTeams, displayProjects, teams, projects]);

  // New team form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#3f88c5');
  const [justCreatedTeam, setJustCreatedTeam] = useState(null); // team object created but modal still open

  // New project form state
  const [newProjName, setNewProjName] = useState('');
  const [newProjTeamId, setNewProjTeamId] = useState(null); // null = no team
  const [isProjTeamDropOpen, setIsProjTeamDropOpen] = useState(false);
  const projTeamTriggerRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const updateDropdownPosition = useCallback(() => {
    if (projTeamTriggerRef.current) {
      const rect = projTeamTriggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  const toggleProjTeamDropdown = () => {
    if (!isProjTeamDropOpen) {
      updateDropdownPosition();
    }
    setIsProjTeamDropOpen((v) => !v);
  };

  useEffect(() => {
    if (!isProjTeamDropOpen) return;

    updateDropdownPosition();

    const handleScrollOrResize = () => {
      updateDropdownPosition();
    };

    const handleClickOutside = (e) => {
      if (
        projTeamTriggerRef.current &&
        !projTeamTriggerRef.current.contains(e.target) &&
        !e.target.closest('.custom-select-dropdown')
      ) {
        setIsProjTeamDropOpen(false);
      }
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProjTeamDropOpen, updateDropdownPosition]);

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    if (editingTeam) {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === editingTeam.id
            ? {
                ...t,
                name: newTeamName.trim(),
                description: newTeamDesc.trim() || t.description,
                accentColor: newTeamColor,
              }
            : t
        )
      );
      setEditingTeam(null);
      closeTeamModal();
    } else {
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
      setJustCreatedTeam(newTeam); // lock submit, show invite CTA
      // Don't close — let user hit "Invitar Equipo"
    }
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    const parentTeam = newProjTeamId ? teams.find((t) => t.id === newProjTeamId) : null;
    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                name: newProjName.trim(),
                teamId: parentTeam?.id || null,
                teamName: parentTeam?.name || 'Sin equipo',
                accentColor: parentTeam?.accentColor || '#64748b',
              }
            : p
        )
      );
      setEditingProject(null);
    } else {
      const newProject = {
        id: `proj-${Date.now()}`,
        name: newProjName.trim(),
        teamId: parentTeam?.id || null,
        teamName: parentTeam?.name || 'Sin equipo',
        accentColor: parentTeam?.accentColor || '#64748b',
        itemCount: 0,
        isFrequent: true,
        lastActive: 'Justo ahora',
      };
      setProjects((prev) => [newProject, ...prev]);
      if (parentTeam) {
        setTeams((prev) =>
          prev.map((t) =>
            t.id === parentTeam.id ? { ...t, projectsCount: t.projectsCount + 1 } : t
          )
        );
      }
    }
    setNewProjName('');
    setNewProjTeamId(null);
    setIsProjTeamDropOpen(false);
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
          <div className="hub-search-overlay-mist" ref={timeFilterDropdownRef}>
            <input
              type="text"
              autoFocus
              maxLength={100}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Escribe para buscar proyectos o equipos..."
              className="hub-search-input"
              aria-label="Buscar equipos y proyectos"
            />
            
            <div className="search-actions-group">
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                  setTimeFilter('all');
                  setIsTimeFilterOpen(false);
                }}
                className="search-frameless-icon-btn"
                title="Cerrar búsqueda (Esc)"
              >
                <X className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsTimeFilterOpen((prev) => !prev)}
                className={`search-frameless-icon-btn ${timeFilter !== 'all' ? 'is-active-filter' : ''}`}
                title="Filtrar por tiempo"
                aria-label="Filtrar por tiempo"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {timeFilter !== 'all' && <span className="time-filter-dot" />}
              </button>
            </div>

            {/* Horizontal Filter Capsule Centered Under Searchbox */}
            {isTimeFilterOpen && (
              <div className="search-time-dropdown-menu">
                {timeFilterOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTimeFilter(opt.id);
                      setIsTimeFilterOpen(false);
                    }}
                    className={`time-dropdown-chip ${timeFilter === opt.id ? 'is-selected' : ''}`}
                    title={opt.desc}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
         {/* Archived Mode Indicator Banner */}
      {showArchivedOnly && (
        <div className="archived-view-banner animate-fade-in">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />
            <span>Estás viendo elementos archivados. Para restaurar, selecciona tarjetas y desmarca la herramienta Archivar.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowArchivedOnly(false)}
            className="btn-exit-archived"
          >
            Ver elementos activos
          </button>
        </div>
      )}

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
            <button
              onClick={openCreateTeamModal}
              className="notched-header-trigger notched-header-trigger-team"
              title="Crear equipo"
            >
              <div className="trigger-content-wrapper">
                <div className="trigger-title-default">
                  <Users className="w-5 h-5 text-[#3f88c5] flex-shrink-0" />
                  <h3 className="column-title">
                    {searchQuery.trim() ? `Equipos "${truncateLabel(searchQuery)}"` : 'Equipos'}
                    <span className="column-title-tag tag-blue">{displayTeams.length}</span>
                  </h3>
                </div>

                <div className="trigger-title-hover">
                  <UserPlus className="w-5 h-5 text-[#3f88c5] flex-shrink-0" />
                  <span className="hover-action-text text-[#3f88c5]">Crear Equipo</span>
                </div>
              </div>
            </button>
          </div>

          {/* Teams List */}
          <div className="hub-cards-list">
            {displayTeams.length > 0 ? (
              displayTeams.map((team) => {
                const isHighlighted = showConnections && hoveredTeamId === team.id;
                const isDimmed = showConnections && hoveredTeamId !== null && hoveredTeamId !== team.id;
                const isSelected = selectedTeamFilter?.id === team.id;
                const isCardMultiSelected = selectedTeamIds.includes(team.id);
                const isEditable = canUserEditTeam(team);

                return (
                  <div
                    key={team.id}
                    data-team-card-id={team.id}
                    onClick={() => {
                      if (activeTool === 'edit') {
                        if (isEditable) {
                          setEditingTeam(team);
                          setNewTeamName(team.name);
                          setNewTeamDesc(team.description || '');
                          setNewTeamColor(team.accentColor || '#3f88c5');
                          setIsCreateTeamOpen(true);
                        }
                      } else if (activeTool) {
                        setSelectedTeamIds((prev) =>
                          prev.includes(team.id) ? prev.filter((id) => id !== team.id) : [...prev, team.id]
                        );
                      } else {
                        setSelectedTeamFilter((prev) => (prev?.id === team.id ? null : team));
                      }
                    }}
                    onMouseEnter={() => showConnections && setHoveredTeamId(team.id)}
                    onMouseLeave={() => setHoveredTeamId(null)}
                    className={`hub-card team-card ${isHighlighted ? 'is-highlighted-group' : ''} ${isDimmed ? 'is-dimmed-group' : ''} ${isSelected ? 'is-team-selected' : ''} ${isCardMultiSelected ? 'is-card-multi-selected' : ''} ${activeTool === 'edit' ? (isEditable ? 'is-card-editable' : 'is-card-non-editable') : ''}`}
                    style={{ '--active-accent': team.accentColor }}
                  >
                    {/* Full-card selected dark translucent overlay with blur & centered check icon */}
                    {isCardMultiSelected && (
                      <div className="card-selected-overlay">
                        <div className="card-selected-check-pill">
                          <Check className="w-5 h-5 text-white stroke-[2.5]" />
                        </div>
                      </div>
                    )}

                    {/* Top-Right Corner Role Ribbon/Badge */}
                    {activeTool === 'edit' ? (
                      !isEditable && (
                        <div className="role-badge-corner role-badge-locked" title="Solo el propietario del equipo puede editarlo">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      )
                    ) : (
                      getRoleBadge(team.role)
                    )}

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
              })
            ) : (
              <div className="hub-empty-column-placeholder">
                <Users className="w-6 h-6 text-slate-500 mb-1" />
                <p className="text-xs text-slate-300 font-bold">
                  {showArchivedOnly ? 'No hay equipos archivados' : 'No hay equipos activos'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {showArchivedOnly ? 'Los equipos que archives aparecerán aquí.' : 'Crea un nuevo equipo desde el botón superior.'}
                </p>
                {!showArchivedOnly && teams.some((t) => t.isArchived) && (
                  <button
                    type="button"
                    onClick={() => setShowArchivedOnly(true)}
                    className="btn-exit-archived mt-2"
                  >
                    Ver archivados
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Divider between sections */}
        <div className="hub-columns-divider" />

        {/* Column 2: Proyectos (Projects) */}
        <div className="hub-column">
          <div className="hub-column-header">
            {selectedTeamFilter && !searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSelectedTeamFilter(null)}
                className="btn-clear-team-filter-pill animate-fade-in"
                title="Mostrar todos los proyectos"
                aria-label="Ver todos los proyectos"
              >
                <div className="btn-clear-icon-box">
                  <X className="w-3.5 h-3.5" />
                </div>
                <span className="btn-clear-expand-label">Ver todos</span>
              </button>
            )}

            <button
              onClick={openCreateProjectModal}
              className="notched-header-trigger notched-header-trigger-proj"
              title="Crear proyecto"
            >
              <div className="trigger-content-wrapper">
                <div className="trigger-title-default">
                  <Layers className="w-5 h-5 text-[#f49d37] flex-shrink-0" />
                  <h3 className="column-title">
                    {searchQuery.trim()
                      ? `Proyectos "${truncateLabel(searchQuery)}"`
                      : selectedTeamFilter
                      ? `Proyectos de ${truncateLabel(selectedTeamFilter.name, 20)}`
                      : 'Proyectos'}
                    <span className="column-title-tag tag-orange">{displayProjects.length}</span>
                  </h3>
                </div>

                <div className="trigger-title-hover">
                  <FolderPlus className="w-5 h-5 text-[#f49d37] flex-shrink-0" />
                  <span className="hover-action-text text-[#f49d37]">Crear Proyecto</span>
                </div>
              </div>
            </button>
          </div>

          {/* Projects List with Liquid Glass Style */}
          <div className="hub-cards-list">
            {displayProjects.length > 0 ? (
              displayProjects.map((proj) => {
                const isHighlighted = showConnections && hoveredTeamId === proj.teamId;
                const isDimmed = showConnections && hoveredTeamId !== null && hoveredTeamId !== proj.teamId;
                const isCardMultiSelected = selectedProjectIds.includes(proj.id);
                const isEditable = canUserEditProject(proj);

                return (
                  <div
                    key={proj.id}
                    data-proj-card-id={proj.id}
                    data-proj-team-id={proj.teamId}
                    onClick={() => {
                      if (activeTool === 'edit') {
                        if (isEditable) {
                          setEditingProject(proj);
                          setNewProjName(proj.name);
                          setNewProjTeamId(proj.teamId || null);
                          setIsCreateProjectOpen(true);
                        }
                      } else if (activeTool) {
                        setSelectedProjectIds((prev) =>
                          prev.includes(proj.id) ? prev.filter((id) => id !== proj.id) : [...prev, proj.id]
                        );
                      } else {
                        if (onSelectProject) onSelectProject(proj);
                      }
                    }}
                    onMouseEnter={() => showConnections && setHoveredTeamId(proj.teamId)}
                    onMouseLeave={() => setHoveredTeamId(null)}
                    className={`hub-card project-card ${isHighlighted ? 'is-highlighted-group' : ''} ${isDimmed ? 'is-dimmed-group' : ''} ${isCardMultiSelected ? 'is-card-multi-selected' : ''} ${activeTool === 'edit' ? (isEditable ? 'is-card-editable' : 'is-card-non-editable') : ''}`}
                    style={{ '--active-accent': proj.accentColor }}
                  >
                    {/* Full-card selected dark translucent overlay with blur & centered check icon */}
                    {isCardMultiSelected && (
                      <div className="card-selected-overlay">
                        <div className="card-selected-check-pill">
                          <Check className="w-5 h-5 text-white stroke-[2.5]" />
                        </div>
                      </div>
                    )}

                    {/* Top-Right Corner Locked Indicator during Edit Mode */}
                    {activeTool === 'edit' && !isEditable && (
                      <div className="role-badge-corner role-badge-locked" title="Solo el propietario del equipo asignado puede editar este proyecto">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    )}

                    {/* Card Header: Icon + Title & Team */}
                    <div className="card-top-row">
                      <div className="card-header-identity">
                        <Hash 
                          className="card-header-icon"
                          style={{ color: proj.accentColor }} 
                        />
                        <div className="card-title-group">
                          <h4 className="card-title">{proj.name}</h4>
                          <span className="card-subtext">{proj.teamName}</span>
                        </div>
                      </div>

                      <span className="card-time-badge">{proj.lastActive}</span>
                    </div>

                    {/* Card Body: Tracking Metric */}
                    <div className="card-metric-box">
                      <span className="metric-count">{proj.itemCount}</span>
                      <span className="metric-label">filas</span>
                    </div>

                    {/* Card Footer: Action Arrow */}
                    <div className="card-footer-row">
                      <CornerRightUp className="card-arrow-icon card-arrow-primary card-arrow-solo" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="hub-empty-column-placeholder">
                <Layers className="w-6 h-6 text-slate-500 mb-1" />
                <p className="text-xs text-slate-300 font-bold">
                  {showArchivedOnly ? 'No hay proyectos archivados' : 'No hay proyectos activos'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {showArchivedOnly ? 'Los proyectos que archives aparecerán aquí.' : 'Crea un nuevo proyecto desde el botón superior.'}
                </p>
                {!showArchivedOnly && projects.some((p) => p.isArchived) && (
                  <button
                    type="button"
                    onClick={() => setShowArchivedOnly(true)}
                    className="btn-exit-archived mt-2"
                  >
                    Ver archivados
                  </button>
                )}
              </div>
            )}
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
                <div className="modal-header-identity">
                  {editingTeam ? (
                    <Pencil className="w-5 h-5 text-[#38bdf8] flex-shrink-0" />
                  ) : (
                    <Users className="w-5 h-5 text-[#3f88c5] flex-shrink-0" />
                  )}
                  <h3 className="modal-title">{editingTeam ? 'Editar Equipo' : 'Nuevo Equipo'}</h3>
                </div>

                {!editingTeam && (
                  <button
                    type="button"
                    onClick={() => {
                      const teamToInvite = justCreatedTeam;
                      closeTeamModal();
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('open-invite-modal', {
                          detail: { preselectedTeam: teamToInvite, activeTab: 'invite', teams: teams }
                        }));
                      }, 420);
                    }}
                    className={`btn-expandable-invite ${justCreatedTeam ? 'is-invite-ready' : ''}`}
                    title="Invitar Equipo"
                  >
                    <div className="btn-icon-box">
                      <UserPlus className="w-4 h-4 text-white" />
                    </div>
                    <span className="btn-expand-label">
                      {justCreatedTeam ? 'Invitar ahora' : 'Invitar Equipo'}
                    </span>
                  </button>
                )}
              </div>

              <form onSubmit={handleCreateTeam} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Mobile Growth, Data Science"
                    value={justCreatedTeam ? justCreatedTeam.name : newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="form-input"
                    disabled={!!justCreatedTeam}
                    readOnly={!!justCreatedTeam}
                  />
                </div>

                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label">Descripción</label>
                    <span className="char-counter">{newTeamDesc.length}/160</span>
                  </div>
                  <textarea
                    maxLength={160}
                    placeholder="Propósito u objetivos de este equipo..."
                    value={newTeamDesc}
                    onChange={(e) => setNewTeamDesc(e.target.value)}
                    className="form-input form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Color de Identidad</label>
                  <div className="color-picker-group">
                    {['#3f88c5', '#f49d37', '#d72638', '#8b5cf6', '#10b981'].map((col) => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setNewTeamColor(col)}
                        className={`color-swatch-btn ${newTeamColor === col ? 'is-active' : ''}`}
                        style={{ '--swatch-color': col, backgroundColor: col }}
                        title={`Seleccionar color ${col}`}
                      />
                    ))}

                    <label 
                      className={`color-swatch-btn color-picker-custom-label ${!['#3f88c5', '#f49d37', '#d72638', '#8b5cf6', '#10b981'].includes(newTeamColor) ? 'is-active' : ''}`}
                      style={{ '--swatch-color': newTeamColor || '#3f88c5', backgroundColor: newTeamColor || '#3f88c5' }}
                      title="Elegir color personalizado"
                    >
                      <input
                        type="color"
                        value={newTeamColor.startsWith('#') ? newTeamColor : `#${newTeamColor}`}
                        onChange={(e) => setNewTeamColor(e.target.value)}
                        className="sr-only-color-input"
                      />
                      <Plus className="w-3.5 h-3.5 text-white/90 m-auto pointer-events-none" />
                    </label>

                    <div className="color-hex-input-wrapper">
                      <span className="hex-prefix">#</span>
                      <input
                        type="text"
                        maxLength={6}
                        value={newTeamColor ? newTeamColor.replace('#', '') : ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
                          setNewTeamColor(`#${val}`);
                        }}
                        placeholder="3F88C5"
                        className="form-input color-hex-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-actions pt-2">
                  {justCreatedTeam ? (
                    <div className="btn-create-success">
                      <Check className="w-4 h-4" />
                      <span>Equipo creado</span>
                    </div>
                  ) : (
                    <button type="submit" className="btn-primary inline-flex items-center gap-1.5">
                      {editingTeam ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      <span>{editingTeam ? 'Guardar Cambios' : 'Crear Equipo'}</span>
                    </button>
                  )}
                  <button type="button" onClick={closeTeamModal} className="btn-secondary inline-flex items-center gap-1.5">
                    <span>{justCreatedTeam ? 'Listo' : 'Cancelar'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Crear / Editar Proyecto (Notched Side Dock — Derecha) */}
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
                <div className="modal-header-identity">
                  {editingProject ? (
                    <Pencil className="w-5 h-5 text-[#38bdf8] flex-shrink-0" />
                  ) : (
                    <Layers className="w-5 h-5 text-[#f49d37] flex-shrink-0" />
                  )}
                  <h3 className="modal-title">{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
                </div>
              </div>

              <form onSubmit={handleCreateProject} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    placeholder="ej. Rediseño Checkout, API v2"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Custom team picker — no native <select> */}
                <div className="form-group">
                  <label className="form-label">Equipo Asignado <span className="form-label-optional">(opcional)</span></label>
                  <div className="custom-select-wrapper">
                    <button
                      ref={projTeamTriggerRef}
                      type="button"
                      className="custom-select-trigger"
                      onClick={toggleProjTeamDropdown}
                      aria-haspopup="listbox"
                      aria-expanded={isProjTeamDropOpen}
                    >
                      {newProjTeamId ? (
                        <span className="custom-select-value">
                          <span
                            className="custom-select-dot"
                            style={{ backgroundColor: teams.find(t => t.id === newProjTeamId)?.accentColor || '#64748b' }}
                          />
                          {teams.find(t => t.id === newProjTeamId)?.name}
                        </span>
                      ) : (
                        <span className="custom-select-placeholder">Sin equipo asignado</span>
                      )}
                      <ChevronRight
                        className={`custom-select-chevron ${isProjTeamDropOpen ? 'is-open' : ''}`}
                      />
                    </button>

                    {isProjTeamDropOpen && typeof document !== 'undefined' && ReactDOM.createPortal(
                      <ul
                        className="custom-select-dropdown custom-select-dropdown-portal"
                        role="listbox"
                        style={{
                          position: 'fixed',
                          top: `${dropdownPos.top}px`,
                          left: `${dropdownPos.left}px`,
                          width: `${dropdownPos.width}px`,
                          zIndex: 100005,
                        }}
                      >
                        {/* No-team option */}
                        <li
                          role="option"
                          aria-selected={newProjTeamId === null}
                          className={`custom-select-option ${newProjTeamId === null ? 'is-selected' : ''}`}
                          onClick={() => { setNewProjTeamId(null); setIsProjTeamDropOpen(false); }}
                        >
                          <span className="custom-select-dot" style={{ backgroundColor: '#475569' }} />
                          <span>Sin equipo asignado</span>
                          {newProjTeamId === null && <Check className="w-3.5 h-3.5 ml-auto text-[#60a5fa]" />}
                        </li>

                        {/* Separator */}
                        <li className="custom-select-separator" role="separator" />

                        {teams.map((t) => (
                          <li
                            key={t.id}
                            role="option"
                            aria-selected={newProjTeamId === t.id}
                            className={`custom-select-option ${newProjTeamId === t.id ? 'is-selected' : ''}`}
                            onClick={() => { setNewProjTeamId(t.id); setIsProjTeamDropOpen(false); }}
                          >
                            <span className="custom-select-dot" style={{ backgroundColor: t.accentColor }} />
                            <span>{t.name}</span>
                            {newProjTeamId === t.id && <Check className="w-3.5 h-3.5 ml-auto text-[#60a5fa]" />}
                          </li>
                        ))}
                      </ul>,
                      document.body
                    )}
                  </div>
                </div>

                <div className="modal-actions pt-4">
                  <button type="submit" className="btn-primary inline-flex items-center gap-1.5">
                    {editingProject ? <Check className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
                    <span>{editingProject ? 'Guardar Cambios' : 'Crear Proyecto'}</span>
                  </button>
                  <button type="button" onClick={closeProjectModal} className="btn-secondary inline-flex items-center gap-1.5">
                    <span>Cancelar</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Tools Dock with Selection & Mass Selection */}
      <FloatingToolsDock
        activeTool={activeTool}
        onSelectTool={handleSelectTool}
        selectedTeamIds={selectedTeamIds}
        selectedProjectIds={selectedProjectIds}
        isAllTeamsSelected={isAllTeamsSelected}
        isAllProjectsSelected={isAllProjectsSelected}
        onToggleAllTeams={handleToggleAllTeams}
        onToggleAllProjects={handleToggleAllProjects}
        showArchivedOnly={showArchivedOnly}
        onToggleViewArchived={() => setShowArchivedOnly((prev) => !prev)}
        onClearSelection={handleClearSelection}
      />

    </div>
  );
}
