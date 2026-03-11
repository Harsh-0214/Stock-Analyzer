import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, BookOpen, CheckCircle, Clock, Zap } from 'lucide-react';
import { educationAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const categoryColors = {
  'Beginner':     { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'Intermediate': { bg: 'bg-sky-500/10 border-sky-500/30',         text: 'text-sky-400',     dot: 'bg-sky-400'     },
  'Advanced':     { bg: 'bg-violet-500/10 border-violet-500/30',   text: 'text-violet-400',  dot: 'bg-violet-400'  },
};

function LessonCard({ lesson, onSelect }) {
  const cat = categoryColors[lesson.category] || categoryColors.Beginner;
  return (
    <button onClick={() => onSelect(lesson)}
      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 text-left transition-all group w-full">
      <div className="flex items-start justify-between">
        <span className="text-3xl">{lesson.icon}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cat.bg} ${cat.text}`}>
          {lesson.category}
        </span>
      </div>
      <h3 className="font-bold text-slate-100 mt-3 group-hover:text-sky-400 transition-colors">{lesson.title}</h3>
      <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{lesson.description}</p>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3 w-3" /> {lesson.duration}
        </div>
        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
      </div>
    </button>
  );
}

function Section({ section, index }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-700/50 transition-colors">
        <h3 className="font-semibold text-slate-200 text-left">{section.title}</h3>
        {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{section.body}</p>
          <div className="space-y-2">
            {(section.key_points || []).map((pt, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">{pt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LessonDetail({ lesson, onBack }) {
  const cat = categoryColors[lesson.category] || categoryColors.Beginner;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        <ChevronRight className="h-4 w-4 rotate-180" /> Back to lessons
      </button>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{lesson.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-slate-100">{lesson.title}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cat.bg} ${cat.text}`}>
                {lesson.category}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {lesson.duration}</span>
              <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {lesson.content?.sections?.length} sections</span>
            </div>
            <p className="text-slate-300 mt-3 leading-relaxed">{lesson.content?.overview}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {(lesson.content?.sections || []).map((section, i) => (
          <Section key={i} section={section} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function Education() {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    educationAPI.getLessons()
      .then(r => setLessons(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (lesson) => {
    try {
      const { data } = await educationAPI.getLesson(lesson.id);
      setSelectedLesson(data);
    } catch {}
  };

  if (selectedLesson) {
    return <LessonDetail lesson={selectedLesson} onBack={() => setSelectedLesson(null)} />;
  }

  const categories = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const filtered = filter === 'All' ? lessons : lessons.filter(l => l.category === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100">Market Education</h1>
        <p className="text-slate-400 mt-1">Master the market with our comprehensive trading lessons</p>
      </div>

      {/* Quick tips banner */}
      <div className="bg-gradient-to-r from-sky-900/50 to-violet-900/50 border border-sky-700/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-200">Pro Tip</h3>
            <p className="text-sm text-slate-300 mt-1">
              Start with <strong className="text-sky-400">Stock Market Fundamentals</strong> if you're new, then progress to Technical Analysis.
              Always combine technical signals with risk management rules before making any trade.
            </p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === cat ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner text="Loading lessons..." />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(lesson => (
            <LessonCard key={lesson.id} lesson={lesson} onSelect={handleSelect} />
          ))}
        </div>
      )}

      {/* Market concepts quick reference */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h2 className="font-bold text-slate-100 mb-4">Quick Reference: Key Metrics</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { term: 'P/E Ratio', def: 'Price ÷ Earnings. <15 may be cheap, >30 may be expensive' },
            { term: 'RSI', def: '<30 = oversold (buy signal), >70 = overbought (sell signal)' },
            { term: 'MACD', def: 'Crossover above signal line = bullish, below = bearish' },
            { term: 'Beta', def: '>1 = more volatile than market, <1 = less volatile' },
            { term: 'Volume Surge', def: '2x+ normal volume with price move = strong conviction' },
            { term: 'Golden Cross', def: 'SMA50 crosses above SMA200 = long-term bullish signal' },
            { term: 'Death Cross', def: 'SMA50 crosses below SMA200 = long-term bearish signal' },
            { term: 'Bollinger Bands', def: 'Price at lower band = oversold, upper band = overbought' },
            { term: 'Fear & Greed', def: '<25 = extreme fear (buy), >75 = extreme greed (sell)' },
          ].map(item => (
            <div key={item.term} className="bg-slate-800 rounded-xl p-3">
              <p className="text-sm font-semibold text-sky-400">{item.term}</p>
              <p className="text-xs text-slate-400 mt-1">{item.def}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
