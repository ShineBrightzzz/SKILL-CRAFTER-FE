'use client'

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import type Player from 'video.js/dist/types/player';

interface VideoPlayerProps {
  src: string;
  className?: string;
  backgroundMode?: boolean;
}

export default function VideoPlayer({ src, className, backgroundMode = false }: VideoPlayerProps) {
  const playerRef = useRef<Player>();
  const [isPiP, setIsPiP] = useState(false);

  useEffect(() => {
    // Tạo video element
    const videoElement = document.createElement('video');
    videoElement.classList.add('video-js', 'vjs-big-play-centered', 'vjs-fluid', 'vjs-custom-skin');
    
    // Append video element vào container
    const container = document.getElementById('video-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(videoElement);

      // Khởi tạo player với các tùy chọn nâng cao
      const player = videojs(videoElement, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        controlBar: {
          children: [
            {
              name: 'playToggle'
            },
            'volumePanel',
            'currentTimeDisplay',
            'timeDivider',
            'durationDisplay',
            'progressControl',
            {
              name: 'playbackRateMenuButton',
              options: {
                rates: [0.5, 0.75, 1, 1.25, 1.5, 2],
              },
            },
            'fullscreenToggle',
            // Thêm nút Picture-in-Picture tùy chỉnh
            {
              name: 'CustomButton',
              text: 'PiP',
              onclick: () => {
                if (!document.pictureInPictureElement) {
                  videoElement.requestPictureInPicture()
                    .then(() => setIsPiP(true))
                    .catch(console.error);
                } else {
                  document.exitPictureInPicture()
                    .then(() => setIsPiP(false))
                    .catch(console.error);
                }
              }
            }
          ],
        },
        sources: [{
          src: src,
          type: 'video/mp4'
        }]
      });

      // Thêm CSS tùy chỉnh cho các nút điều khiển
      const style = document.createElement('style');
      style.textContent = `
        .video-js .vjs-big-play-button {
          font-size: 3em;
          line-height: 2em;
          height: 2em;
          width: 2em;
          border-radius: 50%;
          border: 0.06666em solid #fff;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .video-js .vjs-control-bar {
          font-size: 1.2em;
          height: 4em;
          background-color: rgba(0, 0, 0, 0.7);
        }
        .video-js .vjs-button > .vjs-icon-placeholder:before {
          font-size: 2em;
          line-height: 2;
        }
        .video-js .vjs-playback-rate .vjs-playback-rate-value {
          font-size: 1.5em;
          line-height: 2;
        }
        .video-js .vjs-time-control {
          font-size: 1.2em;
          padding-left: 1em;
          padding-right: 1em;
        }
        .video-js .vjs-volume-panel {
          margin-right: 1em;
        }
        .video-js .vjs-picture-in-picture-control {
          cursor: pointer;
          font-family: VideoJS;
          font-weight: normal;
          font-style: normal;
        }
        .video-js.vjs-pip {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 300px !important;
          height: 169px !important;
          z-index: 9999;
        }
      `;
      document.head.appendChild(style);

      // Xử lý chế độ phát trong nền
      if (backgroundMode) {
        player.on('pause', () => {
          // Khi video tạm dừng trong chế độ nền, tự động phát lại
          player.play();
        });
        
        player.on('play', () => {
          // Tự động tắt âm thanh trong chế độ nền
          player.muted(true);
        });

        // Tự động phát khi khởi tạo trong chế độ nền
        player.ready(() => {
          player.muted(true);
          player.play();
        });
      }

      playerRef.current = player;
    }

    // Cleanup khi component unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = undefined;
      }
    };
  }, [src, backgroundMode]);

  return (
    <div className={`${className} ${isPiP ? 'pip-mode' : ''}`}>
      <div 
        id="video-container"
        style={{ 
          width: '100%', 
          height: '0', 
          paddingBottom: '56.25%', 
          position: 'relative',
          ...(backgroundMode ? {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            paddingBottom: 0,
            zIndex: -1,
            opacity: 0.5
          } : {})
        }}
      />
    </div>
  );
}
