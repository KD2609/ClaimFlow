import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { claimApi, manualProcessingApi } from '../services/api';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  History,
  Check
} from 'lucide-react';

const STAGES = [
  { key: 'DOCUMENT_VERIFICATION', title: '1. Document Verification', desc: 'Verify claimant identity, medical invoices, or police reports' },
  { key: 'POLICY_VALIDATION', title: '2. Policy Validation', desc: 'Confirm policy coverage status, effective dates, and deductible limits' },
  { key: 'AMOUNT_VERIFICATION', title: '3. Amount Verification', desc: 'Audit itemized billing against standard tariff tables and coverage ceilings' },
  { key: 'FRAUD_DETECTION', title: '4. Fraud-Risk Review', desc: 'Examine anomaly indicators, frequency patterns, and claimant history' },
  { key: 'FINAL_DECISION', title: '5. Adjudication Decision', desc: 'Final approval or rejection with payout calculation' },
];

const ManualProcessing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const claimIdParam = searchParams.get('claimId');

  const [claim, setClaim] = useState(null);
  const [claimHistory, setClaimHistory] = useState([]);
  const [pendingClaimsList, setPendingClaimsList] = useState([]);
  const [claimsLoadError, setClaimsLoadError] = useState('');
  const [claimLoadError, setClaimLoadError] = useState('');
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [loadingClaim, setLoadingClaim] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState(claimIdParam || '');
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  // Live Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [hourlyRate, setHourlyRate] = useState(28.50); // $28.50 / hr

  // Stage form inputs
  const [stageNotes, setStageNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');

  const timerRef = useRef(null);

  // Load claims eligible for manual processing
  useEffect(() => {
    const loadEligibleClaims = async () => {
      try {
        setLoadingClaims(true);
        setClaimsLoadError('');
        const res = await claimApi.getClaims({ size: 100 });
        const eligible = (res.data.content || []).filter(
          (c) => c.claimStatus === 'SUBMITTED' || c.claimStatus === 'IN_REVIEW' || c.claimStatus === 'REQUIRES_MANUAL_REVIEW'
        );
        setPendingClaimsList(eligible);
        if (!selectedClaimId && eligible.length > 0) {
          setSelectedClaimId(eligible[0].id.toString());
        }
      } catch (e) {
        console.error('Error fetching eligible claims:', e);
        setPendingClaimsList([]);
        setClaimsLoadError(e.response?.data?.message || 'Could not load eligible claims. Check the API connection and try again.');
      } finally {
        setLoadingClaims(false);
      }
    };
    loadEligibleClaims();
  }, []);

  // Load selected claim data
  useEffect(() => {
    if (!selectedClaimId) {
      setClaim(null);
      setLoadingClaim(false);
      return;
    }

    const loadClaimDetails = async () => {
      try {
        setLoadingClaim(true);
        setClaimLoadError('');
        const res = await claimApi.getClaimById(selectedClaimId);
        setClaim(res.data);
        setApprovedAmount(res.data.eligiblePayoutAmount || res.data.claimAmount);

        // Load processing history
        const hRes = await manualProcessingApi.getHistory(selectedClaimId);
        setClaimHistory(hRes.data || []);

        // Infer current stage
        const histCount = hRes.data?.length || 0;
        setActiveStageIndex(Math.min(histCount, 4));
        setTimerSeconds(0);
        setIsTimerRunning(true);
      } catch (e) {
        console.error('Error loading claim:', e);
        setClaim(null);
        setClaimLoadError(e.response?.data?.message || 'Could not load the selected claim. Please select it again or retry.');
      } finally {
        setLoadingClaim(false);
      }
    };

    loadClaimDetails();
  }, [selectedClaimId]);

  // Timer ticker
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  const activeStageCost = (timerSeconds / 3600) * hourlyRate;
  const currentTotalLaborCost = (claim?.totalOperationalCost || 0) + activeStageCost;

  const handleProgressStage = async () => {
    if (!claim) return;
    setSubmitting(true);
    setFeedbackMsg('');
    try {
      const stageKey = STAGES[activeStageIndex].key;
      await manualProcessingApi.progressStage({
        claimId: claim.id,
        stage: stageKey,
        durationMinutes: timerSeconds / 60.0,
        hourlyCost: hourlyRate,
        notes: stageNotes || `Stage ${stageKey} verified by human claim processor.`,
        verified: true,
      });

      setFeedbackMsg(`Stage "${STAGES[activeStageIndex].title}" saved successfully.`);
      setStageNotes('');
      setTimerSeconds(0);

      // Advance stage
      if (activeStageIndex < 4) {
        setActiveStageIndex((prev) => prev + 1);
      }

      // Refresh claim history
      const hRes = await manualProcessingApi.getHistory(claim.id);
      setClaimHistory(hRes.data || []);
      const cRes = await claimApi.getClaimById(claim.id);
      setClaim(cRes.data);
    } catch (err) {
      setFeedbackMsg(`Error: ${err.response?.data?.message || 'Failed to progress stage'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalDecision = async (decisionStatus) => {
    if (!claim) return;
    setSubmitting(true);
    setFeedbackMsg('');
    try {
      await manualProcessingApi.submitDecision({
        claimId: claim.id,
        decision: decisionStatus,
        eligiblePayoutAmount: decisionStatus === 'APPROVED' ? parseFloat(approvedAmount) : 0,
        decisionRationale: decisionNotes || `Claim adjudicated to ${decisionStatus} by senior adjuster.`,
      });

      setFeedbackMsg(`Claim #${claim.claimNumber} successfully adjudicated: ${decisionStatus}!`);
      // Reload claim
      const cRes = await claimApi.getClaimById(claim.id);
      setClaim(cRes.data);
      const hRes = await manualProcessingApi.getHistory(claim.id);
      setClaimHistory(hRes.data || []);
      setIsTimerRunning(false);
    } catch (err) {
      setFeedbackMsg(`Error: ${err.response?.data?.message || 'Decision failed'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manual Claim Workbench</h1>
          <p className="text-sm text-slate-500 mt-1">
            Step-by-step human verification pipeline tracking elapsed labor stopwatch and accumulated processing costs.
          </p>
        </div>

        {/* Claim Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Select Claim:</label>
          <select
            value={selectedClaimId}
            onChange={(e) => setSelectedClaimId(e.target.value)}
            disabled={loadingClaims || pendingClaimsList.length === 0}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none shadow-sm"
          >
            {pendingClaimsList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.claimNumber} - {c.customerName} (${c.claimAmount?.toLocaleString()})
              </option>
            ))}
            {pendingClaimsList.length === 0 && <option value="">{loadingClaims ? 'Loading claims...' : claimsLoadError ? 'Claims unavailable' : 'No eligible claims'}</option>}
          </select>
        </div>
      </div>

      {claimsLoadError && <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{claimsLoadError}</div>}

      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg('')} className="text-teal-700 hover:text-teal-900 font-bold">✕</button>
        </div>
      )}

      {loadingClaim || (loadingClaims && !selectedClaimId) ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
          <Clock className="w-8 h-8 mx-auto mb-2 text-teal-600 animate-pulse" />
          <p className="text-sm font-semibold">Loading claim details...</p>
        </div>
      ) : claim ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Claim Overview & Labor Stopwatch */}
          <div className="space-y-6">
            {/* Claim Profile Dossier Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-mono text-xs font-bold text-teal-700">{claim.claimNumber}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  claim.claimStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  claim.claimStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {claim.claimStatus?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Claimant:</span>
                  <span className="font-semibold text-slate-800">{claim.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Policy Number:</span>
                  <span className="font-mono text-slate-700">{claim.policyNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Insurance Type:</span>
                  <span className="font-medium text-slate-700">{claim.insuranceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Requested Amount:</span>
                  <span className="font-bold text-slate-900">${claim.claimAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Policy Limit:</span>
                  <span className="font-mono text-slate-700">${claim.coverageAmount?.toLocaleString() || '50,000'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-slate-400">Fraud Anomaly Score:</span>
                  <span className={`font-mono font-bold text-xs ${
                    (claim.fraudRiskScore || 0) > 65 ? 'text-rose-600' :
                    (claim.fraudRiskScore || 0) > 35 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {claim.fraudRiskScore ?? 0} / 100
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Attached Documents:</span>
                <div className="space-y-1">
                  {claim.attachedDocuments ? (
                    claim.attachedDocuments.split(',').map((doc, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-50 text-[11px] flex items-center justify-between text-slate-700">
                        <span className="font-mono truncate max-w-[180px]">{doc.trim()}</span>
                        <span className="text-emerald-600 font-semibold text-[10px]">VERIFIED</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-xs italic">No attached files.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Live Operational Cost Telemetry Card - Converted to Light Theme */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-teal-700" />
                  <span>Labor Cost Stopwatch</span>
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                    title={isTimerRunning ? "Pause stopwatch" : "Start stopwatch"}
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setTimerSeconds(0)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                    title="Reset stopwatch"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-center py-2">
                <div className="font-mono text-4xl font-extrabold tracking-wider text-teal-700">
                  {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:
                  {(timerSeconds % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Active Stage Elapsed Time</p>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Hourly Wage Assumption:</span>
                  <span className="font-mono font-semibold text-slate-800">${hourlyRate.toFixed(2)}/hr</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Active Stage Labor Expense:</span>
                  <span className="font-mono font-semibold text-amber-700">${activeStageCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-100 text-sm">
                  <span>Cumulative Claim Labor Cost:</span>
                  <span className="font-mono text-emerald-700">${currentTotalLaborCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 5-Stage Sequential Adjudication Pipeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stages Stepper */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-teal-700" />
                <span>5-Stage Sequential Adjudication Pipeline</span>
              </h2>

              <div className="space-y-4">
                {STAGES.map((stg, index) => {
                  const isCompleted = index < activeStageIndex;
                  const isCurrent = index === activeStageIndex;

                  return (
                    <div
                      key={stg.key}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'border-teal-600 bg-teal-50/30 ring-1 ring-teal-600/30'
                          : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-slate-200 bg-slate-50/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-teal-700 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-xs text-slate-800">{stg.title}</h3>
                            <p className="text-[11px] text-slate-500">{stg.desc}</p>
                          </div>
                        </div>

                        <div>
                          {isCompleted ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              Completed
                            </span>
                          ) : isCurrent ? (
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              In Progress
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Interactive Stage Form for Current Stage (if not final decision) */}
                      {isCurrent && index < 4 && (
                        <div className="mt-4 pt-4 border-t border-teal-200/60 space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Adjuster Verification Notes & Observations:
                            </label>
                            <input
                              type="text"
                              placeholder={`Confirming requirements for ${stg.title}...`}
                              value={stageNotes}
                              onChange={(e) => setStageNotes(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={handleProgressStage}
                              disabled={submitting}
                              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition-all"
                            >
                              <span>Verify & Proceed to Next Stage</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Stage 5: Final Adjudication Decision Panel - Converted to Light Theme */}
              {activeStageIndex >= 4 && claim.claimStatus !== 'APPROVED' && claim.claimStatus !== 'REJECTED' && (
                <div className="mt-6 p-5 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-bold text-sm text-slate-800">Stage 5: Adjudication Decision & Payout</h3>
                    <span className="text-xs text-teal-700 font-semibold">Final Adjudication</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">Eligible Payout Amount ($):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={approvedAmount}
                        onChange={(e) => setApprovedAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">Adjuster Adjudication Rationale:</label>
                      <input
                        type="text"
                        placeholder="e.g. Valid health bill, 10% deductible applied"
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handleFinalDecision('REJECTED')}
                      disabled={submitting}
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Claim</span>
                    </button>
                    <button
                      onClick={() => handleFinalDecision('APPROVED')}
                      disabled={submitting}
                      className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Claim & Payout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Processing History Audit Trail */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
                <History className="w-4 h-4 text-teal-700" />
                <span>Audited Claim Progression Timeline</span>
              </h2>

              <div className="space-y-3">
                {claimHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No stage history logged yet for this claim.</p>
                ) : (
                  claimHistory.map((h, i) => (
                    <div key={h.id || i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">
                          {h.processingStage?.replace(/_/g, ' ')}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{h.notes}</p>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="font-mono font-semibold text-slate-700 block">
                          {(h.durationMinutes || 0).toFixed(1)} min (${(h.laborCost || 0).toFixed(2)})
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {h.performerType || 'HUMAN'} • {h.timestamp ? new Date(h.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
          {claimLoadError ? <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-rose-400" /> : <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />}
          <p className="text-sm font-semibold">{claimLoadError || 'No active claim selected for manual processing.'}</p>
          <p className="text-xs mt-1">{claimLoadError ? 'Please retry after the API is available.' : 'Select an incoming claim from the dropdown above to begin.'}</p>
        </div>
      )}
    </div>
  );
};

export default ManualProcessing;
