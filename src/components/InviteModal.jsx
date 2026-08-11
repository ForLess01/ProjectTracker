import React, { useState } from 'react';
import { UserPlus, Mail, Shield, Check, Copy, X } from 'lucide-react';

export default function InviteModal({ isOpen, onClose, projectId = 'demo-project' }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setInviteLink('');

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, email, role }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const fullLink = `${window.location.origin}${data.inviteLink}`;
        setInviteLink(fullLink);
        setEmail('');
      } else {
        setError(data.error || 'Error al enviar invitación');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-card">
        
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon-badge">
              <UserPlus style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <h3 className="modal-title">Invitar al Equipo</h3>
              <p className="modal-subtitle">Agrega miembros para colaborar en el proyecto</p>
            </div>
          </div>

          <button onClick={onClose} className="modal-close-btn">
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        {error && (
          <div className="auth-alert" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem' }}>
              Correo Electrónico del Invitado
            </label>
            <div className="modal-input-wrapper">
              <Mail className="modal-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colaborador@equipo.com"
                required
                className="form-input modal-input-with-icon"
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem' }}>
              Rol en el Proyecto
            </label>
            <div className="modal-input-wrapper">
              <Shield className="modal-input-icon" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="modal-select"
              >
                <option value="member">Miembro (Puede crear y editar)</option>
                <option value="owner">Propietario (Control total del proyecto)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <UserPlus style={{ width: '1rem', height: '1rem' }} />
            <span>{loading ? 'Generando Invitación...' : 'Enviar Invitación'}</span>
          </button>
        </form>

        {inviteLink && (
          <div className="invite-link-box">
            <span className="invite-link-label">
              Enlace directo de invitación generado:
            </span>
            <div className="invite-link-row">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="invite-link-input"
              />
              <button onClick={copyToClipboard} className="btn-copy">
                {copied ? <Check style={{ width: '0.875rem', height: '0.875rem' }} /> : <Copy style={{ width: '0.875rem', height: '0.875rem' }} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
