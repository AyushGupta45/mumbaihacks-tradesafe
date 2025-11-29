"use client";

import React, { useEffect, useState } from "react";
import { Save, Bell, Shield, Wallet, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SettingsForm = () => {
  const [config, setConfig] = useState({
    maxTradeAmount: 5000,
    minProfitThreshold: 0.5,
    maxDailyLoss: 1000,
    maxExposurePerAsset: 20000,
    requireHumanApproval: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/settings/guardian');
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings/guardian', {
        method: 'POST',
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-zinc-500">Loading settings...</div>;

  return (
    <div className="glass-card p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
          AG
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Ayush Gupta</h2>
          <p className="text-zinc-400">Pro Trader Account</p>
        </div>
        <Button 
          className="ml-auto bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* Guardian Configuration */}
        <section>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Guardian Safety Layer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Max Trade Amount (USDT)</label>
              <input 
                type="number" 
                value={config.maxTradeAmount}
                onChange={(e) => setConfig({...config, maxTradeAmount: parseFloat(e.target.value)})}
                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Max Exposure Per Asset (USDT)</label>
              <input 
                type="number" 
                value={config.maxExposurePerAsset}
                onChange={(e) => setConfig({...config, maxExposurePerAsset: parseFloat(e.target.value)})}
                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Max Daily Loss (USDT)</label>
              <input 
                type="number" 
                value={config.maxDailyLoss}
                onChange={(e) => setConfig({...config, maxDailyLoss: parseFloat(e.target.value)})}
                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Min Profit Threshold (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={config.minProfitThreshold}
                onChange={(e) => setConfig({...config, minProfitThreshold: parseFloat(e.target.value)})}
                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Risk Controls */}
        <section>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Risk Controls
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div>
              <span className="text-zinc-300 font-bold block">Require Human Approval</span>
              <span className="text-xs text-zinc-500">Pause execution before submitting orders</span>
            </div>
            <div 
              className={`w-12 h-6 rounded-full border relative cursor-pointer transition-colors ${config.requireHumanApproval ? 'bg-blue-600/20 border-blue-600/30' : 'bg-zinc-600/20 border-zinc-600/30'}`}
              onClick={() => setConfig({...config, requireHumanApproval: !config.requireHumanApproval})}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-all ${config.requireHumanApproval ? 'right-1 bg-blue-500 shadow-blue-500/50' : 'left-1 bg-zinc-500'}`} />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            Notifications
          </h3>
          <div className="space-y-4">
            {[
              "Email alerts for successful trades",
              "Push notifications for high-spread opportunities",
              "Weekly performance reports"
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-zinc-300">{item}</span>
                <div className="w-12 h-6 rounded-full bg-blue-600/20 border border-blue-600/30 relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsForm;
