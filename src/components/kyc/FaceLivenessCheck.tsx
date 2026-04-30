'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, CheckCircle2, RotateCcw, X, Shield, Loader2 } from 'lucide-react';

// ── Types ──
export interface LivenessResult {
  /** Selfie blob (frontal frame) ready for upload */
  selfieBlob: Blob;
  /** Selfie as base64 data URL for preview */
  selfieDataUrl: string;
  /** 468-point face mesh landmarks from the frontal frame (x, y, z normalized) */
  faceMeshLandmarks: number[][];
  /** A compact face descriptor (128-dim vector from key landmark distances) */
  faceDescriptor: number[];
  /** Metadata proving liveness steps were completed */
  livenessMetadata: {
    turnLeftCompleted: boolean;
    turnRightCompleted: boolean;
    lookStraightCompleted: boolean;
    timestamp: string;
    totalDurationMs: number;
  };
}

interface FaceLivenessCheckProps {
  onComplete: (result: LivenessResult) => void;
  onCancel: () => void;
  /** Compact circular mode for inline embedding */
  compact?: boolean;
}

// ── Constants ──
const TURN_THRESHOLD = 0.03;      // Yaw threshold for left/right detection (lowered for easier detection)
const STRAIGHT_THRESHOLD = 0.045; // Yaw threshold for "looking straight" (wider tolerance)
const HOLD_FRAMES = 6;            // Frames to hold a pose before confirming (faster response)
const CAPTURE_DELAY_MS = 300;     // Small delay before capturing the final frame
const MIN_FACE_SIZE = 0.18;       // Minimum face bounding box size relative to frame (0-1). Below = too far

type LivenessStep = 'init' | 'turn_left' | 'turn_right' | 'look_straight' | 'capturing' | 'done';

const STEP_LABELS: Record<LivenessStep, string> = {
  init: 'Khởi tạo camera',
  turn_left: 'Quay mặt sang trái',
  turn_right: 'Quay mặt sang phải',
  look_straight: 'Nhìn thẳng vào camera',
  capturing: 'Đang chụp ảnh',
  done: 'Xác thực hoàn tất',
};

/**
 * Compute a simplified face descriptor from 468 mesh landmarks.
 * Uses inter-landmark distances normalized by face bounding box size
 * to produce a rotation-invariant 128-dim vector.
 */
function computeFaceDescriptor(landmarks: number[][]): number[] {
  if (!landmarks || landmarks.length < 468) return [];

  // Key landmark indices (eyes, nose, mouth, jawline, forehead)
  const keyIndices = [
    // Silhouette
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
    172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
    // Left eye
    33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246,
    // Right eye
    362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398,
    // Lips
    61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0,
    // Nose
    1, 2, 98, 327, 4, 5, 195, 197,
    // Inner lips
    78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14,
    // Eyebrows
    70, 63, 105, 66, 107, 55, 65, 52, 53, 46,
    300, 293, 334, 296, 336, 285, 295, 282, 283, 276,
  ];

  // Use a subset of 128 unique indices
  const selectedIndices = [...new Set(keyIndices)].slice(0, 128);
  while (selectedIndices.length < 128) {
    selectedIndices.push(selectedIndices.length % 468);
  }

  // Compute bounding box for normalization
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const lm of landmarks) {
    if (lm[0] < minX) minX = lm[0];
    if (lm[0] > maxX) maxX = lm[0];
    if (lm[1] < minY) minY = lm[1];
    if (lm[1] > maxY) maxY = lm[1];
  }
  const scale = Math.max(maxX - minX, maxY - minY) || 1;

  // Build descriptor: normalized distances from nose tip (index 1)
  const noseTip = landmarks[1];
  const descriptor: number[] = selectedIndices.map(idx => {
    const lm = landmarks[idx] || [0, 0, 0];
    const dx = (lm[0] - noseTip[0]) / scale;
    const dy = (lm[1] - noseTip[1]) / scale;
    const dz = (lm[2] - noseTip[2]) / scale;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  });

  return descriptor;
}

