import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  RefreshCw,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  Phone,
  Mail,
  Send,
  User,
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  ExternalLink,
  Code,
  Github,
  Linkedin,
  MapPin,
  Building,
  Home,
  Check,
  Award,
  Sparkles,
  ShieldCheck,
  Bot,
  MessageSquare,
  AlertCircle,
  Edit3
} from 'lucide-react';
import { parseIntentFromText } from '../utils/intentParser.js';

/**
 * Detect domain category from the user prompt or extracted project_type
 */
export function detectTopicCategory(topicStr = '', projectType = null) {
  if (projectType) {
    const pt = projectType.toUpperCase();
    if (pt === 'PORTFOLIO') return 'portfolio';
    if (pt === 'HOSPITAL') return 'hospital';
    if (pt === 'REAL_ESTATE') return 'realestate';
    if (pt === 'CHATBOT') return 'chatbot';
    if (pt === 'E_COMMERCE') return 'ecommerce';
  }

  const lower = (topicStr || '').toLowerCase();

  if (
    lower.includes('portfolio') ||
    lower.includes('resume') ||
    lower.includes('cv') ||
    lower.includes('personal website') ||
    lower.includes('developer profile') ||
    lower.includes('designer') ||
    lower.includes('freelancer')
  ) {
    return 'portfolio';
  }

  if (
    lower.includes('hospital') ||
    lower.includes('doctor') ||
    lower.includes('medical') ||
    lower.includes('clinic') ||
    lower.includes('health') ||
    lower.includes('telemedicine') ||
    lower.includes('patient') ||
    lower.includes('appointment') ||
    lower.includes('consultation') ||
    lower.includes('ಆರೋಗ್ಯ') ||
    lower.includes('स्वास्थ्य') ||
    lower.includes('अस्पताल')
  ) {
    return 'hospital';
  }

  if (
    lower.includes('real estate') ||
    lower.includes('property') ||
    lower.includes('housing') ||
    lower.includes('apartment') ||
    lower.includes('villa') ||
    lower.includes('realty') ||
    lower.includes('bhk') ||
    lower.includes('homes')
  ) {
    return 'realestate';
  }

  if (
    lower.includes('chat') ||
    lower.includes('bot') ||
    lower.includes('chatbot') ||
    lower.includes('assistant') ||
    lower.includes('gpt') ||
    lower.includes('llm') ||
    lower.includes('conversational')
  ) {
    return 'chatbot';
  }

  if (
    lower.includes('ecommerce') ||
    lower.includes('e-commerce') ||
    lower.includes('store') ||
    lower.includes('shop') ||
    lower.includes('products') ||
    lower.includes('shopping') ||
    lower.includes('retail') ||
    lower.includes('cart')
  ) {
    return 'ecommerce';
  }

  return 'default';
}

/**
 * 1. DYNAMIC PORTFOLIO PREVIEW
 * Binds [user_name], [items_or_skills], and dynamic project cards
 */
