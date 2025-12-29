// 使用 cnchar 和 zdict.js 的汉字数据服务
// cnchar 提供拼音、笔画、部首等核心功能
// zdict.js 提供汉典网站的汉字释义和组词数据

import cnchar from 'cnchar';
import 'cnchar-poly';
import 'cnchar-radical';
import 'cnchar-voice';
import { HanziInfo, SearchResult } from "../types";

// zdict.js 数据接口类型
interface ZdictEntry {
  pinyin?: string | string[];
  definition?: string;
  definitions?: string[];
  words?: string[];
  组词?: string[];
  examples?: string[];
}

// 缓存键名
const CACHE_KEY = 'hanzi_meaning_cache';
const ZDICT_CACHE_KEY = 'zdict_data_cache';
const CACHE_VERSION = '3.0';
const CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30天

// zdict.js 数据存储
let ZDICT_DATA: Record<string, ZdictEntry> = {};
let ZDICT_LOADED = false;

// 从localStorage加载缓存的释义和组词数据
const loadCachedMeanings = (): Record<string, { meaning: string; examples: string[] }> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, version, timestamp } = JSON.parse(cached);
      // 检查版本和过期时间
      if (version === CACHE_VERSION && Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
      }
    }
  } catch (error) {
    console.log('加载缓存失败:', error);
  }
  return {};
};

// 保存到localStorage
const saveCachedMeanings = (meanings: Record<string, { meaning: string; examples: string[] }>) => {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheData = {
      data: meanings,
      version: CACHE_VERSION,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.log('保存缓存失败:', error);
  }
};

// 缓存的释义和组词数据
let MEANING_CACHE = loadCachedMeanings();

// 清除 zdict 缓存的辅助函数（用于调试）
export const clearZdictCache = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ZDICT_CACHE_KEY);
    console.log('已清除 zdict 缓存');
  }
};

// 加载 zdict.js 数据
// 支持从本地文件或 CDN 加载
const loadZdictData = async (): Promise<void> => {
  if (ZDICT_LOADED) return;
  
  // 首先尝试从 localStorage 加载缓存的 zdict 数据
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(ZDICT_CACHE_KEY);
      if (cached) {
        const { data, version, timestamp } = JSON.parse(cached);
        if (version === CACHE_VERSION && Date.now() - timestamp < CACHE_EXPIRY) {
          // 验证数据格式：应该是包含多个汉字键的对象
          const keyCount = data && typeof data === 'object' ? Object.keys(data).length : 0;
          if (keyCount > 100) {
            ZDICT_DATA = data;
            ZDICT_LOADED = true;
            console.log(`从缓存加载 zdict 数据成功，共 ${keyCount} 个汉字`);
            return;
          } else {
            console.log(`缓存数据格式不正确（只有 ${keyCount} 个键），将清除缓存并重新加载`);
            // 清除无效缓存
            localStorage.removeItem(ZDICT_CACHE_KEY);
          }
        }
      }
    } catch (error) {
      console.log('从缓存加载 zdict 数据失败:', error);
      // 清除损坏的缓存
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ZDICT_CACHE_KEY);
      }
    }
  }
  
  // 尝试从多个可能的路径加载 zdict.js 数据
  // zdict.js 的数据文件实际在 js/data-chars.js，但我们需要 JSON 格式
  const possiblePaths = [
    '/zdict-data.json',  // 本地 JSON 文件（推荐）
    '/data/zdict.json',   // 备用本地路径
    // 注意：zdict.js 的原始数据是 JS 格式，需要手动转换为 JSON
    // 运行 npm run download-zdict 可以自动从 @xiee/zdict 包提取数据
  ];
  
  let lastError: Error | null = null;
  for (const path of possiblePaths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const data = await response.json();
        ZDICT_DATA = data;
        ZDICT_LOADED = true;
        
        // 验证数据格式
        if (data && typeof data === 'object' && Object.keys(data).length > 100) {
          ZDICT_DATA = data;
          ZDICT_LOADED = true;
          
          // 保存到 localStorage
          if (typeof window !== 'undefined') {
            try {
              const cacheData = {
                data: ZDICT_DATA,
                version: CACHE_VERSION,
                timestamp: Date.now()
              };
              localStorage.setItem(ZDICT_CACHE_KEY, JSON.stringify(cacheData));
              console.log(`✅ 成功加载 zdict 数据，共 ${Object.keys(ZDICT_DATA).length} 个汉字`);
            } catch (e) {
              console.log('保存 zdict 缓存失败:', e);
            }
          }
        } else {
          console.log('⚠️  zdict 数据格式不正确，跳过');
        }
        return;
      }
    } catch (error) {
      lastError = error as Error;
      // 继续尝试下一个路径
      continue;
    }
  }
  
  // 只在所有路径都失败时显示一次警告
  if (!ZDICT_LOADED) {
    console.log('⚠️  无法加载 zdict 数据，将使用 cnchar 和缓存数据');
    console.log('💡 提示: 运行 npm run download-zdict 可以自动下载 zdict 数据');
  }
};

