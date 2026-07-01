import React from 'react';
import { motion } from 'motion/react';
import { audioController } from '../utils/audio';
import { Stethoscope, HeartPulse, ShieldAlert, Award } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame }) => {
  const handleStart = () => {
    // Initialize audio context and trigger standard background music play
    audioController.init();
    audioController.startBgm();
    onStartGame();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6 bg-gradient-to-b from-sky-50/40 via-white to-slate-50/50 rounded-3xl border border-slate-100 max-w-lg mx-auto shadow-sm select-none">
      {/* Animated Medical Cross Floating */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 4, -4, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 bg-sky-500 rounded-3xl flex items-center justify-center text-white text-5xl font-bold mb-6 shadow-md shadow-sky-200"
      >
        <HeartPulse className="w-11 h-11" />
      </motion.div>

      {/* Game Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 mb-2 px-2">
        メディカル・ジャッジ<br /><span className="text-lg sm:text-xl text-sky-600 block mt-1">〜そっちの科じゃありません！〜</span>
      </h1>
      <p className="text-xs sm:text-sm font-medium text-slate-500 mb-8 max-w-sm">
        次々と現れる患者の症状を瞬時に仕分ける、スピード判断医療クイズ！
      </p>

      {/* Mini Rules Cards */}
      <div className="grid grid-cols-2 gap-3 w-full mb-8 text-left text-xs text-slate-600">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
          <Stethoscope className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-slate-700">5つの診療科</span>
            内科・整形・耳鼻喉・皮膚・眼科から選ぶ
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-slate-700">残機 4つ</span>
            間違えるとペナルティ、0でゲーム終了
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
          <Award className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-slate-700">全体 90秒</span>
            30秒ごとにテンポが加速。高得点を目指そう！
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
          <HeartPulse className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-slate-700">解説機能つき</span>
            終了後に間違えた問題の詳しい解説が見られます
          </div>
        </div>
      </div>

      {/* Start Button with Tap Animation */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleStart}
        className="w-full py-4 px-8 text-base font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl shadow-lg shadow-sky-200 hover:shadow-xl hover:shadow-sky-300 transition duration-300 cursor-pointer"
      >
        受付を開始する (START)
      </motion.button>
      
      <p className="mt-4 text-[11px] text-slate-400">
        ※ 音声が流れます。ご準備の上、開始してください。
      </p>
    </div>
  );
};
