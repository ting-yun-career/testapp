import React, { useState, useRef, useCallback, useMemo } from 'react';

interface Marker {
  index: number;
  value: number;
}

const ScrollSnapDial: React.FC = () => {
  const [currentActiveIndex, setCurrentActiveIndex] = useState<number>(-1);
  const [displayValue, setDisplayValue] = useState<string>('');
  const [markerStates, setMarkerStates] = useState<{
    [key: number]: 'active' | 'nearby' | 'normal';
  }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const clickSoundBufferRef = useRef<AudioBuffer | null>(null);

  const minValue = 0;
  const maxValue = 100;
  const markerCount = 21;

  // Create markers data
  const markers = useMemo<Marker[]>(
    () =>
      Array.from({ length: markerCount }, (_, i) => ({
        index: i,
        value: Math.round(
          minValue + (maxValue - minValue) * (i / (markerCount - 1))
        ),
      })),
    []
  );

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Load click sound audio file
  const loadClickSound = useCallback(async () => {
    if (clickSoundBufferRef.current) return;

    try {
      const audioContext = getAudioContext();
      const response = await fetch('/click.wav');
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      clickSoundBufferRef.current = audioBuffer;
    } catch (error) {
      console.warn('Failed to load click sound:', error);
    }
  }, [getAudioContext]);

  // Play click sound
  const playClickSound = useCallback(async () => {
    try {
      // Load audio buffer if not already loaded
      await loadClickSound();

      const audioContext = getAudioContext();
      if (!audioContext || !clickSoundBufferRef.current) return;

      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();

      source.buffer = clickSoundBufferRef.current;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set volume
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

      source.start(audioContext.currentTime);
    } catch (error) {
      console.warn('Audio context not available:', error);
    }
  }, [getAudioContext, loadClickSound]);

  // Update markers based on mouse position
  const updateMarkers = useCallback(
    (mouseX: number) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeX = mouseX - containerRect.left;

      // Find closest marker
      let closestIndex = -1;
      let minDistance = Infinity;

      markers.forEach((marker) => {
        const markerElement = document.querySelector(
          `[data-index="${marker.index}"]`
        ) as HTMLElement;
        if (markerElement) {
          const markerRect = markerElement.getBoundingClientRect();
          const markerCenter =
            markerRect.left + markerRect.width / 2 - containerRect.left;
          const distance = Math.abs(relativeX - markerCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = marker.index;
          }
        }
      });

      // Update marker states
      const newStates: { [key: number]: 'active' | 'nearby' | 'normal' } = {};

      markers.forEach((marker) => {
        if (
          closestIndex !== -1 &&
          marker.index === closestIndex &&
          minDistance < 40
        ) {
          newStates[marker.index] = 'active';

          // Play sound and show value only when switching to a new marker
          if (currentActiveIndex !== closestIndex) {
            playClickSound();
            setDisplayValue(marker.value.toString());
            setCurrentActiveIndex(closestIndex);
          }
        } else if (
          closestIndex !== -1 &&
          Math.abs(marker.index - closestIndex) === 1 &&
          minDistance < 60
        ) {
          newStates[marker.index] = 'nearby';
        } else {
          newStates[marker.index] = 'normal';
        }
      });

      setMarkerStates(newStates);

      // Only update active index, keep the display value showing last known number
      if (closestIndex === -1 || minDistance >= 40) {
        setCurrentActiveIndex(-1);
      }
    },
    [markers, currentActiveIndex, playClickSound]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      updateMarkers(e.clientX);
    },
    [updateMarkers]
  );

  const handleMouseLeave = useCallback(() => {
    setMarkerStates({});
    // Keep the display value showing the last known number
    setCurrentActiveIndex(-1);
  }, []);

  const handleMarkerClick = useCallback(
    (marker: Marker) => {
      setDisplayValue(marker.value.toString());
      setCurrentActiveIndex(marker.index);

      // Set only this marker as active
      const newStates: { [key: number]: 'active' | 'nearby' | 'normal' } = {};
      newStates[marker.index] = 'active';
      setMarkerStates(newStates);

      playClickSound();
    },
    [playClickSound]
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 font-sans">
      <div className="w-[300px] px-5 pt-16 pb-5 relative">
        {/* Value Display */}
        <div
          className={`absolute top-2 left-1/2 transform -translate-x-1/2 text-5xl font-light text-cyan-400 transition-opacity duration-200 ${
            displayValue ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {displayValue}
        </div>

        {/* Markers Container */}
        <div
          ref={containerRef}
          className="relative h-20 flex justify-between items-end px-2"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {markers.map((marker) => {
            const state = markerStates[marker.index] || 'normal';
            const heightClass =
              state === 'active' ? 'h-16' : state === 'nearby' ? 'h-10' : 'h-8';
            const bgClass =
              state === 'active'
                ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50'
                : state === 'nearby'
                  ? 'bg-gray-500'
                  : 'bg-gray-600 hover:bg-cyan-400';

            return (
              <div
                key={marker.index}
                data-index={marker.index}
                className={`
                  w-1 ${heightClass} ${bgClass} rounded-sm transition-all duration-150 ease-out cursor-pointer relative
                `}
                onClick={() => handleMarkerClick(marker)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScrollSnapDial;
