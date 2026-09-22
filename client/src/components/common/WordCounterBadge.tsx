import React from 'react';
import { countKazakhWords, getWordCountStatus } from '../../utils/wordCount';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface WordCounterBadgeProps {
  text: string;
  minWords?: number;
  maxWords?: number;
}

export const WordCounterBadge: React.FC<WordCounterBadgeProps> = ({
  text,
  minWords,
  maxWords,
}) => {
  const wordCount = countKazakhWords(text);

  if (minWords === undefined || maxWords === undefined) {
    return (
      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <span>Сөз саны:</span>
        <strong className="text-slate-900">{wordCount}</strong>
      </div>
    );
  }

  const status = getWordCountStatus(wordCount, minWords, maxWords);

  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${status.color}`}
    >
      {status.isValid ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5" />
      )}
      <span>{status.text}</span>
      <span className="opacity-80">({status.badgeText})</span>
    </div>
  );
};
