'use client';

import { useEffect, useRef, useState } from 'react';

interface LiaisonLineProps {
  ipaText: string;
  words: string[];
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function LiaisonLine({ ipaText, words, containerRef }: LiaisonLineProps) {
  const [liaisonPaths, setLiaisonPaths] = useState<Array<{ start: number; end: number }>>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    // Parse IPA text to find liaison markers (‿)
    const liaisonIndices: number[] = [];
    let currentIndex = 0;
    for (let i = 0; i < ipaText.length; i++) {
      if (ipaText[i] === '‿') {
        liaisonIndices.push(currentIndex);
      } else if (ipaText[i] !== ' ') {
        currentIndex++;
      }
    }

    // Find word boundaries in IPA
    const ipaWords = ipaText.split(/\s+/).filter(w => w.length > 0);
    
    // Map liaisons to word pairs
    const paths: Array<{ start: number; end: number }> = [];
    let wordIndex = 0;
    let charIndex = 0;

    for (let i = 0; i < ipaText.length; i++) {
      if (ipaText[i] === '‿') {
        // Found a liaison, connect current word to next word
        if (wordIndex < ipaWords.length - 1) {
          paths.push({ start: wordIndex, end: wordIndex + 1 });
        }
      } else if (ipaText[i] === ' ') {
        wordIndex++;
        charIndex = 0;
      } else {
        charIndex++;
      }
    }

    setLiaisonPaths(paths);
  }, [ipaText, words, containerRef]);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current || liaisonPaths.length === 0) return;

    // Get word positions
    const wordElements = containerRef.current.querySelectorAll('[data-word-index]');
    if (wordElements.length === 0) return;

    const svg = svgRef.current;
    const containerRect = containerRef.current.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();

    // Clear existing paths
    svg.innerHTML = '';

    liaisonPaths.forEach(({ start, end }) => {
      const startEl = Array.from(wordElements).find(
        el => el.getAttribute('data-word-index') === String(start)
      );
      const endEl = Array.from(wordElements).find(
        el => el.getAttribute('data-word-index') === String(end)
      );

      if (!startEl || !endEl) return;

      const startRect = startEl.getBoundingClientRect();
      const endRect = endEl.getBoundingClientRect();

      const startX = startRect.right - containerRect.left;
      const startY = startRect.top + startRect.height / 2 - containerRect.top;
      const endX = endRect.left - containerRect.left;
      const endY = endRect.top + endRect.height / 2 - containerRect.top;

      // Create Bezier curve path
      const midX = (startX + endX) / 2;
      const controlY = Math.min(startY, endY) - 20;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute(
        'd',
        `M ${startX} ${startY} Q ${midX} ${controlY} ${endX} ${endY}`
      );
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-dasharray', '5,5');
      path.setAttribute('class', 'text-blue-500 dark:text-blue-400');

      svg.appendChild(path);
    });
  }, [liaisonPaths, containerRef]);

  if (liaisonPaths.length === 0) {
    return null;
  }

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ overflow: 'visible' }}
    />
  );
}
