"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  Target, 
  TrendingUp, 
  Award, 
  Book,
  MessageCircle,
  Volume2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface TutorSession {
  id: string;
  emotion: string;
  originalText: string;
  feedback: string;
  suggestion: string;
  score: number;
  improvements: string[];
}

interface AITutorProps {
  currentText: string;
  detectedEmotion: string;
  onFeedbackRequest: () => void;
  onRetryRequest: () => void;
}

export function AITutor({ 
  currentText, 
  detectedEmotion, 
  onFeedbackRequest, 
  onRetryRequest 
}: AITutorProps) {
  const [tutorSessions, setTutorSessions] = useState<TutorSession[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<string>('');
  const [learningGoals, setLearningGoals] = useState<string[]>([
    'Emotional tone clarity',
    'Cultural sensitivity',
    'Professional communication',
    'Empathetic expression'
  ]);
  const [progressStats, setProgressStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    emotionsImproved: 0,
    streakDays: 0
  });
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);

  console.log('AITutor: Rendering with text:', currentText?.substring(0, 50), 'emotion:', detectedEmotion);

  useEffect(() => {
    if (currentText && detectedEmotion) {
      generateFeedback();
    }
  }, [currentText, detectedEmotion]);

  useEffect(() => {
    // Update progress statistics
    const avgScore = tutorSessions.length > 0 
      ? tutorSessions.reduce((sum, session) => sum + session.score, 0) / tutorSessions.length 
      : 0;
    
    const uniqueEmotions = new Set(tutorSessions.map(s => s.emotion)).size;
    
    setProgressStats({
      totalSessions: tutorSessions.length,
      averageScore: Math.round(avgScore),
      emotionsImproved: uniqueEmotions,
      streakDays: calculateStreakDays()
    });
  }, [tutorSessions]);

  const generateFeedback = () => {
    const feedbackEngine = new EmotionalFeedbackEngine();
    const feedback = feedbackEngine.analyzeCommunication(currentText, detectedEmotion);
    
    const newSession: TutorSession = {
      id: Date.now().toString(),
      emotion: detectedEmotion,
      originalText: currentText,
      feedback: feedback.feedback,
      suggestion: feedback.suggestion,
      score: feedback.score,
      improvements: feedback.improvements
    };

    setTutorSessions(prev => [newSession, ...prev.slice(0, 9)]); // Keep last 10 sessions
    setCurrentFeedback(feedback.feedback);
    
    console.log('AITutor: Generated feedback for emotion:', detectedEmotion, 'score:', feedback.score);
  };

  const calculateStreakDays = () => {
    // Simple streak calculation - in real app, would use actual dates
    return Math.min(tutorSessions.length, 7);
  };

  const getEmotionAdvice = (emotion: string) => {
    const adviceMap = {
      happy: "Great energy! Consider if this level of enthusiasm is appropriate for your context.",
      sad: "Your sadness comes through clearly. Ensure this aligns with your intended message.",
      angry: "Strong emotion detected. Consider softening your tone for better reception.",
      surprise: "Your surprise is evident. Make sure it enhances rather than distracts from your message.",
      fear: "Anxiety detected. Try using more confident language to project assurance.",
      disgust: "Strong negative emotion. Consider reframing more constructively.",
      neutral: "Neutral tone detected. Consider adding more emotional nuance if appropriate."
    };
    return adviceMap[emotion as keyof typeof adviceMap] || "Keep practicing emotional expression!";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 border-green-400 bg-green-400/10';
    if (score >= 60) return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
    return 'text-red-400 border-red-400 bg-red-400/10';
  };

  const speakFeedback = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Tutor Header */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-syntra-indigo" />
            AI Communication Tutor
          </h3>
          <Badge variant="outline" className="text-syntra-blue border-syntra-blue bg-syntra-blue/10">
            <Target className="w-3 h-3 mr-1" />
            Learning Mode
          </Badge>
        </div>

        {/* Progress Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{progressStats.totalSessions}</p>
            <p className="text-xs text-slate-400">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-syntra-blue">{progressStats.averageScore}%</p>
            <p className="text-xs text-slate-400">Avg Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-syntra-purple">{progressStats.emotionsImproved}</p>
            <p className="text-xs text-slate-400">Emotions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{progressStats.streakDays}</p>
            <p className="text-xs text-slate-400">Day Streak</p>
          </div>
        </div>

        {/* Learning Goals */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white flex items-center">
            <Book className="w-4 h-4 mr-2" />
            Learning Goals
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {learningGoals.map((goal, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-syntra-blue rounded-full"></div>
                <span className="text-sm text-slate-300">{goal}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Current Feedback */}
      {currentFeedback && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-syntra-purple" />
              Real-time Feedback
            </h4>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speakFeedback(currentFeedback)}
                className="text-slate-300"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetryRequest}
                className="text-slate-300"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {tutorSessions.length > 0 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={getScoreColor(tutorSessions[0].score)}
                >
                  <Award className="w-3 h-3 mr-1" />
                  Score: {tutorSessions[0].score}%
                </Badge>
                <Badge variant="outline" className="text-slate-300 border-slate-600">
                  {tutorSessions[0].emotion}
                </Badge>
              </div>

              <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <p className="text-white mb-3">{tutorSessions[0].feedback}</p>
                
                <div className="flex items-start space-x-2 text-syntra-blue">
                  <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{tutorSessions[0].suggestion}</p>
                </div>
              </div>

              {/* Improvement Areas */}
              {tutorSessions[0].improvements.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-slate-300 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Areas for Improvement
                  </h5>
                  <div className="space-y-1">
                    {tutorSessions[0].improvements.map((improvement, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <AlertCircle className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                        <span className="text-slate-300">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex space-x-2 pt-3 border-t border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailedFeedback(!showDetailedFeedback)}
                  className="text-slate-300 border-slate-600"
                >
                  <Book className="w-4 h-4 mr-2" />
                  {showDetailedFeedback ? 'Hide' : 'Show'} Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFeedbackRequest}
                  className="text-slate-300 border-slate-600"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  More Feedback
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      )}

      {/* Detailed Analysis */}
      <AnimatePresence>
        {showDetailedFeedback && tutorSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-white mb-4">Detailed Analysis</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-slate-300 mb-2">Emotional Context</h5>
                  <p className="text-sm text-slate-400">
                    {getEmotionAdvice(tutorSessions[0].emotion)}
                  </p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-slate-300 mb-2">Communication Effectiveness</h5>
                  <Progress 
                    value={tutorSessions[0].score} 
                    className="mb-2" 
                  />
                  <p className="text-xs text-slate-400">
                    Your message conveys {tutorSessions[0].emotion} with {tutorSessions[0].score}% effectiveness
                  </p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-slate-300 mb-2">Cultural Considerations</h5>
                  <p className="text-sm text-slate-400">
                    In different cultures, this emotional expression might be interpreted differently. 
                    Consider your audience's cultural background for optimal communication.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session History */}
      {tutorSessions.length > 1 && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Recent Sessions
          </h4>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {tutorSessions.slice(1, 6).map((session, index) => (
              <motion.div
                key={session.id}
                className="p-3 bg-slate-700/30 rounded border border-slate-600/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-slate-300 border-slate-600">
                    {session.emotion}
                  </Badge>
                  <Badge variant="outline" className={getScoreColor(session.score)}>
                    {session.score}%
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 truncate">
                  {session.originalText}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {session.feedback.substring(0, 100)}...
                </p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Feedback Engine Class
class EmotionalFeedbackEngine {
  analyzeCommunication(text: string, emotion: string) {
    const textLength = text.length;
    const wordCount = text.split(' ').length;
    
    // Basic scoring algorithm
    let score = 70; // Base score
    
    // Adjust based on text length
    if (textLength > 10 && textLength < 200) score += 10;
    if (wordCount > 3 && wordCount < 50) score += 10;
    
    // Emotion-specific adjustments
    const emotionScores = {
      happy: 5,
      neutral: 0,
      sad: -5,
      angry: -10,
      fear: -15,
      surprise: 0,
      disgust: -15
    };
    
    score += emotionScores[emotion as keyof typeof emotionScores] || 0;
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));
    
    const feedback = this.generateFeedback(emotion, score, text);
    const suggestion = this.generateSuggestion(emotion, text);
    const improvements = this.generateImprovements(emotion, score);
    
    return { feedback, suggestion, score, improvements };
  }
  
  private generateFeedback(emotion: string, score: number, text: string) {
    const feedbackTemplates = {
      happy: [
        "Your positive energy comes through clearly! This creates a welcoming atmosphere.",
        "Great enthusiasm! Make sure it matches the formality of your situation.",
        "Your joy is infectious! Consider if this level of excitement fits your context."
      ],
      sad: [
        "Your emotion is clearly communicated. This can help others understand your feelings.",
        "The sadness in your voice is evident. Consider if you want to project more strength.",
        "Your emotional honesty is valuable. Think about your audience's ability to support you."
      ],
      angry: [
        "Strong emotion detected. Consider taking a moment to cool down before communicating.",
        "Your frustration is clear. Try rephrasing to be more constructive.",
        "Intense feelings come through. Consider softening your approach for better reception."
      ],
      neutral: [
        "Clear and professional tone. Consider adding more emotional nuance if appropriate.",
        "Balanced communication. You might want to inject more personality.",
        "Steady delivery. Think about whether more emotion would enhance your message."
      ]
    };
    
    const templates = feedbackTemplates[emotion as keyof typeof feedbackTemplates] || feedbackTemplates.neutral;
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return randomTemplate;
  }
  
  private generateSuggestion(emotion: string, text: string) {
    const suggestionMap = {
      happy: "Try adding specific examples to your enthusiasm to make it more credible.",
      sad: "Consider ending with a hopeful note or call to action.",
      angry: "Replace strong words with more diplomatic alternatives.",
      neutral: "Add personal touches or emotional words to engage your audience.",
      surprise: "Build up to your surprise for maximum impact.",
      fear: "Use confident language like 'I will' instead of 'I might'.",
      disgust: "Focus on solutions rather than problems."
    };
    
    return suggestionMap[emotion as keyof typeof suggestionMap] || "Keep practicing emotional expression!";
  }
  
  private generateImprovements(emotion: string, score: number) {
    const improvements = [];
    
    if (score < 60) {
      improvements.push("Work on emotional clarity in your expression");
    }
    
    if (emotion === 'angry') {
      improvements.push("Practice calming techniques before speaking");
      improvements.push("Use 'I' statements instead of 'you' statements");
    }
    
    if (emotion === 'sad') {
      improvements.push("Balance vulnerability with strength");
    }
    
    if (emotion === 'neutral') {
      improvements.push("Add more emotional variety to engage listeners");
    }
    
    return improvements;
  }
}