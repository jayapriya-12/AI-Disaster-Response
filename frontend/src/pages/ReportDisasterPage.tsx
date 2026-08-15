import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, MapPin, Sparkles, AlertCircle, CheckCircle, Navigation } from 'lucide-react';
import api from '../services/api';
import { AiPrediction } from '../types';

export const ReportDisasterPage: React.FC = () => {
  const navigate = useNavigate();

  const [disasterType, setDisasterType] = useState('Flood');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('37.7749');
  const [longitude, setLongitude] = useState('-122.4194');
  const [severity, setSeverity] = useState('Medium');
  const [imageUrl, setImageUrl] = useState('');

  const [aiPredicting, setAiPredicting] = useState(false);
  const [aiResult, setAiResult] = useState<AiPrediction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto detect user location
  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(4));
          setLongitude(pos.coords.longitude.toFixed(4));
          setLocation(`GPS Pin (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`);
        },
        () => {
          alert('Geolocation access denied. Default coordinates applied.');
        }
      );
    }
  };

  // Run AI Severity Prediction Engine
  const handleRunAiPrediction = async () => {
    if (!description) {
      alert('Please type a description of the emergency incident first.');
      return;
    }

    setAiPredicting(true);
    try {
      const res = await api.post('/ai/predict-severity', {
        disasterType,
        description,
        location,
      });

      if (res.data.success && res.data.prediction) {
        setAiResult(res.data.prediction);
        setSeverity(res.data.prediction.severity);
      }
    } catch (err) {
      console.error('AI prediction error:', err);
    } finally {
      setAiPredicting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!description || !location) {
      setErrorMsg('Description and Location are required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/reports', {
        disasterType,
        title: title || `${disasterType} at ${location}`,
        description,
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        severity,
        imageUrl: imageUrl || null,
      });

      if (res.data.success) {
        setSuccessMsg('✅ Incident report submitted successfully to emergency dispatch command!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Report submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3 mb-1">
          <div className="p-2.5 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Report Disaster Incident</h1>
            <p className="text-xs text-slate-400">
              Submit emergency report with GPS location & AI severity analysis.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Disaster Type</label>
            <select
              value={disasterType}
              onChange={(e) => setDisasterType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="Flood">Flood</option>
              <option value="Cyclone">Cyclone</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Fire">Fire</option>
              <option value="Landslide">Landslide</option>
              <option value="Tsunami">Tsunami</option>
              <option value="Other">Other Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Report Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Roof collapse on Main St"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Emergency Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            placeholder="Describe what is happening, number of affected citizens, injuries, trapped individuals..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-sky-500 focus:outline-none"
          />

          {/* AI Severity Recommendation Widget */}
          <div className="mt-3 p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-purple-200">AI Threat Analyzer</p>
                <p className="text-[11px] text-purple-300/80">
                  {aiResult
                    ? `Predicted Severity: ${aiResult.severity} (${aiResult.confidenceScore} confidence)`
                    : 'Auto-assess severity from text details using NLP.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunAiPrediction}
              disabled={aiPredicting}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0"
            >
              {aiPredicting ? 'Analyzing...' : 'Run AI Predictor'}
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">Incident Location Address</label>
            <button
              type="button"
              onClick={handleDetectLocation}
              className="text-xs text-sky-400 hover:underline flex items-center space-x-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Use My GPS</span>
            </button>
          </div>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="e.g. 104 River Valley Sector 4"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Level</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Optional Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-sky-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-sky-600/30 flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Submit Emergency Incident Report</span>
          )}
        </button>
      </form>
    </div>
  );
};
