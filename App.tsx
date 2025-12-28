
import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import TianZiGe from './components/TianZiGe';
import CharacterCard from './components/CharacterCard';
import { searchCharactersByPinyin, getCharacterDetails } from './services/gemini';
import { HanziInfo, SearchResult } from './types';

const App: React.FC = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChar, setSelectedChar] = useState<string>('汉');
  const [detail, setDetail] = useState<HanziInfo | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleSearch = async (pinyin: string) => {
    setLoading(true);
    const data = await searchCharactersByPinyin(pinyin);
    setResults(data);
    setLoading(false);
    if (data.length > 0) {
      handleSelectChar(data[0].char);
    }
  };

  const handleSelectChar = async (char: string) => {
    setSelectedChar(char);
    setLoadingDetail(true);
    const data = await getCharacterDetails(char);
    setDetail(data);
    setLoadingDetail(false);
  };

  useEffect(() => {
    handleSelectChar('汉');
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#fcfaf2] safe-area-inset">
      {/* Header - App Style */}
      <header className="py-4 px-6 md:px-10 flex items-center justify-between border-b border-red-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-lg flex items-center justify-center shadow-lg transform rotate-3">
            <span className="text-white text-xl md:text-2xl font-bold">习</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 brush-font">汉字流</h1>
            <p className="hidden xs:block text-[10px] text-gray-400 tracking-widest uppercase font-semibold">HanziFlow Pro</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-600">书法练习中</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center active:scale-90 transition-transform">
            <span className="text-amber-800 font-bold text-sm">奖</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Search & Character Selection */}
        <aside className="w-full md:w-[350px] lg:w-[400px] border-r border-red-50/50 bg-[#faf8f0] flex flex-col overflow-hidden">
          <div className="p-4 md:p-6 flex-1 flex flex-col min-h-0">
            <SearchBar onSearch={handleSearch} isLoading={loading} />
            
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {results.length > 0 ? `结果 (${results.length})` : '常用汉字'}
              </h2>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-3 gap-3 overflow-y-auto pr-1 pb-4 custom-scrollbar">
              {(results.length > 0 ? results : [
                {char: '学', pinyin: 'xué', brief: ''},
                {char: '习', pinyin: 'xí', brief: ''},
                {char: '书', pinyin: 'shū', brief: ''},
                {char: '道', pinyin: 'dào', brief: ''},
                {char: '春', pinyin: 'chūn', brief: ''},
                {char: '福', pinyin: 'fú', brief: ''},
                {char: '和', pinyin: 'hé', brief: ''},
                {char: '雅', pinyin: 'yǎ', brief: ''},
                {char: '静', pinyin: 'jìng', brief: ''},
                {char: '墨', pinyin: 'mò', brief: ''},
                {char: '笔', pinyin: 'bǐ', brief: ''},
                {char: '砚', pinyin: 'yàn', brief: ''},
              ]).map((res, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectChar(res.char)}
                  className={`aspect-square bg-white rounded-xl shadow-sm border-2 flex flex-col items-center justify-center transition-all active:scale-95 ${
                    selectedChar === res.char ? 'border-red-500 bg-red-50' : 'border-transparent hover:border-red-100'
                  }`}
                >
                  <span className="text-2xl md:text-3xl font-bold text-gray-800">{res.char}</span>
                  <span className="text-[10px] text-red-500/70">{res.pinyin}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Side: Immersive Learning Area */}
        <section className="flex-1 overflow-y-auto p-4 md:p-10 bg-white/50">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
            
            {/* Main Interactive Grid */}
            <div className="w-full lg:w-auto flex justify-center lg:sticky lg:top-0">
               <TianZiGe character={selectedChar} size={window.innerWidth < 768 ? 320 : 450} />
            </div>

            {/* Knowledge Panel */}
            <div className="flex-1 w-full space-y-8 pb-10">
              {loadingDetail ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-2xl w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="grid grid-cols-1 gap-3 pt-4">
                    <div className="h-20 bg-gray-100 rounded-2xl"></div>
                    <div className="h-20 bg-gray-100 rounded-2xl"></div>
                  </div>
                </div>
              ) : detail ? (
                <div className="animate-fade-in">
                  <div className="flex items-end justify-between border-b-2 border-red-600 pb-6 mb-8">
                    <div>
                      <h2 className="text-7xl font-bold text-gray-900 mb-2">{detail.character}</h2>
                      <p className="text-2xl text-red-600 font-medium tracking-wide italic">{detail.pinyin}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                         部首: {detail.radical}
                       </span>
                       <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                         笔画: {detail.strokes} 画
                       </span>
                    </div>
                  </div>

                  <div className="mb-10">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      释义 MEANING
                    </h3>
                    <p className="text-2xl text-gray-800 leading-snug font-medium">
                      {detail.meaning}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">词组举例 PHRASES</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {detail.examples.map((ex, i) => (
                        <div key={i} className="group p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between active:bg-red-50 transition-colors">
                          <span className="text-2xl font-bold text-gray-700">{ex}</span>
                          <button className="text-red-200 group-hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4V8z"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-300">
                   <div className="w-20 h-20 border-4 border-dashed border-gray-200 rounded-full flex items-center justify-center mb-4">
                     <span className="text-4xl">?</span>
                   </div>
                   <p className="text-sm">点击左侧汉字开始学习</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        /* 针对触摸设备的点击态优化 */
        @media (hover: none) {
          .active-scale:active { transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
};

export default App;
