import React, { useState } from 'react';
import WorkspaceHub from './WorkspaceHub.jsx';
import SheetTableApp from './SheetTableApp.jsx';

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
      id: 'proj-1',
      name: 'ProjectTracker Core',
      teamName: 'Engineering Team',
    };
  });

  const [isHubView] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'hub' || !params.get('project');
    }
    return initialView === 'hub';
  });

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
    </div>
  );
}
