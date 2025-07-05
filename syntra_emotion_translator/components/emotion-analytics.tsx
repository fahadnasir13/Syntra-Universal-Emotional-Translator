"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, PieChart, Download } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface EmotionData {
  timestamp: Date;
  emotion: string;
  confidence: number;
  text: string;
}

interface EmotionAnalyticsProps {
  emotionHistory: EmotionData[];
  onExportData: () => void;
}

export function EmotionAnalytics({ emotionHistory, onExportData }: EmotionAnalyticsProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [emotionStats, setEmotionStats] = useState<Record<string, number>>({});
  const [dominantEmotion, setDominantEmotion] = useState('neutral');

  console.log('EmotionAnalytics: Rendering with history length:', emotionHistory.length);

  useEffect(() => {
    if (emotionHistory.length === 0) return;

    // Calculate emotion statistics
    const stats: Record<string, number> = {};
    emotionHistory.forEach(entry => {
      stats[entry.emotion] = (stats[entry.emotion] || 0) + 1;
    });
    setEmotionStats(stats);

    // Find dominant emotion
    const dominant = Object.entries(stats).reduce((a, b) => 
      stats[a[0]] > stats[b[0]] ? a : b
    )[0];
    setDominantEmotion(dominant);

    // Prepare chart data
    const last24Hours = emotionHistory.slice(-24);
    const labels = last24Hours.map(entry => 
      entry.timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    );
    
    const emotionColors = {
      happy: '#10B981',
      sad: '#3B82F6',
      angry: '#EF4444',
      surprise: '#F59E0B',
      fear: '#8B5CF6',
      disgust: '#EF4444',
      neutral: '#6B7280'
    };

    const datasets = Object.keys(stats).map(emotion => ({
      label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      data: last24Hours.map(entry => entry.emotion === emotion ? entry.confidence : 0),
      borderColor: emotionColors[emotion as keyof typeof emotionColors] || '#6B7280',
      backgroundColor: `${emotionColors[emotion as keyof typeof emotionColors] || '#6B7280'}20`,
      tension: 0.4,
    }));

    setChartData({
      labels,
      datasets,
    });
  }, [emotionHistory]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#E2E8F0',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Emotion Trends Over Time',
        color: '#E2E8F0',
      },
    },
    scales: {
      x: {
        grid: {
          color: '#334155',
        },
        ticks: {
          color: '#94A3B8',
        },
      },
      y: {
        grid: {
          color: '#334155',
        },
        ticks: {
          color: '#94A3B8',
        },
      },
    },
  };

  const getEmotionColor = (emotion: string) => {
    const emotionColors = {
      happy: 'text-green-400 border-green-400',
      sad: 'text-blue-400 border-blue-400',
      angry: 'text-red-400 border-red-400',
      surprise: 'text-yellow-400 border-yellow-400',
      fear: 'text-purple-400 border-purple-400',
      disgust: 'text-red-400 border-red-400',
      neutral: 'text-gray-400 border-gray-400'
    };
    return emotionColors[emotion as keyof typeof emotionColors] || 'text-gray-400 border-gray-400';
  };

  if (emotionHistory.length === 0) {
    return (
      <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <div className="text-center text-slate-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Start speaking to see emotion analytics</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Emotion Statistics */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-syntra-blue" />
            Emotion Analytics
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportData}
            className="text-slate-300 border-slate-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{emotionHistory.length}</p>
            <p className="text-sm text-slate-400">Total Expressions</p>
          </div>
          <div className="text-center">
            <Badge 
              variant="outline" 
              className={`${getEmotionColor(dominantEmotion)} bg-current/10`}
            >
              {dominantEmotion}
            </Badge>
            <p className="text-sm text-slate-400 mt-1">Dominant Emotion</p>
          </div>
        </div>

        {/* Emotion Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">Emotion Distribution</h4>
          {Object.entries(emotionStats)
            .sort(([,a], [,b]) => b - a)
            .map(([emotion, count]) => {
              const percentage = (count / emotionHistory.length) * 100;
              return (
                <motion.div
                  key={emotion}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="text-sm text-slate-300 capitalize">{emotion}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${getEmotionColor(emotion).replace('text-', 'bg-').replace('border-', 'bg-')}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8">{count}</span>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </Card>

      {/* Emotion Trends Chart */}
      {chartData && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-syntra-purple" />
            Emotion Trends
          </h4>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Card>
      )}
    </div>
  );
}