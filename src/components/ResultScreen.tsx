import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { WrongAnswerRecord } from '../types';
import { audioController } from '../utils/audio';
import { Award, RotateCcw, CheckCircle, HelpCircle, ArrowRight, AlertCircle } from 'lucide-react';

interface ResultScreenProps {
  score: number;
  wrongAnswers: WrongAnswerRecord[];
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ score, wrongAnswers, onRestart }) => {
  // Stop background music on component mount (Result Screen)
  useEffect(() => {
    audioController.stopBgm();
  }, []);

  return (
    <div className="flex flex-col min-h-[500px] w-full max-w-lg mx-auto bg-white rounded-3xl border border-slate-100 p-6 shadow-sm select-none">
      
      {/* Score Header Panel */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-500 mb-3"
        >
          <Award className="w-9 h-9" />
        </motion.div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">診察リザルト</h2>
        <p className="text-sm text-slate-400 font-medium">おつかれさまでした！受付業務終了です。</p>

        {/* Big Score Display */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 inline-block px-8">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">獲得スコア</span>
          <span className="text-4xl font-black text-sky-600 tracking-tight">{score}</span>
          <span className="text-sm font-bold text-slate-500 ml-1">点</span>
        </div>
      </div>

      {/* Explanation of Mistakes (Scroll Area) */}
      <div className="flex-1 flex flex-col min-h-0 mb-6">
        <div className="flex items-center gap-1.5 mb-2.5 px-1">
          <HelpCircle className="w-4.5 h-4.5 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-700">
            間違えた問題の解説 ({wrongAnswers.length})
          </h3>
        </div>

        {wrongAnswers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-emerald-800">パーフェクト達成！</p>
            <p className="text-xs text-emerald-600 mt-1">すべての患者を適切な診療科へ案内できました！</p>
          </div>
        ) : (
          /* Scroll Container with defined maxHeight */
          <div className="flex-1 overflow-y-auto max-h-[280px] pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {wrongAnswers.map((record, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col text-left gap-2"
              >
                {/* Header info (Symptom summary) */}
                <div className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center bg-rose-100 text-rose-600 text-[10px] font-black rounded px-1.5 py-0.5 mt-0.5">
                    Q
                  </span>
                  <div className="text-xs font-bold text-slate-700 leading-relaxed">
                    【部位: <span className="text-slate-900 font-extrabold">{record.quiz.part}</span>】
                    {record.quiz.symptom}
                  </div>
                </div>

                {/* Patient Answer comparison details */}
                <div className="grid grid-cols-2 gap-2 text-xs py-1.5 border-y border-dashed border-slate-200/60">
                  <div className="flex items-center gap-1 text-rose-600 font-bold bg-rose-50/50 p-1 rounded">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>あなたの回答: {record.userAnswer}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 font-black bg-emerald-50/50 p-1 rounded">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>正解: {record.quiz.answer}</span>
                  </div>
                </div>

                {/* Explanation block */}
                <div className="text-[11px] leading-relaxed text-slate-500 font-medium">
                  {record.quiz.explanation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onRestart}
        className="w-full py-3.5 px-6 text-sm font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-900 transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-100"
      >
        <RotateCcw className="w-4 h-4" />
        もう一度挑戦する
      </motion.button>
    </div>
  );
};
