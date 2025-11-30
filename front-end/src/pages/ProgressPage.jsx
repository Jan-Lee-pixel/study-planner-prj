import React, { useMemo, useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  CheckCircle, 
  Trophy, 
  Zap, 
  CalendarDays,
  ArrowUpRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { generateAIContent } from '../services/aiService'; // Import the AI service

// 3D HERO
import FocusHero3D from '../components/FocusHero3D';

// --- MINI COMPONENTS ---
const StatCard = ({ label, value, subtext, icon, color }) => (
  <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
    {/* Background Glow */}
    <div className={`absolute -right-4 -top-4 w-24 h-24 ${color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
    
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-text)] mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-[var(--text-color)]">{value}</h3>
      <p className="text-xs font-medium text-[var(--muted-text)] mt-1 flex items-center gap-1">
        {subtext}
      </p>
    </div>
    <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-20 flex items-center justify-center text-white shadow-lg`}>
      {icon}
    </div>
  </div>
);

const ProgressBar = ({ label, value, total, colorClass }) => {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-[var(--text-color)]">{label}</span>
        <span className="text-[var(--muted-text)]">{value}/{total} ({percent}%)</span>
      </div>
      <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const DonutChart = ({ percent, color, size = 120, children }) => {
  const rotation = percent * 3.6;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer Ring */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} ${rotation}deg, rgba(255,255,255,0.05) 0deg)`
        }}
      />
      {/* Inner Circle (Hollow) */}
      <div className="absolute inset-2 bg-[#1a1b23] rounded-full flex flex-col items-center justify-center z-10">
        {children}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function ProgressPage({ tasks }) {
  
  // --- ANALYTICS LOGIC ---
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const highPriorityTotal = tasks.filter(t => t.priority === 'high').length;
    const highPriorityDone = tasks.filter(t => t.priority === 'high' && t.completed).length;
    const overdue = tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length;
    
    // Calculate "Focus Score" (Weighted completion)
    const score = total === 0 ? 0 : Math.round(
      ((completed * 1) + (highPriorityDone * 2)) / ((total * 1) + (highPriorityTotal * 2)) * 100
    );

    return {
      total,
      completed,
      active: total - completed,
      overdue,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      focusScore: isNaN(score) ? 0 : score,
      highPriority: { total: highPriorityTotal, done: highPriorityDone }
    };
  }, [tasks]);

  const tasksByType = useMemo(() => {
    const counts = { assignment: 0, exam: 0, project: 0, study: 0 };
    tasks.forEach(t => {
      const type = t.type?.toLowerCase() || 'other';
      if (counts[type] !== undefined) counts[type]++;
    });
    return counts;
  }, [tasks]);

  // "Velocity" - Tasks completed recently vs total
  const recentWins = useMemo(() => {
    return tasks
      .filter(t => t.completed)
      .sort((a, b) => new Date(b.updatedAt || b.dueDate) - new Date(a.updatedAt || a.dueDate))
      .slice(0, 5);
  }, [tasks]);

  // --- AI TIP LOGIC ---
  const [aiTip, setAiTip] = useState("Analyzing your study habits...");
  const [loadingTip, setLoadingTip] = useState(false);

  const fetchTip = async () => {
    setLoadingTip(true);
    try {
      const prompt = `
        User Stats:
        - Completion Rate: ${stats.rate}%
        - Overdue Tasks: ${stats.overdue}
        - Focus Score: ${stats.focusScore}
        - Total Completed: ${stats.completed}
      `;
      
      const tip = await generateAIContent({ mode: 'tip', prompt });
      setAiTip(tip);
    } catch (error) {
      console.error("AI Tip Error:", error);
      setAiTip("Consistencty is key! Keep crushing your tasks."); // Fallback
    } finally {
      setLoadingTip(false);
    }
  };

  // Fetch tip on mount (or when stats change significantly)
  useEffect(() => {
    if (tasks.length > 0) {
      fetchTip();
    }
  }, [tasks.length, stats.rate]); // Only refetch if task count or rate changes

  return (
    <div className="page-shell space-y-8 pb-10">
      
      {/* 1. HEADER */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em]">Analytics</p>
        <h1 className="text-4xl font-bold text-[var(--text-color)]">Your Growth</h1>
      </div>

      {/* 2. NEW 3D HERO SECTION */}
      <FocusHero3D score={stats.focusScore} />

      {/* 3. KPI CARDS (Removed Focus Score from here) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Completion Rate" 
          value={`${stats.rate}%`} 
          subtext="of all tasks done"
          icon={<TrendingUp size={20} />} 
          color="bg-emerald-500" 
        />
        <StatCard 
          label="Total Completed" 
          value={stats.completed} 
          subtext={`+${recentWins.length} recently`}
          icon={<Trophy size={20} />} 
          color="bg-indigo-500" 
        />
        <StatCard 
          label="Active Load" 
          value={stats.active} 
          subtext="Tasks remaining"
          icon={<Target size={20} />} 
          color="bg-rose-500" 
        />
      </div>

      {/* 3. MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* WORKLOAD DISTRIBUTION (Donut Chart) */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-bold text-[var(--text-color)] mb-6 w-full text-left flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400"><CalendarDays size={16} /></div>
            Workload Mix
          </h3>
          
          <div className="relative">
            <DonutChart percent={stats.rate} color="#6366f1" size={180}>
              <div className="text-center">
                <span className="text-4xl font-bold text-white">{stats.rate}%</span>
                <p className="text-xs text-[var(--muted-text)] uppercase tracking-widest mt-1">Done</p>
              </div>
            </DonutChart>
            
            <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1] animate-pulse" />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-8">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <p className="text-xs text-[var(--muted-text)] uppercase">Assignments</p>
              <p className="text-xl font-bold text-white mt-1">{tasksByType.assignment}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <p className="text-xs text-[var(--muted-text)] uppercase">Projects</p>
              <p className="text-xl font-bold text-white mt-1">{tasksByType.project}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <p className="text-xs text-[var(--muted-text)] uppercase">Exams</p>
              <p className="text-xl font-bold text-white mt-1">{tasksByType.exam}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <p className="text-xs text-[var(--muted-text)] uppercase">Study</p>
              <p className="text-xl font-bold text-white mt-1">{tasksByType.study}</p>
            </div>
          </div>
        </div>

        {/* PRIORITY BREAKDOWN (Bar Charts) */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold text-[var(--text-color)] mb-6 flex items-center gap-2">
            <div className="p-1.5 bg-rose-500/20 rounded-lg text-rose-400"><Target size={16} /></div>
            Priority Breakdown
          </h3>
          
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <ProgressBar 
              label="High Priority Tasks" 
              value={stats.highPriority.done} 
              total={stats.highPriority.total} 
              colorClass="bg-gradient-to-r from-red-500 to-rose-400"
            />
            <ProgressBar 
              label="Medium Priority" 
              value={tasks.filter(t => t.priority === 'medium' && t.completed).length} 
              total={tasks.filter(t => t.priority === 'medium').length} 
              colorClass="bg-gradient-to-r from-amber-500 to-orange-400"
            />
            <ProgressBar 
              label="Low Priority" 
              value={tasks.filter(t => t.priority === 'low' && t.completed).length} 
              total={tasks.filter(t => t.priority === 'low').length} 
              colorClass="bg-gradient-to-r from-emerald-500 to-teal-400"
            />
          </div>

          {/* DYNAMIC AI TIP CARD */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 flex items-center justify-between group relative overflow-hidden">
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
                {loadingTip ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm flex items-center gap-2">
                  AI Productivity Tip
                  {loadingTip && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400 font-normal">Refreshing...</span>}
                </p>
                <p className="text-xs text-indigo-200 mt-0.5 leading-relaxed">
                  {aiTip}
                </p>
              </div>
            </div>
            
            <button 
              onClick={fetchTip}
              className="p-2 rounded-full hover:bg-white/10 text-indigo-400 transition-colors"
              title="Get new tip"
            >
              <ArrowUpRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. RECENT WINS LIST */}
      <div className="glass-panel p-6 rounded-3xl">
        <h3 className="text-lg font-bold text-[var(--text-color)] mb-4">Recent Wins</h3>
        <div className="space-y-2">
          {recentWins.length === 0 ? (
            <p className="text-[var(--muted-text)] text-sm py-4">No completed tasks yet. Go crush some goals!</p>
          ) : (
            recentWins.map((task) => (
              <div key={task.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                    <CheckCircle size={14} />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-color)] line-through opacity-70 group-hover:opacity-100 transition-opacity">
                    {task.title}
                  </span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)] bg-black/20 px-2 py-1 rounded">
                  {task.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
