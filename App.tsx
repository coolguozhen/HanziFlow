
import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import SearchBar from './components/SearchBar';
import SearchResultGrid from './components/SearchResultGrid';
import CharacterDetailCard from './components/CharacterDetailCard';
import { searchCharactersByPinyin, getCharacterDetails, speakText, getRandomInitialResults } from './services/hanzi-data';
import { HanziInfo, SearchResult } from './types';

// 使用 React.lazy 懒加载 TianZiGe 组件，减小首屏加载体积
const TianZiGe = lazy(() => import('./components/TianZiGe'));

// TianZiGe 加载时的占位组件
const TianZiGeFallback: React.FC<{ size: number }> = ({ size }) => (
  <div
    className="bg-white rounded-xl shadow-lg border-4 border-red-50 flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    <div className="animate-pulse text-gray-300 text-lg">加载中...</div>
  </div>
);

const App: React.FC = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChar, setSelectedChar] = useState<string>('汉');
  const [detail, setDetail] = useState<HanziInfo | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [playingText, setPlayingText] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // 使用 Ref 追踪播放状态，避免闭包问题
  const isPlayingRef = useRef(false);

  // 当 selectedChar 变化时，获取汉字详情
  useEffect(() => {
    if (!selectedChar) return;

    let cancelled = false;
    setLoadingDetail(true);

    getCharacterDetails(selectedChar).then(data => {
      if (!cancelled) {
        setDetail(data);
        setLoadingDetail(false);
      }
    }).catch(e => {
      if (!cancelled) {
        console.error("Detail failed", e);
        setLoadingDetail(false);
      }
    });

    return () => { cancelled = true; };
  }, [selectedChar]);

  const handleSelectChar = useCallback((char: string) => {
    setSelectedChar(prev => prev === char ? prev : char);
  }, []);

  const handleSearch = useCallback(async (pinyin: string) => {
    setLoading(true);
    try {
      const data = await searchCharactersByPinyin(pinyin);
      setResults(data);
      if (data.length > 0) {
        setSelectedChar(data[0].char);
      }
    } catch (e) {
      console.error("Search failed", e);
    }
    setLoading(false);
  }, []);

  const handleSpeak = useCallback(async (text: string) => {
    // 使用 ref 检查播放状态，避免闭包中引用过期 state
    if (isPlayingRef.current) return;

    isPlayingRef.current = true;
    setPlayingText(text);
    try {
      await speakText(text);
      const duration = text.length * 200;
      setTimeout(() => {
        setPlayingText(null);
        isPlayingRef.current = false;
      }, duration);
    } catch (e) {
      console.error("Speak process failed:", e);
      setPlayingText(null);
      isPlayingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // 初始化随机汉字（确保有12个）
    const init = async () => {
      setLoading(true);
      const data = await getRandomInitialResults();
      setResults(data);
      if (data.length > 0) setSelectedChar(data[0].char);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 计算 TianZiGe 的尺寸
  const tianZiGeSize = windowWidth < 640 ? 260 : (windowWidth < 1280 ? 300 : 380);

  return (
    <div className="h-screen flex flex-col bg-[#fcfaf2] safe-area-inset overflow-hidden">
      <header className="py-4 px-6 md:px-10 flex items-center justify-between border-b border-red-100 bg-white/95 backdrop-blur-md sticky top-0 z-50">
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
          {(loading || loadingDetail) ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
              <span className="text-xs font-bold text-amber-700">同步中...</span>
            </div>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-red-600 rounded-full border border-gray-100 transition-all flex items-center gap-1.5 active:scale-95"
              title="点击刷新页面"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-hover-spin"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
              <span className="text-xs font-bold">刷新</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* 侧边搜索栏 */}
        <aside className="w-full md:w-[260px] lg:w-[280px] border-r border-red-50 bg-[#faf8f0] flex flex-col overflow-hidden">
          <div className="p-4 md:p-6 flex-1 flex flex-col min-h-0">
            <SearchBar onSearch={handleSearch} isLoading={loading} />
            <SearchResultGrid
              results={results}
              selectedChar={selectedChar}
              loading={loading}
              onSelectChar={handleSelectChar}
            />
          </div>
        </aside>

        {/* 内容展示区 */}
        <section className="flex-1 overflow-y-auto p-4 md:p-10 bg-white/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-12 items-start">
            <div className="w-full lg:w-auto flex flex-col items-center lg:sticky lg:top-8">
              <Suspense fallback={<TianZiGeFallback size={tianZiGeSize} />}>
                <TianZiGe character={selectedChar} size={tianZiGeSize} />
              </Suspense>
            </div>

            <div className="flex-1 w-full space-y-8 pb-10">
              {detail ? (
                <CharacterDetailCard
                  detail={detail}
                  playingText={playingText}
                  onSpeak={handleSpeak}
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-300">
                  <span className="animate-pulse">AI 正在解析汉字...</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
