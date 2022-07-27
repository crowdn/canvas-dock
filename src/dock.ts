import peniko, { Rect, Point } from 'peniko';

class Dock {
  zoomRatio = 1;
  appNum = 9;
  bottom = 12;
  baseAppwidth = 40;
  gapW = 8;
  barHeight = this.baseAppwidth + this.gapW * 2;
  appRects: Rect[] = [];
  barRect: Rect | null = null;
  ctx: CanvasRenderingContext2D;
  mousePoint: Point | null = null;
  isMouseEnterBar: boolean = false;
  centerAppInfo: { index: number; delta?: number };

  cvsWidth: number;
  cvsHeight: number;
  beforeRender?: () => void;
  constructor(
    ctx: CanvasRenderingContext2D,
    opt: { bottom?: number; baseAppwidth?: number; appNum?: number } = {}
  ) {
    this.ctx = ctx;
    this.isMouseEnterBar = false;
    this.centerAppInfo = { index: -1 };
    this.cvsHeight = this.ctx.canvas.height;
    this.cvsWidth = this.ctx.canvas.width;
    const { bottom, baseAppwidth, appNum } = opt;
    if (baseAppwidth) {
      this.baseAppwidth = baseAppwidth;
      this.gapW = baseAppwidth / 5;
    }
    appNum && (this.appNum = appNum);
    bottom && (this.bottom = bottom);
  }
  setAppNum(appNum: number) {
    this.appNum = appNum;
    this.render();
  }
  setzoomRatio(zoomRatio: number) {
    this.zoomRatio = zoomRatio;
    this.render();
  }
  setBaseAppwidth(baseAppwidth: number) {
    this.baseAppwidth = baseAppwidth;
    this.render();
  }

  drawRect(rect: Rect, r = 8, strokeStyle = '#333') {
    this.ctx.strokeStyle = strokeStyle;
    var ptA = new Point(rect.x + r, rect.y);
    var ptB = new Point(rect.x + rect.width, rect.y);
    var ptC = new Point(rect.x + rect.width, rect.y + rect.height);
    var ptD = new Point(rect.x, rect.y + rect.height);
    var ptE = new Point(rect.x, rect.y);
    this.ctx.beginPath();
    this.ctx.moveTo(ptA.x, ptA.y);
    this.ctx.arcTo(ptB.x, ptB.y, ptC.x, ptC.y, r);
    this.ctx.arcTo(ptC.x, ptC.y, ptD.x, ptD.y, r);
    this.ctx.arcTo(ptD.x, ptD.y, ptE.x, ptE.y, r);
    this.ctx.arcTo(ptE.x, ptE.y, ptA.x, ptA.y, r);
    // this.ctx.stroke();
  }
  drawApps(appRects: Rect[]) {
    appRects.forEach((rect, index) => {
      const style = '#333';
      this.drawApp(rect, style);
    });
  }
  drawApp(appRect: Rect, style: any) {
    const radius = appRect.width * 0.3;
    this.ctx.save();
    this.drawRect(appRect, radius, style);
    this.ctx.clip();
    const img = document.getElementById('icon');

    this.ctx.drawImage(
      img as CanvasImageSource,
      appRect.x,
      appRect.y,
      appRect.width,
      appRect.height
    );
    this.ctx.restore();
  }

  /**
   * 不考虑根据鼠标形变，只根据app数量，计算appRects 和 barRect
   */
  layoutForRaw() {
    const { appNum, baseAppwidth, barHeight, gapW, bottom } = this;

    let appRects: Rect[] = [];
    for (let i = 0; i < appNum; i++) {
      const x = baseAppwidth * i + gapW * (i + 1);
      const y = (barHeight - baseAppwidth) / 2;
      appRects.push(new Rect(x, y, baseAppwidth, baseAppwidth));
    }
    const barWidth = appNum * baseAppwidth + gapW * (appNum + 1);
    const barRect = new Rect(
      (this.cvsWidth - barWidth) / 2,
      this.cvsHeight - bottom - barHeight,
      barWidth,
      barHeight
    );
    return { appRects, barRect };
  }

