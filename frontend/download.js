function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const lines = text.split('\n');
  let currentY = y;
  for (const line of lines) {
    if (line.trim() === '') { currentY += lineHeight * 0.5; continue; }
    const words = line.split(' ');
    let current = '';
    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        ctx.fillText(current, x, currentY);
        currentY += lineHeight;
        current = word;
      } else {
        current = test;
      }
    }
    if (current) { ctx.fillText(current, x, currentY); currentY += lineHeight; }
  }
  return currentY;
}

async function downloadDoor(imageUrl, poem, dateStr) {
  const W = 820, H = 1160;
  const PAD = 52;

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Background
  ctx.fillStyle = '#08050302';
  ctx.fillRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0,   '#0c0805');
  bg.addColorStop(0.5, '#0a0703');
  bg.addColorStop(1,   '#070502');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Load image (crossOrigin needed for canvas)
  await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const imgW = W - PAD * 2;
      const imgH = Math.round(imgW * (img.naturalHeight / img.naturalWidth));
      const imgY = PAD + 70;

      // sepia overlay on image
      ctx.drawImage(img, PAD, imgY, imgW, imgH);

      // warm sepia wash over image
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = '#7a3a08';
      ctx.fillRect(PAD, imgY, imgW, imgH);
      ctx.restore();

      // vignette on image
      const vig = ctx.createRadialGradient(
        W / 2, imgY + imgH / 2, imgH * 0.2,
        W / 2, imgY + imgH / 2, imgH * 0.85
      );
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = vig;
      ctx.fillRect(PAD, imgY, imgW, imgH);
      ctx.restore();

      resolve({ imgY, imgH });
    };
    img.onerror = reject;
    img.src = imageUrl;
  }).then(({ imgY, imgH }) => {

    // ── KNOCK header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c8a96e';
    ctx.font = '700 28px Georgia, serif';
    ctx.letterSpacing = '0.3em';
    ctx.fillText('K N O C K', W / 2, PAD + 38);

    // ── Gold separator line
    const sepY = imgY + imgH + 36;
    ctx.strokeStyle = '#6e5830';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, sepY); ctx.lineTo(W - PAD, sepY);
    ctx.stroke();

    // ── "the poem" label
    ctx.fillStyle = '#6e5830';
    ctx.font = 'italic 13px Georgia, serif';
    ctx.fillText('— the poem —', W / 2, sepY + 26);

    // ── Poem text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#d4c9b0';
    ctx.font = '17px Georgia, serif';
    const poemY = wrapText(ctx, poem, PAD, sepY + 54, W - PAD * 2, 30);

    // ── Bottom separator
    const botSepY = Math.max(poemY + 28, H - 80);
    ctx.strokeStyle = '#3a2810';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, botSepY); ctx.lineTo(W - PAD, botSepY);
    ctx.stroke();

    // ── Branding + date
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3a2810';
    ctx.font = 'italic 12px Georgia, serif';
    ctx.fillText('Design Your Door  ·  knock.art  ·  ' + (dateStr || ''), W / 2, botSepY + 22);

    // ── Grain overlay (simple noise)
    ctx.save();
    ctx.globalAlpha = 0.045;
    for (let i = 0; i < 18000; i++) {
      const gx = Math.random() * W;
      const gy = Math.random() * H;
      const v  = Math.random() > 0.5 ? 255 : 0;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(gx, gy, 1, 1);
    }
    ctx.restore();

  }).catch(() => {
    alert('Could not load image. Try again.');
    return;
  });

  // ── Trigger download
  const link = document.createElement('a');
  link.download = 'my-door.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
