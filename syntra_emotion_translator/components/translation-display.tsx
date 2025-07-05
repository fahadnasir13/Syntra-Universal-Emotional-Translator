"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Volume2, Copy, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TranslationDisplayProps {
  originalText: string;
  emotion: string;
  sourceLanguage: string;
  targetLanguage: string;
  onTranslationComplete: (translatedText: string) => void;
  isProcessing: boolean;
}

// Mock translation service - in real app this would call actual translation API
const mockTranslations: Record<string, Record<string, string>> = {
  en: {
    ur: 'یہ ایک مثال ترجمہ ہے',
    ar: 'هذه ترجمة تجريبية',
    hi: 'यह एक उदाहरण अनुवाद है',
    es: 'Esta es una traducción de ejemplo',
    fr: 'Ceci est un exemple de traduction',
    de: 'Dies ist eine Beispielübersetzung',
    zh: '这是一个示例翻译',
    ja: 'これは翻訳の例です',
  },
  ur: {
    en: 'This is an example translation from Urdu',
    ar: 'هذه ترجمة تجريبية من الأردية',
  },
  ar: {
    en: 'This is an example translation from Arabic',
    ur: 'یہ عربی سے ترجمے کی مثال ہے',
  }
};

export function TranslationDisplay({
  originalText,
  emotion,
  sourceLanguage,
  targetLanguage,
  onTranslationComplete,
  isProcessing
}: TranslationDisplayProps) {
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationStatus, setTranslationStatus] = useState<'idle' | 'translating' | 'success' | 'error'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  console.log('TranslationDisplay: Component rendered', {
    originalText,
    emotion,
    sourceLanguage,
    targetLanguage,
    isProcessing
  });

  useEffect(() => {
    if (originalText && !isProcessing) {
      console.log('TranslationDisplay: Starting translation', { originalText, sourceLanguage, targetLanguage });
      handleTranslation();
    }
  }, [originalText, sourceLanguage, targetLanguage, isProcessing]);

  const handleTranslation = async () => {
    setIsTranslating(true);
    setTranslationStatus('translating');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      // Get mock translation or generate a contextual one
      let translated = getMockTranslation(originalText, sourceLanguage, targetLanguage);
      
      // Add emotional context to translation
      translated = addEmotionalContext(translated, emotion);
      
      console.log('TranslationDisplay: Translation completed', translated);
      
      setTranslatedText(translated);
      setTranslationStatus('success');
      onTranslationComplete(translated);
      
    } catch (error) {
      console.error('TranslationDisplay: Translation failed', error);
      setTranslationStatus('error');
      toast({
        title: "Translation Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const getMockTranslation = (text: string, source: string, target: string): string => {
    // Use mock translations if available
    if (mockTranslations[source] && mockTranslations[source][target]) {
      return mockTranslations[source][target];
    }
    
    // Generate contextual translation based on text content
    return generateContextualTranslation(text, target);
  };

  const generateContextualTranslation = (text: string, targetLang: string): string => {
    const greetings = {
      ur: 'سلام علیکم',
      ar: 'السلام عليكم',
      hi: 'नमस्ते',
      es: 'Hola',
      fr: 'Bonjour',
      de: 'Hallo',
      zh: '你好',
      ja: 'こんにちは',
    };

    // Simple contextual responses
    if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
      return greetings[targetLang as keyof typeof greetings] || 'Hello';
    }
    
    if (text.toLowerCase().includes('thank')) {
      const thanks = {
        ur: 'شکریہ',
        ar: 'شكرا',
        hi: 'धन्यवाद',
        es: 'Gracias',
        fr: 'Merci',
        de: 'Danke',
        zh: '谢谢',
        ja: 'ありがとう',
      };
      return thanks[targetLang as keyof typeof thanks] || 'Thank you';
    }

    // Default translation format
    return `[${targetLang.toUpperCase()}] ${text}`;
  };

  const addEmotionalContext = (translation: string, emotionType: string): string => {
    const emotionalPrefixes = {
      happy: {
        ur: '(خوشی سے) ',
        ar: '(بسعادة) ',
        es: '(con alegría) ',
        fr: '(avec joie) ',
      },
      sad: {
        ur: '(افسوس سے) ',
        ar: '(بحزن) ',
        es: '(con tristeza) ',
        fr: '(avec tristesse) ',
      },
      angry: {
        ur: '(غصے سے) ',
        ar: '(بغضب) ',
        es: '(con ira) ',
        fr: '(avec colère) ',
      }
    };

    if (emotionType !== 'neutral' && emotionalPrefixes[emotionType as keyof typeof emotionalPrefixes]) {
      const prefix = emotionalPrefixes[emotionType as keyof typeof emotionalPrefixes][targetLanguage as keyof typeof emotionalPrefixes.happy];
      if (prefix) {
        return prefix + translation;
      }
    }

    return translation;
  };

  const handlePlayAudio = () => {
    if (!translatedText) return;
    
    setIsSpeaking(true);
    console.log('TranslationDisplay: Playing audio', translatedText);
    
    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = getLanguageCode(targetLanguage);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    } else {
      // Fallback - simulate audio playback
      setTimeout(() => setIsSpeaking(false), 3000);
      toast({
        title: "Audio Playback",
        description: "Text-to-speech not supported in this browser",
      });
    }
  };

  const handleCopyText = async () => {
    if (!translatedText) return;
    
    try {
      await navigator.clipboard.writeText(translatedText);
      console.log('TranslationDisplay: Text copied to clipboard');
      toast({
        title: "Copied!",
        description: "Translation copied to clipboard",
      });
    } catch (error) {
      console.error('TranslationDisplay: Copy failed', error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getLanguageCode = (code: string): string => {
    const langCodes: Record<string, string> = {
      en: 'en-US',
      ur: 'ur-PK',
      ar: 'ar-SA',
      hi: 'hi-IN',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      zh: 'zh-CN',
      ja: 'ja-JP',
    };
    return langCodes[code] || 'en-US';
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!originalText ? (
          <motion.div
            key="empty"
            className="text-center p-8 border-2 border-dashed border-slate-600/50 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-slate-400">Translation will appear here</p>
          </motion.div>
        ) : isTranslating ? (
          <motion.div
            key="translating"
            className="text-center p-8 bg-slate-700/30 rounded-lg border border-slate-600/50"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className="flex flex-col items-center space-y-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Loader2 className="w-8 h-8 text-syntra-indigo animate-spin" />
              <p className="text-white font-medium">Translating with emotional context...</p>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs bg-syntra-indigo/10 border-syntra-indigo text-syntra-indigo">
                  {emotion}
                </Badge>
                <span className="text-xs text-slate-400">emotion applied</span>
              </div>
            </motion.div>
          </motion.div>
        ) : translationStatus === 'success' && translatedText ? (
          <motion.div
            key="success"
            className="bg-slate-700/30 rounded-lg border border-slate-600/50 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Translation Header */}
            <div className="p-4 bg-slate-800/50 border-b border-slate-600/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Translation Complete</span>
                </div>
                <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/50 text-green-400">
                  {emotion} context applied
                </Badge>
              </div>
            </div>

            {/* Translation Content */}
            <div className="p-6">
              <motion.p
                className="text-lg text-white leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {translatedText}
              </motion.p>

              <Separator className="my-4 bg-slate-600/50" />

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePlayAudio}
                    disabled={isSpeaking}
                    className="bg-slate-700/50 border-slate-600/50 hover:bg-slate-600/50 text-white"
                  >
                    {isSpeaking ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Volume2 className="w-4 h-4 mr-2" />
                    )}
                    {isSpeaking ? 'Playing...' : 'Play Audio'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyText}
                    className="bg-slate-700/50 border-slate-600/50 hover:bg-slate-600/50 text-white"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span>Quality:</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-green-400" />
                    ))}
                    <div className="w-2 h-2 rounded-full bg-slate-600" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : translationStatus === 'error' ? (
          <motion.div
            key="error"
            className="text-center p-8 bg-red-500/10 border border-red-500/50 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 font-medium mb-2">Translation Failed</p>
            <p className="text-sm text-slate-400">Please try again or check your connection</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleTranslation}
              className="mt-4 bg-red-500/10 border-red-500/50 hover:bg-red-500/20 text-red-400"
            >
              Retry Translation
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}