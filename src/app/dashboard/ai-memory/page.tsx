'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCRMStore } from '@/store/crm-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { ScoreBadge } from '@/components/ui/badge';
import { formatDate, cn } from '@/lib/utils';
import { 
  Search, 
  Brain, 
  Edit3, 
  Trash2, 
  Save,
} from 'lucide-react';
import Link from 'next/link';

export default function AIMemoryPage() {
  const { memories, deleteMemory, updateMemory, leads } = useCRMStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const leadId = params.get('leadId');
      if (leadId && leads.length > 0) {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
          setSearch(lead.fullName);
        }
      }
    }
  }, [leads]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const leadsMap = useMemo(() => {
    const map: Record<string, typeof leads[0]> = {};
    leads.forEach(l => {
      map[l.id] = l;
    });
    return map;
  }, [leads]);

  const filtered = useMemo(() => {
    let result = [...memories];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(m => 
        m.leadName.toLowerCase().includes(s) || 
        m.memoryValue.toLowerCase().includes(s) ||
        m.memoryType.toLowerCase().includes(s)
      );
    }
    if (typeFilter !== 'all') result = result.filter(m => m.memoryType === typeFilter);
    return result;
  }, [memories, search, typeFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof memories> = {};
    filtered.forEach(m => {
      if (!groups[m.leadId]) groups[m.leadId] = [];
      groups[m.leadId].push(m);
    });
    return groups;
  }, [filtered]);

  const handleSaveEdit = (id: string) => {
    updateMemory(id, editValue);
    setEditId(null);
  };

  const handleDelete = (id: string) => {
    deleteMemory(id);
    setDeleteConfirmId(null);
  };

  const memoryTypes = ['all', 'preference', 'behavior', 'context', 'intent', 'objection', 'timeline'];

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between mb-4 relative z-10">
        <div className="flex items-center w-full md:w-[350px] shrink-0 h-[42px] bg-white border border-slate-200/60 rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all overflow-hidden px-3.5">
          <Search className="h-[18px] w-[18px] text-slate-400 shrink-0 mr-3" />
          <input 
            type="text" 
            placeholder="Search memory context..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-full bg-transparent border-none text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-0 p-0" 
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
            <Brain className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <p className="text-[14px] font-semibold text-slate-900">No memory logs found</p>
            <p className="text-[13px] text-slate-500 mt-1 max-w-xs">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([leadId, mems]) => {
            const lead = leadsMap[leadId];
            const name = mems[0]?.leadName || lead?.fullName || 'Lead Profile';
            
            return (
              <Card 
                key={leadId} 
                padding="none"
                className="flex flex-col overflow-hidden bg-white border border-slate-200/60 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-400"
              >
                <div className="flex items-center gap-5 p-6 border-b border-slate-100 bg-slate-50/40">
                  <Avatar name={name} className="h-12 w-12 shadow-sm font-semibold shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Link href={`/dashboard/leads?id=${leadId}`} className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight hover:text-[#2563EB] transition-colors">
                        {name}
                      </Link>
                      {lead && (
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-2 py-0.5 rounded-[6px] shadow-sm">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
                          <ScoreBadge score={lead.leadScore} className="text-[12.5px]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[13px] text-slate-500 font-medium">
                      {lead?.businessType || 'No industry specified'}
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 bg-white">
                  {mems.map(mem => (
                    <div 
                      key={mem.id} 
                      className="group relative"
                    >
                      {editId === mem.id ? (
                        <div className="space-y-3">
                          <textarea 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full p-3.5 rounded-xl bg-white border border-slate-200/80 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 resize-none leading-relaxed shadow-sm" 
                            rows={3} 
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setEditId(null)} className="h-9 px-4 rounded-[10px]">Cancel</Button>
                            <Button variant="primary" size="sm" onClick={() => handleSaveEdit(mem.id)} className="gap-2 h-9 px-4 rounded-[10px] bg-[#2563EB] hover:bg-blue-700 font-semibold shadow-[0_2px_8px_rgba(37,99,235,0.2)]">
                              <Save className="h-4 w-4" /> Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                          <div className="flex-1 flex items-start justify-between gap-4">
                            <p className="text-[14px] text-slate-700 leading-relaxed font-medium">
                              {mem.memoryValue}
                            </p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-1">
                              <button 
                                onClick={() => { setEditId(mem.id); setEditValue(mem.memoryValue); }}
                                className="p-1.5 rounded-md text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmId(mem.id)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Modal open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Delete Memory" size="sm">
        <div className="space-y-6">
          <p className="text-[13px] text-slate-600">
            Are you sure you want to delete this memory record? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)} className="border-slate-200">Cancel</Button>
            <Button variant="danger" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} className="bg-rose-600 hover:bg-rose-700 text-white">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
