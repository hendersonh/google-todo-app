import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const TimelineView = ({ tasks, onTaskClick }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  // Get next 7 days
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d;
  });

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-xl font-medium">Next 7 Days</h3>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20}/></button>
          <button className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex min-w-[1000px] h-full divide-x divide-gray-100">
          {week.map((date, idx) => {
            const isToday = date.toDateString() === today.toDateString();
            const dateStr = date.toDateString();
            const dayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === dateStr);

            return (
              <div key={idx} className={`flex-1 min-w-[150px] flex flex-col ${isToday ? 'bg-blue-50/20' : ''}`}>
                <div className="p-4 text-center border-b border-gray-50">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-google-blue' : 'text-on-variant'}`}>
                    {days[date.getDay()]}
                  </p>
                  <p className={`text-2xl mt-1 ${isToday ? 'text-google-blue font-bold' : 'text-on-surface'}`}>
                    {date.getDate()}
                  </p>
                </div>
                
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  {dayTasks.length > 0 ? dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => onTaskClick?.(task)}
                      className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <p className="text-sm font-medium line-clamp-2">{task.title}</p>
                      <div className="flex items-center gap-1 text-[10px] text-on-variant mt-2">
                        <Clock size={10} />
                        <span>12:00 PM</span>
                      </div>
                    </div>
                  )) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