  layout() {
    const { baseAppwidth, barHeight, gapW } = this;

    const baseLayout = this.layoutForRaw();

    if (this.isMouseEnterBar) {
      const { barRect: baseBarRect, appRects: baseAppRects } = baseLayout;
      const relativeMousePoint = peniko.convertRelativeCoordinate(
        this.mousePoint!,
        baseBarRect
      );
      // 根据鼠标位置，找到最近的一个app
      const centerAppInfo = baseAppRects.reduce(
        (curCenterAppInfo, curapp, index) => {
          const delta = relativeMousePoint.x - (curapp.x + curapp.width / 2);
          if (Math.abs(delta) < Math.abs(curCenterAppInfo.delta)) {
            return { delta, index };
          }
          return curCenterAppInfo;
        },
        { delta: Infinity, index: -1 }
      );

      let leftPos = 0;
      let leftIdx = centerAppInfo.index - 1;
      let rightPos = 0;
      let rightIdx = centerAppInfo.index + 1;
      const newAppRects: Rect[] = [];
      // 计算中心app rect
      newAppRects[centerAppInfo.index] = (() => {
        const rect = baseAppRects[centerAppInfo.index];
        const centerX = rect.x + rect.width / 2;
        const bottom = rect.bottom;
        const newWidth = baseAppwidth * this.getZoomScale(rect, baseBarRect);

        // 新的appRect 以鼠标为中心进行缩放
        const mouseCenterX = relativeMousePoint.x;
        let pos = (mouseCenterX - centerX) / rect.width + 1 / 2;
        // pos = Math.min(Math.max(pos, 0), 1);

        const newRect = new Rect(
          mouseCenterX - newWidth * pos,
          bottom - newWidth,
          newWidth,
          newWidth
        );
        leftPos = newRect.left;
        rightPos = newRect.right;

        return newRect;
      })();

      // 从center app为中心，向两边依次缩放计算新的apprect
      while (leftIdx >= 0 || rightIdx < this.appRects.length) {
        if (leftIdx >= 0) {
          const rect = baseAppRects[leftIdx];
          const bottom = rect.bottom;
          const newWidth = baseAppwidth * this.getZoomScale(rect, baseBarRect);
          const newRect = new Rect(
            leftPos - newWidth - this.gapW,
            bottom - newWidth,
            newWidth,
            newWidth
          );
          newAppRects[leftIdx] = newRect;

          leftPos = newRect.left;
          leftIdx--;
        }
        if (rightIdx < this.appRects.length) {
          const rect = baseAppRects[rightIdx];
          const bottom = rect.bottom;
          const newWidth = baseAppwidth * this.getZoomScale(rect, baseBarRect);
          const newRect = new Rect(
            rightPos + this.gapW,
            bottom - newWidth,
            newWidth,
            newWidth
          );
          newAppRects[rightIdx] = newRect;
          rightPos = newRect.right;
          rightIdx++;
        }
      }

      const barWidth =
        newAppRects[newAppRects.length - 1].right -
        newAppRects[0].left +
        gapW * 2;
      const newBarRect = new Rect(
        newAppRects[0].left + baseBarRect.x - gapW,
        baseBarRect.y,
        barWidth,
        baseBarRect.height
      );

      this.barRect = newBarRect;
      this.appRects = newAppRects.map((rect) => {
        const { x, y } = peniko.revertRelativeCoordinate(rect, baseBarRect);
        rect.x = x;
        rect.y = y;
        return rect;
      });
      this.centerAppInfo = centerAppInfo;
    } else {
      this.appRects = baseLayout.appRects.map((rect) => {
        const { x, y } = peniko.revertRelativeCoordinate(
          rect,
          baseLayout.barRect
        );
        rect.x = x;
        rect.y = y;
        return rect;
      });
      this.barRect = baseLayout.barRect;
      this.centerAppInfo = { index: -1 };
    }
  }

  draw() {
    this.ctx.save();
    this.ctx.filter = 'blur(1px)';
    this.ctx.fillStyle = '#fff';
    this.ctx.globalAlpha = 0.5;
    this.drawRect(this.barRect!, 12);
    this.ctx.clip();
    this.ctx.fill();
    this.ctx.restore();
    this.drawApps(this.appRects);
  }
  render(isForce = false) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.beforeRender?.();
    this.layout();
    this.draw();
  }
  onMouseMove(e: any) {
    const cvasRect = this.ctx.canvas.getBoundingClientRect();
    this.mousePoint = peniko.convertRelativeCoordinate(
      e,
      Rect.create(cvasRect)
    );
    const { barRect } = this.layoutForRaw();
    const isMouseEnterBar = peniko.isPointInRect(this.mousePoint, barRect);
    if (isMouseEnterBar !== this.isMouseEnterBar || isMouseEnterBar) {
      this.isMouseEnterBar = isMouseEnterBar;
      this.render();
    }
    // console.log({ mousePoint: this.mousePoint });
  }
  init() {
    this.render(true);
    this.ctx.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
  }
  getZoomScale(appRect: Rect, barRect: Rect) {
    const relativeMousePoint = peniko.convertRelativeCoordinate(
      this.mousePoint!,
      barRect
    );
    const centerPX = appRect.x + appRect.width / 2;
    const base =
      (peniko.normalDistributionfun(centerPX - relativeMousePoint.x, 0, 70) *
        this.zoomRatio) /
      peniko.normalDistributionfun(0, 0, 70);
    return 1 + base;
  }
}
export default Dock;
