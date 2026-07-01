import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AvatarReaction } from '../types';

interface HumanAvatarProps {
  part: string; // 対象部位: "お腹", "頭", "胸", "膝", "腰", "足首", "肩", "首", "手首", "耳", "鼻", "喉（のど）", "皮膚", "腕", "顔", "足", "目", "背中", "手", "全身"
  reaction: AvatarReaction; // 'idle' | 'correct' | 'incorrect'
}

// Coordinate mapping for human body parts (SVG local viewBox: 0 0 300 320)
const partCoordinates: Record<string, { x: number; y: number }> = {
  "頭": { x: 150, y: 62 },
  "顔": { x: 150, y: 72 },
  "目": { x: 140, y: 72 },
  "耳": { x: 114, y: 72 },
  "鼻": { x: 150, y: 78 },
  "喉（のど）": { x: 150, y: 102 },
  "首": { x: 150, y: 102 },
  "胸": { x: 150, y: 135 },
  "お腹": { x: 150, y: 175 },
  "腰": { x: 150, y: 195 },
  "肩": { x: 110, y: 125 },
  "腕": { x: 92, y: 155 },
  "手": { x: 78, y: 185 },
  "手首": { x: 84, y: 175 },
  "膝": { x: 130, y: 245 },
  "足": { x: 130, y: 285 },
  "足首": { x: 130, y: 275 },
  "皮膚": { x: 95, y: 160 }, // Displays on the arm
  "背中": { x: 180, y: 155 }, // Displays slightly to the right of torso
  "全身": { x: 150, y: 150 },
};

