import { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';
import { Avatar } from './avatar';

interface ProfileCardProps {
  name: string;
  avatarUrl?: string;
  initials?: string;
  status?: ReactNode;
  score?: ReactNode;
  metadata?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ProfileCard({ name, avatarUrl, initials, status, score, metadata, className, onClick }: ProfileCardProps) {
  return (
    <Card padding="default" hoverable={!!onClick} onClick={onClick} className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={avatarUrl} fallback={initials || name.charAt(0)} size="lg" />
          <div>
            <h4 className="font-semibold text-slate-900 text-base">{name}</h4>
            {status && <div className="mt-0.5">{status}</div>}
          </div>
        </div>
        {score && <div>{score}</div>}
      </div>
      
      {metadata && (
        <div className="pt-4 border-t border-slate-100 text-sm text-slate-500">
          {metadata}
        </div>
      )}
    </Card>
  );
}
