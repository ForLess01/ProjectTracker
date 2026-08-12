import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Crown, User, Check, Copy, RefreshCw, Link as LinkIcon, Hash, Ban, Clock, LogIn, ArrowRight, ChevronRight } from 'lucide-react';

export default function InviteModal({
  isOpen,
  onClose,
  projectName = 'Equipo',
  teamName: initialTeamName,
  teamColor: initialTeamColor,
  preselectedTeam = null,
  initialTab = 'join',
  teams = []
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'join'); // 'join' | 'invite'
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isTeamDropOpen, setIsTeamDropOpen] = useState(false);
  const selectRef = useRef(null);

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  const [role, setRole] = useState('member'); // 'member' | 'owner'
  const [inviteCode, setInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRevoked, setIsRevoked] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const effectiveTeams = React.useMemo(() => {
    if (!teams || teams.length === 0) {
      return preselectedTeam ? [preselectedTeam] : [];
    }
    if (preselectedTeam && !teams.some((t) => t.id === preselectedTeam.id)) {
      return [preselectedTeam, ...teams];
    }
    return teams;
  }, [teams, preselectedTeam]);

  const currentSelectedTeam = effectiveTeams.find((t) => t.id === selectedTeamId) || preselectedTeam || null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsTeamDropOpen(false);
      }
    };
    if (isTeamDropOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTeamDropOpen]);

  // Generate a random team invite code (e.g., TRK-8F32X)
  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TRK-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'invite');
      if (preselectedTeam) {
        setSelectedTeamId(preselectedTeam.id);
      } else if (teams && teams.length > 0) {
        setSelectedTeamId(teams[0].id);
      } else {
        setSelectedTeamId('');
      }
      setInviteCode(generateCode());
      setIsRevoked(false);
      setCopiedCode(false);
      setCopiedLink(false);
      setJoinCodeInput('');
      setIsJoining(false);
      setJoinSuccess(false);
    }
  }, [isOpen, preselectedTeam, initialTab, teams]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 380);
  };

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://projecttracker.app';
  const inviteLink = isRevoked ? '' : `${currentDomain}/join?code=${inviteCode}&role=${role}${currentSelectedTeam ? `&team=${currentSelectedTeam.id}` : ''}`;

  const copyCode = () => {
    if (!inviteCode || isRevoked) return;
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    if (!inviteLink || isRevoked) return;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRegenerate = () => {
    setInviteCode(generateCode());
    setIsRevoked(false);
    setCopiedCode(false);
    setCopiedLink(false);
  };

  const handleRevoke = () => {
    setIsRevoked(true);
    setCopiedCode(false);
    setCopiedLink(false);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setIsJoining(true);
    setTimeout(() => {
      setIsJoining(false);
      setJoinSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className={`marfil-drawer-layer marfil-drawer-layer-left ${isClosing ? 'is-closing' : ''}`}>
      <div className="marfil-drawer-backdrop" onClick={handleClose} />
      <div className={`single-notch-dock single-notch-dock-left ${isClosing ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Dock SVG Contour */}
        <svg 
          className="single-notch-svg single-notch-svg-left" 
          width="440" 
          height="580" 
          viewBox="0 0 440 580" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="singleNotchInviteGrad" x1="0" y1="0" x2="440" y2="580" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.07)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
            </linearGradient>
          </defs>
          <path 
            d="M 0 0 C 0 18, 18 36, 36 36 H 408 C 424 36, 440 48, 440 64 V 516 C 440 532, 424 544, 408 544 H 36 C 18 544, 0 562, 0 580 Z" 
            fill="url(#singleNotchInviteGrad)" 
            stroke="none" 
          />
        </svg>

        <div className="single-notch-content">
          {/* Header */}
          <div className="modal-header-glass">
            <div className="modal-header-identity">
              {activeTab === 'join' ? (
                <LogIn className="w-5 h-5 text-[#f49d37] flex-shrink-0" />
              ) : (
                <UserPlus className="w-5 h-5 text-[#3f88c5] flex-shrink-0" />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <h3 className="modal-title">
                  {activeTab === 'join' ? 'Unirse a un Equipo' : 'Invitar al Equipo'}
                </h3>
              </div>
            </div>

            {/* Quick Switch Tabs */}
            <div className="modal-header-switch-tabs">
              <button
                type="button"
                onClick={() => setActiveTab('join')}
                className={`btn-modal-tab ${activeTab === 'join' ? 'is-active-join' : ''}`}
              >
                Unirse
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('invite')}
                className={`btn-modal-tab ${activeTab === 'invite' ? 'is-active-invite' : ''}`}
              >
                Invitar
              </button>
            </div>
          </div>

          <div className="modal-form">
            {activeTab === 'join' ? (
              /* TAB 1: UNIRSE A UN EQUIPO */
              <form onSubmit={handleJoinSubmit} className="modal-tab-form">
                <div className="form-group">
                  <label className="form-label">Código de Invitación o Enlace</label>
                  <p className="modal-field-desc">
                    Ingresa el código que te compartió el propietario del equipo (ej: <span className="highlight-code">TRK-8F32X</span>) o pega el enlace completo.
                  </p>

                  <div className="invite-link-input-box invite-join-input-box">
                    <Hash className="w-4 h-4 text-[#f49d37] flex-shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="TRK-8F32X o pega el enlace..."
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      className="invite-join-input"
                    />
                  </div>
                </div>

                {joinSuccess ? (
                  <div className="join-success-banner animate-fade-in">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>¡Te has unido al equipo con éxito!</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isJoining || !joinCodeInput.trim()}
                    className="btn-modal-submit-gradient"
                  >
                    {isJoining ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verificando código...</span>
                      </>
                    ) : (
                      <>
                        <span>Unirse al Equipo</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                <div className="modal-info-note">
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Si no tienes un código, pídele al administrador del equipo que genere uno desde la pestaña Invitar.</span>
                </div>
              </form>
            ) : (
              /* TAB 2: INVITAR AL EQUIPO (GENERAR CÓDIGO) */
              <>
                {/* Custom Glass Team Selection Dropdown */}
                {effectiveTeams.length > 0 && (
                  <div className="form-group" ref={selectRef}>
                    <div className="custom-select-wrapper">
                      <button
                        type="button"
                        className="custom-select-trigger"
                        onClick={() => setIsTeamDropOpen((prev) => !prev)}
                        aria-haspopup="listbox"
                        aria-expanded={isTeamDropOpen}
                      >
                        {currentSelectedTeam ? (
                          <span className="custom-select-value">
                            <span
                              className="custom-select-dot"
                              style={{ backgroundColor: currentSelectedTeam.accentColor || '#3f88c5' }}
                            />
                            {currentSelectedTeam.name}
                          </span>
                        ) : (
                          <span className="custom-select-placeholder">Seleccionar equipo</span>
                        )}
                        <ChevronRight
                          className={`custom-select-chevron ${isTeamDropOpen ? 'is-open' : ''}`}
                        />
                      </button>

                      {isTeamDropOpen && (
                        <ul className="custom-select-dropdown" role="listbox">
                          {effectiveTeams.map((t) => {
                            const isSelected = selectedTeamId === t.id;
                            return (
                              <li
                                key={t.id}
                                role="option"
                                aria-selected={isSelected}
                                className={`custom-select-option ${isSelected ? 'is-selected' : ''}`}
                                onClick={() => {
                                  setSelectedTeamId(t.id);
                                  setIsTeamDropOpen(false);
                                }}
                              >
                                <span
                                  className="custom-select-dot"
                                  style={{ backgroundColor: t.accentColor || '#3f88c5' }}
                                />
                                <span>{t.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-[#60a5fa]" />}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
                {/* Role Selection Tabs */}
                <div className="form-group">
                  <label className="form-label">Rol a Asignar</label>
                  <div className="invite-role-selector">
                    <button
                      type="button"
                      onClick={() => setRole('member')}
                      className={`invite-role-btn ${role === 'member' ? 'is-active' : ''}`}
                    >
                      <User className="role-btn-icon text-[#38bdf8]" />
                      <div className="role-btn-content">
                        <span className="role-btn-title">Miembro</span>
                        <span className="role-btn-desc">Editar y colaborar</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('owner')}
                      className={`invite-role-btn ${role === 'owner' ? 'is-active' : ''}`}
                    >
                      <Crown className="role-btn-icon text-[#f49d37]" />
                      <div className="role-btn-content">
                        <span className="role-btn-title">Propietario</span>
                        <span className="role-btn-desc">Control total</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Code Box */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label">Código de Unión</label>
                    <button 
                      type="button" 
                      onClick={handleRegenerate}
                      className="btn-regenerate-code"
                      title="Generar nuevo código"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerar</span>
                    </button>
                  </div>

                  <div className={`invite-code-card ${isRevoked ? 'is-revoked' : ''}`}>
                    <div className="invite-code-display">
                      <Hash className="w-4 h-4 text-slate-400" />
                      <span className={`invite-code-text ${isRevoked ? 'text-red-400 line-through opacity-60' : ''}`}>
                        {isRevoked ? 'REVOCADO' : inviteCode}
                      </span>
                    </div>
                    {!isRevoked && (
                      <button
                        type="button"
                        onClick={copyCode}
                        className="btn-icon-copy"
                        title="Copiar código de unión"
                        aria-label="Copiar código de unión"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Link Box */}
                <div className="form-group">
                  <label className="form-label">Enlace de Invitación Directo</label>
                  <div className="invite-link-row">
                    <div className={`invite-link-input-box ${isRevoked ? 'opacity-50' : ''}`}>
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <input
                        type="text"
                        readOnly
                        value={isRevoked ? 'Este enlace ha sido revocado' : inviteLink}
                        className="invite-link-input"
                      />
                    </div>
                    {!isRevoked && (
                      <button
                        type="button"
                        onClick={copyLink}
                        className="btn-icon-copy"
                        title="Copiar enlace directo"
                        aria-label="Copiar enlace directo"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Revoke Invitation Action & Expiration Note inline */}
                <div className="revoke-expiration-row" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {!isRevoked ? (
                    <button
                      type="button"
                      onClick={handleRevoke}
                      className="btn-revoke-invite"
                      title="Revocar y anular este enlace y código"
                      style={{ flexShrink: 0, margin: 0 }}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Revocar</span>
                    </button>
                  ) : (
                    <div className="revoked-banner" style={{ flexShrink: 0, margin: 0 }}>
                      <span className="text-red-400 text-xs font-semibold">Revocado</span>
                      <button
                        type="button"
                        onClick={handleRegenerate}
                        className="btn-regenerate-inline"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Nuevo enlace</span>
                      </button>
                    </div>
                  )}

                  <div className="invite-expiration-note" style={{ width: 'auto', flex: 1, margin: 0, paddingTop: 0, fontSize: '0.7rem', opacity: 0.85 }}>
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>El enlace vence automáticamente en 3 días si no se revoca antes.</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
