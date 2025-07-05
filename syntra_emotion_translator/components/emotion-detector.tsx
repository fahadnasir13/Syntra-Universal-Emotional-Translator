"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Heart, Smile, Frown, Angry, AlertCircle, Meh, Zap } from 'lucide-react';

interface EmotionDetectorProps {
  text: string;
  onEmotionDetected: (emotion: string) => void;
  emotion: string;
}

// Simplified emotion detection based on keywords
const emotionKeywords = {
  happy: ['happy', 'joy', 'excited', 'wonderful', 'great', 'amazing', 'love', 'fantastic', 'awesome', 'perfect'],
  sad: ['sad', 'depressed', 'down', 'upset', 'disappointed', 'hurt', 'cry', 'terrible', 'awful', 'worst'],
  angry: ['angry', 'mad', 'furious', 'hate', 'disgusted', 'annoyed', 'frustrated', 'rage', 'livid', 'pissed'],
  surprise: ['surprised', 'shocked', 'wow', 'amazing', 'incredible', 'unbelievable', 'astonished', 'stunned'],
  fear: ['afraid', 'scared', 'worried', 'anxious', 'nervous', 'terrified', 'panic', 'frightened'],
  disgust: ['disgusting', 'gross', 'sick', 'nasty', 'revolting', 'repulsive', 'horrible'],
  neutral: []
};

export function EmotionDetector({ text, onEmotionDetected, emotion }: EmotionDetectorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confidence, setConfidence] = useState(0);

  console.log('EmotionDetector: Component rendered', { text, emotion });

  useEffect(() => {
    if (text.trim()) {
      console.log('EmotionDetector: Analyzing text', text);
      setIsAnalyzing(true);
      
      // Simulate processing delay
      setTimeout(() => {
        const detectedEmotion = analyzeEmotion(text);
        const emotionConfidence = calculateConfidence(text, detectedEmotion);
        
        console.log('EmotionDetector: Analysis complete', { detectedEmotion, emotionConfidence });
        
        setConfidence(emotionConfidence);
        onEmotionDetected(detectedEmotion);
        setIsAnalyzing(false);
      }, 1000);
    }
  }, [text, onEmotionDetected]);

  const analyzeEmotion = (inputText: string): string => {
    const lowerText = inputText.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    let emotionScores = {
      happy: 0,
      sad: 0,
      angry: 0,
      surprise: 0,
      fear: 0,
      disgust: 0,
      neutral: 0
    };

    // Count keyword matches for each emotion
    Object.entries(emotionKeywords).forEach(([emotionType, keywords]) => {
      if (emotionType !== 'neutral') {
        keywords.forEach(keyword => {
          if (words.includes(keyword)) {
            emotionScores[emotionType as keyof typeof emotionScores] += 1;
          }
        });
      }
    });

    // Find the emotion with the highest score
    const maxEmotion = Object.entries(emotionScores).reduce((a, b) => 
      emotionScores[a[0] as keyof typeof emotionScores] > emotionScores[b[0] as keyof typeof emotionScores] ? a : b
    );

    return maxEmotion[1] > 0 ? maxEmotion[0] : 'neutral';
  };

  const calculateConfidence = (inputText: string, detectedEmotion: string): number => {
    const lowerText = inputText.toLowerCase();
    const words = lowerText.split(/\s+/);
    const relevantKeywords = emotionKeywords[detectedEmotion as keyof typeof emotionKeywords] || [];
    
    const matches = relevantKeywords.filter(keyword => words.includes(keyword)).length;
    return Math.min((matches / Math.max(words.length, 1)) * 100, 95);
  };

  const getEmotionIcon = (emotionType: string) => {
    const icons = {
      happy: Smile,
      sad: Frown,
      angry: Angry,
      surprise: AlertCircle,
      fear: Heart,
      disgust: Meh,
      neutral: Meh
    };
    
    const IconComponent = icons[emotionType as keyof typeof icons] || Meh;
    return <IconComponent className="w-4 h-4" />;
  };

  const getEmotionColor = (emotionType: string) => {
    const colors = {
      happy: 'text-emotion-happy border-emotion-happy bg-emotion-happy/10',
      sad: 'text-emotion-sad border-emotion-sad bg-emotion-sad/10',
      angry: 'text-emotion-angry border-emotion-angry bg-emotion-angry/10',
      surprise: 'text-emotion-surprise border-emotion-surprise bg-emotion-surprise/10',
      fear: 'text-emotion-fear border-emotion-fear bg-emotion-fear/10',
      disgust: 'text-emotion-disgust border-emotion-disgust bg-emotion-disgust/10',
      neutral: 'text-emotion-neutral border-emotion-neutral bg-emotion-neutral/10'
    };
    
    return colors[emotionType as keyof typeof colors] || colors.neutral;
  };

  const allEmotions = ['happy', 'sad', 'angry', 'surprise', 'fear', 'disgust', 'neutral'];

  return (
    <div className="space-y-4">
      {/* Current Detected Emotion */}
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="analyzing"
            className="flex items-center justify-center p-4 border border-slate-600/50 rounded-lg bg-slate-700/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className="flex items-center space-x-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Zap className="w-4 h-4 text-syntra-purple" />
              <span className="text-sm text-slate-300">Analyzing emotion...</span>
            </motion.div>
          </motion.div>
        ) : emotion && text ? (
          <motion.div
            key={emotion}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div
              className={`inline-flex items-center space-x-2 px-4 py-3 rounded-lg border ${getEmotionColor(emotion)}`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5 }}
            >
              {getEmotionIcon(emotion)}
              <span className="font-medium capitalize">{emotion}</span>
              {confidence > 0 && (
                <Badge variant="outline" className="text-xs bg-white/10 border-white/20">
                  {confidence.toFixed(0)}%
                </Badge>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="waiting"
            className="text-center p-4 border border-slate-600/50 rounded-lg bg-slate-700/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-sm text-slate-400">Waiting for input...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emotion Grid */}
      <div className="grid grid-cols-3 gap-2">
        {allEmotions.map((emotionType) => (
          <motion.div
            key={emotionType}
            className={`p-2 rounded-lg border transition-all duration-300 ${
              emotion === emotionType
                ? getEmotionColor(emotionType)
                : 'border-slate-600/30 bg-slate-700/20 text-slate-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col items-center space-y-1">
              <motion.div
                animate={emotion === emotionType ? { 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                {getEmotionIcon(emotionType)}
              </motion.div>
              <span className="text-xs font-medium capitalize">{emotionType}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Emotional Context */}
      {emotion && emotion !== 'neutral' && text && (
        <motion.div
          className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <h5 className="text-xs font-medium text-slate-400 mb-2">Emotional Context</h5>
          <p className="text-xs text-slate-300">
            {getEmotionalContext(emotion)}
          </p>
        </motion.div>
      )}
    </div>
  );
}

function getEmotionalContext(emotion: string): string {
  const contexts = {
    happy: "Positive sentiment detected. Translation will convey joy and enthusiasm.",
    sad: "Melancholic tone identified. Translation will preserve emotional depth.",
    angry: "Strong negative emotion found. Translation will maintain intensity.",
    surprise: "Astonishment detected. Translation will capture the element of surprise.",
    fear: "Anxiety or concern identified. Translation will convey caution.",
    disgust: "Disapproval detected. Translation will express distaste.",
    neutral: "Balanced emotional state. Translation will be straightforward."
  };
  
  return contexts[emotion as keyof typeof contexts] || contexts.neutral;
}