import React, { useState } from 'react';
import { Layers, ChevronDown, Star, Users, Check, Sparkles, FolderPlus } from 'lucide-react';

export default function ProjectSelectorHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const projects = [
    { id: '1', name: 'ProjectTracker Core', team: 'Engineering Team', frequent: true, active: true },
    { id: '2', name: 'Design System & Glass UI', team: 'Product & Design', frequent: true, active: false },
    { id: '3', name: 'Mobile SDK Native', team: 'Mobile Team', frequent: true, active: false },
    { id: '4', name: 'API Gateway Backend', team: 'Infrastructure', frequent: false, active: false },
  ];

  const activeProject = projects.find((p) => p.active) || projects[0];
  const frequentProjects = projects.filter((p) => p.frequent);

  return (
    <div className="project-selector-wrapper">
      <div className="project-selector-bar">
        {/* Active Project Button */}
        <div className="project-selector-dropdown-container">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="project-selector-trigger-btn"
          >
            <div className="project-icon-badge">
              <Layers className="w-4 h-4 text-[#3f88c5]" />
            </div>
            <div className="project-trigger-text">
              <span className="project-team-label">{activeProject.team}</span>
              <span className="project-name-label">{activeProject.name}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Switcher Dropdown */}
          {isOpen && (
            <div className="project-dropdown-menu">
              <div className="project-dropdown-section">
                <span className="project-dropdown-header">
                  <Star className="w-3.5 h-3.5 text-[#f49d37]" />
                  <span>Sugerencias Frecuentes</span>
                </span>
                {frequentProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    className={`project-dropdown-item ${p.active ? 'active' : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="project-item-bullet"></div>
                      <div className="flex flex-col text-left">
                        <span className="project-item-title">{p.name}</span>
                        <span className="project-item-team">{p.team}</span>
                      </div>
                    </div>
                    {p.active && <Check className="w-4 h-4 text-[#3f88c5]" />}
                  </button>
                ))}
              </div>

              <div className="project-dropdown-divider"></div>

              <div className="project-dropdown-section">
                <span className="project-dropdown-header">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Equipos & Proyectos</span>
                </span>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    className={`project-dropdown-item ${p.active ? 'active' : ''}`}
                  >
                    <span className="project-item-title">{p.name}</span>
                    <span className="project-item-team">{p.team}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Frequent Chips */}
        <div className="project-frequent-chips">
          <span className="frequent-label">Frecuentes:</span>
          {frequentProjects.map((p) => (
            <button
              key={p.id}
              className={`frequent-chip ${p.active ? 'active' : ''}`}
            >
              <Sparkles className="w-3 h-3 text-[#f49d37]" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
