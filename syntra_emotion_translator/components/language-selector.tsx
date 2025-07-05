"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from 'lucide-react';

interface LanguageSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (language: string) => void;
  onTargetChange: (language: string) => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' }
];

export function LanguageSelector({ 
  sourceLanguage, 
  targetLanguage, 
  onSourceChange, 
  onTargetChange 
}: LanguageSelectorProps) {
  
  console.log('LanguageSelector: Component rendered', { sourceLanguage, targetLanguage });

  const getLanguageName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  const handleSwapLanguages = () => {
    console.log('LanguageSelector: Swapping languages', { sourceLanguage, targetLanguage });
    onSourceChange(targetLanguage);
    onTargetChange(sourceLanguage);
  };

  return (
    <div className="space-y-4">
      {/* Source Language */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">From</label>
        <Select value={sourceLanguage} onValueChange={onSourceChange}>
          <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
            <SelectValue>
              {getLanguageName(sourceLanguage)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {languages.map((language) => (
              <SelectItem 
                key={language.code} 
                value={language.code}
                className="text-white hover:bg-slate-700 focus:bg-slate-700"
              >
                <span className="flex items-center space-x-2">
                  <span>{language.flag}</span>
                  <span>{language.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapLanguages}
            className="bg-slate-700/50 border-slate-600/50 hover:bg-slate-600/50 text-white"
          >
            <motion.div
              animate={{ rotate: [0, 180] }}
              transition={{ duration: 0.3 }}
              key={`${sourceLanguage}-${targetLanguage}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </motion.div>
          </Button>
        </motion.div>
      </div>

      {/* Target Language */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">To</label>
        <Select value={targetLanguage} onValueChange={onTargetChange}>
          <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
            <SelectValue>
              {getLanguageName(targetLanguage)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {languages
              .filter(lang => lang.code !== sourceLanguage)
              .map((language) => (
                <SelectItem 
                  key={language.code} 
                  value={language.code}
                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  <span className="flex items-center space-x-2">
                    <span>{language.flag}</span>
                    <span>{language.name}</span>
                  </span>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Language Pair Info */}
      <motion.div
        className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={`${sourceLanguage}-${targetLanguage}`}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Translation Pair:</span>
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">
              {getLanguageName(sourceLanguage)}
            </span>
            <span className="text-slate-400">→</span>
            <span className="text-white font-medium">
              {getLanguageName(targetLanguage)}
            </span>
          </div>
        </div>
        
        {/* Quality Indicator */}
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Expected Quality:</span>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < getTranslationQuality(sourceLanguage, targetLanguage)
                    ? 'bg-green-400'
                    : 'bg-slate-600'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function getTranslationQuality(source: string, target: string): number {
  // Simulate quality based on language pair popularity
  const highQualityPairs = [
    'en-es', 'en-fr', 'en-de', 'en-zh', 'en-ja',
    'es-en', 'fr-en', 'de-en', 'zh-en', 'ja-en'
  ];
  
  const mediumQualityPairs = [
    'en-hi', 'en-ar', 'en-ur', 'en-ru', 'en-pt',
    'hi-en', 'ar-en', 'ur-en', 'ru-en', 'pt-en'
  ];
  
  const pair = `${source}-${target}`;
  
  if (highQualityPairs.includes(pair)) return 5;
  if (mediumQualityPairs.includes(pair)) return 4;
  if (source === 'en' || target === 'en') return 3;
  return 2;
}