// 从 zdict.js 获取汉字释义和组词
const getMeaningFromZdict = (char: string): { meaning: string; examples: string[] } | null => {
  if (!ZDICT_LOADED || !ZDICT_DATA[char]) {
    return null;
  }
  
  const entry = ZDICT_DATA[char];
  const meaning = entry.definition || 
                  (Array.isArray(entry.definitions) && entry.definitions.length > 0 ? entry.definitions[0] : null) ||
                  "暂无释义";
  
  const examples = entry.words || 
                   entry.组词 || 
                   entry.examples || 
                   [];
  
  return { meaning, examples };
};

// 获取汉字释义和组词（优先使用 zdict.js，其次缓存）
const getCharacterMeaning = async (char: string): Promise<{ meaning: string; examples: string[] }> => {
  // 1. 尝试从 zdict.js 获取
  if (ZDICT_LOADED) {
    const zdictResult = getMeaningFromZdict(char);
    if (zdictResult) {
      // 保存到缓存
      MEANING_CACHE[char] = zdictResult;
      saveCachedMeanings(MEANING_CACHE);
      return zdictResult;
    }
  }
  
  // 2. 尝试从缓存获取
  if (MEANING_CACHE[char]) {
    return MEANING_CACHE[char];
  }
  
  // 3. 返回默认值
  return { meaning: "暂无释义", examples: [] };
};

// 移除拼音声调的辅助函数
const removeTone = (pinyin: string): string => {
  return pinyin
    .toLowerCase()
    .replace(/[āáǎà]/g, 'a')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ūúǔù]/g, 'u')
    .replace(/[ǖǘǚǜ]/g, 'ü')
    .replace(/[1-5]/g, '');
};

// 从 zdict 数据中搜索拼音（近似搜索）
const searchFromZdict = (pinyinPrefix: string): SearchResult[] => {
  if (!ZDICT_LOADED) {
    console.log('zdict 数据未加载');
    return [];
  }
  
  const results: SearchResult[] = [];
  const normalizedPrefix = pinyinPrefix.toLowerCase();
  let checkedCount = 0;
  
  // 遍历所有汉字，查找拼音匹配的
  for (const [char, entry] of Object.entries(ZDICT_DATA)) {
    checkedCount++;
    
    // 确保 char 是有效的单个汉字字符
    if (!char || char.length !== 1 || !/[\u4e00-\u9fa5]/.test(char)) {
      continue;
    }
    
    if (entry && entry.pinyin && typeof entry.pinyin === 'string') {
      // 移除声调后进行比较
      const entryPinyinNoTone = removeTone(entry.pinyin);
      
      // 检查拼音是否以输入的前缀开头（精确或前缀匹配）
      if (entryPinyinNoTone.startsWith(normalizedPrefix)) {
        const meaning = entry.definition || "常用汉字";
        const brief = meaning.split('，')[0]?.split(',')[0] || meaning || "常用汉字";
        
        results.push({
          char,
          pinyin: entry.pinyin,
          brief
        });
        
        // 获取更多结果，因为后面会过滤掉无效的
        if (results.length >= 20) break;
      }
    }
  }
  
  console.log(`zdict 搜索完成: 检查了 ${checkedCount} 个字符，找到 ${results.length} 个结果`);
  return results;
};

