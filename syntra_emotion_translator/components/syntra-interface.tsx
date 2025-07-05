"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mic, MicOff, Volume2, Languages, Shield, Brain, Waves } from 'lucide-react';
import { VoiceInput } from './voice-input';
import { EmotionDetector } from './emotion-detector';
import { LanguageSelector } from './language-selector';
import { TranslationDisplay } from './translation-display';

interface TranslationSession {
  id: string;
  originalText: string;
  translatedText: string;
  emotion: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: Date;
}

export function SyntraInterface() {
  const [isListening, setIsListening] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [detectedEmotion, setDetectedEmotion] = useState<string>('neutral');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('ur');
  const [isProcessing, setIsProcessing] = useState(false);
  const [translationSessions, setTranslationSessions] = useState<TranslationSession[]>([]);
  const [isSecureMode, setIsSecureMode] = useState(true);

  console.log('SyntraInterface: Component rendered', {
    isListening,
    currentText,
    detectedEmotion,
    sourceLanguage,
    targetLanguage
  });

  const handleVoiceInput = (text: string) => {
    console.log('SyntraInterface: Voice input received', text);
    setCurrentText(text);
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  const handleEmotionDetected = (emotion: string) => {
    console.log('SyntraInterface: Emotion detected', emotion);
    setDetectedEmotion(emotion);
  };

  const handleTranslationComplete = (translatedText: string) => {
    console.log('SyntraInterface: Translation completed', translatedText);
    
    const newSession: TranslationSession = {
      id: Date.now().toString(),
      originalText: currentText,
      translatedText,
      emotion: detectedEmotion,
      sourceLanguage,
      targetLanguage,
      timestamp: new Date()
    };
    
    setTranslationSessions(prev => [newSession, ...prev.slice(0, 4)]);
  };

  const getEmotionColor = (emotion: string) => {
    const emotionColors = {
      happy: 'text-emotion-happy',
      sad: 'text-emotion-sad',
      angry: 'text-emotion-angry',
      surprise: 'text-emotion-surprise',
      fear: 'text-emotion-fear',
      disgust: 'text-emotion-disgust',
      neutral: 'text-emotion-neutral'
    };
    return emotionColors[emotion as keyof typeof emotionColors] || 'text-emotion-neutral';
  };

  return (
    <div className="min-h-screen bg-syntra-gradient relative overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-syntra-purple/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Waves className="w-8 h-8 text-syntra-indigo mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-syntra-blue bg-clip-text text-transparent">
              Syntra
            </h1>
          </div>
          <p className="text-xl text-slate-300 font-light tracking-wide">
            Universal Emotional Translator
          </p>
          <p className="text-sm text-slate-400 mt-2">
            "Where Emotions Speak Every Language"
          </p>
          
          {/* Security Badge */}
          <motion.div
            className="flex items-center justify-center mt-4"
            animate={{ opacity: isSecureMode ? 1 : 0.5 }}
          >
            <Badge variant="outline" className="bg-green-500/10 border-green-500/50 text-green-400">
              <Shield className="w-3 h-3 mr-1" />
              End-to-End Encrypted
            </Badge>
          </motion.div>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Languages className="w-5 h-5 mr-2 text-syntra-blue" />
                Language Settings
              </h3>
              <LanguageSelector
                sourceLanguage={sourceLanguage}
                targetLanguage={targetLanguage}
                onSourceChange={setSourceLanguage}
                onTargetChange={setTargetLanguage}
              />
            </Card>

            <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-syntra-purple" />
                Emotion Analysis
              </h3>
              <EmotionDetector
                text={currentText}
                onEmotionDetected={handleEmotionDetected}
                emotion={detectedEmotion}
              />
            </Card>
          </motion.div>

          {/* Center Panel - Voice Input */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="p-8 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm text-center">
              <VoiceInput
                isListening={isListening}
                onStartListening={() => setIsListening(true)}
                onStopListening={() => setIsListening(false)}
                onTextReceived={handleVoiceInput}
                isProcessing={isProcessing}
              />
            </Card>

            {currentText && (
              <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <h4 className="text-sm font-medium text-slate-400 mb-2">Original Text</h4>
                <p className="text-white leading-relaxed">{currentText}</p>
                <div className="flex items-center mt-4">
                  <span className="text-sm text-slate-400 mr-2">Detected Emotion:</span>
                  <Badge 
                    variant="outline" 
                    className={`${getEmotionColor(detectedEmotion)} border-current bg-current/10`}
                  >
                    {detectedEmotion}
                  </Badge>
                </div>
              </Card>
            )}
          </motion.div>

          {/* Right Panel - Translation Results */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Volume2 className="w-5 h-5 mr-2 text-syntra-indigo" />
                Translation Output
              </h3>
              <TranslationDisplay
                originalText={currentText}
                emotion={detectedEmotion}
                sourceLanguage={sourceLanguage}
                targetLanguage={targetLanguage}
                onTranslationComplete={handleTranslationComplete}
                isProcessing={isProcessing}
              />
            </Card>

            {/* Recent Translations */}
            {translationSessions.length > 0 && (
              <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <h4 className="text-sm font-medium text-slate-400 mb-4">Recent Translations</h4>
                <div className="space-y-3">
                  {translationSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <p className="text-sm text-slate-300 truncate">{session.originalText}</p>
                      <Separator className="my-2 bg-slate-600/50" />
                      <p className="text-sm text-white truncate">{session.translatedText}</p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className={`text-xs ${getEmotionColor(session.emotion)} border-current`}>
                          {session.emotion}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {session.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}