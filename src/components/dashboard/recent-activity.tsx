'use client';

import { useCRMStore } from '@/store/crm-store';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { MessageSquare, Calendar, ArrowUpRight, Brain } from 'lucide-react';

export function RecentActivity() {
  const { leads, appointments, followUps } = useCRMStore();

  const activities = [
    ...leads.slice(0, 3).map(l => ({
      id: l.id,
      type: 'lead' as const,
      name: l.fullName,
      action: `New lead from ${l.source}`,
      time: l.createdDate,
      status: l.status,
      icon: MessageSquare,
    })),
    ...appointments.slice(0, 3).map(a => ({
      id: a.id,
      type: 'appointment' as const,
      name: a.leadName,
      action: `Appointment ${a.status}`,
      time: a.appointmentDate,
      status: a.status,
      icon: Calendar,
    })),
    ...followUps.slice(0, 2).map(f => ({
      id: f.id,
      type: 'followup' as const,
      name: f.leadName,
      action: `Follow-up #${f.followUpNumber}`,
      time: f.scheduledTime,
      status: f.status,
      icon: ArrowUpRight,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
            <Avatar name={activity.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{activity.name}</p>
              <p className="text-xs text-gray-400">{activity.action}</p>
            </div>
            <Badge status={activity.status} />
          </div>
        ))}
      </div>
    </Card>
  );
}
