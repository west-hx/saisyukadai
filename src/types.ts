export interface QuizItem {
  id: string;
  part: string; // お腹, 頭, 胸, 膝, 腰, 足首, 肩, 首, 手首, 耳, 鼻, 喉（のど）, 皮膚, 腕, 顔, 足, 目
  symptom: string;
  answer: string; // 内科, 整形外科, 耳鼻咽喉科, 皮膚科, 眼科
  explanation: string;
}

export interface WrongAnswerRecord {
  quiz: QuizItem;
  userAnswer: string; // "内科", "整形外科" など、または "タイムアップ"
}

export type GameState = 'title' | 'playing' | 'result';

export type AvatarReaction = 'idle' | 'correct' | 'incorrect';
