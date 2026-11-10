import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface BackgroundVideoProps {
  videoUrl?: string;
}

// Configurable medical visualization stream or dental photogrammetry clip
const DEFAULT_VIDEO_URL = 'https://stream.mux.com/kimF2ha9zLrX64H00UgLGPflCzNtl1T0215MlAmeOztv8.m3u8';

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  videoUrl = DEFAULT_VIDEO_URL,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    let hls: Hls | null = null;

    const handleLoaded = () => {
      setVideoLoaded(true);
      video.play().catch(() => {});
    };

    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('error', () => setVideoError(true));

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.play().catch(() => {});
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, () => {
        setVideoError(true);
      });
    } else {
      setVideoError(true);
    }

    return () => {
      video.removeEventListener('loadeddata', handleLoaded);
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoUrl]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Underlying Video Element with HLS */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded && !videoError ? 'opacity-25 scale-105' : 'opacity-0'
        }`}
      />

      {/* 2. Fallback / Ambient Medical Technology Lighting & Laser Grid */}
      <div className="absolute inset-0 ambient-light" />

      {/* Dynamic Laser Scanning Line across Arch */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="w-full h-48 bg-gradient-to-b from-transparent via-teal-400/10 to-transparent blur-md animate-[pulse_4s_ease-in-out_infinite]" />
        {/* Subtle grid lines indicating photogrammetric scan coordinate space */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #009F95 1px, transparent 0)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* Floating 3D Dental Silhouette & Scanning Beam Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] pointer-events-none">
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-teal-200/15 via-cyan-100/20 to-transparent blur-3xl" />
      </div>

      {/* 3. Deep Black Translucent Overlay for High Contrast Text & Floating Tooth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050608]/85 via-[#050608]/70 to-[#050608] backdrop-blur-[2px]" />
    </div>
  );
};
