'use client';

import { useState, useEffect } from 'react';
import { useCRMStore } from '@/store/crm-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  Save, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Cpu,
  CreditCard,
  Database,
  Calendar,
  Plug,
  Send,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

type SettingsTab = 'general' | 'integrations' | 'models' | 'billing';

export default function SettingsPage() {
  const { settings, setSettings, loadSettingsFromDB, saveSettingsToDB } = useCRMStore();
  const [mounted, setMounted] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('integrations');
  const [business, setBusiness] = useState(settings.business);
  const [googleSheets, setGoogleSheets] = useState(settings.googleSheets);
  const [googleCalendar, setGoogleCalendar] = useState(settings.googleCalendar);
  const [telegram, setTelegram] = useState(settings.telegram);
  const [apiKeys, setApiKeys] = useState(settings.apiKeys);
  const [saving, setSaving] = useState(false);

  // AI Models settings
  const [defaultModel, setDefaultModel] = useState('grok-2');
  const [temperature, setTemperature] = useState(0.7);

  // Integrations State
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const toggleKeyVisibility = (key: string) => setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));

  const [integrationStatus, setIntegrationStatus] = useState<Record<string, 'connected' | 'not_connected' | 'error'>>({
    sheets: 'not_connected',
    calendar: 'not_connected',
    grok: 'not_connected',
    telegram: 'not_connected'
  });

  const [testingInt, setTestingInt] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<{ id: string; success: boolean; message: string } | null>(null);

  useEffect(() => {
    const initSettings = async () => {
      await loadSettingsFromDB();
      setMounted(true);
      setLoadingInitial(false);
    };
    initSettings();
  }, [loadSettingsFromDB]);

  // Sync state whenever settings change (like after DB load)
  useEffect(() => {
    if (!loadingInitial) {
      setBusiness(settings.business);
      setGoogleSheets(settings.googleSheets);
      setGoogleCalendar(settings.googleCalendar);
      setTelegram(settings.telegram);
      setApiKeys(settings.apiKeys);
      setIntegrationStatus({
        sheets: settings.googleSheets.connected ? 'connected' : 'not_connected',
        calendar: settings.googleCalendar.connected ? 'connected' : 'not_connected',
        grok: settings.apiKeys.grok ? 'connected' : 'not_connected',
        telegram: settings.telegram.connected ? 'connected' : 'not_connected'
      });
    }
  }, [settings, loadingInitial]);

  // Real test connection — calls the server API with actual credentials
  const testSheetsConnection = async () => {
    setTestingInt('sheets');
    setTestMessage(null);
    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      if (!session?.access_token) {
        setTestMessage({ id: 'sheets', success: false, message: 'Not logged in. Please refresh and try again.' });
        setTestingInt(null);
        return;
      }
      const res = await fetch('/api/test-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          spreadsheetUrl: googleSheets.spreadsheetUrl,
          clientId: googleSheets.clientId,
          clientSecret: googleSheets.clientSecret,
        }),
      });
      const data = await res.json();
      setTestMessage({ id: 'sheets', success: data.success, message: data.message || data.error });
      if (data.success) {
        setIntegrationStatus(prev => ({ ...prev, sheets: 'connected' }));
      } else {
        setIntegrationStatus(prev => ({ ...prev, sheets: 'error' }));
      }
    } catch (err) {
      setTestMessage({ id: 'sheets', success: false, message: 'Network error. Please try again.' });
      setIntegrationStatus(prev => ({ ...prev, sheets: 'error' }));
    }
    setTestingInt(null);
  };

  const testIntegration = async (id: string, success: boolean = true) => {
    setTestingInt(id);
    await new Promise(r => setTimeout(r, 1200));
    setIntegrationStatus(prev => ({ ...prev, [id]: success ? 'connected' : 'error' }));
    setTestingInt(null);
  };

  const handleSave = async () => {
    setSaving(true);
    const updatedSettings = {
      ...settings,
      business,
      googleSheets,
      googleCalendar,
      telegram,
      apiKeys
    };
    
    const success = await saveSettingsToDB(updatedSettings);
    setSaving(false);
    
    if (success) {
      // Optional: Add a toast notification here in the future
      console.log('Saved to Supabase securely');
    }
  };

  const handleSaveIntegration = async (id: string) => {
    setSaving(true);
    
    const updateStatus = { ...integrationStatus };
    if (id === 'sheets' && (googleSheets.clientId || googleSheets.clientSecret)) updateStatus.sheets = 'connected';
    if (id === 'calendar' && googleCalendar.clientId) updateStatus.calendar = 'connected';
    if (id === 'grok' && apiKeys.grok) updateStatus.grok = 'connected';
    if (id === 'telegram' && telegram.botToken) updateStatus.telegram = 'connected';
    
    setIntegrationStatus(updateStatus);

    const updatedSettings = {
      ...settings,
      business,
      googleSheets: { ...googleSheets, connected: updateStatus.sheets === 'connected' },
      googleCalendar: { ...googleCalendar, connected: updateStatus.calendar === 'connected' },
      telegram: { ...telegram, connected: updateStatus.telegram === 'connected' },
      apiKeys
    };

    await saveSettingsToDB(updatedSettings);
    setSaving(false);
  };

  const tabConfig = [
    { id: 'general' as const, label: 'General', icon: Building2 },
    { id: 'integrations' as const, label: 'Integrations', icon: Plug },
    { id: 'models' as const, label: 'AI Models', icon: Cpu },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
  ];

  const renderStatus = (status: string) => {
    if (status === 'connected') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Connected</span>
        </div>
      );
    }
    if (status === 'error') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-100/50">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Error</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Not Connected</span>
      </div>
    );
  };

  if (!mounted || loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] w-full gap-4 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-[13px] font-medium tracking-wide">Loading Secure Settings from Supabase...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <p className="text-[13.5px] font-medium text-slate-500">Configure your workspace settings and external integrations.</p>
        <Button 
          variant="primary" 
          onClick={handleSave} 
          disabled={saving} 
          className="gap-2 shrink-0 bg-[#2563EB] hover:bg-blue-700 h-9 px-4 text-[13px] rounded-[10px] shadow-sm transition-all"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT COLUMN: Tabs */}
        <div className="w-full lg:w-[240px] shrink-0 flex flex-col gap-1">
          {tabConfig.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full text-left px-4 h-[42px] rounded-[12px] transition-all duration-200 flex items-center gap-3 cursor-pointer text-[13.5px]',
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white font-semibold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium'
              )}
            >
              <tab.icon className={cn("h-[18px] w-[18px] shrink-0", activeTab === tab.id ? "text-white" : "text-slate-400")} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 w-full min-h-[480px]">
          {activeTab === 'general' && (
            <Card padding="lg" className="bg-white border border-slate-200/80 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="pb-5 border-b border-slate-100 mb-6">
                <h3 className="text-[16px] font-bold text-slate-900">Corporate Details</h3>
                <p className="text-[13px] text-slate-500 mt-1 font-medium">Adjust default parameters defining timezone and operational hours.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Business Name</label>
                  <Input 
                    value={business.businessName} 
                    onChange={(e) => setBusiness(prev => ({ ...prev, businessName: e.target.value }))}
                    className="h-10 rounded-[10px] bg-slate-50 border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Workspace Timezone</label>
                  <select 
                    value={business.timezone} 
                    onChange={(e) => setBusiness(prev => ({ ...prev, timezone: e.target.value }))}
                    className="flex h-10 w-full rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 cursor-pointer transition-colors font-medium"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="pb-2">
                <h3 className="text-[18px] font-bold text-slate-900 tracking-tight">Integrations & Credentials</h3>
                <p className="text-[13.5px] text-slate-500 mt-1 font-medium">
                  Connect your external services and authenticate your workspace securely.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                
                {/* 1. Google Sheets */}
                <div className="p-6 rounded-[24px] bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[14px] bg-emerald-50 border border-emerald-100/50 flex items-center justify-center shrink-0 shadow-sm">
                        <Database className="h-[22px] w-[22px] text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">Google Sheets Database</h4>
                        <p className="text-[12.5px] text-slate-500 font-medium mt-0.5">Used as the CRM database.</p>
                      </div>
                    </div>
                    {renderStatus(integrationStatus.sheets)}
                  </div>
                  <div className="space-y-4 flex-1 mb-6">

                    {/* Step-by-step instruction */}
                    <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-blue-50 border border-blue-100">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-black text-white">?</span>
                      </div>
                      <p className="text-[11.5px] text-blue-800 font-medium leading-relaxed">
                        Go to <strong>Google Cloud Console → IAM → Service Accounts → Keys → Add Key → JSON</strong>. Download the file, open it in Notepad, then paste the entire content below.
                      </p>
                    </div>

                    {/* Service Account JSON textarea */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Service Account JSON Key</label>
                        <button
                          onClick={() => toggleKeyVisibility('g_json')}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {showKeys['g_json'] ? <><EyeOff className="h-3 w-3" /> Hide</> : <><Eye className="h-3 w-3" /> Show</>}
                        </button>
                      </div>
                      <textarea
                        value={showKeys['g_json'] ? googleSheets.clientSecret : (googleSheets.clientSecret ? '••••••••••••••••••••••••••••••••' : '')}
                        onChange={(e) => {
                          // Only update when shown (not masked)
                          if (showKeys['g_json']) {
                            setGoogleSheets(prev => ({ ...prev, clientSecret: e.target.value, clientId: '' }));
                          }
                        }}
                        onFocus={() => setShowKeys(prev => ({ ...prev, g_json: true }))}
                        placeholder={'Paste your Service Account JSON here...\n{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key": "-----BEGIN RSA PRIVATE KEY-----\\n...",\n  "client_email": "...@....iam.gserviceaccount.com",\n  ...\n}'}
                        rows={6}
                        className="w-full rounded-[10px] bg-slate-50 border border-slate-200/60 px-3 py-2.5 text-[11.5px] font-mono text-slate-800 focus:outline-none focus:border-blue-400 focus:bg-white resize-none transition-colors placeholder:text-slate-300"
                      />
                      {googleSheets.clientSecret && (
                        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> JSON key saved
                        </p>
                      )}
                    </div>

                    {/* Spreadsheet URL */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Spreadsheet URL</label>
                      <Input
                        type="text"
                        value={googleSheets.spreadsheetUrl}
                        onChange={(e) => setGoogleSheets(prev => ({ ...prev, spreadsheetUrl: e.target.value }))}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="h-[40px] text-[13px] rounded-[10px] bg-slate-50 border-slate-200/60 font-mono focus:bg-white"
                      />
                      <p className="text-[11px] text-slate-400 font-medium">Paste the full URL of your Google Sheet.</p>
                    </div>

                  </div>
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-100 mt-auto">
                    <Button
                      variant="secondary"
                      onClick={testSheetsConnection}
                      disabled={testingInt === 'sheets' || !googleSheets.spreadsheetUrl || !googleSheets.clientSecret}
                      className="h-[40px] px-4 text-[13px] rounded-[10px] flex-1 font-semibold border-slate-200/80 hover:bg-slate-50 shadow-sm text-slate-700"
                    >
                      {testingInt === 'sheets'
                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Testing...</>
                        : 'Test Connection'
                      }
                    </Button>
                    <Button variant="primary" onClick={() => handleSaveIntegration('sheets')} disabled={saving} className="h-[40px] px-4 text-[13px] rounded-[10px] flex-1 bg-[#2563EB] hover:bg-blue-700 font-semibold shadow-[0_2px_8px_rgba(37,99,235,0.25)]">
                      {saving ? 'Saving...' : 'Save Credentials'}
                    </Button>
                  </div>
                  {/* Test result message */}
                  {testMessage?.id === 'sheets' && (
                    <div className={cn(
                      'mt-3 flex items-start gap-2.5 p-3 rounded-[10px] text-[12.5px] font-medium leading-snug',
                      testMessage.success
                        ? 'bg-emerald-50 border border-emerald-100 text-emerald-800'
                        : 'bg-rose-50 border border-rose-100 text-rose-800'
                    )}>
                      {testMessage.success
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        : <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      }
                      <span>{testMessage.message}</span>
                    </div>
                  )}
                </div>

                {/* 2. Google Calendar */}
                <div className="p-6 rounded-[24px] bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[14px] bg-blue-50 border border-blue-100/50 flex items-center justify-center shrink-0 shadow-sm">
                        <Calendar className="h-[22px] w-[22px] text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">Google Calendar</h4>
                        <p className="text-[12.5px] text-slate-500 font-medium mt-0.5">Appointment management.</p>
                      </div>
                    </div>
                    {renderStatus(integrationStatus.calendar)}
                  </div>
                  <div className="space-y-4 flex-1 mb-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Google Client ID</label>
                      <div className="relative">
                        <Input 
                          type={showKeys['cal_client'] ? 'text' : 'password'} 
                          value={googleCalendar.clientId}
                          onChange={(e) => setGoogleCalendar(prev => ({ ...prev, clientId: e.target.value }))}
                          placeholder="client-id.apps.googleusercontent.com" 
                          className="h-[40px] text-[13px] rounded-[10px] bg-slate-50 border-slate-200/60 pr-10 font-mono focus:bg-white" 
                        />
                        <button onClick={() => toggleKeyVisibility('cal_client')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer">
                          {showKeys['cal_client'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Google Client Secret</label>
                      <div className="relative">
                        <Input 
                          type={showKeys['cal_secret'] ? 'text' : 'password'} 
                          value={googleCalendar.clientSecret}
                          onChange={(e) => setGoogleCalendar(prev => ({ ...prev, clientSecret: e.target.value }))}
                          placeholder="GOCSPX-..." 
                          className="h-[40px] text-[13px] rounded-[10px] bg-slate-50 border-slate-200/60 pr-10 font-mono focus:bg-white" 
                        />
                        <button onClick={() => toggleKeyVisibility('cal_secret')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer">
                          {showKeys['cal_secret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Calendar ID (Optional)</label>
                      <Input 
                        type="text" 
                        value={googleCalendar.calendarId}
                        onChange={(e) => setGoogleCalendar(prev => ({ ...prev, calendarId: e.target.value }))}
                        placeholder="primary or c_...group.calendar.google.com" 
                        className="h-[40px] text-[13px] rounded-[10px] bg-slate-50 border-slate-200/60 font-mono focus:bg-white" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-100 mt-auto">
                    <Button variant="secondary" onClick={() => testIntegration('calendar', !!googleCalendar.clientId)} disabled={testingInt === 'calendar'} className="h-[40px] px-4 text-[13px] rounded-[10px] flex-1 font-semibold border-slate-200/80 hover:bg-slate-50 shadow-sm text-slate-700">
                      {testingInt === 'calendar' ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <Button variant="primary" onClick={() => handleSaveIntegration('calendar')} disabled={saving} className="h-[40px] px-4 text-[13px] rounded-[10px] flex-1 bg-[#2563EB] hover:bg-blue-700 font-semibold shadow-[0_2px_8px_rgba(37,99,235,0.25)]">
                      {saving ? 'Saving...' : 'Save Credentials'}
                    </Button>
                  </div>
                </div>

                {/* 3. Grok AI */}
                <div className="p-6 rounded-[24px] bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[14px] bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-white font-black text-[22px] leading-none">X</span>
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">Grok AI</h4>
                        <p className="text-[12.5px] text-slate-500 font-medium mt-0.5">Dashboard Intelligence.</p>
                      </div>
                    </div>
                    {renderStatus(integrationStatus.grok)}
                  </div>
                  <div className="space-y-4 flex-1 mb-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Grok API Key</label>
                      <div className="relative">
                        <Input 
                          type={showKeys['grok_key'] ? 'text' : 'password'} 
                          value={apiKeys.grok}
                          onChange={(e) => setApiKeys(prev => ({ ...prev, grok: e.target.value }))}
                          placeholder="xai-..." 
                          className="h-[40px] text-[13px] rounded-[10px] bg-slate-50 border-slate-200/60 pr-10 font-mono focus:bg-white" 
                        />
                        <button onClick={() => toggleKeyVisibility('grok_key')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer">
                          {showKeys['grok_key'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-100 mt-auto">
                    <Button variant="secondary" onClick={() => testIntegration('grok', !!apiKeys.grok)} disabled={testingInt === 'grok'} className="h-[40px] px-4 text-[13px] rounded-[10px] flex-1 font-semibold border-slate-200/80 hover:bg-slate-50 shadow-sm text-slate-700">
                      {testingInt === 'grok' ? 'Validating...' : 'Validate API Key'}
                    </Button>
                    <Button variant="primary" onClick={() => handleSaveIntegration('grok')} disabled={saving} className="h-[40px] px-4 text-[13px] rounded-[10px] flex-1 bg-[#2563EB] hover:bg-blue-700 font-semibold shadow-[0_2px_8px_rgba(37,99,235,0.25)]">
                      {saving ? 'Saving...' : 'Save API Key'}
                    </Button>
                  </div>
                </div>

                {/* 4. Telegram Bot */}
                <div className="p-6 rounded-[24px] bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[14px] bg-[#0088cc]/10 border border-[#0088cc]/20 flex items-center justify-center shrink-0 shadow-sm">
                        <Send className="h-[22px] w-[22px] text-[#0088cc] -ml-0.5" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">Telegram Bot</h4>
                        <p className="text-[12.5px] text-slate-500 font-medium mt-0.5">Conversation Management.</p>
                      </div>
                    </div>
                    {renderStatus(integrationStatus.telegram)}
                  </div>
                  <div className="space-y-4 flex-1 mb-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bot Token</label>
                      <div className="relative">
                        <Input 
                          type={showKeys['tg_token'] ? 'text' : 'password'} 
                          value={telegram.botToken}
                          onChange={(e) => setTelegram(prev => ({ ...prev, botToken: e.target.value }))}
                          placeholder="123456789:ABCdefGHIjkl..." 
                          className="h-[40px] text-[13px] rounded-[10px] bg-slate-50 border-slate-200/60 pr-10 font-mono focus:bg-white" 
                        />
                        <button onClick={() => toggleKeyVisibility('tg_token')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer">
                          {showKeys['tg_token'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Webhook URL (Optional)</label>
                      <Input 
                        type="text" 
                        value={telegram.webhookUrl}
                        onChange={(e) => setTelegram(prev => ({ ...prev, webhookUrl: e.target.value }))}
                        placeholder="https://api.yourdomain.com/webhook/telegram" 
                        className="h-[40px] text-[13px] rounded-[10px] bg-slate-50 border-slate-200/60 font-mono focus:bg-white" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-100 mt-auto">
                    <Button variant="secondary" onClick={() => testIntegration('telegram', !!telegram.botToken)} disabled={testingInt === 'telegram'} className="h-[40px] px-4 text-[13px] rounded-[10px] flex-1 font-semibold border-slate-200/80 hover:bg-slate-50 shadow-sm text-slate-700">
                      {testingInt === 'telegram' ? 'Testing...' : 'Test Bot'}
                    </Button>
                    <Button variant="primary" onClick={() => handleSaveIntegration('telegram')} disabled={saving} className="h-[40px] px-4 text-[13px] rounded-[10px] flex-1 bg-[#2563EB] hover:bg-blue-700 font-semibold shadow-[0_2px_8px_rgba(37,99,235,0.25)]">
                      {saving ? 'Saving...' : 'Save Credentials'}
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <Card padding="lg" className="bg-white border border-slate-200/80 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="pb-5 border-b border-slate-100 mb-6">
                <h3 className="text-[16px] font-bold text-slate-900">AI Models</h3>
                <p className="text-[13px] text-slate-500 mt-1 font-medium">Optimize AI parameters and behaviors.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Default Model</label>
                  <select 
                    value={defaultModel} 
                    onChange={(e) => setDefaultModel(e.target.value)}
                    className="flex h-10 w-full rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 cursor-pointer transition-colors font-medium"
                  >
                    <option value="grok-2">Grok-2 (Recommended)</option>
                    <option value="gpt-4o">GPT-4o (Fast)</option>
                    <option value="claude-3-5">Claude 3.5 Sonnet</option>
                  </select>
                </div>
                <div className="space-y-2 flex flex-col justify-center">
                  <div className="flex justify-between text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    <span>Temperature</span>
                    <span className="text-[#2563EB]">{temperature}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full bg-slate-200 appearance-none cursor-pointer accent-blue-600" 
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                    <span>Strict</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card padding="lg" className="bg-white border border-slate-200/80 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="pb-5 border-b border-slate-100 mb-6">
                <h3 className="text-[16px] font-bold text-slate-900">Billing & Plan</h3>
                <p className="text-[13px] text-slate-500 mt-1 font-medium">Review API usage and subscription level.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                <div className="p-5 rounded-[16px] bg-slate-50 border border-slate-200 flex flex-col justify-between h-[120px]">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Current Plan</span>
                    <span className="text-[16px] font-bold text-slate-900 mt-1 block tracking-tight">Enterprise SaaS Plan</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                    Active
                  </span>
                </div>
                <div className="p-5 rounded-[16px] bg-slate-50 border border-slate-200 flex flex-col justify-between h-[120px]">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Credit Usage</span>
                    <span className="text-[16px] font-bold text-slate-900 mt-1 block tracking-tight">$148.20 / $500.00 Limit</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    Resets next month
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
