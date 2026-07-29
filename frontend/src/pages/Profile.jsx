import { useState } from 'react';
import { User, Lock, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Section({ title, children }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ fontSize: '0.9rem', fontWeight: 600, paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Alert({ type, message }) {
  const isError = type === 'error';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: isError ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
        border: `1px solid ${isError ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
        borderRadius: '0.5rem',
        padding: '0.75rem',
        fontSize: '0.875rem',
        color: isError ? 'var(--color-danger)' : 'var(--color-success)'
      }}
    >
      {isError ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
      {message}
    </div>
  );
}

export default function Profile() {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!profileForm.name.trim()) {
      setProfileMsg({ type: 'error', text: 'Name is required.' });
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile(profileForm.name, profileForm.email);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      alert('Type DELETE to confirm account deletion.');
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Profile & Settings</h1>

      {/* Profile Details */}
      <Section title="Profile Details">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.75rem' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 600 }}>{user?.name}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Member since {new Date(user?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {profileMsg && <Alert type={profileMsg.type} message={profileMsg.text} />}
          <div>
            <label className="label" htmlFor="profileName">Full Name</label>
            <input
              id="profileName"
              className="input"
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="profileEmail">Email</label>
            <input
              id="profileEmail"
              className="input"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={savingProfile} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', alignSelf: 'flex-start' }}>
            <User size={14} /> {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Section>

      {/* Change Password */}
      <Section title="Change Password">
        <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {passwordMsg && <Alert type={passwordMsg.type} message={passwordMsg.text} />}
          {[
            { id: 'currentPwd', label: 'Current Password', key: 'currentPassword' },
            { id: 'newPwd', label: 'New Password', key: 'newPassword' },
            { id: 'confirmPwd', label: 'Confirm New Password', key: 'confirmPassword' }
          ].map(({ id, label, key }) => (
            <div key={id}>
              <label className="label" htmlFor={id}>{label}</label>
              <input
                id={id}
                className="input"
                type="password"
                value={passwordForm[key]}
                onChange={(e) => setPasswordForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
          ))}
          <button type="submit" className="btn-primary" disabled={savingPassword} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', alignSelf: 'flex-start' }}>
            <Lock size={14} /> {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </Section>

      {/* Danger Zone */}
      <Section title="Danger Zone">
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          Deleting your account is permanent. All your notes and categories will be removed immediately and cannot be recovered.
        </p>
        <div>
          <label className="label" htmlFor="deleteConfirm">Type DELETE to confirm</label>
          <input
            id="deleteConfirm"
            className="input"
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
            style={{ borderColor: deleteConfirm === 'DELETE' ? 'var(--color-danger)' : undefined }}
          />
        </div>
        <button
          className="btn-danger"
          onClick={handleDeleteAccount}
          disabled={deleting || deleteConfirm !== 'DELETE'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', alignSelf: 'flex-start' }}
        >
          <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete My Account'}
        </button>
      </Section>
    </div>
  );
}