export const HumanAvatar: React.FC<HumanAvatarProps> = ({ part, reaction }) => {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; type: 'star' | 'heart' | 'sweat' }[]>([]);

  // Coordinates of the targeted spot on the body
  const targetCoord = partCoordinates[part] || { x: 150, y: 150 };

  // Calculate arrow starting point (always coming from top-right offset)
  const arrowStart = {
    x: targetCoord.x + 45,
    y: targetCoord.y - 45
  };

  // Trigger positive/negative effect particles on reaction change
  useEffect(() => {
    if (reaction === 'correct') {
      // Generate positive particles (stars/hearts) around the avatar
      const newSparkles = Array.from({ length: 12 }).map((_, i) => ({
        id: Date.now() + i,
        x: 150 + (Math.random() - 0.5) * 160,
        y: 130 + (Math.random() - 0.5) * 160,
        type: Math.random() > 0.4 ? ('star' as const) : ('heart' as const)
      }));
      setSparkles(newSparkles);
    } else if (reaction === 'incorrect') {
      // Generate blue sweat drops around the head
      const newSparkles = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i,
        x: 150 + (Math.random() - 0.5) * 80,
        y: 70 + (Math.random() - 0.5) * 50,
        type: 'sweat' as const
      }));
      setSparkles(newSparkles);
    } else {
      setSparkles([]);
    }
  }, [reaction]);

  return (
    <div className="relative w-full h-48 md:h-52 flex items-center justify-center select-none overflow-hidden bg-slate-50/50 rounded-2xl border border-slate-100 p-2">
      {/* Absolute background visual glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sky-50/20 pointer-events-none" />
      
      {/* Background Orbs */}
      <AnimatePresence>
        {reaction === 'correct' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute w-40 h-40 rounded-full bg-emerald-100/30 filter blur-xl pointer-events-none"
          />
        )}
        {reaction === 'incorrect' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute w-40 h-40 rounded-full bg-rose-100/20 filter blur-xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Main SVG Container */}
      <svg
        viewBox="0 0 300 320"
        className="w-full h-full max-w-[240px] md:max-w-[260px] drop-shadow-sm z-10"
      >
        {/* Gradients & Filters */}
        <defs>
          {/* Skin Gradient - Clean soft warm white */}
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff8f6" />
            <stop offset="100%" stopColor="#fef2ee" />
          </linearGradient>

          {/* Hair Gradient - Friendly soft brown */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Clothes (Shirt) - Clean white / pale light blue */}
          <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="80%" stopColor="#f0f9ff" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>

          {/* Pants / Lower body - Soft Sky Blue */}
          <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Red arrow gradient */}
          <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          {/* Shadow Filter */}
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* ---------------- HUMAN CHARACTER LAYER ---------------- */}
        <motion.g
          animate={
            reaction === 'correct'
              ? {
                  y: [-12, 0, -8, 0],
                  scaleY: [0.93, 1.04, 0.97, 1],
                  rotate: [1, -1, 1, 0],
                  transition: { duration: 0.55, ease: 'easeInOut' },
                }
              : reaction === 'incorrect'
              ? {
                  y: [3, -1, 3, 0],
                  x: [-2, 2, -1, 1, 0],
                  rotate: [0.8, -1, 0.8, -0.5, 0],
                  transition: { duration: 0.5, ease: 'easeOut' },
                }
              : {
                  y: [0, -3, 0],
                  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                }
          }
          style={{ originX: '150px', originY: '180px' }}
        >
          {/* Floor Shadow */}
          <ellipse cx="150" cy="305" rx="50" ry="5" fill="#e2e8f0" />

          {/* LEGS & FEET */}
          <g>
            {/* Left Leg */}
            <rect x="116" y="210" width="12" height="78" rx="6" fill="#fef2ee" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="116" y="210" width="12" height="30" fill="url(#pantsGrad)" />
            {/* Left Shoe */}
            <path d="M104 286 h24 a5 5 0 0 1 5 5 v3 h-34 v-3 a5 5 0 0 1 5 -5 z" fill="#94a3b8" />

            {/* Right Leg */}
            <rect x="172" y="210" width="12" height="78" rx="6" fill="#fef2ee" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="172" y="210" width="12" height="30" fill="url(#pantsGrad)" />
            {/* Right Shoe */}
            <path d="M166 286 h24 a5 5 0 0 1 5 5 v3 h-34 v-3 a5 5 0 0 1 5 -5 z" fill="#94a3b8" />
          </g>

          {/* ARMS */}
          <g>
            {/* Left Arm Group */}
            <motion.g
              animate={
                reaction === 'correct'
                  ? { rotate: [-45, -120, -90, -100], x: -2, y: -3 }
                  : reaction === 'incorrect'
                  ? { rotate: [12, 35, 12, 15] }
                  : { rotate: [0, -5, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }
              }
              style={{ transformOrigin: '100px 125px' }}
            >
              {/* Left Arm (Skin) */}
              <path
                d="M102 125 c-12 8-22 30-22 48 0 6 4 9 8 6 4-3 8-20 12-38z"
                fill="#fef2ee"
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />
              {/* Left Sleeve */}
              <path d="M98 122 c-4 4-8 12-10 18 l11 3 c1-4 3-13 3-17 z" fill="url(#shirtGrad)" />
            </motion.g>

            {/* Right Arm Group */}
            <motion.g
              animate={
                reaction === 'correct'
                  ? { rotate: [45, 120, 90, 100], x: 2, y: -3 }
                  : reaction === 'incorrect'
                  ? { rotate: [-12, -35, -12, -15] }
                  : { rotate: [0, 5, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 } }
              }
              style={{ transformOrigin: '200px 125px' }}
            >
              {/* Right Arm (Skin) */}
              <path
                d="M198 125 c12 8 22 30 22 48 0 6-4 9-8 6-4-3-8-20-12-38z"
                fill="#fef2ee"
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />
              {/* Right Sleeve */}
              <path d="M202 122 c4 4 8 12 10 18 l-11 3 c-1-4-3-13-3-17 z" fill="url(#shirtGrad)" />
            </motion.g>
          </g>

          {/* TORSO (Shirt & Pants) */}
          <g filter="url(#shadow)">
            {/* Main Torso Block (Shirt) */}
            <path d="M98 116 h104 v78 c0 10-8 18-18 18 h-68 c-10 0-18-8-18-18 z" fill="url(#shirtGrad)" stroke="#e2e8f0" strokeWidth="1.5" />
            
            {/* Clean cyan medical emblem / cross on chest */}
            <g transform="translate(150, 142) scale(0.7)">
              <rect x="-16" y="-5" width="32" height="10" rx="3" fill="#38bdf8" />
              <rect x="-5" y="-16" width="10" height="32" rx="3" fill="#38bdf8" />
            </g>

            {/* Pants Belt / Upper Section */}
            <path d="M98 186 h104 v26 h-104 z" fill="url(#pantsGrad)" />
          </g>

          {/* HEAD, HAIR, NECK */}
          <g>
            {/* Neck */}
            <rect x="140" y="96" width="20" height="22" rx="3" fill="#fef2ee" stroke="#e2e8f0" strokeWidth="1" />
            
            {/* Head Circle */}
            <circle cx="150" cy="70" r="32" fill="url(#skinGrad)" filter="url(#shadow)" />

            {/* Simple Clean Hair (Short cut style) */}
            <path d="M118 68 c0-22 16-36 32-36 s32 14 32 36 c0 4-3 6-5 2 c-4-8-12-14-27-14 s-22 6-27 14 c-2 4-5 2-5-2 z" fill="url(#hairGrad)" />
            {/* Soft Side burns */}
            <path d="M118 62 v10 l4 -2 z" fill="url(#hairGrad)" />
            <path d="M182 62 v10 l-4 -2 z" fill="url(#hairGrad)" />

            {/* Friendly Facial Features (Eye/Mouth) */}
            <AnimatePresence mode="wait">
              {reaction === 'correct' ? (
                // Happy / Smiling Faces
                <motion.g
                  key="face-correct"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Arc Happy Eyes */}
                  <path d="M132 72 q8-7 14 0" stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M154 72 q8-7 14 0" stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round" />
                  {/* Wide Smile Mouth */}
                  <path d="M142 84 q8 8 16 0" stroke="#f43f5e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  {/* Rosy Cheeks */}
                  <ellipse cx="126" cy="78" rx="5" ry="2.5" fill="#f43f5e" opacity="0.6" />
                  <ellipse cx="174" cy="78" rx="5" ry="2.5" fill="#f43f5e" opacity="0.6" />
                </motion.g>
              ) : reaction === 'incorrect' ? (
                // Shonbori / Sad Facial Expression
                <motion.g
                  key="face-incorrect"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Drooping Eyes */}
                  <path d="M132 73 q8 4 12 -1" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M156 72 q8 4 12 -1" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  {/* Curving sad mouth */}
                  <path d="M144 86 q6-5 12 0" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />
                </motion.g>
              ) : (
                // Normal Friendly Face
                <motion.g
                  key="face-idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Round blinking eyes */}
                  <motion.circle
                    cx="138"
                    cy="71"
                    r="3.5"
                    fill="#334155"
                    animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                    transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.9, 0.92, 0.94, 1] }}
                  />
                  <motion.circle
                    cx="162"
                    cy="71"
                    r="3.5"
                    fill="#334155"
                    animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                    transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.9, 0.92, 0.94, 1] }}
                  />
                  {/* Gentle mouth smile */}
                  <path d="M145 80 q5 4 10 0" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />
                </motion.g>
              )}
            </AnimatePresence>
          </g>
        </motion.g>

        {/* ---------------- INTERACTIVE INJURY TARGET GLOW ---------------- */}
        <AnimatePresence>
          {reaction === 'idle' && (
            <g>
              {/* Soft blinking radar pulse around the targeted body part */}
              <motion.circle
                cx={targetCoord.x}
                cy={targetCoord.y}
                r="16"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                initial={{ scale: 0.6, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
              />
              <motion.circle
                cx={targetCoord.x}
                cy={targetCoord.y}
                r="5"
                fill="#ef4444"
                initial={{ scale: 0.95 }}
                animate={{ scale: [0.95, 1.25, 0.95] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
              />
            </g>
          )}
        </AnimatePresence>

        {/* ---------------- DIRECT RED POINTER ARROW ---------------- */}
        <AnimatePresence>
          {reaction === 'idle' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Line path to target */}
              <motion.path
                d={`M ${arrowStart.x} ${arrowStart.y} L ${targetCoord.x + 6} ${targetCoord.y - 6}`}
                stroke="url(#arrowGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="4 4"
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              />

              {/* Arrow Head directly pointing to spot */}
              <motion.polygon
                points={`${targetCoord.x},${targetCoord.y} ${targetCoord.x + 12},${targetCoord.y - 3} ${targetCoord.x + 3},${targetCoord.y - 12}`}
                fill="#ef4444"
                animate={{ scale: [1, 1.15, 1], x: [0, 1.5, 0], y: [0, 1.5, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
              />

              {/* Glowing Arrow Label anchor circle */}
              <circle cx={arrowStart.x} cy={arrowStart.y} r="6" fill="#ef4444" />
              <circle cx={arrowStart.x} cy={arrowStart.y} r="3" fill="#ffffff" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ---------------- EMITTED REACTION PARTICLES ---------------- */}
        <g>
          {sparkles.map((sp) => (
            <motion.g
              key={sp.id}
              initial={{ x: sp.x, y: sp.y, scale: 0, opacity: 1 }}
              animate={{
                y: sp.y - 40 - Math.random() * 25,
                x: sp.x + (Math.random() - 0.5) * 35,
                scale: [0, 1.3, 0.8, 0],
                opacity: [1, 1, 0.8, 0],
              }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              {sp.type === 'star' && (
                <path d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2 Z" fill="#fbbf24" />
              )}
              {sp.type === 'heart' && (
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#f43f5e" transform="scale(0.5) translate(-12, -12)" />
              )}
              {sp.type === 'sweat' && (
                <path d="M0,0 Q-3,6 0,10 Q3,6 0,0 Z" fill="#38bdf8" opacity="0.8" />
              )}
            </motion.g>
          ))}
        </g>
      </svg>
    </div>
  );
};

