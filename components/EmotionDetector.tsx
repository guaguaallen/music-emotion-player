import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

interface EmotionDetectorProps {
  onEmotionDetected: (emotion: string) => void;
}

const EmotionDetector: React.FC<EmotionDetectorProps> = ({ onEmotionDetected }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastEmotion, setLastEmotion] = useState<string | null>(null);
  const [emotionCounter, setEmotionCounter] = useState<number>(0);
  const CONFIDENCE_THRESHOLD = 0.7;
  const EMOTION_STABILITY_THRESHOLD = 3;

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(process.env.PUBLIC_URL + '/models');
        await faceapi.nets.faceExpressionNet.loadFromUri(process.env.PUBLIC_URL + '/models');
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const video = document.getElementById('video') as HTMLVideoElement;
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          video.srcObject = stream;
        })
        .catch(err => console.error('Error accessing camera:', err));

      video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
          const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
          if (detections) {
            const emotion = getTopEmotion(detections.expressions);
            handleEmotionDetection(emotion);
          }
        }, 1000);
      });
    }
  }, [isLoading, onEmotionDetected]);

  const getTopEmotion = (expressions: faceapi.FaceExpressions): string => {
    return Object.entries(expressions).reduce((prev, current) => 
      current[1] > prev[1] ? current : prev
    )[0];
  };

  const handleEmotionDetection = (emotion: string) => {
    if (emotion === lastEmotion) {
      setEmotionCounter(prev => prev + 1);
    } else {
      setEmotionCounter(1);
      setLastEmotion(emotion);
    }

    if (emotionCounter >= EMOTION_STABILITY_THRESHOLD) {
      onEmotionDetected(emotion);
    }
  };

  return (
    <div>
      {isLoading ? <p>Loading emotion detection models...</p> : null}
      <video id="video" width="720" height="560" autoPlay muted></video>
    </div>
  );
};

export default EmotionDetector;

 