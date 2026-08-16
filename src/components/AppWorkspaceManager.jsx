import React, { useState, useEffect } from 'react';
import WorkspaceHub from './WorkspaceHub.jsx';
import SheetTableApp from './SheetTableApp.jsx';
import InviteModal from './InviteModal.jsx';
import FloatingToolsDock from './FloatingToolsDock.jsx';

export default function AppWorkspaceManager({ initialView = 'hub', currentUser }) {
  // Check URL parameters for project selection
  const [activeProject, setActiveProject] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const projParam = params.get('project');
      if (projParam) {
        return {
          id: projParam,
          name: projParam === 'core' ? 'ProjectTracker Core' : projParam,
          teamName: 'Engineering Team',
        };
      }
    }
    return {
      id: 'core',
      name: 'ProjectTracker Core',
      teamName: 'Engineering Team',
    };
  });

  const [isHubView] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (v === 'hub') return true;
      if (v && v !== 'hub') return false;
      return !params.get('project');
    }
    return initialView === 'hub';
  });

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  // Contextual data for the invite modal (preselected team, initial tab, teams)
  const [inviteContext, setInviteContext] = useState({ preselectedTeam: null, activeTab: 'invite', teams: [] });

  useEffect(() => {
    const handleOpenInvite = (e) => {
      const detail = e.detail || {};
      setInviteContext({
        preselectedTeam: detail.preselectedTeam || null,
        activeTab: detail.activeTab || 'invite',
        teams: detail.teams || [],
      });
      setIsInviteOpen(true);
    };
    window.addEventListener('open-invite-modal', handleOpenInvite);
    return () => window.removeEventListener('open-invite-modal', handleOpenInvite);
  }, []);

  const handleSelectProject = (project) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/app?project=${project.id}&view=ideas`;
    }
  };

  const handleBackToHub = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/app?view=hub`;
    }
  };

  return (
    <div className="workspace-manager-root">
      {isHubView ? (
        <main className="app-main-workspace animate-fade-in">
          <WorkspaceHub
            currentUser={currentUser}
            onSelectProject={handleSelectProject}
          />
        </main>
      ) : (
        <main className="app-main-workspace animate-fade-in">
          <SheetTableApp
            initialView={initialView === 'hub' ? 'ideas' : initialView}
            currentUser={currentUser}
            activeProject={activeProject}
            onBackToHub={handleBackToHub}
          />
        </main>
      )}

      {/* Global Team / Project Invite Modal */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => {
          setIsInviteOpen(false);
          setInviteContext({ preselectedTeam: null, activeTab: 'invite', teams: [] });
        }}
        projectId={activeProject?.id || 'default-project'}
        projectName={activeProject?.name || 'Espacio de Trabajo'}
        teamName={inviteContext.preselectedTeam?.name || activeProject?.teamName}
        teamColor={inviteContext.preselectedTeam?.accentColor || activeProject?.accentColor}
        preselectedTeam={inviteContext.preselectedTeam}
        initialTab={inviteContext.activeTab}
        teams={inviteContext.teams}
      />
    </div>
  );
}