// 根据拼音搜索汉字（使用 cnchar + zdict 近似搜索）
export const searchCharactersByPinyin = async (pinyin: string): Promise<SearchResult[]> => {
  // 移除音调，转换为小写
  const normalizedPinyin = pinyin.toLowerCase().replace(/[1-5]/g, '');
  
  if (!normalizedPinyin || normalizedPinyin.length === 0) {
    return [];
  }
  
  const results: SearchResult[] = [];
  const foundChars = new Set<string>();
  
  // 方法1: 尝试使用 cnchar 精确搜索
  try {
    const spellResult = cnchar.spellToWord(normalizedPinyin);
    const characters: string[] = Array.isArray(spellResult) 
      ? spellResult 
      : (typeof spellResult === 'string' ? [spellResult] : []);
    
    // 获取更多结果，因为后面会过滤掉无效的
    for (const char of characters.slice(0, 20)) {
      if (foundChars.has(char)) continue;
      foundChars.add(char);
      
      const pinyinResult = cnchar.spell(char, 'tone', 'low');
      const pinyinStr = Array.isArray(pinyinResult) ? pinyinResult[0] : (pinyinResult || normalizedPinyin);
      
      const cached = MEANING_CACHE[char];
      const zdictResult = ZDICT_LOADED ? getMeaningFromZdict(char) : null;
      const meaning = zdictResult?.meaning || cached?.meaning || "常用汉字";
      const brief = meaning.split('，')[0]?.split(',')[0] || meaning || "常用汉字";
      
      results.push({
        char,
        pinyin: pinyinStr,
        brief
      });
    }
  } catch (error) {
    // cnchar 搜索失败（可能是无效拼音），继续使用近似搜索
    console.log('cnchar 精确搜索失败，使用近似搜索:', error);
  }
  
  // 方法2: 如果结果不足或 cnchar 搜索失败，使用 zdict 近似搜索
  // 优先使用 zdict，因为它有更完整的数据
  if (results.length < 12 && ZDICT_LOADED) {
    console.log(`使用 zdict 搜索补充结果: "${normalizedPinyin}"`);
    const zdictResults = searchFromZdict(normalizedPinyin);
    
    for (const result of zdictResults) {
      if (foundChars.has(result.char)) continue;
      // 获取更多结果，因为后面会过滤掉无效的
      if (results.length >= 20) break;
      
      foundChars.add(result.char);
      results.push(result);
    }
  } else if (!ZDICT_LOADED) {
    console.log('zdict 数据未加载，无法进行近似搜索');
  }
  
  // 如果仍然没有结果，直接使用 zdict 搜索（即使 cnchar 搜索成功但返回空）
  if (results.length === 0 && ZDICT_LOADED) {
    console.log(`zdict 作为主要搜索方式: "${normalizedPinyin}"`);
    const zdictResults = searchFromZdict(normalizedPinyin);
    return zdictResults.slice(0, 12);
  }
  
  // 方法3: 如果还是不足，尝试更短的前缀搜索
  if (results.length < 5 && normalizedPinyin.length > 1) {
    // 尝试使用前几个字母进行搜索
    const shorterPrefix = normalizedPinyin.slice(0, -1);
    
    // 先尝试 cnchar
    try {
      const partialResult = cnchar.spellToWord(shorterPrefix);
      const partialChars: string[] = Array.isArray(partialResult)
        ? partialResult
        : (typeof partialResult === 'string' ? [partialResult] : []);
      
      for (const char of partialChars) {
        // 确保是有效的汉字字符
        if (!char || char.length !== 1 || !/[\u4e00-\u9fa5]/.test(char)) {
          continue;
        }
        
        if (foundChars.has(char)) continue;
        // 获取更多结果，因为后面会过滤掉无效的
        if (results.length >= 20) break;
        
        foundChars.add(char);
        const pinyinResult = cnchar.spell(char, 'tone', 'low');
        const pinyinStr = Array.isArray(pinyinResult) ? pinyinResult[0] : (pinyinResult || shorterPrefix);
        const cached = MEANING_CACHE[char];
        const zdictResult = ZDICT_LOADED ? getMeaningFromZdict(char) : null;
        const meaning = zdictResult?.meaning || cached?.meaning || "常用汉字";
        const brief = meaning.split('，')[0]?.split(',')[0] || meaning || "常用汉字";
        
        results.push({
          char,
          pinyin: pinyinStr,
          brief
        });
      }
    } catch (e) {
      // 忽略错误
    }
    
    // 再尝试 zdict 近似搜索
    if (results.length < 12 && ZDICT_LOADED) {
      const zdictResults = searchFromZdict(shorterPrefix);
      
      for (const result of zdictResults) {
        if (foundChars.has(result.char)) continue;
        // 获取更多结果，因为后面会过滤掉无效的
        if (results.length >= 20) break;
        
        foundChars.add(result.char);
        results.push(result);
      }
    }
  }
  
  // 过滤掉无效的结果（确保 char 是有效的汉字）
  const validResults = results.filter(result => 
    result.char && 
    result.char.length === 1 && 
    /[\u4e00-\u9fa5]/.test(result.char)
  );
  
  return validResults.slice(0, 12);
};

