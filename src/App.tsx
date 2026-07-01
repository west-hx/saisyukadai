import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, WrongAnswerRecord } from './types';
import { TitleScreen } from './components/TitleScreen';
import { QuizGame } from './components/QuizGame';
import { ResultScreen } from './components/ResultScreen';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('title');
  const [finalScore, setFinalScore] = useState(0);
  const [wrongRecords, setWrongRecords] = useState<WrongAnswerRecord[]>([]);

  // Start playing
  const handleStartGame = () => {
    setFinalScore(0);
    setWrongRecords([]);
    setGameState('playing');
  };

  // Game over triggered from quiz
  const handleGameOver = (score: number, wrongs: WrongAnswerRecord[]) => {
    setFinalScore(score);
    setWrongRecords(wrongs);
    setGameState('result');
  };

  // Restart to title screen
  const handleRestart = () => {
    setGameState('title');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans select-none antialiased">
      {/* Absolute floating subtle design elements to look extremely polished and clean */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-400" />
      
      <main className="w-full max-w-lg z-10 my-auto">
        <AnimatePresence mode="wait">
          {gameState === 'title' && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <TitleScreen onStartGame={handleStartGame} />
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <QuizGame onGameOver={handleGameOver} />
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <ResultScreen
                score={finalScore}
                wrongAnswers={wrongRecords}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Humble Footer info strictly following "no margin clutter" but keeping standard copyright */}
      <footer className="mt-6 text-center text-[10px] text-slate-400 font-medium">
        &copy; 2026 メディカル・ジャッジ〜そっちの科じゃありません！〜. All rights reserved.
      </footer>
    </div>
  );
}
