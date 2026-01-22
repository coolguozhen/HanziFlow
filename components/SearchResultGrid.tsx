import React from 'react';
import { SearchResult } from '../types';

interface SearchResultGridProps {
    results: SearchResult[];
    selectedChar: string;
    loading: boolean;
    onSelectChar: (char: string) => void;
}

const SearchResultGrid: React.FC<SearchResultGridProps> = ({
    results,
    selectedChar,
    loading,
    onSelectChar
}) => {
    if (results.length > 0) {
        return (
            <div className="grid grid-cols-4 md:grid-cols-3 gap-3 overflow-y-auto pr-1 pb-4 custom-scrollbar">
                {results.map((res, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelectChar(res.char)}
                        className={`aspect-square bg-white rounded-xl shadow-sm border-2 flex flex-col items-center justify-center transition-all ${selectedChar === res.char
                                ? 'border-red-500 bg-red-50 shadow-md'
                                : 'border-transparent'
                            }`}
                    >
                        <span className="text-2xl md:text-3xl font-bold text-gray-800">
                            {res.char}
                        </span>
                        <span className="text-[10px] text-red-500/60 uppercase">
                            {Array.isArray(res.pinyin) ? res.pinyin.join('/') : res.pinyin}
                        </span>
                    </button>
                ))}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="grid grid-cols-4 md:grid-cols-3 gap-3 overflow-y-auto pr-1 pb-4 custom-scrollbar">
                {Array(12)
                    .fill(0)
                    .map((_, idx) => (
                        <div
                            key={idx}
                            className="aspect-square bg-white rounded-xl border-2 border-transparent animate-pulse flex flex-col items-center justify-center"
                        >
                            <div className="w-8 h-8 bg-gray-100 rounded mb-1"></div>
                            <div className="w-10 h-2 bg-gray-50 rounded"></div>
                        </div>
                    ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-4 md:grid-cols-3 gap-3 overflow-y-auto pr-1 pb-4 custom-scrollbar">
            <div className="col-span-full py-10 text-center text-gray-400 text-xs">
                未找到匹配汉字
            </div>
        </div>
    );
};

export default SearchResultGrid;