// 获取汉字详情（使用 cnchar + zdict.js）
export const getCharacterDetails = async (char: string): Promise<HanziInfo | null> => {
  if (char.length !== 1) {
    return null;
  }
  
  try {
    // 使用 cnchar 获取基础信息
    const pinyinResult = cnchar.spell(char, 'tone', 'low');
    const pinyin = Array.isArray(pinyinResult) ? pinyinResult[0] : (pinyinResult || "");
    
    // cnchar.stroke 可能返回数字或数组，确保是数字
    const strokeResult = cnchar.stroke(char);
    const strokes = typeof strokeResult === 'number' 
      ? strokeResult 
      : (Array.isArray(strokeResult) ? strokeResult[0] : 0);
    
    // 使用 cnchar-radical 获取偏旁部首
    let radical = "";
    try {
      const radicalInfo = cnchar.radical(char);
      if (radicalInfo) {
        if (Array.isArray(radicalInfo) && radicalInfo.length > 0) {
          // IRadicalResult 类型，尝试访问可能的属性
          const first = radicalInfo[0] as any;
          radical = first?.radical || first?.name || first?.char || "";
        } else if (typeof radicalInfo === 'object') {
          const info = radicalInfo as any;
          radical = info.radical || info.name || info.char || "";
        } else if (typeof radicalInfo === 'string') {
          radical = radicalInfo;
        }
      }
    } catch (e) {
      // 如果 radical 插件未正确加载，忽略错误
    }
    
    // 获取释义和组词（优先使用 zdict.js）
    const { meaning, examples } = await getCharacterMeaning(char);
    
    return {
      character: char,
      pinyin,
      meaning,
      radical,
      strokes,
      examples: examples.slice(0, 10) // 限制组词数量
    };
  } catch (error) {
    console.error('获取汉字详情失败:', error);
    // 返回一个默认结构
    return {
      character: char,
      pinyin: "",
      meaning: "暂无释义",
      radical: "",
      strokes: 0,
      examples: []
    };
  }
};

// 使用 cnchar-voice 进行语音合成
export const speakText = async (text: string, ctx: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // 使用 cnchar 的语音功能
      if (cnchar.voice && cnchar.voice.speak) {
        cnchar.voice.speak(text);
        // 估算语音时长
        const duration = text.length * 300; // 每个字符约300ms
        setTimeout(() => resolve(), duration);
      } else {
        // 如果 cnchar-voice 未正确加载，回退到浏览器 TTS
        if (!('speechSynthesis' in window)) {
          reject(new Error('浏览器不支持语音合成'));
          return;
        }
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        const chineseVoice = voices.find(voice => 
          voice.lang.includes('zh') || voice.lang.includes('CN') || voice.name.includes('Chinese')
        );
        if (chineseVoice) {
          utterance.voice = chineseVoice;
        }
        
        utterance.onend = () => resolve();
        utterance.onerror = (error) => reject(error);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      reject(error);
    }
  });
};

// 获取音频上下文（保持兼容性）
export const getAudioContext = () => {
  return null as any;
};

// 批量扩充释义缓存（从 zdict.js 获取多个汉字的释义和组词）
export const expandMeaningCache = async (characters: string[]): Promise<number> => {
  let successCount = 0;
  
  // 确保 zdict 数据已加载
  if (!ZDICT_LOADED) {
    await loadZdictData();
  }
  
  for (const char of characters) {
    if (!MEANING_CACHE[char]) {
      const result = await getCharacterMeaning(char);
      if (result && result.meaning !== "暂无释义") {
        MEANING_CACHE[char] = result;
        successCount++;
      }
    }
  }
  
  // 保存缓存
  if (successCount > 0) {
    saveCachedMeanings(MEANING_CACHE);
  }
  
  return successCount;
};

// 初始化：加载 zdict.js 数据并在后台扩充常用汉字的释义缓存
export const initializeDatabaseExpansion = async (): Promise<void> => {
  // 在后台异步加载 zdict 数据，不阻塞主线程
  setTimeout(async () => {
    try {
      // 静默加载 zdict 数据（已在 loadZdictData 中输出日志）
      await loadZdictData();
      
      // 检查缓存大小
      const currentSize = Object.keys(MEANING_CACHE).length;
      
      // 如果缓存太小（少于100个字符），尝试扩充
      if (currentSize < 100) {
        // 常用汉字列表
        const commonChars = [
          "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
          "学", "习", "汉", "字", "中", "国", "人", "大", "小", "好",
          "爱", "家", "马", "你", "我", "他", "是", "的", "了", "在",
          "有", "这", "个", "来", "去", "说", "看", "听", "做", "想",
          "天", "地", "水", "火", "木", "金", "土", "日", "月", "年"
        ];
        
        // 过滤出未缓存的汉字
        const toExpand = commonChars.filter(char => !MEANING_CACHE[char]);
        
        if (toExpand.length > 0) {
          const count = await expandMeaningCache(toExpand);
          if (count > 0) {
            console.log(`✅ 成功扩充 ${count} 个常用汉字的释义`);
          }
        }
      }
    } catch (error) {
      console.log('初始化失败:', error);
    }
  }, 1000); // 延迟1秒，确保页面已加载
};

// 在浏览器环境中自动初始化
if (typeof window !== 'undefined') {
  // 延迟初始化，避免影响页面加载速度
  if (document.readyState === 'complete') {
    initializeDatabaseExpansion();
  } else {
    window.addEventListener('load', () => {
      initializeDatabaseExpansion();
    });
  }
}
