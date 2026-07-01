import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizItem, WrongAnswerRecord, AvatarReaction } from '../types';
import { quizList } from '../data/quizData';
import { HumanAvatar } from './HumanAvatar';
import { audioController } from '../utils/audio';
import { Heart, Timer, Award, AlertCircle, ShieldAlert } from 'lucide-react';

interface QuizGameProps {
  onGameOver: (finalScore: number, wrongRecords: WrongAnswerRecord[]) => void;
}

const DEPARTMENTS = ["内科", "整形外科", "耳鼻咽喉科", "皮膚科", "眼科"] as const;

export const QuizGame: React.FC<QuizGameProps> = ({ onGameOver }) => {
  // Game Stats States
  const [globalTime, setGlobalTime] = useState(90); // 90 seconds total
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(4); // 4 lives total

  // Quiz Pool Management
  const [unusedQuizzes, setUnusedQuizzes] = useState<QuizItem[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizItem | null>(null);

  // Question Timer States
  const [questionTimeLeft, setQuestionTimeLeft] = useState(8); // in seconds, counts down dynamically
  const [maxQuestionTime, setMaxQuestionTime] = useState(8); // base for current phase (8s, 6s, 4s)

  // Intermission (Showing correct/wrong reaction)
  const [isIntermission, setIsIntermission] = useState(false);
  const [avatarReaction, setAvatarReaction] = useState<AvatarReaction>('idle');
  const [feedbackText, setFeedbackText] = useState<'correct' | 'incorrect' | 'timeout' | null>(null);

  // Keep records of mistakes
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswerRecord[]>([]);

  // Refs for precise interval timers
  const globalTimerRef = useRef<any>(null);
  const questionTimerRef = useRef<any>(null);

  // Phase computation (Phase 1, 2, or 3 based on elapsed time)
  // Phase 1: 0~29s elapsed (90~61s left)
  // Phase 2: 30~59s elapsed (60~31s left)
  // Phase 3: 60~90s elapsed (30~0s left)
  const elapsedTime = 90 - globalTime;
  const currentPhase: 1 | 2 | 3 = elapsedTime < 30 ? 1 : elapsedTime < 60 ? 2 : 3;

  // Intermission / Delay speeds per phase
  // Phase 1: 1.5s interval
  // Phase 2: 1.0s interval
  // Phase 3: 0.6s interval
  const getIntermissionDuration = () => {
    if (currentPhase === 1) return 1500;
    if (currentPhase === 2) return 1000;
    return 600;
  };

  // Get question time limit per phase
  const getQuestionTimeLimit = () => {
    if (currentPhase === 1) return 8;
    if (currentPhase === 2) return 6;
    return 4;
  };

  // Initialize and Shuffle Quiz Pool
  useEffect(() => {
    resetQuizPool();
    // Set initial tempo of BGM
    audioController.setTempoMultiplier(1);
    
    return () => {
      // Clear timers on unmount
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, []);

  // Sync BGM tempo adjustments as currentPhase updates
  useEffect(() => {
    audioController.setTempoMultiplier(currentPhase);
    setMaxQuestionTime(getQuestionTimeLimit());
  }, [currentPhase]);

  // Overall Global Timer Count Down (90s total)
  useEffect(() => {
    globalTimerRef.current = setInterval(() => {
      setGlobalTime((prev) => {
        if (prev <= 1) {
          clearInterval(globalTimerRef.current);
          handleGameFinish(score, wrongAnswers); // Trigger Game Over on time limit reached
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
    };
  }, [score, wrongAnswers]);

  // Question Timer Loop
  useEffect(() => {
    if (isIntermission || !currentQuiz) {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      return;
    }

    const intervalStepMs = 50; // smooth 20fps countdown animation
    setQuestionTimeLeft(getQuestionTimeLimit());

    questionTimerRef.current = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        const nextVal = prev - (intervalStepMs / 1000);
        if (nextVal <= 0) {
          clearInterval(questionTimerRef.current);
          handleTimeUp(); // Handle Timeout penalty
          return 0;
        }
        return nextVal;
      });
    }, intervalStepMs);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [currentQuiz, isIntermission]);

  // Handle Game Over / Finish
  const handleGameFinish = (finalScore: number, finalWrongs: WrongAnswerRecord[]) => {
    // End standard game immediately and trigger the callback
    if (globalTimerRef.current) clearInterval(globalTimerRef.current);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    onGameOver(finalScore, finalWrongs);
  };

  // Setup / Reset the quiz selection pool so questions are unique
  const resetQuizPool = () => {
    const shuffled = [...quizList].sort(() => Math.random() - 0.5);
    setUnusedQuizzes(shuffled);
    setCurrentQuiz(shuffled[0]);
  };

  // Retrieve next patient from unique pool
  const loadNextPatient = () => {
    setUnusedQuizzes((prevPool) => {
      const remaining = [...prevPool];
      remaining.shift(); // remove current

      if (remaining.length === 0) {
        // Pool exhausted, reshuffle from all questions
        const reshuffled = [...quizList].sort(() => Math.random() - 0.5);
        setCurrentQuiz(reshuffled[0]);
        return reshuffled;
      } else {
        setCurrentQuiz(remaining[0]);
        return remaining;
      }
    });

    // Reset feedback state
    setIsIntermission(false);
    setAvatarReaction('idle');
    setFeedbackText(null);
  };

  // Action on user clicking a department button
  const handleAnswerSelection = (selectedDept: typeof DEPARTMENTS[number]) => {
    if (isIntermission || !currentQuiz) return;

    const isCorrect = currentQuiz.answer === selectedDept;
    setIsIntermission(true);

    if (isCorrect) {
      audioController.playSeikai();
      setAvatarReaction('correct');
      setFeedbackText('correct');
      setScore((prev) => prev + 10); // +10 Score on correct answer
    } else {
      audioController.playMatigai();
      setAvatarReaction('incorrect');
      setFeedbackText('incorrect');
      
      const newWrongRecords = [
        ...wrongAnswers,
        { quiz: currentQuiz, userAnswer: selectedDept }
      ];
      setWrongAnswers(newWrongRecords);

      setLives((prev) => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          // Finish game immediately if lives reach 0
          setTimeout(() => {
            handleGameFinish(score, newWrongRecords);
          }, 300);
          return 0;
        }
        return nextLives;
      });
    }

    // Load next patient after specific phase-dependent delay
    setTimeout(() => {
      setLives((currentLives) => {
        if (currentLives > 0 && globalTime > 0) {
          loadNextPatient();
        }
        return currentLives;
      });
    }, getIntermissionDuration());
  };

  // Action on 8s/6s/4s time limit reached
  const handleTimeUp = () => {
    if (isIntermission || !currentQuiz) return;

    setIsIntermission(true);
    audioController.playMatigai();
    setAvatarReaction('incorrect');
    setFeedbackText('timeout');

    const newWrongRecords = [
      ...wrongAnswers,
      { quiz: currentQuiz, userAnswer: 'タイムアップ' }
    ];
    setWrongAnswers(newWrongRecords);

    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        setTimeout(() => {
          handleGameFinish(score, newWrongRecords);
        }, 300);
        return 0;
      }
      return nextLives;
    });

    // Pause briefly, then load next patient
    setTimeout(() => {
      setLives((currentLives) => {
        if (currentLives > 0 && globalTime > 0) {
          loadNextPatient();
        }
        return currentLives;
      });
    }, getIntermissionDuration());
  };

  // Format countdown string safely
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto bg-white rounded-3xl border border-slate-100 p-4 md:p-5 shadow-sm select-none h-full justify-between">
      
      {/* ----------------- TOP STATUS SECTION ----------------- */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50/70 border border-slate-100 p-3 rounded-2xl text-center items-center">
        {/* Overall Global Time Limit */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <Timer className="w-3.5 h-3.5 text-sky-500" />
            制限時間
          </div>
          <span className="text-lg font-black text-slate-800 tabular-nums">
            {formatTime(globalTime)}
          </span>
        </div>

        {/* Current Score (+10pts per correct answer) */}
        <div className="flex flex-col items-center border-x border-slate-200">
          <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            スコア
          </div>
          <span className="text-lg font-black text-sky-600">
            {score}<span className="text-xs font-bold text-slate-500 ml-0.5">点</span>
          </span>
        </div>

        {/* Lives Counter (4 max, splits to hearts) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            残機
          </div>
          <div className="flex items-center gap-0.5 mt-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                animate={i < lives ? { scale: [1, 1.15, 1] } : { scale: 0.8, opacity: 0.2 }}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`w-4 h-4 ${
                    i < lives ? 'fill-rose-500 stroke-rose-500' : 'fill-slate-300 stroke-slate-300'
                  }`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Speed / Phase indicators floating badge */}
      <div className="flex justify-between items-center px-1 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            フェーズ {currentPhase}/3
          </span>
        </div>
        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50/50 border border-indigo-100/40 rounded-full px-2.5 py-0.5">
          {currentPhase === 1 ? '標準テンポ' : currentPhase === 2 ? 'テンポUP！' : '限界スピード！！'}
        </span>
      </div>

      {/* ----------------- CENTRAL QUIZ / AVATAR SECTION ----------------- */}
      {currentQuiz && (
        <div className="my-2 flex flex-col gap-2">
          
          {/* SVG Human Avatar Component */}
          <HumanAvatar part={currentQuiz.part} reaction={avatarReaction} />

          {/* Patient Detail Board directly below avatar */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left relative overflow-hidden">
            
            {/* Visual Header label */}
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
              ▼ 症状詳細カルテ
            </div>

            {/* Affected Part tag */}
            <div className="text-sm font-black text-slate-700 flex items-center gap-1.5 mb-1.5">
              <span>対象部位:</span>
              <span className="bg-rose-50 text-rose-600 text-xs font-black px-2 py-0.5 rounded-md border border-rose-100/60">
                {currentQuiz.part}
              </span>
            </div>

            {/* Detailed description */}
            <p className="text-sm md:text-base font-bold text-slate-800 leading-relaxed min-h-[48px]">
              {currentQuiz.symptom}
            </p>

            {/* Float visual indicator over screen on correct/incorrect feedback */}
            <AnimatePresence>
              {feedbackText && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className={`absolute inset-0 flex items-center justify-center font-black text-2xl tracking-widest bg-white/90 backdrop-blur-[1px] z-20 ${
                    feedbackText === 'correct'
                      ? 'text-emerald-500'
                      : feedbackText === 'timeout'
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }`}
                >
                  {feedbackText === 'correct' && '〇 正 解'}
                  {feedbackText === 'incorrect' && '✕ 不 正 解'}
                  {feedbackText === 'timeout' && '⏱ タイムアップ'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Single Question Progress Bar Timer */}
          <div className="w-full">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 mb-1 px-0.5">
              <span>回答時間</span>
              <span className="tabular-nums font-extrabold text-slate-600">
                {Math.max(0, questionTimeLeft).toFixed(1)}s
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{
                  width: `${(questionTimeLeft / maxQuestionTime) * 100}%`,
                  backgroundColor:
                    questionTimeLeft < 3
                      ? '#ef4444' // red
                      : questionTimeLeft < 5
                      ? '#eab308' // yellow
                      : '#10b981', // green
                }}
                transition={{ duration: 0.05, ease: 'linear' }}
                className="h-full rounded-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* ----------------- BOTTOM ANSWER ACTIONS ----------------- */}
      <div className="mt-2">
        <div className="text-[10px] font-black text-slate-400 text-left mb-2 px-1 uppercase tracking-widest">
          ▼ 診療科を選択して仕分ける
        </div>

        {/* 5 Fixed Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 md:gap-2">
          {DEPARTMENTS.map((dept) => {
            // Check if correct on feedback highlight for user learning
            const isTarget = currentQuiz?.answer === dept;
            const isCurrentSelectedFeedback = isIntermission && feedbackText === 'correct' && isTarget;

            return (
              <motion.button
                key={dept}
                whileHover={!isIntermission ? { scale: 1.04, y: -2 } : {}}
                whileTap={!isIntermission ? { scale: 0.96 } : {}}
                disabled={isIntermission}
                onClick={() => handleAnswerSelection(dept)}
                className={`py-3 px-1 text-xs md:text-sm font-extrabold rounded-2xl border transition duration-150 cursor-pointer text-center select-none shadow-sm ${
                  isCurrentSelectedFeedback
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-100'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 active:bg-slate-100'
                } disabled:opacity-70 flex items-center justify-center min-h-[44px]`}
              >
                {dept}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
