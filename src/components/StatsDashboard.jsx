import React from 'react';
import { Target, TrendingUp, PieChart, CheckCircle2 } from 'lucide-react';

const StatsDashboard = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const urgentCount = tasks.filter(t => t.category === 'urgent' && !t.completed).length;
  const workCount = tasks.filter(t => t.category === 'work' && !t.completed).length;
  const personalCount = tasks.filter(t => t.category === 'personal' && !t.completed).length;
  
  const stats = [
    { label: 'Completion Rate', value: `${completionRate}%`, icon: Target, color: 'text-google-blue' },
    { label: 'Total Done', value: completed, icon: CheckCircle2, color: 'text-google-green' },
    { label: 'Urgent Pending', value: urgentCount, icon: TrendingUp, color: 'text-google-red' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gray-50 ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-on-variant uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-semibold text-on-surface">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-bold text-on-variant uppercase tracking-wider mb-4 flex items-center gap-2">
          <PieChart size={14} />
          Focus Breakdown
        </p>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-on-variant">Work</span>
            <span className="font-medium text-google-green">{workCount} tasks</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-google-green h-full transition-all duration-1000" 
              style={{ width: `${total > 0 ? (workCount / total) * 100 : 0}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-on-variant">Personal</span>
            <span className="font-medium text-google-blue">{personalCount} tasks</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-google-blue h-full transition-all duration-1000" 
              style={{ width: `${total > 0 ? (personalCount / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