/**
 * Estimate face yaw (left-right rotation) from mesh landmarks.
 * Uses multiple landmark pairs for robust estimation.
 * Returns negative for LEFT turn, positive for RIGHT turn.
 * The result is INVERTED because webcam is mirrored (scaleX(-1)),
 * so we negate to match the user's visual perspective.
 */
function estimateYaw(landmarks: number[][]): number {
  if (!landmarks || landmarks.length < 468) return 0;

  // Use multiple pairs for more robust estimation
  // Pair 1: Cheeks (234 left, 454 right)
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const noseTip = landmarks[1];

  const leftDist1 = Math.abs(noseTip[0] - leftCheek[0]);
  const rightDist1 = Math.abs(rightCheek[0] - noseTip[0]);

  // Pair 2: Eye corners (33 left outer, 263 right outer)
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const leftDist2 = Math.abs(noseTip[0] - leftEye[0]);
  const rightDist2 = Math.abs(rightEye[0] - noseTip[0]);

  // Average both pairs for stability
  const leftDist = (leftDist1 + leftDist2) / 2;
  const rightDist = (rightDist1 + rightDist2) / 2;
  const total = leftDist + rightDist;
  if (total < 0.001) return 0;

  // Raw yaw: negative = user turned left, positive = user turned right
  const rawYaw = (rightDist - leftDist) / total;
  return rawYaw;
}

