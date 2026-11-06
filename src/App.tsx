import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Menu, X } from 'lucide-react';
import { getContent, submitFounderInquiry, submitLpInquiry } from './api';
import AdminDashboard from './components/AdminDashboard';
import type { NewLpInquiry, NewSubmission, WebsiteContent } from './types';

const defaultContent: WebsiteContent = {
  heroHeadline: "The next trillion-dollar AI wave won't live in chatbots. It will live in factories, fleets, machines, and critical infrastructure.",
  heroSubhead: 'We back founders building the intelligence layer for the physical world.',
  thesisHeading: 'The AI that earns the next decade of returns lives in the physical world.',
  thesisLeft: 'Foundation models are moving beyond screens and into the systems that make and move things. Models such as π0, paired with platforms like GR00T and Jetson Thor, are opening a new frontier for machines that can perceive, reason, and act.',
  thesisRight: 'As the humanoid bill of materials drops, new products become economically viable across factories, fleets, and critical infrastructure. We invest where intelligent software meets real-world operations—and where a $10B platform can be built.',
  wedges: ['Industrial Intelligence', 'Logistics', 'Robotics Middleware', 'Energy', 'Agricultural / Construction', 'Applied Vertical AI'],
  stackIntro: 'We use AI across the investment lifecycle: from sourcing and diligence to portfolio monitoring and reporting. Our long-term ambition is to work alongside 1,300 founders building $10B platforms.',
  teamMembers: [
    { id: 'ramiro-lopez-garcia', name: 'Ramiro López-García', role: 'General Partner', bio: "Ramiro López-García's background includes CEMEX and Intel.", affiliations: ['CEMEX', 'Intel'], linkedinUrl: 'https://www.linkedin.com/in/ramirolg' },
    { id: 'ishtiaque-mohammad', name: 'Ishtiaque Mohammad', role: 'General Partner', bio: 'Ishtiaque Mohammad’s background includes Amazon, Intel, Broadcom, and Cornell.', affiliations: ['Amazon', 'Intel', 'Broadcom', 'Cornell'], linkedinUrl: 'https://www.linkedin.com/in/ishtiaque-mohammad/' }
  ]
};

const navItems = [['Thesis', '#thesis'], ['How we operate', '#stack'], ['Team', '#team'], ['Contact', '#contact']];

