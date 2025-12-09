'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Disc, Activity, Zap, Heart, Mic, Sliders, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface Recommendation {
  track_name: string;
  artist_name: string;
  year: number;
  spotify_link: string;
  match_score: string;
}

interface FormData {
  bpm: number;
  danceability: number;
  valence: number;
  energy: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
  [key: string]: number;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState<FormData>({
    bpm: 120,
    danceability: 70,
    valence: 50,
    energy: 70,
    acousticness: 10,
    instrumentalness: 0,
    liveness: 10,
    speechiness: 5
  });

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setRecommendations(data.recommendations);

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      alert('Failed to fetch recommendations. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className={`min-h-screen ${inter.className} relative flex flex-col items-center py-20 px-4 bg-black text-white`}>

      {/* Main Container - Centered and Contained */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl z-10"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-4">
            SpotifyRec
          </h1>
          <p className="text-gray-400 text-lg font-medium max-w-lg mx-auto">
            KNN & Classification Tree Model Powered Song Recommender
          </p>
        </div>

        {/* Control Card */}
        <div className="minimal-card rounded-[32px] p-8 md:p-10 mb-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Primary Controls */}
            <div className="space-y-8">
              <InputSlider
                label="Tempo" name="bpm" value={formData.bpm} min={60} max={200}
                icon={<Activity />} suffix=" BPM"
                onChange={handleSliderChange}
              />
              <InputSlider
                label="Energy" name="energy" value={formData.energy} min={0} max={100}
                icon={<Zap />} suffix="%"
                onChange={handleSliderChange}
              />
              <InputSlider
                label="Mood" name="valence" value={formData.valence} min={0} max={100}
                icon={<Heart />} suffix="%"
                onChange={handleSliderChange}
              />
              <InputSlider
                label="Danceability" name="danceability" value={formData.danceability} min={0} max={100}
                icon={<Disc />} suffix="%"
                onChange={handleSliderChange}
              />
            </div>

            {/* Advanced Toggle */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors py-2"
              >
                {showAdvanced ? 'Hide Advanced' : 'Show Advanced Settings'}
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 space-y-8 pb-2">
                      <InputSlider label="Acousticness" name="acousticness" value={formData.acousticness} min={0} max={100} icon={<Music />} onChange={handleSliderChange} suffix="%" />
                      <InputSlider label="Instrumentalness" name="instrumentalness" value={formData.instrumentalness} min={0} max={100} icon={<Sliders />} onChange={handleSliderChange} suffix="%" />
                      <InputSlider label="Liveness" name="liveness" value={formData.liveness} min={0} max={100} icon={<Activity />} onChange={handleSliderChange} suffix="%" />
                      <InputSlider label="Speechiness" name="speechiness" value={formData.speechiness} min={0} max={100} icon={<Mic />} onChange={handleSliderChange} suffix="%" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-full bg-white text-black font-bold text-xl hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Activity className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 fill-black" />
                  Generate Playlist
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Container */}
        <div id="results" className="scroll-mt-10 space-y-4">
          <AnimatePresence>
            {recommendations.map((rec, index) => (
              <motion.div
                key={`${rec.track_name}-${index}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="minimal-card p-4 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-white/5"
                onClick={() => window.open(rec.spotify_link, '_blank')}
              >
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center shrink-0 font-bold text-xl text-white">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">
                    {rec.track_name}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {rec.artist_name} • {rec.year}
                  </p>
                </div>

                <div className="flex items-center gap-4 pr-2">
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Match</div>
                    <div className="text-white font-mono font-bold">{rec.match_score}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </motion.div>
    </main>
  );
}

interface InputSliderProps {
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  icon: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suffix?: string;
}

function InputSlider({ label, name, value, min, max, icon, onChange, suffix = '' }: InputSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex justify-between items-end mb-3">
        <label className="flex items-center gap-2 text-white font-semibold text-lg">
          <span className="text-gray-400">{icon}</span>
          {label}
        </label>
        <span className="font-mono text-white font-bold text-lg bg-white/10 px-2 rounded">
          {value}{suffix}
        </span>
      </div>

      <div className="relative h-8 flex items-center">
        <input
          type="range"
          name={name}
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          className="absolute z-20 w-full opacity-0 cursor-pointer h-full"
        />
        {/* Track Background */}
        <div className="absolute z-0 w-full h-[2px] bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Thumb */}
        <div
          className="absolute z-10 w-4 h-4 bg-white rounded-full border-2 border-black transition-all pointer-events-none"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}
