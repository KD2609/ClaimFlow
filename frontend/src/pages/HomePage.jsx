import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  FileText,
  Bot,
  BarChart3,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  Cpu,
  Database,
  Code2,
  Sparkles,
  Menu,
  X,
  User,
  Lock,
  Info,
  Server
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Smooth scroll helper
  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('hero');
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 72;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'overview', 'how-it-works', 'tech-stack'];
      const scrollPos = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8F6] text-[#1E293B] flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* ========================================================================= */}
      {/* 1. TOP PUBLIC NAVIGATION BAR                                              */}
      {/* ========================================================================= */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand Logo & Name (No version or OR/RPA tags) */}
            <div 
              onClick={() => scrollTo('hero')}
              className="flex items-center space-x-2.5 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-teal-800 transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-800 tracking-tight">
                ClaimFlow
              </span>
            </div>

            {/* Center: Desktop Navigation Links with Active Highlighting */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <button
                onClick={() => scrollTo('hero')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSection === 'hero'
                    ? 'text-teal-800 bg-teal-50 border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollTo('features')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSection === 'features'
                    ? 'text-teal-800 bg-teal-50 border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => scrollTo('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSection === 'overview'
                    ? 'text-teal-800 bg-teal-50 border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Project Overview
              </button>
              <button
                onClick={() => scrollTo('how-it-works')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSection === 'how-it-works'
                    ? 'text-teal-800 bg-teal-50 border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                How It Works
              </button>
            </nav>

            {/* Right: Auth Action Buttons */}
            <div className="hidden sm:flex items-center space-x-2 lg:space-x-2.5">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-teal-800 hover:bg-teal-50/60 border border-slate-200/90 bg-white transition-all shadow-xs whitespace-nowrap"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 hover:bg-teal-100 transition-all shadow-xs whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
            <button
              onClick={() => scrollTo('hero')}
              className="block w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="block w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('overview')}
              className="block w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Project Overview
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="block w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </button>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-all shadow-xs"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 bg-white"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-100"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section id="hero" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Subtle Ambient Background Gradient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden select-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-100/50 blur-3xl opacity-70" />
          <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl opacity-60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Text & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Small Category Label */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                <span>INSURANCE CLAIM AUTOMATION</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
                Insurance Claim Automation with{' '}
                <span className="text-teal-700">RPA &amp; Operations Research</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                A college project to automate insurance claim processing using Robotic Process Automation (RPA) and analyze system performance through Operations Research simulation.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all group"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <button
                  type="button"
                  onClick={() => scrollTo('overview')}
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-all"
                >
                  <span>Learn More</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Academic Highlights Ribbon */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left max-w-lg">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Cycle Latency</span>
                  <span className="text-base sm:text-lg font-extrabold text-slate-800">↓ 88% Faster</span>
                  <span className="text-[10px] text-slate-500 block">40 min → 3.7 min</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Unit Cost</span>
                  <span className="text-base sm:text-lg font-extrabold text-teal-700">↓ 70% Saved</span>
                  <span className="text-[10px] text-slate-500 block">$22.80 → $4.48</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Queue Model</span>
                  <span className="text-base sm:text-lg font-extrabold text-slate-800">M/G/c Queue</span>
                  <span className="text-[10px] text-slate-500 block">SimPy Discrete-Event</span>
                </div>
              </div>
            </div>

            {/* Right Column: ClaimFlow Dashboard Device Mockup */}
            <div className="lg:col-span-5 relative">
              {/* Outer Laptop Chassis Frame */}
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl bg-slate-900 p-2.5 sm:p-3 shadow-xl ring-1 ring-slate-800/10">
                {/* Screen Bezel Notch */}
                <div className="w-16 h-1 bg-slate-700 rounded-full mx-auto mb-2 opacity-50"></div>

                {/* Dashboard Screen Content Container */}
                <div className="rounded-xl bg-[#F7F8F6] p-3 sm:p-4 border border-slate-200/60 overflow-hidden text-left space-y-3 font-sans">
                  {/* Mini Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-5 h-5 rounded bg-teal-700 text-white flex items-center justify-center font-bold text-[9px]">
                        CF
                      </div>
                      <span className="text-xs font-bold text-slate-800">ClaimFlow Console</span>
                    </div>
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Pipeline Active</span>
                    </span>
                  </div>

                  {/* Mini KPI Cards Grid */}
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Claims Intake</span>
                      <span className="text-sm font-bold text-slate-800">250 Claims</span>
                      <span className="text-[9px] text-teal-700 block mt-0.5">λ = 12.0 claims/hr</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">STP Settlement</span>
                      <span className="text-sm font-bold text-emerald-600">82.4% Clean</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">17.6% Escalated</span>
                    </div>
                  </div>

                  {/* Mini Pipeline Adjudication Step List */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-700 flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-teal-700" />
                        <span>1. OCR Document Audit</span>
                      </span>
                      <span className="text-emerald-600 font-bold">100% Passed</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-700 flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-teal-700" />
                        <span>2. Policy Limit Validation</span>
                      </span>
                      <span className="text-emerald-600 font-bold">Approved</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-700 flex items-center space-x-1">
                        <Bot className="w-3 h-3 text-teal-700" />
                        <span>3. RPA Bot Execution</span>
                      </span>
                      <span className="text-teal-700 font-bold">1.5 min/claim</span>
                    </div>
                  </div>

                  {/* Mini Queue Latency Comparison Bar */}
                  <div className="p-2 rounded-lg bg-teal-50/60 border border-teal-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-600">Queue Latency Reduction:</span>
                    <span className="font-bold text-teal-800">↓ 88.2% (W_q = 2.1 min)</span>
                  </div>
                </div>
              </div>

              {/* Floating Glassmorphism Badge 1 (Top Right) */}
              <div className="hidden sm:flex absolute -top-5 -right-4 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md items-center space-x-2.5 z-10 animate-fade-in">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-slate-800">Policy Verified</p>
                  <p className="text-[9px] text-slate-400">Deductible ceiling check passed</p>
                </div>
              </div>

              {/* Floating Glassmorphism Badge 2 (Bottom Left) */}
              <div className="hidden sm:flex absolute -bottom-5 -left-4 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md items-center space-x-2.5 z-10">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-slate-800">RPA Bot Fleet Active</p>
                  <p className="text-[9px] text-slate-400">Sub-second document extraction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURES SECTION                                                       */}
      {/* ========================================================================= */}
      <section id="features" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 inline-block">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Operations Research &amp; Automation Features
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Designed to simulate and analyze the operational impact of Robotic Process Automation on multi-server queueing systems.
            </p>
          </div>

          {/* 4 Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Claim Management */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-teal-600/60 transition-all text-left flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 mb-2">
                  Claim Management
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Track and manage insurance claims efficiently.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Dossier &amp; Intake</span>
                <span className="text-teal-700 font-semibold">Active Pipeline →</span>
              </div>
            </div>

            {/* Card 2: RPA Automation */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-teal-600/60 transition-all text-left flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 mb-2">
                  RPA Automation
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Automate document verification, policy checks, and processing decisions.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Straight-Through (STP)</span>
                <span className="text-teal-700 font-semibold">Bot Fleet →</span>
              </div>
            </div>

            {/* Card 3: OR Simulation Lab */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-teal-600/60 transition-all text-left flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 mb-2">
                  OR Simulation Lab
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Analyze queue performance using SimPy and M/G/c queueing models.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Poisson λ &amp; Congestion</span>
                <span className="text-teal-700 font-semibold">SimPy Engine →</span>
              </div>
            </div>

            {/* Card 4: Operational Insights */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-teal-600/60 transition-all text-left flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 mb-2">
                  Operational Insights
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Compare processing costs, waiting times, throughput and resource utilization.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Capital ROI Payback</span>
                <span className="text-teal-700 font-semibold">3-Yr Model →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PROJECT OVERVIEW SECTION                                               */}
      {/* ========================================================================= */}
      <section id="overview" className="py-16 md:py-20 bg-[#F7F8F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 inline-block">
              Operations Research Context
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              About the Project
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
              Traditional insurance claim processing involves repetitive manual verification, long waiting queues and operational costs. ClaimFlow demonstrates how Robotic Process Automation can simplify repetitive claim-processing activities while Operations Research simulation helps analyze and compare the performance of manual and automated systems.
            </p>
          </div>

          {/* Side-by-Side Queue Comparison Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto text-left">
            {/* Traditional Manual Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Traditional Manual Processing</h3>
                    <p className="text-[10px] text-slate-400">M/G/c Multi-Server Queue</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                  Scenario A
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Claims adjusters manually perform OCR reviews, policy ceiling audits, invoice arithmetic, and anomaly evaluations. Service times follow a variable heavy-tailed distribution, causing queue congestion when claim arrival rate surges.
              </p>

              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Average Processing Time:</span>
                  <span className="font-mono font-semibold text-slate-800">~24.0 – 40.0 min</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Unit Cost per Claim:</span>
                  <span className="font-mono font-semibold text-slate-800">$22.80 ($28.50/hr labor)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Queue Congestion Risk:</span>
                  <span className="font-semibold text-amber-700">Explodes when λ &gt; 10/hr</span>
                </div>
              </div>
            </div>

            {/* RPA Automated Pipeline Card */}
            <div className="p-6 rounded-2xl bg-white border border-teal-200/80 shadow-2xs space-y-4 ring-1 ring-teal-600/10">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">RPA Automated Pipeline</h3>
                    <p className="text-[10px] text-teal-700 font-medium">Deterministic Automation + Escalation</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/60">
                  Scenario B
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Parallel RPA bots automatically ingest, inspect, and approve clean claims (~82% STP) in seconds. Only complex anomalies or fraud flags (&gt;65) are escalated to human adjusters, stabilizing the queue and eliminating bottlenecks.
              </p>

              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Average Processing Time:</span>
                  <span className="font-mono font-bold text-emerald-700">~1.5 – 3.7 min (↓88%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Unit Cost per Claim:</span>
                  <span className="font-mono font-bold text-emerald-700">$4.48 (↓70% saved)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Capital Payback Period:</span>
                  <span className="font-semibold text-teal-700">~4.2 Months Payback</span>
                </div>
              </div>
            </div>
          </div>

          {/* Little's Law Theoretical Formulation Banner */}
          <div className="mt-8 max-w-5xl mx-auto p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Theoretical Validation with Little's Law
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Congestion in the discrete-event model strictly satisfies Little's Law: <code className="bg-slate-100 text-teal-800 px-1 py-0.5 rounded font-mono font-semibold">L = λ × W</code>
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200/60 whitespace-nowrap">
              M/G/c Queue Analysis
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW IT WORKS SECTION                                                   */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-16 md:py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 inline-block">
              End-to-End Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Four structured operational stages connecting claim intake to simulation analysis.
            </p>
          </div>

          {/* 4 Connected Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative text-left">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between relative group hover:border-teal-600/60 hover:bg-white transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-teal-700 flex items-center justify-center font-bold shadow-2xs group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">01</span>
                </div>
                <h3 className="font-bold text-sm text-slate-800 mb-1.5">
                  1. Submit Claim
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Insurance claim and supporting documents are submitted.
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-200/60">
                Customer info, requested amount &amp; document dossier.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between relative group hover:border-teal-600/60 hover:bg-white transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-teal-700 flex items-center justify-center font-bold shadow-2xs group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">02</span>
                </div>
                <h3 className="font-bold text-sm text-slate-800 mb-1.5">
                  2. Automated Processing
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  RPA workers perform predefined document and policy verification tasks.
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-200/60">
                Sub-second OCR check, policy limit check &amp; fraud score.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between relative group hover:border-teal-600/60 hover:bg-white transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-teal-700 flex items-center justify-center font-bold shadow-2xs group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">03</span>
                </div>
                <h3 className="font-bold text-sm text-slate-800 mb-1.5">
                  3. Performance Analysis
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  SimPy simulates queue behaviour and compares manual and automated processing.
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-200/60">
                Poisson arrivals, server utilization &amp; queue wait times.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between relative group hover:border-teal-600/60 hover:bg-white transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-teal-700 flex items-center justify-center font-bold shadow-2xs group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">04</span>
                </div>
                <h3 className="font-bold text-sm text-slate-800 mb-1.5">
                  4. Results &amp; Decisions
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Processing outcomes and operational performance metrics are displayed.
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-200/60">
                Instant STP approvals, exceptions, and 3-Year ROI curve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TECHNOLOGY STACK SECTION                                               */}
      {/* ========================================================================= */}
      <section id="tech-stack" className="py-16 md:py-20 bg-[#F7F8F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 inline-block">
              Project Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Technology Stack
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Implemented with clean, modern technologies for an academic Operations Research demonstration.
            </p>
          </div>

          {/* 5 Tech Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
            {/* React */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">React</h3>
                <span className="text-[10px] font-semibold text-teal-700 block mb-1">Frontend</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Vite, Tailwind CSS, Recharts analytics, and responsive navigation.
                </p>
              </div>
            </div>

            {/* Spring Boot */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                  <Server className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">Spring Boot</h3>
                <span className="text-[10px] font-semibold text-teal-700 block mb-1">Backend</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Java 21 / 17, Spring Data JPA, lightweight REST API, and data seeding.
                </p>
              </div>
            </div>

            {/* Python */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">Python</h3>
                <span className="text-[10px] font-semibold text-teal-700 block mb-1">Simulation Engine</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  FastAPI service exposing simulation and sensitivity endpoints on port 8000.
                </p>
              </div>
            </div>

            {/* SimPy */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">SimPy</h3>
                <span className="text-[10px] font-semibold text-teal-700 block mb-1">Discrete-Event</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Stochastic queue modeling, Poisson arrival generation, and server resources.
                </p>
              </div>
            </div>

            {/* PostgreSQL / H2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">PostgreSQL / H2</h3>
                <span className="text-[10px] font-semibold text-teal-700 block mb-1">Database</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  In-memory PostgreSQL-compatible mode for instant zero-config evaluation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CALL TO ACTION STRIP                                                   */}
      {/* ========================================================================= */}
      <section className="py-12 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Explore the ClaimFlow Operations Research Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Sign in with an account configured for your deployment to explore the claims registry, manual adjuster workbench, RPA console, and SimPy simulation studio.
          </p>
          <div className="pt-2 flex justify-center items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Branding & Course Identity */}
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded bg-teal-700 flex items-center justify-center text-white font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-800 text-sm">ClaimFlow</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 text-xs">College Project</span>
            </div>

            {/* Center: Topics & Technologies */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
              <span>Insurance Claim Automation</span>
              <span>•</span>
              <span>RPA</span>
              <span>•</span>
              <span>Operations Research</span>
              <span>•</span>
              <span>SimPy Simulation</span>
            </div>

            {/* Right: Quick Links */}
            <div className="flex items-center space-x-4 text-xs">
              <button 
                onClick={() => scrollTo('hero')} 
                className="hover:text-teal-700 transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollTo('features')} 
                className="hover:text-teal-700 transition-colors"
              >
                Features
              </button>
              <Link 
                to="/login" 
                className="font-semibold text-teal-700 hover:text-teal-800 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 9. SIGN UP DEMO NOTICE MODAL                                              */}
      {/* ========================================================================= */}
      {signUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">College Demonstration Project</h3>
                  <p className="text-[11px] text-slate-400">Pre-Configured Demo Accounts</p>
                </div>
              </div>
              <button
                onClick={() => setSignUpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This academic application operates with pre-configured role accounts to protect simulation datasets. Public self-registration is not required. You can sign in immediately using either of the demo accounts below:
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">Administrator Role</span>
                  <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.2 rounded font-semibold">Full Access</span>
                </div>
                <div className="font-mono text-[11px] text-slate-600">User: <strong className="text-slate-800">admin</strong></div>
                <p className="text-[10px] text-slate-400 mt-1">Full access to Simulation Studio, RPA Console, and Claims Management.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">Claims Adjuster Role</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded font-semibold">Adjuster</span>
                </div>
                <div className="font-mono text-[11px] text-slate-600">User: <strong className="text-slate-800">processor</strong></div>
                <p className="text-[10px] text-slate-400 mt-1">Access to 5-stage Manual Adjudication Workbench and Dossier.</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSignUpModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignUpModalOpen(false);
                  navigate('/login');
                }}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