export default function App() {
  const [content, setContent] = useState<WebsiteContent>(defaultContent);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');
  const [lpFormState, setLpFormState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [lpFormMessage, setLpFormMessage] = useState('');
  const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin';

  useEffect(() => {
    if (isAdmin) return;
    getContent().then((data) => setContent({ ...defaultContent, ...data }))
      .catch((error: unknown) => console.error('Unable to load website content:', error));
  }, [isAdmin]);

  if (isAdmin) return <AdminDashboard />;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState('sending');
    setFormMessage('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const submission: NewSubmission = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      company: String(data.get('company') ?? '').trim(),
      companyUrl: String(data.get('companyUrl') ?? '').trim(),
      stage: String(data.get('stage') ?? ''),
      message: String(data.get('message') ?? '').trim()
    };
    try {
      await submitFounderInquiry(submission);
      form.reset();
      setFormState('success');
      setFormMessage('Thank you. Your note is on its way.');
    } catch (error) {
      setFormState('error');
      setFormMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  }

  async function handleLpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLpFormState('sending');
    setLpFormMessage('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const inquiry: NewLpInquiry = {
      name: String(data.get('lpName') ?? '').trim(),
      email: String(data.get('lpEmail') ?? '').trim(),
      organization: String(data.get('organization') ?? '').trim(),
      message: String(data.get('lpMessage') ?? '').trim()
    };
    try {
      await submitLpInquiry(inquiry);
      form.reset();
      setLpFormState('success');
      setLpFormMessage('Thank you. Your note is on its way.');
    } catch (error) {
      setLpFormState('error');
      setLpFormMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="site-header">
        <a className="wordmark" href="#hero" aria-label="Astra Ventures home"><span className="wordmark-star">✳</span> ASTRA<span className="wordmark-light"> VENTURES</span></a>
        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          {navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a className="nav-lp" href="#lps" onClick={() => setMenuOpen(false)}>For LPs <ArrowUpRight size={14} /></a>
        </nav>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <main>
        <section id="hero" className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow eyebrow-light"><span /> INDEPENDENT VENTURE CAPITAL</p>
            <h1>{content.heroHeadline}</h1>
            <p className="hero-subhead">{content.heroSubhead}</p>
            <div className="hero-actions">
              <a className="button button-copper" href="#contact">For founders <ArrowDownRight size={16} /></a>
              <a className="button button-outline-light" href="#lps">For LPs <ArrowUpRight size={16} /></a>
            </div>
            <div className="hero-index">BUILT FOR WHAT'S NEXT <span>01 — 06</span></div>
          </div>
          <div className="hero-visual">
            <div className="video-frame" aria-label="Video placeholder">
              <div className="video-grid" />
              <div className="video-center"><button aria-label="Video preview placeholder"><span /></button></div>
              <span className="frame-corner frame-top-left" /><span className="frame-corner frame-bottom-right" />
              <span className="video-label">FIELD NOTES / 001</span>
            </div>
            <p className="video-caption"><span className="caption-line" />60–90 sec · GP thesis intro or industrial-footage reel</p>
          </div>
          <a className="scroll-cue" href="#thesis"><span /> SCROLL TO EXPLORE</a>
        </section>

        <section id="thesis" className="section thesis-section">
          <div className="section-topline"><p className="eyebrow"><span /> THESIS</p><p className="section-marker">01 / THE OPPORTUNITY</p></div>
          <h2 className="section-heading thesis-heading">{content.thesisHeading}</h2>
          <div className="thesis-narrative">
            <p>{content.thesisLeft}</p>
            <p>{content.thesisRight}</p>
          </div>
          <div className="wedge-header"><h3>Where we focus</h3><span>Six connected investment wedges</span></div>
          <div className="wedge-grid">
            {(Array.isArray(content.wedges) ? content.wedges : defaultContent.wedges).map((wedge, index) => (
              <article className="wedge-card" key={wedge}><span className="wedge-number">{String(index + 1).padStart(2, '0')}</span><h4>{wedge}</h4><ArrowUpRight size={16} className="wedge-arrow" /></article>
            ))}
          </div>
        </section>

        <section id="stack" className="stack-section">
          <div className="section stack-inner">
            <div className="section-topline"><p className="eyebrow eyebrow-light"><span /> HOW WE OPERATE</p><p className="section-marker section-marker-light">02 / OUR EDGE</p></div>
            <div className="stack-intro-row">
              <h2 className="section-heading">AI across<br /><em>the stack.</em></h2>
              <p>{content.stackIntro}</p>
            </div>
            <div className="stack-steps">
              {['Deal flow', 'Diligence', 'Monitoring', 'Reporting'].map((step, index) => <div className="stack-step" key={step}><span>0{index + 1}</span><strong>{step}</strong><ArrowUpRight size={15} /></div>)}
            </div>
            <div className="stack-footer"><p>Better signals. Deeper work. More time for founders.</p><a className="button button-copper" href="https://sowfin.com" target="_blank" rel="noreferrer">Powered by SowFin <ArrowUpRight size={16} /></a></div>
          </div>
        </section>

        <section id="team" className="section team-section">
          <div className="section-topline"><p className="eyebrow"><span /> TEAM</p><p className="section-marker">03 / THE PEOPLE</p></div>
          <div className="team-heading-row"><h2 className="section-heading">Operators’ instinct.<br /><em>Investors’ conviction.</em></h2><p>We partner with founders building the next generation of enduring companies.</p></div>
          <div className="team-grid">
            {(Array.isArray(content.teamMembers) ? content.teamMembers : defaultContent.teamMembers).map((member, index) => (
              <article className="team-card" key={member.id}>
                <div className="team-card-top"><span>{member.role.toUpperCase()}</span><span className="team-card-number">{String(index + 1).padStart(2, '0')}</span></div>
                <div className={`portrait-placeholder ${index % 2 === 0 ? 'portrait-one' : 'portrait-two'}`} aria-hidden="true"><span>{member.name.trim().charAt(0).toUpperCase()}</span><i>ASTRA / PEOPLE</i></div>
                <h3>{member.name}</h3><p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
                <p className="team-affiliations">{member.affiliations.map((affiliation, affiliationIndex) => <span key={`${member.id}-${affiliation}`}>{affiliationIndex > 0 && ' · '}{affiliation}</span>)}</p>
                {member.linkedinUrl && <a className="text-link" href={member.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} /></a>}
              </article>
            ))}
            {content.teamMembers.length === 0 && <p className="team-empty">Our team is taking shape.</p>}
          </div>
        </section>

        <section id="lps" className="lp-section">
          <div className="section lp-inner">
            <div className="lp-copy">
              <div className="section-topline"><p className="eyebrow"><span /> FOR LIMITED PARTNERS</p><p className="section-marker">04 / LP RELATIONS</p></div>
              <h2 className="section-heading">Backing the<br /><em>physical future.</em></h2>
              <p>For fund information or to connect with Astra Ventures, leave us a note. Our team will be in touch.</p>
              <a className="text-link" href="mailto:lp@astraventures.ai">lp@astraventures.ai <ArrowUpRight size={14} /></a>
            </div>
            <form className="lp-form" onSubmit={handleLpSubmit}>
              <div className="form-grid">
                <label>Name<input name="lpName" required maxLength={120} autoComplete="name" placeholder="Your name" /></label>
                <label>Email<input name="lpEmail" type="email" required maxLength={254} autoComplete="email" placeholder="you@organization.com" /></label>
                <label className="form-full">Fund or organization<input name="organization" required maxLength={200} autoComplete="organization" placeholder="Organization name" /></label>
                <label className="form-full">How can we help?<textarea name="lpMessage" rows={4} maxLength={5000} required placeholder="Tell us what you’d like to discuss..." /></label>
              </div>
              <div className="form-submit-row"><p className={`form-message ${lpFormState}`}>{lpFormMessage}</p><button className="button button-copper" type="submit" disabled={lpFormState === 'sending'}>{lpFormState === 'sending' ? 'Sending…' : 'Contact investor relations'} <ArrowUpRight size={16} /></button></div>
            </form>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="section contact-inner">
            <div className="contact-copy">
              <div className="section-topline"><p className="eyebrow eyebrow-light"><span /> FOUNDER INQUIRIES</p><p className="section-marker section-marker-light">05 / START A CONVERSATION</p></div>
              <h2 className="section-heading">Make something<br /><em>real.</em></h2>
              <p>If you’re building for the physical world, we’d like to hear what you see.</p>
              <span className="contact-coordinate">ASTRA VENTURES <i>·</i> FOUNDERS, FIRST</span>
            </div>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>Name<input name="name" required maxLength={120} autoComplete="name" placeholder="Your name" /></label>
                <label>Email<input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@company.com" /></label>
                <label>Company<input name="company" required maxLength={160} autoComplete="organization" placeholder="Company name" /></label>
                <label>Company URL<input name="companyUrl" type="url" required maxLength={500} placeholder="https://company.com" /></label>
                <label className="form-full">Stage<select name="stage" defaultValue="" required><option value="" disabled>Select a stage</option><option>Pre-seed</option><option>Seed</option><option>Other</option></select></label>
                <label className="form-full">What you’re building<textarea name="message" rows={4} maxLength={5000} required placeholder="A few lines on the problem, your approach, and what you’re learning..." /></label>
              </div>
              <div className="form-submit-row"><p className={`form-message ${formState}`}>{formMessage}</p><button className="button button-copper" type="submit" disabled={formState === 'sending'}>{formState === 'sending' ? 'Sending…' : 'Send your note'} <ArrowUpRight size={16} /></button></div>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark footer-wordmark" href="#hero"><span className="wordmark-star">✳</span> ASTRA<span className="wordmark-light"> VENTURES</span></a>
        <nav aria-label="Footer navigation"><a href="#thesis">Thesis</a><a href="#stack">How we operate</a><a href="#team">Team</a><a href="#lps">For LPs</a><a href="#contact">Founders</a></nav>
        <p>© 2026 Astra Ventures. All rights reserved.</p>
      </footer>
    </div>
  );
}
