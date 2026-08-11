import React from 'react';
import { MapPin, Building, Mail } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <PageContainer title="My AyurVerify Identity" description="Please sign in to view identity.">
        <div>Not authenticated</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="My AyurVerify Identity"
      description="View and verify your registered supply-chain credential details."
    >
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 flex flex-col gap-6 text-left" hoverable={false}>
          {/* Avatar & Title */}
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="h-16 w-16 bg-ayur-green-50 text-ayur-green-700 rounded-2xl flex items-center justify-center font-black text-xl border border-ayur-green-100 shadow-inner">
              {user.role.substring(0, 3)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
              <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-1">
                {user.role} ROLE
              </p>
            </div>
          </div>

          {/* Identity details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
            <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Official Participant ID
              </span>
              <span className="text-sm font-bold text-ayur-green-700 select-all">{user.participantId}</span>
            </div>

            <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Organization Name
              </span>
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Building className="h-4 w-4 text-slate-400 shrink-0" />
                {user.organizationName}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Location Address
              </span>
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                {user.location}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Email Address
              </span>
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                {user.email}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
