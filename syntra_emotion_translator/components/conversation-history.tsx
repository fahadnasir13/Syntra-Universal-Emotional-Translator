"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Lock, 
  Users, 
  Clock,
  Volume2,
  Eye,
  EyeOff
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import localforage from 'localforage';
import CryptoJS from 'crypto-js';

interface ConversationEntry {
  id: string;
  timestamp: Date;
  speaker: string;
  originalText: string;
  translatedText: string;
  emotion: string;
  emotionConfidence: number;
  sourceLanguage: string;
  targetLanguage: string;
  sessionId: string;
  encrypted?: boolean;
  audioUrl?: string;
}

interface ConversationHistoryProps {
  entries: ConversationEntry[];
  onEntrySelect: (entry: ConversationEntry) => void;
  onDeleteEntry: (id: string) => void;
  onExportHistory: () => void;
  encryptionKey?: string;
}

export function ConversationHistory({
  entries,
  onEntrySelect,
  onDeleteEntry,
  onExportHistory,
  encryptionKey
}: ConversationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmotion, setFilterEmotion] = useState('all');
  const [filterSpeaker, setFilterSpeaker] = useState('all');
  const [isEncrypted, setIsEncrypted] = useState(!!encryptionKey);
  const [filteredEntries, setFilteredEntries] = useState<ConversationEntry[]>([]);
  const [sessionStats, setSessionStats] = useState<Record<string, number>>({});
  const [showDecrypted, setShowDecrypted] = useState(false);

  console.log('ConversationHistory: Rendering with', entries.length, 'entries');

  useEffect(() => {
    // Save to local storage with encryption
    const saveToStorage = async () => {
      try {
        if (encryptionKey && entries.length > 0) {
          const encryptedData = CryptoJS.AES.encrypt(
            JSON.stringify(entries),
            encryptionKey
          ).toString();
          await localforage.setItem('syntra_conversation_history', encryptedData);
          console.log('ConversationHistory: Encrypted data saved to storage');
        } else {
          await localforage.setItem('syntra_conversation_history', entries);
          console.log('ConversationHistory: Unencrypted data saved to storage');
        }
      } catch (error) {
        console.error('ConversationHistory: Error saving to storage', error);
      }
    };

    saveToStorage();
  }, [entries, encryptionKey]);

  useEffect(() => {
    // Filter entries based on search and filters
    let filtered = entries;

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.translatedText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.speaker.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterEmotion !== 'all') {
      filtered = filtered.filter(entry => entry.emotion === filterEmotion);
    }

    if (filterSpeaker !== 'all') {
      filtered = filtered.filter(entry => entry.speaker === filterSpeaker);
    }

    setFilteredEntries(filtered);

    // Calculate session statistics
    const stats: Record<string, number> = {};
    entries.forEach(entry => {
      stats[entry.sessionId] = (stats[entry.sessionId] || 0) + 1;
    });
    setSessionStats(stats);
  }, [entries, searchTerm, filterEmotion, filterSpeaker]);

  const getEmotionColor = (emotion: string) => {
    const emotionColors = {
      happy: 'text-green-400 border-green-400 bg-green-400/10',
      sad: 'text-blue-400 border-blue-400 bg-blue-400/10',
      angry: 'text-red-400 border-red-400 bg-red-400/10',
      surprise: 'text-yellow-400 border-yellow-400 bg-yellow-400/10',
      fear: 'text-purple-400 border-purple-400 bg-purple-400/10',
      disgust: 'text-red-400 border-red-400 bg-red-400/10',
      neutral: 'text-gray-400 border-gray-400 bg-gray-400/10'
    };
    return emotionColors[emotion as keyof typeof emotionColors] || 'text-gray-400 border-gray-400 bg-gray-400/10';
  };

  const getSpeakerColor = (speaker: string) => {
    const colors = [
      'text-indigo-400 border-indigo-400 bg-indigo-400/10',
      'text-emerald-400 border-emerald-400 bg-emerald-400/10',
      'text-pink-400 border-pink-400 bg-pink-400/10',
      'text-cyan-400 border-cyan-400 bg-cyan-400/10'
    ];
    const hash = speaker.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const uniqueEmotions = [...new Set(entries.map(entry => entry.emotion))];
  const uniqueSpeakers = [...new Set(entries.map(entry => entry.speaker))];

  const exportToCSV = () => {
    const csvContent = [
      ['Timestamp', 'Speaker', 'Original Text', 'Translated Text', 'Emotion', 'Confidence', 'Source Lang', 'Target Lang', 'Session ID'],
      ...filteredEntries.map(entry => [
        entry.timestamp.toISOString(),
        entry.speaker,
        entry.originalText,
        entry.translatedText,
        entry.emotion,
        entry.emotionConfidence.toString(),
        entry.sourceLanguage,
        entry.targetLanguage,
        entry.sessionId
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syntra_conversation_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (entries.length === 0) {
    return (
      <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <div className="text-center text-slate-400">
          <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No conversation history yet</p>
          <p className="text-sm mt-2">Start translating to build your history</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <Card className="p-4 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <History className="w-5 h-5 mr-2 text-syntra-blue" />
            Conversation History
          </h3>
          <div className="flex items-center space-x-2">
            {isEncrypted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDecrypted(!showDecrypted)}
                className="text-slate-300"
              >
                {showDecrypted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="text-slate-300 border-slate-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{entries.length}</p>
            <p className="text-xs text-slate-400">Total Entries</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{Object.keys(sessionStats).length}</p>
            <p className="text-xs text-slate-400">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{uniqueSpeakers.length}</p>
            <p className="text-xs text-slate-400">Speakers</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white"
            />
          </div>

          <div className="flex space-x-2">
            <select
              value={filterEmotion}
              onChange={(e) => setFilterEmotion(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white text-sm"
            >
              <option value="all">All Emotions</option>
              {uniqueEmotions.map(emotion => (
                <option key={emotion} value={emotion}>
                  {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filterSpeaker}
              onChange={(e) => setFilterSpeaker(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white text-sm"
            >
              <option value="all">All Speakers</option>
              {uniqueSpeakers.map(speaker => (
                <option key={speaker} value={speaker}>
                  {speaker}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Conversation Entries */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <ScrollArea className="h-96 p-4">
          <AnimatePresence>
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                className="mb-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 cursor-pointer hover:bg-slate-700/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onEntrySelect(entry)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getSpeakerColor(entry.speaker)}>
                      <Users className="w-3 h-3 mr-1" />
                      {entry.speaker}
                    </Badge>
                    <Badge variant="outline" className={getEmotionColor(entry.emotion)}>
                      {entry.emotion}
                    </Badge>
                    {entry.encrypted && (
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400 bg-yellow-400/10">
                        <Lock className="w-3 h-3 mr-1" />
                        Encrypted
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {entry.audioUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Play audio
                          const audio = new Audio(entry.audioUrl);
                          audio.play();
                        }}
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEntry(entry.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Original ({entry.sourceLanguage.toUpperCase()})</p>
                    <p className="text-white text-sm">{isEncrypted && !showDecrypted ? '••••••••••••' : entry.originalText}</p>
                  </div>
                  <Separator className="bg-slate-600/50" />
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Translation ({entry.targetLanguage.toUpperCase()})</p>
                    <p className="text-syntra-blue text-sm">{isEncrypted && !showDecrypted ? '••••••••••••' : entry.translatedText}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {entry.timestamp.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    Confidence: {Math.round(entry.emotionConfidence * 100)}%
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </Card>
    </div>
  );
}