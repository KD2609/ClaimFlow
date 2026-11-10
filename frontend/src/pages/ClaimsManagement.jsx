import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { claimApi } from '../services/api';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Shield,
  FileCheck,
  User,
  Sparkles,
  Paperclip,
  Upload,
  Trash2
} from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_MANUAL_REVIEW'];
const TYPE_OPTIONS = ['ALL', 'HEALTH', 'VEHICLE', 'LIFE'];

const DEFAULT_DOCS = [
  'Hospital_Discharge_Summary.pdf',
  'Pharmacy_Prescription_Invoice.pdf',
  'National_Identity_Card.pdf'
];

const ClaimsManagement = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [claims, setClaims] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Modal state for New Claim
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('Sarah Jenkins');
  const [customerEmail, setCustomerEmail] = useState('sarah.jenkins@example.com');
  const [policyNumber, setPolicyNumber] = useState('POL-HLT-2026-881');
  const [insuranceType, setInsuranceType] = useState('HEALTH');
  const [claimAmount, setClaimAmount] = useState('3850.00');
  const [description, setDescription] = useState('Emergency laparoscopic procedure and post-operative in-patient care.');
  const [attachedDocs, setAttachedDocs] = useState(DEFAULT_DOCS);
  const [newDocName, setNewDocName] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Claim Dossier Details Modal state
  const [inspectClaim, setInspectClaim] = useState(null);
  const [dossierDocs, setDossierDocs] = useState([]);
  const fileInputRef = useRef(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const params = {
        page,
        size: pageSize,
      };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await claimApi.getClaims(params);
      setClaims(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);

      if (highlightId && !inspectClaim) {
        const found = (res.data.content || []).find((c) => c.id === Number(highlightId));
        if (found) handleInspect(found);
      }
    } catch (err) {
      console.error('Failed to fetch claims:', err);
      setClaims([]);
      setTotalElements(0);
      setLoadError(err.response?.data?.message || 'Could not load claims. Check the API connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [page, pageSize, statusFilter, typeFilter]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setPage(0);
    fetchClaims();
  };

  const openNewClaimModal = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setPolicyNumber(`POL-${insuranceType.slice(0, 3)}-2026-${randomSuffix}`);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleTypeChange = (newType) => {
    setInsuranceType(newType);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setPolicyNumber(`POL-${newType.slice(0, 3)}-2026-${randomSuffix}`);
    if (newType === 'HEALTH') {
      setDescription('Emergency laparoscopic procedure and post-operative in-patient care.');
      setAttachedDocs(['Hospital_Discharge_Summary.pdf', 'Pharmacy_Invoice.pdf', 'National_ID.pdf']);
    } else if (newType === 'VEHICLE') {
      setDescription('Front bumper and headlight collision repair estimate following multi-vehicle fender bender.');
      setAttachedDocs(['Police_Accident_Report.pdf', 'Garage_Repair_Estimate.pdf', 'Driver_License.pdf']);
    } else {
      setDescription('Term life policy benefit disbursement claim following terminal diagnosis certification.');
      setAttachedDocs(['Physician_Attending_Certificate.pdf', 'Identity_Proof.pdf', 'Beneficiary_Declaration.pdf']);
    }
  };

  const handleAddDocument = () => {
    if (newDocName.trim() && !attachedDocs.includes(newDocName.trim())) {
      setAttachedDocs([...attachedDocs, newDocName.trim()]);
      setNewDocName('');
    }
  };

  const handleRemoveDoc = (docToRemove) => {
    setAttachedDocs(attachedDocs.filter((d) => d !== docToRemove));
  };

  const handleInspect = (claim) => {
    setInspectClaim(claim);
    const initial = claim.attachedDocuments
      ? claim.attachedDocuments.split(',').map((name, i) => ({
          id: `orig-${i}`,
          fileName: name.trim(),
          status: 'Verified',
          isUploaded: false,
        }))
      : [
          { id: 'def-1', fileName: 'Hospital_Discharge_Summary.pdf', status: 'Verified', isUploaded: false },
          { id: 'def-2', fileName: 'National_Identity_Card.pdf', status: 'Verified', isUploaded: false }
        ];
    setDossierDocs(initial);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newEntries = files.map((file, idx) => ({
      id: `upload-${Date.now()}-${idx}`,
      fileName: file.name,
      status: 'Pending Verification',
      isUploaded: true,
      fileSize: (file.size / 1024).toFixed(1) + ' KB',
    }));

    setDossierDocs((prev) => [...prev, ...newEntries]);
    e.target.value = '';
  };

  const handleRemoveDossierDoc = (idToRemove) => {
    setDossierDocs((prev) => prev.filter((d) => d.id !== idToRemove));
  };

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        policyNumber: policyNumber.trim(),
        insuranceType,
        claimAmount: parseFloat(claimAmount),
        description: description.trim() || 'Claim intake submitted for standard verification pipeline.',
        attachedDocuments: attachedDocs.join(', '),
      };

      await claimApi.createClaim(payload);
      setIsModalOpen(false);
      setClaimAmount('');
      setDescription('');
      fetchClaims();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit claim. Please verify your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Insurance Claims Registry</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, and manage insurance claims across Health, Vehicle, and Life portfolios.
          </p>
        </div>

        <button
          onClick={openNewClaimModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Claim</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Claim ID (e.g., CLM-2026-0001) or Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
          />
        </form>

        <div className="flex items-center space-x-3 overflow-x-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <span className="font-semibold">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Claim Number</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Policy No</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Claim Amount</th>
                <th className="py-3 px-6">Submission Date</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Mode</th>
                <th className="py-3 px-6">Fraud Score</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading claims pipeline...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-rose-600 font-medium">{loadError}</td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400 font-medium">
                    No insurance claims found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr
                    key={claim.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      highlightId && Number(highlightId) === claim.id ? 'bg-teal-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-800">
                      {claim.claimNumber}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {claim.customerName}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-500">
                      {claim.policyNumber}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {claim.insuranceType}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      ${claim.claimAmount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {claim.submissionDate ? new Date(claim.submissionDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          claim.claimStatus === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : claim.claimStatus === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : claim.claimStatus === 'REQUIRES_MANUAL_REVIEW'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : claim.claimStatus === 'IN_REVIEW'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {claim.claimStatus?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        claim.processingMode === 'AUTOMATED' 
                          ? 'bg-teal-50 text-teal-800 border border-teal-200' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {claim.processingMode === 'AUTOMATED' ? 'RPA BOT' : 'MANUAL'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`font-mono text-xs font-bold ${
                        (claim.fraudRiskScore || 0) > 65
                          ? 'text-rose-600'
                          : (claim.fraudRiskScore || 0) > 35
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}>
                        {claim.fraudRiskScore ?? 0} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleInspect(claim)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors font-medium text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      {claim.claimStatus !== 'APPROVED' && claim.claimStatus !== 'REJECTED' && (
                        <Link
                          to={`/manual-processing?claimId=${claim.id}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 transition-colors font-medium text-[11px]"
                        >
                          <span>Process</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{claims.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalElements}</span> claims
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Claim Modal with Document Upload */}
      {inspectClaim && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-teal-700 font-mono">
                  {inspectClaim.claimNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-0.5">
                  Claim Dossier & Audit Record
                </h3>
              </div>
              <button
                onClick={() => setInspectClaim(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Customer Name</span>
                  <span className="text-slate-800 font-bold text-sm">{inspectClaim.customerName}</span>
                  <span className="text-slate-500 text-[11px] block">{inspectClaim.customerEmail || 'customer@example.com'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Policy Identifier</span>
                  <span className="text-slate-800 font-bold text-sm font-mono">{inspectClaim.policyNumber}</span>
                  <span className="text-slate-500 text-[11px] block">Max Limit: ${inspectClaim.coverageAmount?.toLocaleString() || '50,000'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Insurance Type</span>
                  <span className="text-slate-800 font-bold text-sm">{inspectClaim.insuranceType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Claim Amount</span>
                  <span className="text-slate-900 font-bold text-base">${inspectClaim.claimAmount?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Current Status</span>
                  <span className="font-bold text-teal-700 uppercase text-xs">{inspectClaim.claimStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Processing Mode</span>
                  <span className="font-bold text-slate-700 text-xs">{inspectClaim.processingMode}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1.5">Claim Description & Context</h4>
                <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 leading-relaxed text-xs">
                  {inspectClaim.description || 'No detailed incident summary entered by claimant.'}
                </p>
              </div>

              {/* Supporting Documents Section with Local File Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800">Attached Supporting Documents</h4>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-semibold transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-teal-700" />
                      <span>Attach Document</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {dossierDocs.length === 0 ? (
                    <div className="text-slate-400 italic py-2">No uploaded documents attached to this claim.</div>
                  ) : (
                    dossierDocs.map((doc) => (
                      <div key={doc.id} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-teal-700 flex-shrink-0" />
                          <span className="font-medium text-slate-800 text-xs truncate max-w-[280px]">{doc.fileName}</span>
                          {doc.fileSize && (
                            <span className="text-[10px] text-slate-400 font-mono">({doc.fileSize})</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.status === 'Verified' ? (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Verification</span>
                            </span>
                          )}
                          {doc.isUploaded && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDossierDoc(doc.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition-colors"
                              title="Remove uploaded document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 italic">
                  Supported formats: PDF, JPG, JPEG, PNG. Newly selected files remain in session for demonstration.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end space-x-3">
              <button
                onClick={() => setInspectClaim(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close Dossier
              </button>
              {inspectClaim.claimStatus !== 'APPROVED' && inspectClaim.claimStatus !== 'REJECTED' && (
                <Link
                  to={`/manual-processing?claimId=${inspectClaim.id}`}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-xs font-semibold text-white shadow-sm"
                >
                  Start Manual Verification
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Claim Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Intake New Insurance Claim</h3>
                <p className="text-xs text-slate-500">Submit a claim for automated or manual processing workflow</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {submitError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleCreateClaim} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. sarah.j@example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Insurance Type</label>
                  <select
                    value={insuranceType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  >
                    <option value="HEALTH">Health</option>
                    <option value="VEHICLE">Vehicle</option>
                    <option value="LIFE">Life</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Policy Identifier</label>
                  <input
                    type="text"
                    required
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    placeholder="POL-HLT-2026-XXXX"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Claim Amount Requested ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="e.g. 3850.00"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Incident / Narrative Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe treatment, hospital admission, accident circumstance or claim grounds..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supporting Claim Documents</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {attachedDocs.map((doc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 shadow-sm"
                      >
                        <Paperclip className="w-3 h-3 text-teal-700" />
                        <span>{doc}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(doc)}
                          className="text-slate-400 hover:text-rose-500 ml-1 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
                    <input
                      type="text"
                      placeholder="Add another file e.g. Lab_Results.pdf"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDocument();
                        }
                      }}
                      className="flex-1 p-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddDocument}
                      className="px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
                    >
                      Attach
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Registering Claim...' : 'Register Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsManagement;