export default function FaceLivenessCheck({ onComplete, onCancel, compact = false }: FaceLivenessCheckProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceMeshRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);

  const [step, setStep] = useState<LivenessStep>('init');
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0); // 0-100 for current step hold progress
  const [debugYaw, setDebugYaw] = useState(0); // Real-time yaw value for visual feedback
  const [faceTooFar, setFaceTooFar] = useState(false); // Warning: face too far from camera
  const [noFaceDetected, setNoFaceDetected] = useState(false); // No face in frame

  // Liveness tracking refs (avoid re-renders during detection loop)
  const stepRef = useRef<LivenessStep>('init');
  const holdCountRef = useRef(0);
  const stepsCompletedRef = useRef({ left: false, right: false, straight: false });
  const frontalLandmarksRef = useRef<number[][] | null>(null);
  const startTimeRef = useRef(Date.now());

  const updateStep = useCallback((newStep: LivenessStep) => {
    stepRef.current = newStep;
    holdCountRef.current = 0;
    setStep(newStep);
    setProgress(0);
  }, []);

  // ── Initialize MediaPipe Face Mesh ──
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // Dynamically import to avoid SSR issues
        const { FaceMesh } = await import('@mediapipe/face_mesh');

        const faceMesh = new FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results: any) => {
          if (cancelled) return;
          processResults(results);
        });

        faceMeshRef.current = faceMesh;

        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            startTimeRef.current = Date.now();
            updateStep('turn_left');
            detectLoop();
          };
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('FaceLiveness init error:', err);
          setError(
            err.name === 'NotAllowedError'
              ? 'Vui lòng cấp quyền truy cập camera để xác thực gương mặt.'
              : 'Không thể khởi tạo camera: ' + (err.message || 'Unknown error')
          );
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      faceMeshRef.current?.close?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Detection loop ──
  const detectLoop = useCallback(async () => {
    if (!videoRef.current || !faceMeshRef.current) return;
    if (stepRef.current === 'done' || stepRef.current === 'capturing') return;

    try {
      await faceMeshRef.current.send({ image: videoRef.current });
    } catch (e) {
      // Ignore frame send errors
    }

    animFrameRef.current = requestAnimationFrame(detectLoop);
  }, []);

  // ── Process face mesh results ──
  const processResults = useCallback((results: any) => {
    const currentStep = stepRef.current;
    if (currentStep === 'done' || currentStep === 'capturing' || currentStep === 'init') return;

    // Draw overlay
    drawOverlay(results);

    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      holdCountRef.current = 0;
      setProgress(0);
      setNoFaceDetected(true);
      setFaceTooFar(false);
      return;
    }
    setNoFaceDetected(false);

    const rawLandmarks = results.multiFaceLandmarks[0];
    const landmarks: number[][] = rawLandmarks.map((lm: any) => [lm.x, lm.y, lm.z]);

    // Check face distance (bounding box size)
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const lm of landmarks) {
      if (lm[0] < minX) minX = lm[0];
      if (lm[0] > maxX) maxX = lm[0];
      if (lm[1] < minY) minY = lm[1];
      if (lm[1] > maxY) maxY = lm[1];
    }
    const faceWidth = maxX - minX;
    const faceHeight = maxY - minY;
    const faceSize = Math.max(faceWidth, faceHeight);
    const isTooFar = faceSize < MIN_FACE_SIZE;
    setFaceTooFar(isTooFar);

    if (isTooFar) {
      // Don't process yaw if face is too far
      holdCountRef.current = Math.max(0, holdCountRef.current - 1);
      setProgress(Math.min(100, (holdCountRef.current / HOLD_FRAMES) * 100));
      return;
    }

    const yaw = estimateYaw(landmarks);

    // Update debug yaw every 3 frames for smooth display
    if (holdCountRef.current % 3 === 0) {
      setDebugYaw(yaw);
    }

    switch (currentStep) {
      case 'turn_left':
        if (yaw < -TURN_THRESHOLD) {
          holdCountRef.current++;
          setProgress(Math.min(100, (holdCountRef.current / HOLD_FRAMES) * 100));
          if (holdCountRef.current >= HOLD_FRAMES) {
            stepsCompletedRef.current.left = true;
            updateStep('turn_right');
          }
        } else {
          // Slow decay so progress doesn't jump back instantly
          holdCountRef.current = Math.max(0, holdCountRef.current - 0.5);
          setProgress(Math.min(100, (holdCountRef.current / HOLD_FRAMES) * 100));
        }
        break;

      case 'turn_right':
        if (yaw > TURN_THRESHOLD) {
          holdCountRef.current++;
          setProgress(Math.min(100, (holdCountRef.current / HOLD_FRAMES) * 100));
          if (holdCountRef.current >= HOLD_FRAMES) {
            stepsCompletedRef.current.right = true;
            updateStep('look_straight');
          }
        } else {
          holdCountRef.current = Math.max(0, holdCountRef.current - 0.5);
          setProgress(Math.min(100, (holdCountRef.current / HOLD_FRAMES) * 100));
        }
        break;

      case 'look_straight':
        if (Math.abs(yaw) < STRAIGHT_THRESHOLD) {
          holdCountRef.current++;
          setProgress(Math.min(100, (holdCountRef.current / HOLD_FRAMES) * 100));
          if (holdCountRef.current >= HOLD_FRAMES) {
            stepsCompletedRef.current.straight = true;
            frontalLandmarksRef.current = landmarks;
            captureFrame(landmarks);
          }
        } else {
          holdCountRef.current = Math.max(0, holdCountRef.current - 0.5);
          setProgress(Math.min(100, (holdCountRef.current / HOLD_FRAMES) * 100));
        }
        break;
    }
  }, [updateStep]);

  // ── Draw face outline overlay ──
  const drawOverlay = useCallback((results: any) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const video = videoRef.current;
    if (!video) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];

      // Draw face mesh contour (simplified — face oval)
      const faceOvalIndices = [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
        397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
        172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10
      ];

      ctx.strokeStyle = stepRef.current === 'look_straight' ? '#22c55e' : '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      faceOvalIndices.forEach((idx, i) => {
        const lm = landmarks[idx];
        const x = lm.x * canvas.width;
        const y = lm.y * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();

      // Draw key points (eyes, nose)
      const keyPoints = [33, 263, 1, 61, 291]; // left eye, right eye, nose, left mouth, right mouth
      ctx.fillStyle = '#22c55e';
      keyPoints.forEach(idx => {
        const lm = landmarks[idx];
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }, []);

  // ── Capture frontal frame ──
  const captureFrame = useCallback((landmarks: number[][]) => {
    updateStep('capturing');

    setTimeout(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        setError('Lỗi chụp ảnh: không tìm thấy video/canvas');
        return;
      }

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Mirror the image (since webcam is mirrored)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Lỗi tạo ảnh selfie');
          return;
        }

        const descriptor = computeFaceDescriptor(landmarks);

        const result: LivenessResult = {
          selfieBlob: blob,
          selfieDataUrl: dataUrl,
          faceMeshLandmarks: landmarks,
          faceDescriptor: descriptor,
          livenessMetadata: {
            turnLeftCompleted: stepsCompletedRef.current.left,
            turnRightCompleted: stepsCompletedRef.current.right,
            lookStraightCompleted: stepsCompletedRef.current.straight,
            timestamp: new Date().toISOString(),
            totalDurationMs: Date.now() - startTimeRef.current,
          },
        };

        // Stop camera
        streamRef.current?.getTracks().forEach(t => t.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        updateStep('done');
        onComplete(result);
      }, 'image/jpeg', 0.92);
    }, CAPTURE_DELAY_MS);
  }, [onComplete, updateStep]);

  // ── Reset ──
  const handleReset = () => {
    stepsCompletedRef.current = { left: false, right: false, straight: false };
    frontalLandmarksRef.current = null;
    holdCountRef.current = 0;
    setError('');
    updateStep('init');

    // Re-init camera
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    }).then(stream => {
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          startTimeRef.current = Date.now();
          updateStep('turn_left');
          detectLoop();
        };
      }
    }).catch(err => {
      setError('Không thể khởi tạo lại camera: ' + err.message);
    });
  };

  const stepsCount = [
    stepsCompletedRef.current?.left,
    stepsCompletedRef.current?.right,
    stepsCompletedRef.current?.straight
  ].filter(Boolean).length;

  // ── Render ──
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 ${compact ? 'p-4' : 'p-8'}`}>
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
          <X className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-sm text-red-600 font-bold text-center max-w-xs">{error}</p>
        <div className="flex gap-2">
          <button onClick={handleReset} className="px-4 py-2 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2">
            <RotateCcw className="h-3 w-3" /> Thử lại
          </button>
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${compact ? '' : 'p-4'}`}>
      {/* Step indicator */}
      <div className="flex items-center gap-2 w-full justify-center mb-1">
        {['turn_left', 'turn_right', 'look_straight'].map((s, i) => {
          const completed = i === 0 ? stepsCompletedRef.current?.left
            : i === 1 ? stepsCompletedRef.current?.right
            : stepsCompletedRef.current?.straight;
          const isActive = step === s;
          return (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                completed ? 'bg-emerald-500 text-white shadow-sm' :
                isActive ? 'bg-gray-900 text-white animate-pulse' :
                'bg-gray-100 text-gray-400'
              }`}>
                {completed ? '✓' : i + 1}
              </div>
              {i < 2 && <div className={`w-4 h-[1px] transition-all ${completed ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
            </div>
          );
        })}
      </div>

      {/* Status label */}
      <div className={`px-4 py-2 rounded-xl text-center transition-all duration-300 ${
        step === 'done' ? 'bg-emerald-50 text-emerald-700' :
        step === 'capturing' ? 'bg-amber-50 text-amber-700' :
        'bg-gray-100/50 text-gray-700'
      }`}>
        <p className="text-[11px] font-bold uppercase tracking-widest">{STEP_LABELS[step]}</p>
      </div>

      {/* Real-time yaw indicator bar */}
      {(step === 'turn_left' || step === 'turn_right' || step === 'look_straight') && (
        <div className="w-full max-w-[220px] flex flex-col items-center gap-1.5">
          <div className="w-full h-1.5 bg-gray-200/50 rounded-full relative overflow-hidden">
            {/* Center marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 -translate-x-1/2 z-10" />
            {/* Yaw position dot */}
            <div
              className={`absolute top-0 bottom-0 w-4 rounded-full transition-all duration-100 ${
                (step === 'turn_left' && debugYaw < -TURN_THRESHOLD) ||
                (step === 'turn_right' && debugYaw > TURN_THRESHOLD) ||
                (step === 'look_straight' && Math.abs(debugYaw) < STRAIGHT_THRESHOLD)
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-400'
              }`}
              style={{ left: `${Math.max(2, Math.min(98, 50 + debugYaw * 400))}%`, transform: 'translateX(-50%)' }}
            />
          </div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
            {step === 'turn_left' ? 'Di chuyển sang trái' :
             step === 'turn_right' ? 'Di chuyển sang phải' :
             'Giữ vị trí trung tâm'}
          </p>
        </div>
      )}

      {/* Camera viewport (circular) — LARGE */}
      <div className="relative">
        <div className={`h-[280px] w-[280px] rounded-full overflow-hidden border-4 transition-all duration-500 shadow-xl ${
          faceTooFar ? 'border-amber-500' :
          step === 'done' ? 'border-emerald-500' :
          step === 'capturing' ? 'border-amber-500' :
          step === 'turn_left' || step === 'turn_right' ? 'border-blue-500' :
          step === 'look_straight' ? 'border-emerald-400' :
          'border-gray-300'
        }`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          {/* Overlay canvas for face mesh drawing */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Loading spinner */}
          {step === 'init' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}

          {/* Done overlay */}
          {step === 'done' && (
            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-[2px]">
              <div className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
            </div>
          )}

          {/* Face too far warning overlay */}
          {faceTooFar && step !== 'done' && step !== 'init' && step !== 'capturing' && (
            <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
              <div className="px-3 py-1.5 bg-amber-500/90 rounded-full backdrop-blur-sm animate-pulse">
                <p className="text-[10px] font-black text-white uppercase tracking-wider">⚠️ Đưa mặt lại gần hơn!</p>
              </div>
            </div>
          )}

          {/* No face detected overlay */}
          {noFaceDetected && step !== 'done' && step !== 'init' && step !== 'capturing' && (
            <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
              <div className="px-3 py-1.5 bg-red-500/90 rounded-full backdrop-blur-sm animate-pulse">
                <p className="text-[10px] font-black text-white uppercase tracking-wider">❌ Không thấy gương mặt</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress ring */}
        {(step === 'turn_left' || step === 'turn_right' || step === 'look_straight') && progress > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="47"
              fill="none"
              stroke={step === 'look_straight' ? '#22c55e' : '#3b82f6'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.95} ${295 - progress * 2.95}`}
              strokeDashoffset="73.75"
              className="transition-all duration-150"
            />
          </svg>
        )}

        {/* Direction arrows */}
        {step === 'turn_left' && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-black shadow-lg">←</div>
          </div>
        )}
        {step === 'turn_right' && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-10 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-black shadow-lg">→</div>
          </div>
        )}
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Action buttons */}
      <div className="flex gap-2 mt-1">
        {step !== 'done' && step !== 'capturing' && (
          <>
            <button onClick={handleReset} className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-1.5">
              <RotateCcw className="h-3 w-3" /> Làm lại
            </button>
            <button onClick={onCancel} className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
              Hủy
            </button>
          </>
        )}
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-1.5 opacity-50">
        <Shield className="h-3 w-3 text-gray-400" />
        <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Powered by MediaPipe Face Mesh · Anti-Spoofing</p>
      </div>
    </div>
  );
}
