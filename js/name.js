"use strict";

let text = 'MHZ';
const fontName = 'Monoton';
const fontWeight = 400;
let fontsReady = false;
const stars = [];
let hasLoadedStars = false;
let imgData;
const targetWidth = 400;
const threshold = 0.15;

function setup() {
  loadWebFont(`${fontName}:${fontWeight}`).then(() => {
    fontsReady = true;
    setTheFont();
  });
}

function setTheFont(size = 100) {
  textAlign(TEXTALIGN_CENTER);
  textBaseline(TEXTBASELINE_MIDDLE); // textBaseline(TEXTBASELINE_TOP);

  font(`${fontWeight} ${size}px ${fontName}`);
}

function getFontSizeForTargetWidth(text, targetWidth) {
  const testSize = 200;
  setTheFont(testSize);
  const measurement = measureText(text);
  return min(testSize / measurement.width * targetWidth, 200);
}

function createStars() {
  imgData = null;
  stars.splice(0);
  const fontSize = getFontSizeForTargetWidth(text, targetWidth);
  setTheFont(fontSize);
  fillText(text, 0, 0);
  const extraBounds = 16;
  const extraBoundsHalf = extraBounds * 0.5;
  imgData = getImageData(targetWidth * -0.5 - extraBoundsHalf + width_half, fontSize * -0.5 - extraBoundsHalf + height_half, targetWidth + extraBounds, fontSize + extraBounds);
  const {
    data,
    data: {
      length: dataLength
    },
    width: imgWidth,
    height: imgHeight
  } = imgData;
  let countSinceLast = 0;

  for (let i = 0; i < dataLength; i += 4) {
    if (Math.random() > threshold && countSinceLast++ < 3) continue;
    countSinceLast = 0;
    const pixel = data.slice(i, i + 4);
    if (pixel[3] < 50) continue;
    const pos = iToXY(i / 4, imgWidth);
    pos.add(targetWidth * -0.5 - extraBoundsHalf, fontSize * -0.5 - extraBoundsHalf).add(Vector.fa(random(TAU), random(1))).div(targetWidth).mult(800).setZ(random(-1, 1));
    const size = random([...repeatArray(floor(random(30, 50)) / 100, 4), 1, 1.5, 2]);
    stars.push({
      pos,
      size,
      val: random()
    });
  }

  stars.sort((a, b) => a.size - b.size);
}

function draw(e) {
  var _starGroups$circle$, _starGroups$line$;

  if (!fontsReady) {
    fillText('Loading font...');
    return;
  }

  if (!hasLoadedStars) {
    hasLoadedStars = true;
    createStars();
  }

  if (!imgData) return; // putImageData(imgData, 0, 0);

  const time = e * 0.001;
  const mouse = mouseIn ? mousePos._.sub(width_half, height_half) : null;
  const starGroups = {
    line: [],
    circle: []
  };

  for (const star of stars) {
    const rot = sin(time - star.pos.x / targetWidth * TAU) * SIXTH_PI * 0.1; // const pos = star.pos._.mult(4);

    const pos = star.pos.copy().multZ(20);

    const _pos = pos.copy();

    let isLine = false;

    if (mouse && true) {
      const diff = pos._.sub(mouse);

      const magSq = diff.magSq3D();

      if (magSq < 40000) {
        diff.mult(ease.expo.in(map(magSq, 0, 40000, 1, 0)));
        pos.add(diff);

        _pos.add(diff.mult(0.1));

        isLine = true;
      }
    }

    pos.rotateYZ(rot);
    pos.divXY((pos.z + 1000) / 1000);

    if (isLine) {
      _pos.rotateYZ(rot);

      _pos.divXY((_pos.z + 1000) / 1000);
    }

    const rad = star.size * map(sin(time - star.pos.x * star.pos.y * TAU * 6) ** 32, -1, 1, 0, 1);
    star.drawPos = pos;
    star._drawPos = _pos;
    star.rad = rad;
    star.isLine = isLine;
    starGroups[isLine ? 'line' : 'circle'].push(star);
  }

  let currentSize = (_starGroups$circle$ = starGroups.circle[0]) === null || _starGroups$circle$ === void 0 ? void 0 : _starGroups$circle$.size;
  ctx.shadowColor = 'white';

  const end = rad => {
    ctx.shadowBlur = currentSize ** 3;
  };

  beginPath();

  for (const star of starGroups.circle) {
    if (star.size !== currentSize) {
      end();
      fill();
      currentSize = star.size;
      beginPath();
    }

    circle(star.drawPos, star.rad);
  }

  end();
  fill();
  currentSize = (_starGroups$line$ = starGroups.line[0]) === null || _starGroups$line$ === void 0 ? void 0 : _starGroups$line$.size;
  lineCap('round');
  beginPath();

  for (const star of starGroups.line) {
    if (star.size !== currentSize) {
      end();
      stroke('white', currentSize);
      currentSize = star.size;
      beginPath();
    }

    line(star.drawPos, star._drawPos);
  }

  end();
  stroke('white', currentSize);
} // function repeatArray(input = [], count = 0) {
// 	if(count <= 0) return [];
// 	const arr = [];
// 	for(let i = 0; i < count; i++) {
// 		arr.push(...input);
// 	}
// 	return arr;
// }
