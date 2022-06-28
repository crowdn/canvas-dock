import Dock from './dock';

export default class Mac {
  container: HTMLDivElement;
  canvas: HTMLCanvasElement;
  static ratio = 1.7;
  dock: Dock;
  constructor(container: HTMLDivElement) {
    this.container = container;
    const cvasDom = document.createElement('canvas', {});
    const macBg = document.querySelector('#bg') as HTMLImageElement;

    this.canvas = cvasDom;
    cvasDom.width = 1200;
    cvasDom.height = 1200 / Mac.ratio;
    container.innerHTML = '';
    container.append(cvasDom);
    const ctx = cvasDom.getContext('2d');

    this.dock = new Dock(ctx!, { bottom: cvasDom.height * 0.13 });
    this.dock.beforeRender = () =>
      ctx?.drawImage(macBg, 0, 0, cvasDom.width, cvasDom.height);
    this.dock.init();
  }
  onResize = () => {};
}
