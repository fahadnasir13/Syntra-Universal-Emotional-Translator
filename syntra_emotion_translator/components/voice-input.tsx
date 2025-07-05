"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onTextReceived: (text: string) => void;
  isProcessing: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export function VoiceInput({ 
  isListening, 
  onStartListening, 
  onStopListening, 
  onTextReceived, 
  isProcessing 
}: VoiceInputProps) {
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  console.log('VoiceInput: Component rendered', { isListening, isProcessing, isRecognitionActive });

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false; // Set to false to prevent issues
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        recognitionInstance.maxAlternatives = 1;

        recognitionInstance.onstart = () => {
          console.log('VoiceInput: Speech recognition started');
          setIsRecognitionActive(true);
        };

        recognitionInstance.onresult = (event: any) => {
          try {
            const results = Array.from(event.results);
            const transcript = results
              .map((result: any) => result[0].transcript)
              .join('');
            
            console.log('VoiceInput: Speech recognition result', transcript);
            
            if (event.results[event.results.length - 1].isFinal && transcript.trim()) {
              onTextReceived(transcript.trim());
              setIsRecognitionActive(false);
              onStopListening();
            }
          } catch (error) {
            console.error('VoiceInput: Error processing speech result', error);
            setIsRecognitionActive(false);
            onStopListening();
          }
        };

        recognitionInstance.onerror = (event: any) => {
          const errorType = event.error;
          console.log('VoiceInput: Speech recognition error type:', errorType);
          
          // Handle different error types gracefully
          switch (errorType) {
            case 'aborted':
              console.log('VoiceInput: Speech recognition was aborted (normal behavior)');
              break;
            case 'no-speech':
              console.log('VoiceInput: No speech detected');
              break;
            case 'audio-capture':
              console.warn('VoiceInput: Audio capture failed - check microphone permissions');
              break;
            case 'not-allowed':
              console.warn('VoiceInput: Microphone access denied');
              break;
            case 'network':
              console.warn('VoiceInput: Network error during speech recognition');
              break;
            default:
              console.error('VoiceInput: Unexpected speech recognition error:', errorType);
          }
          
          setIsRecognitionActive(false);
          onStopListening();
        };

        recognitionInstance.onend = () => {
          console.log('VoiceInput: Speech recognition ended');
          setIsRecognitionActive(false);
          if (isListening) {
            onStopListening();
          }
        };

        setRecognition(recognitionInstance);
        recognitionRef.current = recognitionInstance;
      } else {
        console.warn('VoiceInput: Speech recognition not supported');
      }
    }

    return () => {
      // Cleanup on component unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recognitionRef.current && isRecognitionActive) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.log('VoiceInput: Cleanup - recognition already stopped');
        }
      }
    };
  }, [onTextReceived, onStopListening, isListening, isRecognitionActive]);

  useEffect(() => {
    if (isListening && recognition && !isRecognitionActive) {
      try {
        // Only start if not already active
        recognition.start();
        console.log('VoiceInput: Starting speech recognition');
        
        // Simulate audio level for visual feedback
        intervalRef.current = setInterval(() => {
          setAudioLevel(Math.random() * 100);
        }, 100);
      } catch (error) {
        console.error('VoiceInput: Error starting recognition', error);
        setIsRecognitionActive(false);
        onStopListening();
      }
    } else if (!isListening && recognition && isRecognitionActive) {
      try {
        // Gracefully stop recognition
        recognition.abort(); // Use abort instead of stop for immediate termination
        console.log('VoiceInput: Stopping speech recognition');
        setIsRecognitionActive(false);
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setAudioLevel(0);
      } catch (error) {
        console.log('VoiceInput: Recognition already stopped or error stopping:', error);
        setIsRecognitionActive(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setAudioLevel(0);
      }
    }
  }, [isListening, recognition, isRecognitionActive, onStopListening]);

  const handleToggleListening = () => {
    console.log('VoiceInput: Toggle listening clicked', { isListening, isRecognitionActive });
    
    // Prevent rapid toggling
    if (isProcessing) {
      console.log('VoiceInput: Ignoring toggle - processing in progress');
      return;
    }
    
    if (isListening || isRecognitionActive) {
      // Stop listening
      onStopListening();
    } else {
      // Start listening
      onStartListening();
    }
  };

  // Fallback for browsers without speech recognition
  const handleManualInput = () => {
    const text = prompt("Enter text to translate:");
    if (text && text.trim()) {
      console.log('VoiceInput: Manual text input', text);
      onTextReceived(text.trim());
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main Voice Button */}
      <div className="relative">
        {/* Pulse Rings */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-syntra-indigo"
                animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-syntra-blue"
                animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}
        </AnimatePresence>

        <Button
          size="icon"
          variant={isListening ? "destructive" : "default"}
          className={`w-20 h-20 rounded-full transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50' 
              : 'bg-syntra-indigo hover:bg-syntra-blue shadow-lg shadow-syntra-indigo/50'
          } ${isProcessing ? 'animate-pulse' : ''}`}
          onClick={isSupported ? handleToggleListening : handleManualInput}
          disabled={isProcessing}
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Loader2 className="w-8 h-8 animate-spin" />
              </motion.div>
            ) : isListening ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <MicOff className="w-8 h-8" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Mic className="w-8 h-8" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {/* Audio Visualization */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="flex items-center space-x-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-syntra-indigo rounded-full"
                animate={{
                  height: [10, audioLevel / 5 + 10, 10],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Text */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.p
              key="processing"
              className="text-white font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Processing your speech...
            </motion.p>
          ) : isListening ? (
            <motion.p
              key="listening"
              className="text-syntra-indigo font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Listening... Speak now
            </motion.p>
          ) : (
            <motion.p
              key="idle"
              className="text-slate-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isSupported 
                ? "Click to start voice input" 
                : "Click to enter text manually"
              }
            </motion.p>
          )}
        </AnimatePresence>
        
        {!isSupported && (
          <p className="text-xs text-slate-500 mt-2">
            Voice recognition not supported in this browser
          </p>
        )}
      </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}