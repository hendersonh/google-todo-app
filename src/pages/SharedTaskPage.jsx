import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Circle, Star, Calendar, RotateCcw, CheckSquare, Square, ExternalLink, AlertCircle, Clock } from 'lucide-react';
import { SharingService } from '../services/SharingService';

const SharedTaskPage = () => {
  const { linkId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskData = await SharingService.getSharedTask(linkId);
        setTask(taskData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [linkId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-google-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-on-variant text-sm">Loading shared task…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={36} className="text-google-red" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-on-surface">Link Unavailable</h1>
            <p className="text-on-variant">
              {error === 'This link has expired.'
                ? 'This shared link has expired. Links are valid for 7 days.'
                : 'This link is invalid or has been removed.'}
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-google-blue text-white px-6 py-3 rounded-2xl font-medium hover:bg-blue-600 transition-colors"
          >
            <CheckCircle2 size={18} />
            Go to Tasks
          </Link>
        </div>
      </div>
    );
  }

  const categoryColors = {
    personal: '#4285F4',
    work: '#34A853',
    urgent: '#EA4335',
    shopping: '#FBBC05',
  };

  const categoryColor = categoryColors[task.category] || '#4285F4';
  const completedSubtasks = (task.subtasks || []).filter(s => s.completed).length;
  const totalSubtasks = (task.subtasks || []).length;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-google-blue rounded-lg flex items-center justify-center">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            <span className="font-semibold text-on-surface">Shared Task</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-google-blue font-medium hover:underline"
          >
            Open App
            <ExternalLink size={14} />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* Task Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Category accent bar */}
          <div className="h-1.5 w-full" style={{ backgroundColor: categoryColor }} />

          <div className="p-8 space-y-6">
            {/* Title + status */}
            <div className="flex items-start gap-4">
              <div className="mt-1 shrink-0">
                {task.completed
                  ? <CheckCircle2 size={26} className="text-google-blue" />
                  : <Circle size={26} className="text-on-variant/30" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h1 className={`text-2xl font-semibold leading-snug ${task.completed ? 'line-through text-on-variant/50' : 'text-on-surface'}`}>
                  {task.title}
                </h1>
                {task.starred && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-yellow-600 font-medium">Important</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            {task.details && (
              <p className="text-on-variant text-base leading-relaxed pl-10">{task.details}</p>
            )}

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 pl-10">
              {task.category && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: categoryColor }}
                >
                  {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                </span>
              )}
              {task.dueDate && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-google-blue">
                  <Calendar size={11} />
                  Due {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              {task.completed && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Subtasks */}
          {totalSubtasks > 0 && (
            <div className="border-t border-gray-50 px-8 py-6 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-on-variant uppercase tracking-widest">
                  Sub-tasks
                </p>
                <span className="text-xs text-on-variant/60 font-medium">
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-google-blue rounded-full transition-all"
                  style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
                />
              </div>

              <div className="space-y-2">
                {(task.subtasks || []).map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 py-1">
                    {sub.completed
                      ? <CheckSquare size={16} className="text-google-blue shrink-0" />
                      : <Square size={16} className="text-on-variant/30 shrink-0" />
                    }
                    <span className={`text-sm ${sub.completed ? 'line-through text-on-variant/50' : 'text-on-surface'}`}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Read-only notice */}
        <div className="flex items-center gap-2 text-xs text-on-variant/60 justify-center">
          <Clock size={12} />
          <span>This is a read-only snapshot. Links expire after 7 days.</span>
        </div>
      </main>
    </div>
  );
};

export default SharedTaskPage;