function PortfolioPreview({ 
  userName, 
  onUserNameChange, 
  skills, 
  rawInput, 
  title 
}) {
  const [selectedTag, setSelectedTag] = useState('All');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isEditingName, setIsEditingName] = useState(false);

  const displayName = userName || 'Developer';
  const effectiveSkills = skills.length > 0 ? skills : ['React', 'Python', 'TypeScript', 'FastAPI'];

  // Dynamic Skill Competency Meters
  const skillMeters = useMemo(() => {
    return effectiveSkills.map((s, idx) => ({
      name: s,
      level: 90 + ((idx * 3) % 8),
      category: idx % 2 === 0 ? 'Core Stack' : 'Framework'
    }));
  }, [effectiveSkills]);

  // Dynamic Projects derived from extracted skills and prompt
  const projects = useMemo(() => {
    const list = [];
    effectiveSkills.forEach((skill, idx) => {
      list.push({
        title: `${displayName}'s ${skill} Engine`,
        desc: `High-performance production microservice leveraging ${skill} with zero cloud leakage and autonomous workflows.`,
        category: idx % 2 === 0 ? 'Full-Stack' : 'AI & Backend',
        stars: 180 + idx * 45,
        tags: [skill, 'Vite', idx === 0 ? 'Production Ready' : 'Edge Enclave']
      });
    });

    if (list.length < 3) {
      list.push({
        title: `${displayName}'s Sovereign Hub`,
        desc: `Decentralized verifiable application built for "${rawInput.slice(0, 40)}..."`,
        category: 'Architecture',
        stars: 310,
        tags: [...effectiveSkills.slice(0, 2), 'Zero-Trust']
      });
    }

    return list.slice(0, 3);
  }, [displayName, effectiveSkills, rawInput]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', message: '' });
      setContactSubmitted(false);
    }, 3500);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Parameter Alert: If user_name was omitted, provide interactive live input */}
      {!userName && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-300">
            <User className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Name parameter omitted in prompt. Type your name for live binding:</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={userName}
              onChange={(e) => onUserNameChange(e.target.value)}
              className="bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 w-full sm:w-48"
            />
          </div>
        </div>
      )}

      {/* Hero Header Section */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 p-6 sm:p-8 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-3 text-center md:text-left flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Available for {effectiveSkills[0] || 'Software'} Contracts</span>
          </div>

          {/* Requirement: Welcome to [user_name]'s Portfolio */}
          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to {displayName}'s Portfolio
            </h1>
            <button
              type="button"
              onClick={() => setIsEditingName(!isEditingName)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition"
              title="Edit Name Live"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {isEditingName && (
            <div className="flex items-center gap-2 pt-1 font-mono text-xs">
              <span className="text-cyan-400">Live Edit Name:</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => onUserNameChange(e.target.value)}
                placeholder="Type your name..."
                className="bg-slate-950 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="px-2 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-[10px]"
              >
                Done
              </button>
            </div>
          )}

          <p className="text-cyan-300 font-mono text-sm font-semibold">
            Full-Stack Software Engineer & Specialist in {effectiveSkills.join(' • ')}
          </p>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            {rawInput 
              ? `Synthesized based on: "${rawInput}". Engineered with zero cloud data leakage, responsive modular UI components, and cryptographic integrity.`
              : `Building resilient software solutions with ${effectiveSkills.join(', ')}.`}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs">
            <span className="flex items-center gap-1 text-slate-400"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> Bengaluru / Remote</span>
            <span className="flex items-center gap-1 text-slate-400"><Award className="w-3.5 h-3.5 text-emerald-400" /> Verified Credentials</span>
            <span className="flex items-center gap-1 text-slate-400"><Code className="w-3.5 h-3.5 text-amber-400" /> {effectiveSkills.length} Dynamic Tech Modules</span>
          </div>
        </div>

        {/* Avatar Card */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-emerald-500 p-1 shadow-2xl shadow-cyan-500/30">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-3xl font-bold text-cyan-300 uppercase">
              {displayName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DEV'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition" title="GitHub">
              <Github className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition" title="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition" title="Email">
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Requirement: Display skill badges matching [items_or_skills] */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Extracted Technical Skills & Stack ({effectiveSkills.length})
          </h3>
          <span className="text-[11px] font-mono text-cyan-400">Dynamically bound from user prompt</span>
        </div>

        {/* Skill Badges */}
        <div className="flex flex-wrap gap-2">
          {effectiveSkills.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 font-mono text-xs font-semibold shadow-sm hover:scale-105 transition"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              {skill}
            </span>
          ))}
        </div>

        {/* Competency Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {skillMeters.map((s, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-semibold">{s.name}</span>
                <span className="text-cyan-400">{s.level}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" 
                  style={{ width: `${s.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Requirement: List custom project cards derived from user's prompt */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              Custom Project Showcase for {displayName}
            </h3>
            <p className="text-xs text-slate-400">Synthesized dynamically matching your prompt parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((p, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-all group">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1">
                  <span>{p.category}</span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" /> {p.stars}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {p.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.tags.map((t, ti) => (
                    <span key={ti} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {t}
                    </span>
                  ))}
                </div>
                <button 
                  type="button"
                  onClick={() => alert(`Launching live demo for ${p.title} (${displayName})`)}
                  className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-slate-800 font-mono text-xs transition font-semibold"
                >
                  <span>Launch Live Demo</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Contact Form */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/20">
        <h3 className="text-sm font-mono font-bold text-white mb-1 flex items-center gap-2">
          <Mail className="w-4 h-4 text-cyan-400" />
          Send a Direct Message to {displayName}
        </h3>
        <p className="text-xs text-slate-400 mb-4">Encrypted dispatch directly to {displayName}'s inbox</p>

        {contactSubmitted ? (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-mono">
              Message dispatched successfully! {displayName} will follow up within 24 hours.
            </span>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <input 
              type="text" 
              placeholder="Your Name" 
              value={contactForm.name}
              onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
              required
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400" 
            />
            <input 
              type="email" 
              placeholder="Your Email" 
              value={contactForm.email}
              onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
              required
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400" 
            />
            <button 
              type="submit"
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold uppercase tracking-wider hover:opacity-90 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Contact {displayName}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/**
 * 2. DYNAMIC HOSPITAL / HEALTHCARE PREVIEW
 * Binds [user_name] (e.g. City Care Hospital), [items_or_skills] (specialties)
 */
function HospitalBookingPreview({ 
  userName, 
  onUserNameChange, 
  skills, 
  rawInput, 
  title 
}) {
  const hospitalName = userName || 'City Care Hospital';
  const effectiveSpecialties = skills.length > 0 ? skills : ['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology'];

  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [patientName, setPatientName] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [isEditingHospital, setIsEditingHospital] = useState(false);

  // Dynamic Doctors generated matching extracted specialties
  const doctors = useMemo(() => {
    const list = [];
    const doctorNames = ['Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Ananya Rao', 'Dr. Vikramaditya Sen'];
    const degrees = ['MD (Gold Medalist)', 'MS, DNB', 'DM, Fellow', 'MD, FACC'];
    const fees = ['₹750', '₹600', '₹900', '₹1,100'];

    effectiveSpecialties.forEach((spec, idx) => {
      const name = doctorNames[idx % doctorNames.length];
      const initials = name.replace('Dr. ', '').split(' ').map(n => n[0]).join('');
      list.push({
        id: `DOC-${idx + 1}`,
        name: `${name}, ${degrees[idx % degrees.length]}`,
        specialty: spec,
        experience: `${10 + (idx * 2)} Yrs Exp`,
        rating: Number((4.7 + (idx * 0.1) % 0.3).toFixed(1)),
        reviews: 210 + idx * 65,
        fee: fees[idx % fees.length],
        availability: idx === 0 ? 'Available Today' : (idx === 1 ? 'Available Tomorrow' : 'In 2 Days'),
        avatar: initials
      });
    });

    return list;
  }, [effectiveSpecialties]);

  const specialtiesList = useMemo(() => ['All', ...effectiveSpecialties], [effectiveSpecialties]);

  const filteredDoctors = selectedSpecialty === 'All'
    ? doctors
    : doctors.filter(d => d.specialty === selectedSpecialty);

  const handleConfirmBooking = () => {
    if (!patientName.trim()) {
      alert('Please enter patient name.');
      return;
    }
    const token = `MED-CONF-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingConfirmed({
      token,
      hospital: hospitalName,
      doctor: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: selectedDate,
      slot: selectedSlot,
      patient: patientName,
      fee: selectedDoctor.fee
    });
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Parameter Alert: If hospital name was omitted, allow live typing */}
      {!userName && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-emerald-500/10 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-300">
            <Building className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Hospital name parameter omitted in prompt. Type name for live binding:</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. City Care Hospital"
              value={userName}
              onChange={(e) => onUserNameChange(e.target.value)}
              className="bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 w-full sm:w-56"
            />
          </div>
        </div>
      )}

      {/* Hospital Header */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/50 p-6 sm:p-8 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
              NABH Certified Hospital Network
            </span>
            <span className="text-[10px] font-mono text-cyan-300">24/7 Tele-Consult</span>
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {hospitalName} Clinical & Telemedicine Dashboard
            </h2>
            <button
              type="button"
              onClick={() => setIsEditingHospital(!isEditingHospital)}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 transition"
              title="Edit Hospital Name Live"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {isEditingHospital && (
            <div className="flex items-center gap-2 pt-1 font-mono text-xs">
              <span className="text-emerald-400">Live Edit Hospital:</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => onUserNameChange(e.target.value)}
                placeholder="Type hospital name..."
                className="bg-slate-950 border border-emerald-500/50 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={() => setIsEditingHospital(false)}
                className="px-2 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]"
              >
                Done
              </button>
            </div>
          )}

          <p className="text-xs text-slate-300 mt-1">
            Instant doctor appointment booking with encrypted patient telemetry for <strong className="text-emerald-400">{hospitalName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Emergency Desk: <strong className="text-rose-400">108 / 1800-MED-CARE</strong>
          </div>
        </div>
      </div>

      {/* Specialty Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
        <span className="text-slate-400 flex items-center gap-1 shrink-0"><Filter className="w-3.5 h-3.5 text-cyan-400" /> Specialties:</span>
        {specialtiesList.map(spec => (
          <button
            key={spec}
            type="button"
            onClick={() => setSelectedSpecialty(spec)}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
              selectedSpecialty === spec
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDoctors.map(doc => {
          const isSelected = selectedDoctor?.id === doc.id;
          return (
            <div 
              key={doc.id}
              className={`p-5 rounded-2xl border transition-all ${
                isSelected 
                  ? 'bg-emerald-950/30 border-emerald-400 ring-2 ring-emerald-500/30 shadow-xl' 
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold font-mono flex items-center justify-center text-base">
                    {doc.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{doc.name}</h4>
                    <p className="text-xs text-cyan-400 font-mono">{doc.specialty} • {doc.experience}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <strong className="text-white">{doc.rating}</strong>
                      <span>({doc.reviews} verified reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400 font-mono">{doc.fee}</div>
                  <div className="text-[10px] text-slate-400 uppercase mt-0.5">Consultation Fee</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> {doc.availability}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedDoctor(doc)}
                  className={`px-4 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {isSelected ? '✓ Selected' : 'Book Consultation'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Form Drawer if Doctor is Selected */}
      {selectedDoctor && !bookingConfirmed && (
        <div className="p-6 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Schedule Consultation at {hospitalName}
              </h4>
              <p className="text-xs text-slate-400">{selectedDoctor.name} ({selectedDoctor.specialty}) • {selectedDoctor.fee}</p>
            </div>
            <button 
              type="button"
              onClick={() => setSelectedDoctor(null)}
              className="text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Select Consultation Day</label>
              <div className="grid grid-cols-2 gap-1.5">
                {['Today', 'Tomorrow', 'In 2 Days', 'Next Week'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={`py-1.5 px-2 rounded-lg text-center transition ${
                      selectedDate === d 
                        ? 'bg-cyan-500 text-slate-950 font-bold' 
                        : 'bg-slate-950 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Select Time Slot</label>
              <div className="grid grid-cols-2 gap-1.5">
                {['09:30 AM', '11:00 AM', '02:30 PM', '05:00 PM'].map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-1.5 px-2 rounded-lg text-center transition ${
                      selectedSlot === slot 
                        ? 'bg-emerald-500 text-slate-950 font-bold' 
                        : 'bg-slate-950 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Patient Name</label>
              <input 
                type="text"
                placeholder="e.g. Ramesh Patil"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-400 mb-2"
              />
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold uppercase tracking-wider hover:opacity-90 transition text-xs"
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Confirmation Receipt */}
      {bookingConfirmed && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-2 border-emerald-400 text-emerald-200 shadow-2xl space-y-3 animate-fadeIn font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/40">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Appointment Confirmed at {bookingConfirmed.hospital} • Token {bookingConfirmed.token}
            </span>
            <button 
              type="button"
              onClick={() => { setBookingConfirmed(null); setSelectedDoctor(null); }}
              className="text-slate-400 hover:text-white"
            >
              Book Another
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>Patient: <strong className="text-white block">{bookingConfirmed.patient}</strong></div>
            <div>Doctor: <strong className="text-cyan-300 block">{bookingConfirmed.doctor}</strong></div>
            <div>Schedule: <strong className="text-emerald-400 block">{bookingConfirmed.date} @ {bookingConfirmed.slot}</strong></div>
            <div>Fee: <strong className="text-white block">{bookingConfirmed.fee} (Direct Settlement)</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 3. DYNAMIC CHATBOT PREVIEW
 * Binds [user_name] (bot name/brand), [items_or_skills] (action cards)
 */
function ChatbotPreview({ 
  userName, 
  onUserNameChange, 
  skills, 
  rawInput, 
  title 
}) {
  const botEntity = userName || 'OmniBot Sovereign AI';
  const effectiveActions = skills.length > 0 ? skills : ['Autonomous Reasoning', 'Live Ticket Resolution', 'Security Attestation'];

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello! I am your dedicated AI Assistant for "${botEntity}". How can I assist you with "${rawInput || 'your request'}" today?`,
      time: '12:00 PM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEditingBot, setIsEditingBot] = useState(false);

  // Dynamic quick action chips matching extracted skills/items
  const quickChips = useMemo(() => {
    return effectiveActions.map(action => `⚡ ${action}`);
  }, [effectiveActions]);

  const handleSendMessage = (textToSend = null) => {
    const msg = textToSend || inputText.trim();
    if (!msg) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = `Acknowledged: "${msg}". ${botEntity} executed task on edge with zero cloud leakage. All parameters validated.`;
      if (msg.includes('Security') || msg.includes('Attestation')) {
        replyText = `Security audit clean: Prompt injection delta 0.001, AMD SEV-SNP enclave locked.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="space-y-4 text-slate-100 font-sans">
      {!userName && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-slate-900 to-cyan-500/10 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-300">
            <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Bot brand parameter omitted in prompt. Type brand name:</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. Acme Support Bot"
              value={userName}
              onChange={(e) => onUserNameChange(e.target.value)}
              className="bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 w-full sm:w-56"
            />
          </div>
        </div>
      )}

      {/* Chat App Frame */}
      <div className="rounded-3xl bg-slate-950 border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col h-[480px]">
        {/* Chat Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-mono font-bold text-white">{botEntity}</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <button
                  type="button"
                  onClick={() => setIsEditingBot(!isEditingBot)}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white text-[10px]"
                  title="Rename Bot"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[10px] font-mono text-cyan-300">
                Autonomous Contextual Assistant • Edge Loopback
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
              Latency: <strong className="text-emerald-400">1.2ms</strong>
            </span>
          </div>
        </div>

        {isEditingBot && (
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 text-xs font-mono">
            <span className="text-cyan-400">Edit Bot Name:</span>
            <input
              type="text"
              value={userName}
              onChange={(e) => onUserNameChange(e.target.value)}
              className="bg-slate-950 border border-cyan-500/50 rounded px-2 py-1 text-white text-xs"
            />
            <button
              onClick={() => setIsEditingBot(false)}
              className="px-2 py-1 bg-cyan-500 text-slate-950 font-bold rounded text-[10px]"
            >
              Save
            </button>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
          {messages.map(m => {
            const isUser = m.sender === 'user';
            return (
              <div 
                key={m.id} 
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-500 px-1">{m.time}</span>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono animate-pulse">
              <Bot className="w-3.5 h-3.5" />
              <span>{botEntity} is reasoning on edge...</span>
            </div>
          )}
        </div>

        {/* Dynamic Action Chips */}
        <div className="p-2.5 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
          {quickChips.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition shrink-0 border border-slate-700/80"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Ask ${botEntity} anything...`}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold hover:opacity-90 transition font-mono text-xs flex items-center gap-1"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 4. DYNAMIC E-COMMERCE PREVIEW
 * Binds [user_name] (store name) and [items_or_skills] (products)
 */
function EcommercePreview({ 
  userName, 
  onUserNameChange, 
  skills, 
  rawInput, 
  title 
}) {
  const storeName = userName || 'Digital Sovereign Store';
  const effectiveProducts = skills.length > 0 ? skills : ['Laptops', 'Headphones', 'Audio Kits', 'Smartphones'];

  const [cart, setCart] = useState([
    { id: 1, name: effectiveProducts[0] || 'Hardware Module', price: 4999, qty: 1 }
  ]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [isEditingStore, setIsEditingStore] = useState(false);

  // Dynamic products derived from extracted list
  const catalog = useMemo(() => {
    const prices = [12999, 4499, 8999, 1999, 15999, 2499];
    const badges = ['Bestseller', 'Attested', 'Zero-Trust', 'High Demand'];

    return effectiveProducts.map((p, idx) => ({
      id: idx + 1,
      name: p.includes('Pro') ? p : `${p} Pro`,
      desc: `High-grade ${p} optimized for edge workloads with cryptographic serial attestation.`,
      price: prices[idx % prices.length],
      rating: Number((4.7 + (idx * 0.1) % 0.3).toFixed(1)),
      badge: badges[idx % badges.length]
    }));
  }, [effectiveProducts]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const totalCartValue = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {!userName && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-300">
            <ShoppingCart className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Store name parameter omitted in prompt. Type store name:</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. TechMart Store"
              value={userName}
              onChange={(e) => onUserNameChange(e.target.value)}
              className="bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 w-full sm:w-56"
            />
          </div>
        </div>
      )}

      {/* Storefront Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 p-6 sm:p-8 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase">
              Direct Edge Storefront
            </span>
            <span className="text-[10px] font-mono text-emerald-400">⚡ Instant Digital Settlement</span>
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {storeName}
            </h2>
            <button
              type="button"
              onClick={() => setIsEditingStore(!isEditingStore)}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 transition"
              title="Edit Store Name"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {isEditingStore && (
            <div className="flex items-center gap-2 pt-1 font-mono text-xs">
              <span className="text-amber-400">Edit Store Name:</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => onUserNameChange(e.target.value)}
                className="bg-slate-950 border border-amber-500/50 rounded px-2 py-1 text-white text-xs"
              />
              <button
                onClick={() => setIsEditingStore(false)}
                className="px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded text-[10px]"
              >
                Save
              </button>
            </div>
          )}

          <p className="text-xs text-slate-300 mt-1">
            Storefront dynamically synthesized for <strong className="text-amber-300">{storeName}</strong> featuring {effectiveProducts.join(', ')}
          </p>
        </div>

        {/* Cart Counter Trigger */}
        <button
          type="button"
          onClick={() => setShowCartDrawer(!showCartDrawer)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-mono text-xs font-bold shadow-lg hover:opacity-95 transition"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart ({cart.reduce((c, i) => c + i.qty, 0)})</span>
          <span className="px-1.5 py-0.5 rounded bg-black/20 text-slate-950 text-[11px]">
            ₹{totalCartValue.toLocaleString()}
          </span>
        </button>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {catalog.map(prod => (
          <div 
            key={prod.id}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                  {prod.badge}
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" /> {prod.rating}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                {prod.name}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {prod.desc}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 mb-2">
                <span className="text-base font-bold text-white font-mono">
                  ₹{prod.price.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500">In Stock</span>
              </div>

              <button
                type="button"
                onClick={() => addToCart(prod)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Drawer */}
      {showCartDrawer && (
        <div className="p-6 rounded-2xl bg-slate-900 border-2 border-amber-500/50 shadow-2xl space-y-4 animate-fadeIn font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              {storeName} Cart ({cart.reduce((c, i) => c + i.qty, 0)} Items)
            </h4>
            <button 
              type="button"
              onClick={() => setShowCartDrawer(false)}
              className="text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-6 text-slate-400">Your cart is empty.</div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-white font-bold">{item.name}</div>
                    <div className="text-[11px] text-cyan-400">₹{item.price.toLocaleString()} each</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      <button onClick={() => updateQty(item.id, -1)} className="text-slate-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                      <span className="font-bold text-white px-1">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="text-slate-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                    </div>
                    <span className="font-bold text-emerald-400 w-20 text-right">₹{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-bold text-sm">
                <span className="text-slate-300">Total Settlement:</span>
                <span className="text-emerald-400">₹{totalCartValue.toLocaleString()}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCheckoutComplete(true);
                  setTimeout(() => {
                    setCart([]);
                    setCheckoutComplete(false);
                    setShowCartDrawer(false);
                  }, 2500);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold uppercase tracking-wider hover:opacity-90 transition text-xs flex items-center justify-center gap-2"
              >
                <span>{checkoutComplete ? '✓ Order Settled on Ledger!' : 'Proceed to Checkout'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 5. DYNAMIC REAL ESTATE PREVIEW
 */
function RealEstatePreview({ 
  userName, 
  onUserNameChange, 
  skills, 
  rawInput, 
  title 
}) {
  const brandName = userName || 'Verified Property Marketplace';
  const effectiveConfigs = skills.length > 0 ? skills : ['2 BHK', '3 BHK', '4 BHK Luxury Villas', 'Penthouses'];

  const [bhkFilter, setBhkFilter] = useState('All');
  const [scheduledModal, setScheduledModal] = useState(null);
  const [isEditingBrand, setIsEditingBrand] = useState(false);

  const properties = useMemo(() => {
    return effectiveConfigs.map((cfg, idx) => ({
      id: `PROP-${idx + 1}`,
      title: `${brandName} ${cfg} Residence`,
      location: idx % 2 === 0 ? 'Whitefield, Bengaluru' : 'Indiranagar 100ft Rd, Bengaluru',
      bhk: cfg,
      area: `${1200 + idx * 600} sq.ft`,
      price: idx === 0 ? '₹95 Lakh' : (idx === 1 ? '₹1.65 Cr' : '₹2.85 Cr'),
      rating: 4.9,
      tag: idx === 0 ? 'Ready to Move' : 'Premium Luxury',
      amenities: ['Clubhouse', 'Olympic Pool', 'Solar Backup', 'RERA Approved']
    }));
  }, [brandName, effectiveConfigs]);

  const filteredProperties = bhkFilter === 'All'
    ? properties
    : properties.filter(p => p.bhk.includes(bhkFilter));

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {!userName && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-slate-900 to-cyan-500/10 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-300">
            <Home className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Realty brand parameter omitted in prompt. Type agency/brand name:</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. Skyline Realty"
              value={userName}
              onChange={(e) => onUserNameChange(e.target.value)}
              className="bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 w-full sm:w-56"
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 p-6 sm:p-8 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
              RERA Verified Marketplace
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Zero Brokerage Guarantee</span>
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {brandName}
            </h2>
            <button
              type="button"
              onClick={() => setIsEditingBrand(!isEditingBrand)}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-400 transition"
              title="Edit Brand Name"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {isEditingBrand && (
            <div className="flex items-center gap-2 pt-1 font-mono text-xs">
              <span className="text-cyan-400">Edit Realty Brand:</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => onUserNameChange(e.target.value)}
                className="bg-slate-950 border border-cyan-500/50 rounded px-2 py-1 text-white text-xs"
              />
              <button
                onClick={() => setIsEditingBrand(false)}
                className="px-2 py-1 bg-cyan-500 text-slate-950 font-bold rounded text-[10px]"
              >
                Save
              </button>
            </div>
          )}

          <p className="text-xs text-slate-300 mt-1">
            Discover verified luxury residential properties customized for <strong className="text-cyan-300">{brandName}</strong>
          </p>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProperties.map(prop => (
          <div 
            key={prop.id}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                  {prop.tag}
                </span>
                <span className="text-emerald-400 font-bold text-base">{prop.price}</span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                {prop.title}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-rose-400" /> {prop.location}
              </p>

              <div className="flex items-center gap-3 my-3 text-xs font-mono text-slate-300">
                <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">{prop.bhk}</span>
                <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">{prop.area}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {prop.amenities.map((a, ai) => (
                  <span key={ai} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-slate-400 border border-slate-800/80">
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-slate-400">RERA Verified</span>
              <button
                type="button"
                onClick={() => setScheduledModal(prop)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition"
              >
                Schedule Site Visit
              </button>
            </div>
          </div>
        ))}
      </div>

      {scheduledModal && (
        <div className="p-5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 font-mono text-xs text-emerald-200 shadow-2xl flex items-center justify-between gap-4 animate-fadeIn">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Site Visit Confirmed: {scheduledModal.title}
            </h4>
            <p className="text-[11px] text-emerald-300 mt-1">
              Assigned through {brandName}. Executive will connect on WhatsApp.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setScheduledModal(null)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white border border-slate-700 hover:bg-slate-800 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 6. DYNAMIC DEFAULT / AGRICULTURAL / CUSTOM PORTAL PREVIEW
 */
function GenericDashboardPreview({ 
  userName, 
  onUserNameChange, 
  skills, 
  rawInput, 
  title 
}) {
  const portalTitle = title || (userName ? `${userName} Sovereign Portal` : 'Sovereign Edge Portal');
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [selectedSeedQuota, setSelectedSeedQuota] = useState('Paddy IR-64');

  const isSeedSubsidy = /seed|seeds|subsidy|ಬೀಜ|ಕೃಷಿ|crop|farmer|agriculture|ರೈತ|ಸಹಾಯಧನ/i.test(rawInput + ' ' + portalTitle);

  const seedQuotas = [
    { name: 'Certified Paddy (IR-64)', quota: '50 Quintals', subsidy: '75% Govt Subsidized', status: 'In Stock (District Hub)' },
    { name: 'Bio-Fortified Ragi (GPU-28)', quota: '40 Quintals', subsidy: '75% Govt Subsidized', status: 'Immediate Dispatch' },
    { name: 'Groundnut Seeds (K-6)', quota: '25 Quintals', subsidy: '50% Govt Subsidized', status: 'Allocated' },
    { name: 'Bio-Fertilizer & Micronutrients', quota: '100 Kits', subsidy: '100% Free Quota', status: 'Ready for Collection' }
  ];

  const records = isSeedSubsidy ? [
    { id: 'BEN-KA08', name: userName ? `${userName} Node` : 'Mandya Kaveri Raitha Sangha', district: 'District KA-08 (Mandya)', amount: '₹15,00,000', status: 'DISBURSED', date: 'Oct 04, 2026' },
    { id: 'BEN-KA14', name: 'Shimoga Agro Seed Society', district: 'District KA-14 (Shimoga)', amount: '₹22,50,000', status: 'IN_TRANSIT', date: 'Oct 04, 2026' },
    { id: 'BEN-KA02', name: 'Tumakuru Farmers Cooperative', district: 'District KA-02 (Tumakuru)', amount: '₹12,50,000', status: 'DISBURSED', date: 'Oct 04, 2026' }
  ] : [
    { id: 'BEN-001', name: userName ? `${userName} Node` : 'Kaveri Basin Farmers Cooperative', district: 'District KA-08', amount: '₹15,00,000', status: 'DISBURSED', date: 'Oct 04, 2026' },
    { id: 'BEN-002', name: 'Regional Telemetry Balancer', district: 'District KA-14', amount: '₹22,50,000', status: 'IN_TRANSIT', date: 'Oct 04, 2026' }
  ];

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-emerald-950/60 p-6 sm:p-8 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
              Sovereign Edge Public Portal
            </span>
            <span className="text-[10px] font-mono text-cyan-300">W3C Digital ShramSetu Spec</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {portalTitle}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {rawInput || 'Real-time direct benefit tracking, telemetry balancing, and autonomous TEE allocations.'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-semibold">
            ● 100% Operational
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">Approved Allocation</div>
          <div className="text-emerald-400 font-bold text-base mt-1">₹50,00,000</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Direct Benefit Gateway</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">Beneficiaries</div>
          <div className="text-cyan-300 font-bold text-base mt-1">1,420 Enrolled</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Verified DIDs</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">Enclave Egress</div>
          <div className="text-white font-bold text-base mt-1">0 Bytes Leakage</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">AMD SEV-SNP Active</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">Processing Latency</div>
          <div className="text-amber-300 font-bold text-base mt-1">1.2 ms</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Airgapped Localhost</div>
        </div>
      </div>

      {/* Seed Subsidy Quota Cards */}
      {isSeedSubsidy && (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
              <span>🌱</span> Subsidized Certified Seeds Allocation Quota (75% DBT)
            </span>
            <span className="text-[10px] text-slate-400">Govt of Karnataka Agriculture Dept Spec</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {seedQuotas.map((sq, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedSeedQuota(sq.name)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedSeedQuota === sq.name 
                    ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-lg shadow-emerald-500/10' 
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-bold text-white">{sq.name}</div>
                <div className="text-emerald-400 font-bold text-sm mt-1">{sq.quota}</div>
                <div className="text-[10px] text-cyan-300 mt-0.5">{sq.subsidy}</div>
                <div className="text-[9px] text-slate-400 mt-1">{sq.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Beneficiary Ledger Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="font-bold text-white text-xs">Active Beneficiary Ledger & Disbursement Stream</span>
          <span className="text-[10px] text-slate-400">Updated: Just Now</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="py-2">Beneficiary ID</th>
                <th className="py-2">Jurisdiction</th>
                <th className="py-2">Allocation</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Settlement Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-slate-900/50">
                  <td className="py-2.5 font-bold text-cyan-300">{r.id}</td>
                  <td className="py-2.5 text-slate-200">{r.name} ({r.district})</td>
                  <td className="py-2.5 font-bold text-emerald-400">{r.amount}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-slate-400 text-[11px]">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div>
          <h4 className="font-bold text-white text-sm">Submit Direct Benefit Claim on Sovereign Edge</h4>
          <p className="text-slate-400 text-xs mt-0.5">Instant zero-trust attestation issued to your Digital ShramSetu wallet</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setClaimSubmitted(true);
            setTimeout(() => setClaimSubmitted(false), 3000);
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold uppercase tracking-wider hover:opacity-90 transition shrink-0"
        >
          {claimSubmitted ? '✓ Claim Sealed to Ledger!' : '⚡ Fast-Track Claim (₹50L)'}
        </button>
      </div>
    </div>
  );
}

/**
 * Universal Master Container rendering the synthesized application
 * with dynamic parameters bound directly to visual UI.
 */
export default function DynamicAppPreview({ currentTopic, activeVC, onParametersChange }) {
  // Extract real dynamic parameters from activeVC or parse from currentTopic
  const resolvedParams = useMemo(() => {
    const cred = activeVC?.credentialSubject || activeVC?.parameters || {};
    if (cred.project_type && (cred.user_name !== undefined || cred.items_or_skills !== undefined)) {
      return {
        project_type: cred.project_type || 'CUSTOM',
        user_name: cred.user_name || '',
        title: cred.title || '',
        items_or_skills: Array.isArray(cred.items_or_skills) ? cred.items_or_skills : [],
        raw_input: cred.raw_input || cred.raw_transcript || currentTopic || ''
      };
    }
    return parseIntentFromText(currentTopic || '');
  }, [activeVC, currentTopic]);

  // Live editable state allowing users to type and edit in real time
  const [userName, setUserName] = useState(resolvedParams.user_name || '');
  const [skills, setSkills] = useState(resolvedParams.items_or_skills || []);
  const [title, setTitle] = useState(resolvedParams.title || '');

  useEffect(() => {
    setUserName(resolvedParams.user_name || '');
    setSkills(resolvedParams.items_or_skills || []);
    setTitle(resolvedParams.title || '');
  }, [resolvedParams]);

  const handleUserNameChange = (newName) => {
    setUserName(newName);
    if (onParametersChange) {
      onParametersChange({
        ...resolvedParams,
        user_name: newName,
        title: newName ? `${newName}'s Portfolio` : title
      });
    }
  };

  const category = detectTopicCategory(currentTopic, resolvedParams.project_type);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Mockup Browser Top Chrome */}
      <div className="bg-slate-900/95 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Window controls */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-[11px] text-slate-400">
            Synthesized by Sovereign Agent Swarm
          </span>
        </div>

        {/* Mock Browser URL Bar */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 w-full sm:w-80 truncate">
          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-500">https://</span>
          <span className="text-cyan-300 font-semibold truncate">
            {userName ? userName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'omni-preview'}.internal/{category}
          </span>
        </div>

        {/* Domain Badge */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase font-bold tracking-wider">
            {resolvedParams.project_type || category}
          </span>
        </div>
      </div>

      {/* Main Synthesized UI Zone */}
      <div className="p-4 sm:p-6 bg-slate-950/70">
        {category === 'portfolio' && (
          <PortfolioPreview 
            userName={userName}
            onUserNameChange={handleUserNameChange}
            skills={skills}
            rawInput={resolvedParams.raw_input}
            title={title}
          />
        )}
        {category === 'hospital' && (
          <HospitalBookingPreview 
            userName={userName}
            onUserNameChange={handleUserNameChange}
            skills={skills}
            rawInput={resolvedParams.raw_input}
            title={title}
          />
        )}
        {category === 'realestate' && (
          <RealEstatePreview 
            userName={userName}
            onUserNameChange={handleUserNameChange}
            skills={skills}
            rawInput={resolvedParams.raw_input}
            title={title}
          />
        )}
        {category === 'chatbot' && (
          <ChatbotPreview 
            userName={userName}
            onUserNameChange={handleUserNameChange}
            skills={skills}
            rawInput={resolvedParams.raw_input}
            title={title}
          />
        )}
        {category === 'ecommerce' && (
          <EcommercePreview 
            userName={userName}
            onUserNameChange={handleUserNameChange}
            skills={skills}
            rawInput={resolvedParams.raw_input}
            title={title}
          />
        )}
        {category === 'default' && (
          <GenericDashboardPreview 
            userName={userName}
            onUserNameChange={handleUserNameChange}
            skills={skills}
            rawInput={resolvedParams.raw_input}
            title={title}
          />
        )}
      </div>
    </div>
  );
}
