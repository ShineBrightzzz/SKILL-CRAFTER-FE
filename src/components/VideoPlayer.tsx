'use client'

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import type Player from 'video.js/dist/types/player';

interface VideoPlayerProps {
  src: string;
  className?: string;
}

export default function VideoPlayer({ src, className }: VideoPlayerProps) {
  const playerRef = useRef<Player>();

  useEffect(() => {
    console.log('Video URL:', src); // Thêm dòng này để debug

    // Tạo video element
    const videoElement = document.createElement('video');
    videoElement.classList.add('video-js', 'vjs-big-play-centered', 'vjs-fluid');
    
    // Append video element vào container
    const container = document.getElementById('video-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(videoElement);

      // Khởi tạo player
      const player = videojs(videoElement, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        sources: [{
          src: src,
          type: 'video/mp4'
        }]
      });

      playerRef.current = player;
    }

    // Cleanup khi component unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = undefined;
      }
    };
  }, [src]);

  return (
    <div className={className}>
      <div 
        id="video-container"
        style={{ width: '100%', height: '0', paddingBottom: '56.25%', position: 'relative' }}
      />
    </div>
  );
}
