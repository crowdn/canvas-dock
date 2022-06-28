import React, { useEffect, useRef, useState } from 'react';
import iconImg from '../assets/1.png';
import macImg from '../assets/mac.png';

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
      <img
        id="icon"
        src={iconImg}
        style={{ display: 'none' }}
        onLoad={() => macRef.current?.dock.render()}
      ></img>
      <img
        id="mac"
        src={macImg}
        style={{ display: 'none' }}
        onLoad={() => macRef.current?.dock.render()}
      ></img>

      {/* <image id="img" src="./assets/2.png" style="display: none"></image> */}
      <h2 className="title">模拟Macos 程序坞动画 - canvas 实现</h2>
      <div>
        <div className="mac" ref={canvasRef}></div>
      </div>
    </div>
  );
}
