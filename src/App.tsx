import React, { useEffect, useRef, useState } from 'react';

import './App.less';
import Mac from './mac';

export default function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const macRef = useRef<Mac>();
  useEffect(() => {
    if (canvasRef.current) {
      macRef.current = new Mac(canvasRef.current);
      window['__mac__'] = macRef.current;
    }
  }, [canvasRef.current]);

  return (
    <div>
      <h2 className="title">模拟Macos 程序坞动画 - canvas 实现</h2>
      <div>
        <div className="mac" ref={canvasRef}></div>
      </div>
    </div>
  );
}
