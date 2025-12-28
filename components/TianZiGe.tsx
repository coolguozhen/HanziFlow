
import React, { useEffect, useRef, useState } from 'react';

interface TianZiGeProps {
  character: string;
  size?: number;
}

const TianZiGe: React.FC<TianZiGeProps> = ({ character, size = 400 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !character) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Initialize HanziWriter
    writerRef.current = window.HanziWriter.create(containerRef.current, character, {
      width: size,
      height: size,
      padding: 20,
      strokeColor: '#b91c1c', // Dark red for "ink"
      outlineColor: '#e5e7eb',
      showOutline: true,
      showCharacter: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 300,
      onComplete: () => setIsPlaying(false)
    });

    // Custom background drawing (Tian Zi Ge lines)
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('stroke', '#ef4444');
      g.setAttribute('stroke-width', '1');
      g.setAttribute('stroke-dasharray', '5,5');
      g.setAttribute('opacity', '0.4');

      // Horizontal center
      const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      hLine.setAttribute('x1', '0');
      hLine.setAttribute('y1', (size / 2).toString());
      hLine.setAttribute('x2', size.toString());
      hLine.setAttribute('y2', (size / 2).toString());

      // Vertical center
      const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      vLine.setAttribute('x1', (size / 2).toString());
      vLine.setAttribute('y1', '0');
      vLine.setAttribute('x2', (size / 2).toString());
      vLine.setAttribute('y2', size.toString());

      // Diagonals
      const d1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      d1.setAttribute('x1', '0'); d1.setAttribute('y1', '0');
      d1.setAttribute('x2', size.toString()); d1.setAttribute('y2', size.toString());

      const d2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      d2.setAttribute('x1', size.toString()); d2.setAttribute('y1', '0');
      d2.setAttribute('x2', '0'); d2.setAttribute('y2', size.toString());

      g.appendChild(hLine);
      g.appendChild(vLine);
      g.appendChild(d1);
      g.appendChild(d2);

      // Border
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', '0');
      rect.setAttribute('y', '0');
      rect.setAttribute('width', size.toString());
      rect.setAttribute('height', size.toString());
      rect.setAttribute('fill', 'none');
      rect.setAttribute('stroke', '#ef4444');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('stroke-dasharray', 'none');
      rect.setAttribute('opacity', '0.6');
      g.appendChild(rect);

      svg.insertBefore(g, svg.firstChild);
    }
  }, [character, size]);

  const handleAnimate = () => {
    if (writerRef.current) {
      setIsPlaying(true);
      writerRef.current.animateCharacter();
    }
  };

  const handleQuiz = () => {
    if (writerRef.current) {
      writerRef.current.quiz();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div 
        ref={containerRef} 
        className="bg-white rounded-lg shadow-inner border border-red-100 p-2 cursor-pointer transition-transform hover:scale-[1.01]"
        onClick={handleAnimate}
      />
      
      <div className="flex space-x-4">
        <button 
          onClick={handleAnimate}
          disabled={isPlaying}
          className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
            isPlaying 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {isPlaying ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          )}
          {isPlaying ? '演示中...' : '演示笔顺'}
        </button>
        
        <button 
          onClick={handleQuiz}
          className="px-8 py-3 bg-amber-600 text-white rounded-full font-bold shadow-lg hover:bg-amber-700 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          临摹练习
        </button>
      </div>
      <p className="text-gray-500 text-sm italic">点击上方按钮观看笔顺或在格子内练习书写</p>
    </div>
  );
};

export default TianZiGe;
