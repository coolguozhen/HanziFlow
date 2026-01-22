import React from 'react';
import { HanziInfo } from '../types';

interface CharacterDetailCardProps {
    detail: HanziInfo;
    playingText: string | null;
    onSpeak: (text: string) => void;
}

const CharacterDetailCard: React.FC<CharacterDetailCardProps> = ({
    detail,
    playingText,
    onSpeak
}) => {
    return (
        <div className="animate-fade-in">
            <div className="flex items-end justify-between border-b-4 border-red-600 pb-8 mb-10">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h2
                            className="text-6xl sm:text-7xl lg:text-8xl font-black text-gray-900 leading-none cursor-pointer hover:text-red-700 transition-colors"
                            onClick={() => onSpeak(detail.character)}
                        >
                            {detail.character}
                        </h2>
                        <button
                            className={`px-4 py-2 rounded-full text-lg font-bold ${playingText === detail.character
                                    ? 'bg-green-500 scale-105'
                                    : 'bg-red-600'
                                } text-white shadow-lg active:scale-95 transition-all`}
                            onClick={() => onSpeak(detail.character)}
                        >
                            {Array.isArray(detail.pinyin)
                                ? detail.pinyin.join(' / ')
                                : detail.pinyin}{' '}
                            {playingText === detail.character ? '🔊' : '🔈'}
                        </button>
                    </div>
                    <p className="text-xl text-gray-400 font-medium tracking-widest">
                        汉字详情
                    </p>
                </div>
            </div>

            <div className="mb-12">
                <h3 className="text-sm font-bold text-red-800/40 uppercase mb-4 tracking-widest">
                    释义
                </h3>
                <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed font-serif whitespace-pre-wrap">
                    {detail.meaning}
                </p>
            </div>

            <div>
                <h3 className="text-sm font-bold text-red-800/40 uppercase mb-6 tracking-widest">
                    组词
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {detail.examples.map((ex, i) => (
                        <button
                            key={i}
                            onClick={() => onSpeak(ex)}
                            className={`group p-6 bg-white rounded-3xl shadow-sm border-2 flex items-center justify-between transition-all ${playingText === ex
                                    ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                                    : 'border-transparent hover:border-red-100 hover:shadow-md'
                                }`}
                        >
                            <span className="text-2xl md:text-3xl font-bold text-gray-800">
                                {ex}
                            </span>
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${playingText === ex
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : 'bg-red-50 text-red-400'
                                    }`}
                            >
                                {playingText === ex ? '🔊' : '▶'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CharacterDetailCard;
