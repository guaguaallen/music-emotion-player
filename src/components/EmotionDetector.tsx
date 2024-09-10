import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

interface EmotionDetectorProps {
  onEmotionDetected: (emotion: string) => void;
}

const EmotionDetector: React.FC<EmotionDetectorProps> = ({ onEmotionDetected }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(process.env.PUBLIC_URL + '/models');
        await faceapi.nets.faceExpressionNet.loadFromUri(process.env.PUBLIC_URL + '/models');
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
        onEmotionDetected('Model loading failed');
      }
    };
    loadModels();
  }, [onEmotionDetected]);

  useEffect(() => {
    if (!isLoading) {
      const video = document.getElementById('video') as HTMLVideoElement;
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          video.srcObject = stream;
        })
        .catch(err => {
          console.error('Error accessing camera:', err);
          onEmotionDetected('Camera not available');
        });

      video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
          const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
          if (detections) {
            const emotion = getTopEmotion(detections.expressions);
            onEmotionDetected(emotion);
          }
        }, 1000);
      });
    }
  }, [isLoading, onEmotionDetected]);

  const getTopEmotion = (expressions: any) => {
    return Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
  };

  return (
    <div>
      {isLoading ? <p>Loading emotion detection models...</p> : null}
      <video id="video" width="720" height="560" autoPlay muted></video>
    </div>
  );
};

export default EmotionDetector;