"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Volume2, 
  VolumeX, 
  Settings, 
  Palette,
  Zap,
  Heart,
  Frown,
  Angry,
  Surprise,
  Meh
} from 'lucide-react';

interface AvatarDisplayProps {
  emotion: string;
  isSpaking: boolean;
  text?: string;
  onAvatarSettingsChange: (settings: any) => void;
}

export function AvatarDisplay({ 
  emotion, 
  isSpaking, 
  text, 
  onAvatarSettingsChange 
}: AvatarDisplayProps) {
  const [avatarStyle, setAvatarStyle] = useState('default');
  const [showSettings, setShowSettings] = useState(false);
  const [mouthAnimation, setMouthAnimation] = useState(0);
  const [eyeAnimation, setEyeAnimation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  console.log('AvatarDisplay: Rendering with emotion:', emotion, 'speaking:', isSpaking);

  useEffect(() => {
    if (isSpaking) {
      // Animate mouth movement when speaking
      const animateMouth = () => {
        setMouthAnimation(prev => (prev + 0.3) % (Math.PI * 2));
        animationRef.current = requestAnimationFrame(animateMouth);
      };
      animateMouth();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setMouthAnimation(0);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpaking]);

  useEffect(() => {
    // Animate eyes based on emotion
    const animateEyes = () => {
      if (emotion === 'surprise') {
        setEyeAnimation(1.2);
      } else if (emotion === 'sad') {
        setEyeAnimation(0.7);
      } else if (emotion === 'angry') {
        setEyeAnimation(0.9);
      } else {
        setEyeAnimation(1);
      }
    };
    animateEyes();
  }, [emotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    canvas.width = 300;
    canvas.height = 300;

    // Draw avatar based on emotion and state
    drawAvatar(ctx, emotion, mouthAnimation, eyeAnimation, isSpaking);
  }, [emotion, mouthAnimation, eyeAnimation, isSpaking, avatarStyle]);

  const drawAvatar = (
    ctx: CanvasRenderingContext2D, 
    emotion: string, 
    mouthAnim: number, 
    eyeAnim: number, 
    speaking: boolean
  ) => {
    const centerX = 150;
    const centerY = 150;

    // Head
    ctx.fillStyle = getAvatarColor(emotion);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeSize = 15 * eyeAnim;
    ctx.fillStyle = '#000';
    
    // Left eye
    ctx.beginPath();
    ctx.arc(centerX - 30, centerY - 20, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.arc(centerX + 30, centerY - 20, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows based on emotion
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    if (emotion === 'angry') {
      // Angry eyebrows
      ctx.beginPath();
      ctx.moveTo(centerX - 45, centerY - 40);
      ctx.lineTo(centerX - 15, centerY - 35);
      ctx.moveTo(centerX + 15, centerY - 35);
      ctx.lineTo(centerX + 45, centerY - 40);
      ctx.stroke();
    } else if (emotion === 'sad') {
      // Sad eyebrows
      ctx.beginPath();
      ctx.moveTo(centerX - 45, centerY - 35);
      ctx.lineTo(centerX - 15, centerY - 40);
      ctx.moveTo(centerX + 15, centerY - 40);
      ctx.lineTo(centerX + 45, centerY - 35);
      ctx.stroke();
    } else {
      // Normal eyebrows
      ctx.beginPath();
      ctx.moveTo(centerX - 45, centerY - 40);
      ctx.lineTo(centerX - 15, centerY - 40);
      ctx.moveTo(centerX + 15, centerY - 40);
      ctx.lineTo(centerX + 45, centerY - 40);
      ctx.stroke();
    }

    // Mouth based on emotion and speaking
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();

    if (speaking) {
      // Animated mouth when speaking
      const mouthHeight = 10 + Math.sin(mouthAnim) * 8;
      ctx.arc(centerX, centerY + 30, 20, 0, Math.PI);
      ctx.moveTo(centerX - 20, centerY + 30);
      ctx.quadraticCurveTo(centerX, centerY + 30 + mouthHeight, centerX + 20, centerY + 30);
    } else {
      switch (emotion) {
        case 'happy':
          // Smile
          ctx.arc(centerX, centerY + 20, 25, 0, Math.PI);
          break;
        case 'sad':
          // Frown
          ctx.arc(centerX, centerY + 50, 25, Math.PI, 0);
          break;
        case 'angry':
          // Angry mouth
          ctx.moveTo(centerX - 20, centerY + 30);
          ctx.lineTo(centerX + 20, centerY + 30);
          break;
        case 'surprise':
          // Surprised mouth (O shape)
          ctx.arc(centerX, centerY + 30, 15, 0, Math.PI * 2);
          break;
        case 'fear':
          // Fearful mouth
          ctx.arc(centerX, centerY + 40, 15, 0, Math.PI);
          break;
        default:
          // Neutral mouth
          ctx.moveTo(centerX - 15, centerY + 30);
          ctx.lineTo(centerX + 15, centerY + 30);
      }
    }
    ctx.stroke();

    // Add glow effect based on emotion
    const glowColor = getEmotionGlow(emotion);
    if (glowColor) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  };

  const getAvatarColor = (emotion: string) => {
    const colors = {
      happy: '#10B981',
      sad: '#3B82F6',
      angry: '#EF4444',
      surprise: '#F59E0B',
      fear: '#8B5CF6',
      disgust: '#EF4444',
      neutral: '#6B7280'
    };
    return colors[emotion as keyof typeof colors] || '#6B7280';
  };

  const getEmotionGlow = (emotion: string) => {
    const glows = {
      happy: '#10B981',
      sad: '#3B82F6',
      angry: '#EF4444',
      surprise: '#F59E0B',
      fear: '#8B5CF6',
      disgust: '#EF4444',
      neutral: null
    };
    return glows[emotion as keyof typeof glows];
  };

  const getEmotionIcon = (emotion: string) => {
    const icons = {
      happy: Heart,
      sad: Frown,
      angry: Angry,
      surprise: Surprise,
      neutral: Meh
    };
    const Icon = icons[emotion as keyof typeof icons] || Meh;
    return <Icon className="w-4 h-4" />;
  };

  const emotionVariants = {
    happy: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, 0],
      transition: { duration: 0.8, repeat: Infinity }
    },
    sad: {
      scale: [1, 0.95, 1],
      y: [0, 10, 0],
      transition: { duration: 1.2, repeat: Infinity }
    },
    angry: {
      scale: [1, 1.05, 1],
      x: [-2, 2, -2, 2, 0],
      transition: { duration: 0.3, repeat: Infinity }
    },
    surprise: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.5 }
    },
    fear: {
      scale: [1, 0.9, 1],
      rotate: [-2, 2, -2, 2, 0],
      transition: { duration: 0.2, repeat: Infinity }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <User className="w-5 h-5 mr-2 text-syntra-purple" />
            AI Avatar
          </h3>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`${getAvatarColor(emotion) === '#10B981' ? 'text-green-400 border-green-400' : 
                         getAvatarColor(emotion) === '#3B82F6' ? 'text-blue-400 border-blue-400' :
                         getAvatarColor(emotion) === '#EF4444' ? 'text-red-400 border-red-400' :
                         getAvatarColor(emotion) === '#F59E0B' ? 'text-yellow-400 border-yellow-400' :
                         getAvatarColor(emotion) === '#8B5CF6' ? 'text-purple-400 border-purple-400' :
                         'text-gray-400 border-gray-400'} bg-current/10`}
            >
              {getEmotionIcon(emotion)}
              {emotion}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Avatar Canvas */}
        <div className="relative flex justify-center">
          <motion.div
            className="relative"
            variants={emotionVariants}
            animate={emotion}
          >
            <canvas
              ref={canvasRef}
              className="rounded-full border-2 border-slate-600 shadow-lg"
              width={300}
              height={300}
            />
            
            {/* Speaking indicator */}
            <AnimatePresence>
              {isSpaking && (
                <motion.div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                >
                  <Badge className="bg-green-500 text-white">
                    <Volume2 className="w-3 h-3 mr-1" />
                    Speaking
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Voice waves effect when speaking */}
            {isSpaking && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 border-2 border-syntra-blue/30 rounded-full"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ 
                      scale: [1, 1.3, 1.6],
                      opacity: [0.6, 0.3, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Current text being spoken */}
        {text && (
          <motion.div
            className="mt-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-slate-300 text-center italic">
              "{text}"
            </p>
          </motion.div>
        )}

        {/* Avatar Settings */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                Avatar Settings
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Avatar Style</label>
                  <select
                    value={avatarStyle}
                    onChange={(e) => {
                      setAvatarStyle(e.target.value);
                      onAvatarSettingsChange({ style: e.target.value });
                    }}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
                  >
                    <option value="default">Default</option>
                    <option value="minimal">Minimal</option>
                    <option value="expressive">Expressive</option>
                    <option value="cartoon">Cartoon</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-300 border-slate-600"
                    onClick={() => {
                      // Reset avatar position
                      setMouthAnimation(0);
                      setEyeAnimation(1);
                    }}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-300 border-slate-600"
                    onClick={() => {
                      // Test expression
                      setEyeAnimation(1.5);
                      setTimeout(() => setEyeAnimation(1), 1000);
                    }}
                  >
                    Test
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}