import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { ApiError, getContent, getLpInquiries, getSubmissions, updateContent } from '../api';
import type { LpInquiry, Submission, TeamMember, WebsiteContent } from '../types';

const editableKeys = [
  ['heroHeadline', 'Hero headline'],
  ['heroSubhead', 'Hero subhead'],
  ['thesisHeading', 'Thesis heading'],
  ['thesisLeft', 'Thesis narrative — left'],
  ['thesisRight', 'Thesis narrative — right'],
  ['stackIntro', 'How we operate']
] as const;

export default function AdminDashboard() {
  const [token, setToken] = useState(() => sessionStorage.getItem('astra-admin-token') ?? '');
  const [accessToken, setAccessToken] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [lpInquiries, setLpInquiries] = useState<LpInquiry[]>([]);
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [teamDraft, setTeamDraft] = useState<TeamMember[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDashboard = useCallback(async (activeToken: string) => {
    setLoading(true);
    setError('');
    try {
      const [inquiries, investorInquiries, websiteContent] = await Promise.all([
        getSubmissions(activeToken),
        getLpInquiries(activeToken),
        getContent()
      ]);
      setSubmissions(inquiries);
      setLpInquiries(investorInquiries);
      setContent(websiteContent);
      setTeamDraft(Array.isArray(websiteContent.teamMembers) ? websiteContent.teamMembers : []);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        sessionStorage.removeItem('astra-admin-token');
        setToken('');
        setAccessToken('');
        setError('Your saved admin token is invalid or expired. Enter the current backend ADMIN_ACCESS_TOKEN.');
      } else {
        setError(cause instanceof Error ? cause.message : 'Unable to load dashboard.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) void loadDashboard(token);
  }, [token, loadDashboard]);

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const candidate = accessToken.trim();
    if (!candidate) {
      setError('Enter your admin access token.');
      setLoading(false);
      return;
    }
    sessionStorage.setItem('astra-admin-token', candidate);
    setToken(candidate);
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content || !token) return;
    const formData = new FormData(event.currentTarget);
    setStatus('');
    setError('');
    try {
      for (const [key] of editableKeys) {
        const value = formData.get(key);
        if (typeof value === 'string' && value !== content[key]) {
          await updateContent(token, key, value);
        }
      }
      if (JSON.stringify(teamDraft) !== JSON.stringify(content.teamMembers)) {
        await updateContent(token, 'teamMembers', teamDraft);
      }
      const freshContent = await getContent();
      setContent(freshContent);
      setTeamDraft(Array.isArray(freshContent.teamMembers) ? freshContent.teamMembers : []);
      setStatus('Content updates are live.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save content.');
    }
  }

  function updateMember(id: string, field: keyof TeamMember, value: string | string[]) {
    setTeamDraft((current) => current.map((member) => member.id === id ? { ...member, [field]: value } : member));
  }

  function addFounder() {
    setTeamDraft((current) => [...current, {
      id: crypto.randomUUID(),
      name: '',
      role: 'Founder',
      bio: '',
      affiliations: [],
      linkedinUrl: ''
    }]);
  }

  function removeFounder(id: string) {
    if (!window.confirm('Remove this profile from the public team section?')) return;
    setTeamDraft((current) => current.filter((member) => member.id !== id));
  }

  function disconnect() {
    sessionStorage.removeItem('astra-admin-token');
    setToken('');
    setAccessToken('');
    setContent(null);
    setTeamDraft([]);
    setSubmissions([]);
    setLpInquiries([]);
    setError('');
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a className="wordmark" href="/"><span className="wordmark-star">✳</span> ASTRA<span className="wordmark-light"> VENTURES</span></a>
        <a className="admin-back" href="/"><ArrowLeft size={15} /> View website</a>
      </header>
      <div className="admin-container">
        <div className="admin-title-row"><div><p className="eyebrow"><span /> COMMAND VIEW</p><h1>Inquiries</h1></div>{token && <button className="admin-refresh" onClick={() => void loadDashboard(token)} disabled={loading}><RefreshCw size={15} /> Refresh</button>}</div>
        {!token ? (
          <form className="admin-connect" onSubmit={connect}>
            <h2>Admin access</h2><p>Enter your access token to manage team profiles and review founder and LP inquiries.</p>
            <label>Admin access token<input type="password" value={accessToken} onChange={(event) => setAccessToken(event.target.value)} required autoComplete="current-password" /></label>
            {error && <p className="admin-error login-error">{error}</p>}
            <button className="button button-copper" type="submit" disabled={loading}>{loading ? 'Checking token…' : 'Continue'} <ArrowUpRight size={15} /></button>
          </form>
        ) : (
          <>
            <div className="admin-panel">
              <div className="admin-panel-heading"><div><span className="admin-kicker">FOUNDERS</span><h2>Founder inquiries <span className="inquiry-count">{submissions.length}</span></h2></div><button className="admin-text-button" onClick={disconnect}>Sign out</button></div>
              {loading ? <p className="admin-empty">Loading inquiries…</p> : error && !submissions.length ? <p className="admin-error">{error}</p> : submissions.length === 0 ? <p className="admin-empty">No founder inquiries yet.</p> : (
                <div className="table-scroll"><table className="inquiry-table"><thead><tr><th>Received</th><th>Founder</th><th>Company</th><th>Stage</th><th>What they’re building</th></tr></thead><tbody>
                  {submissions.map((submission) => <tr key={submission.id}><td className="date-cell">{new Date(submission.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td><td><strong>{submission.name}</strong><a className="table-email" href={`mailto:${submission.email}`}>{submission.email}</a></td><td><a href={submission.companyUrl} target="_blank" rel="noreferrer">{submission.company} ↗</a></td><td><span className="stage-pill">{submission.stage}</span></td><td className="message-cell">{submission.message}</td></tr>)}
                </tbody></table></div>
              )}
            </div>
            <div className="admin-panel">
              <div className="admin-panel-heading"><div><span className="admin-kicker">LIMITED PARTNERS</span><h2>LP inquiries <span className="inquiry-count">{lpInquiries.length}</span></h2></div></div>
              {loading ? <p className="admin-empty">Loading LP inquiries…</p> : error && !lpInquiries.length ? <p className="admin-error">{error}</p> : lpInquiries.length === 0 ? <p className="admin-empty">No LP inquiries yet.</p> : (
                <div className="table-scroll"><table className="inquiry-table"><thead><tr><th>Received</th><th>Contact</th><th>Fund or organization</th><th>Message</th></tr></thead><tbody>
                  {lpInquiries.map((inquiry) => <tr key={inquiry.id}><td className="date-cell">{new Date(inquiry.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td><td><strong>{inquiry.name}</strong><a className="table-email" href={`mailto:${inquiry.email}`}>{inquiry.email}</a></td><td>{inquiry.organization}</td><td className="message-cell">{inquiry.message}</td></tr>)}
                </tbody></table></div>
              )}
            </div>
            <div className="admin-panel content-editor-panel">
              <div className="admin-panel-heading"><div><span className="admin-kicker">LIVE COPY</span><h2>Content editor</h2></div><span className="admin-hint">Changes publish immediately</span></div>
              {content && <form className="content-editor" onSubmit={saveContent}>
                {editableKeys.map(([key, label]) => {
                  const value = content[key];
                  return <label key={key}>{label}{typeof value === 'string' && value.length > 150 ? <textarea name={key} defaultValue={value} rows={4} /> : <input name={key} defaultValue={typeof value === 'string' ? value : ''} />}</label>;
                })}
                <section className="team-manager">
                  <div className="team-manager-heading"><div><span className="admin-kicker">PUBLIC TEAM</span><h3>Founder profiles <span className="inquiry-count">{teamDraft.length}</span></h3></div><button className="admin-add-button" type="button" onClick={addFounder}><Plus size={15} /> Add founder</button></div>
                  {teamDraft.length === 0 && <p className="team-manager-empty">No profiles are currently displayed on the website.</p>}
                  {teamDraft.map((member, index) => (
                    <fieldset className="founder-editor-card" key={member.id}>
                      <legend>PROFILE {String(index + 1).padStart(2, '0')}</legend>
                      <button className="founder-remove-button" type="button" onClick={() => removeFounder(member.id)} aria-label={`Remove ${member.name || 'founder'} profile`}><Trash2 size={14} /> Remove</button>
                      <div className="founder-editor-grid">
                        <label>Name<input value={member.name} onChange={(event) => updateMember(member.id, 'name', event.target.value)} required maxLength={120} /></label>
                        <label>Role<input value={member.role} onChange={(event) => updateMember(member.id, 'role', event.target.value)} required maxLength={120} /></label>
                        <label>Affiliations <span className="field-note">Separate with commas</span><input value={member.affiliations.join(', ')} onChange={(event) => updateMember(member.id, 'affiliations', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} /></label>
                        <label>LinkedIn URL<input type="url" value={member.linkedinUrl} onChange={(event) => updateMember(member.id, 'linkedinUrl', event.target.value)} placeholder="https://www.linkedin.com/in/..." /></label>
                        <label className="founder-bio-field">Bio<textarea value={member.bio} onChange={(event) => updateMember(member.id, 'bio', event.target.value)} required maxLength={2000} rows={3} /></label>
                      </div>
                    </fieldset>
                  ))}
                </section>
                <div className="editor-actions"><p className={error ? 'admin-error' : 'admin-success'}>{error || status}</p><button className="button button-copper" type="submit"><Save size={15} /> Publish updates</button></div>
              </form>}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
