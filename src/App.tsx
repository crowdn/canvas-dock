import React, { useEffect, useRef, useState } from 'react';
import Dock from './dock';
export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current?.getContext('2d');
      new Dock(ctx, canvasRef.current.width, canvasRef.current.height).init();
    }
  }, [canvasRef.current]);
  return (
    <div>
      <canvas width="900" height="400" ref={canvasRef}></canvas>
    </div>
  );
}
