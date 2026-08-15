import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, AlertTriangle, Package, ShieldCheck, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { AiPrediction, AiPrioritizationItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AIInsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'severity' | 'prioritization' | 'relief'>('severity');

  // Tab 1: Severity Predictor
  const [disasterType, setDisasterType] = useState('Flood');
  const [description, setDescription] = useState(
    'Torrential downpour broke the river embankment. Water levels rising rapidly, 15 families trapped on roofs with young children.'
  );
  const [location, setLocation] = useState('Sector 4 Eastside District');
  const [severityResult, setSeverityResult] = useState<AiPrediction | null>(null);
  const [predicting, setPredicting] = useState(false);

  // Tab 2: Prioritization Matrix
  const [matrixItems, setMatrixItems] = useState<AiPrioritizationItem[]>([]);
  const [matrixLoading, setMatrixLoading] = useState(false);

  // Tab 3: Relief Supply Allocator
  const [affectedPeople, setAffectedPeople] = useState(350);
  const [reliefType, setReliefType] = useState('Flood');
  const [reliefSeverity, setReliefSeverity] = useState('Critical');
  const [reliefResult, setReliefResult] = useState<any>(null);
  const [calculatingRelief, setCalculatingRelief] = useState(false);

  const handlePredictSeverity = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const res = await api.post('/ai/predict-severity', {
        disasterType,
        description,
        location,
      });
      if (res.data.success) {
        setSeverityResult(res.data.prediction);
      }
    } catch (err) {
      console.error('Severity prediction error:', err);
    } finally {
      setPredicting(false);
    }
  };

  const fetchPrioritization = async () => {
    setMatrixLoading(true);
    try {
      const res = await api.get('/ai/prioritize-reports');
      if (res.data.success) {
        setMatrixItems(res.data.prioritizationMatrix || []);
      }
    } catch (err) {
      console.error('Prioritization fetch error:', err);
    } finally {
      setMatrixLoading(false);
    }
  };

  const handleCalculateRelief = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculatingRelief(true);
    try {
      const res = await api.post('/ai/recommend-relief', {
        disasterType: reliefType,
        severity: reliefSeverity,
        estimatedAffectedPeople: affectedPeople,
      });
      if (res.data.success) {
        setReliefResult(res.data);
      }
    } catch (err) {
      console.error('Relief error:', err);
    } finally {
      setCalculatingRelief(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'prioritization') {
      fetchPrioritization();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3 mb-1">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">AI Intelligence & Operational Decision Support</h1>
            <p className="text-xs text-slate-400">
              Machine-learning threat severity classification, report prioritization matrix & relief supply allocator.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('severity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'severity'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          1. Severity Predictor
        </button>

        <button
          onClick={() => setActiveTab('prioritization')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'prioritization'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          2. Report Prioritization Matrix
        </button>

        <button
          onClick={() => setActiveTab('relief')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'relief'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          3. Relief Supply Allocator
        </button>
      </div>

      {/* TAB 1: SEVERITY PREDICTOR */}
      {activeTab === 'severity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handlePredictSeverity} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Incident Text Analyzer
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Disaster Category</label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              >
                <option value="Flood">Flood</option>
                <option value="Cyclone">Cyclone</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Fire">Fire</option>
                <option value="Landslide">Landslide</option>
                <option value="Tsunami">Tsunami</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Report Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location Details</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={predicting}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              {predicting ? 'Processing AI Neural Weights...' : 'Run Severity Prediction Engine'}
            </button>
          </form>

          {/* AI Result Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-white mb-4">AI Model Prediction Output</h3>

              {severityResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                    <span className="text-xs uppercase font-bold text-slate-400">Predicted Severity Level</span>
                    <div className="text-3xl font-black text-purple-400">{severityResult.severity}</div>
                    <div className="text-xs text-emerald-400 font-semibold">
                      Confidence Score: {severityResult.confidenceScore} (Risk Score: {severityResult.riskScore})
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="font-bold text-slate-300 block mb-1">Key Emergency Triggers Identified:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {severityResult.keyTriggersIdentified.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-200">
                    ⚠️ {severityResult.recommendationNotice}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs">
                  Run the text analyzer to simulate real-time AI severity predictions.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRIORITIZATION MATRIX */}
      {activeTab === 'prioritization' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-white">Pending Reports Priority Ranking</h3>
              <p className="text-xs text-slate-400">
                AI algorithm ranks pending reports by risk score, emergency keywords, and severity.
              </p>
            </div>
            <button
              onClick={fetchPrioritization}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800"
            >
              Refresh Ranking
            </button>
          </div>

          {matrixLoading ? (
            <LoadingSpinner message="Calculating report priority matrix..." />
          ) : (
            <div className="space-y-3">
              {matrixItems.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No pending reports currently in queue.</p>
              ) : (
                matrixItems.map((item, idx) => (
                  <div key={item.reportId} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-950 text-purple-300 font-bold flex items-center justify-center border border-purple-800">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm mb-0.5">{item.location}</div>
                        <p className="text-slate-400 line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sky-400 block">{item.priorityLevel}</span>
                      <span className="text-[10px] text-slate-500">Risk Score: {item.priorityScore}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RELIEF ALLOCATOR */}
      {activeTab === 'relief' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleCalculateRelief} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white mb-2">Relief Recommendation Inputs</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Disaster Type</label>
              <select
                value={reliefType}
                onChange={(e) => setReliefType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              >
                <option value="Flood">Flood</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Fire">Fire</option>
                <option value="Cyclone">Cyclone</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Level</label>
              <select
                value={reliefSeverity}
                onChange={(e) => setReliefSeverity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Affected People</label>
              <input
                type="number"
                value={affectedPeople}
                onChange={(e) => setAffectedPeople(parseInt(e.target.value) || 0)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={calculatingRelief}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              {calculatingRelief ? 'Calculating...' : 'Generate Relief Allocation Matrix'}
            </button>
          </form>

          {/* Result */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-white mb-4">Recommended Supply Allocations</h3>

              {reliefResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-slate-400 block">💧 Drinking Water</span>
                      <strong className="text-sm text-sky-400 font-extrabold">
                        {reliefResult.recommendations.water.quantity} {reliefResult.recommendations.water.unit}
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-slate-400 block">🍞 Ready MRE Food</span>
                      <strong className="text-sm text-amber-400 font-extrabold">
                        {reliefResult.recommendations.food.quantity} {reliefResult.recommendations.food.unit}
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-slate-400 block">🩺 Medical Trauma Kits</span>
                      <strong className="text-sm text-rose-400 font-extrabold">
                        {reliefResult.recommendations.medicine.quantity} {reliefResult.recommendations.medicine.unit}
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-slate-400 block">⛺ Shelter Family Tents</span>
                      <strong className="text-sm text-emerald-400 font-extrabold">
                        {reliefResult.recommendations.shelter.quantity} {reliefResult.recommendations.shelter.unit}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                    <span className="font-bold text-slate-300 block mb-1">AI Logistical Guidance:</span>
                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                      {reliefResult.logisticalNotes.map((note: string, i: number) => (
                        <li key={i}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs">
                  Fill in population estimate to generate relief supply distribution recommendations.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
