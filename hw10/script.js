async function setupCamera() {
  const video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => resolve(video);
  });
}

function getVector(a, b) {
  return {
    x: b[0] - a[0],
    y: b[1] - a[1],
    z: b[2] - a[2]
  };
}

function vectorLength(v) {
  return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
}

function getAngle(v1, v2) {
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const len1 = vectorLength(v1);
  const len2 = vectorLength(v2);
  if (len1 === 0 || len2 === 0) return null;
  return Math.acos(dot / (len1 * len2)) * 180 / Math.PI;
}

const MIN_FINGER_LENGTH = 30;
function isFingerVisible(mcp, tip) {
  const vec = getVector(mcp, tip);
  return vectorLength(vec) > MIN_FINGER_LENGTH;
}

async function main() {
  await tf.setBackend('webgl');
  await tf.ready();

  const video = await setupCamera();
  video.play();

  const model = await handpose.load();
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  async function detect() {
    const predictions = await model.estimateHands(video, true);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (predictions.length > 0) {
      const keypoints = predictions[0].landmarks;

      // Чи видимі пальці
      const thumbVisible  = isFingerVisible(keypoints[1], keypoints[4]);
      const indexVisible  = isFingerVisible(keypoints[5], keypoints[8]);
      const middleVisible = isFingerVisible(keypoints[9], keypoints[12]);
      const ringVisible   = isFingerVisible(keypoints[13], keypoints[16]);
      const pinkyVisible  = isFingerVisible(keypoints[17], keypoints[20]);

      const anyFingerVisible = thumbVisible || indexVisible || middleVisible || ringVisible || pinkyVisible;

      if (!anyFingerVisible) {
        showHint("Підніміть розкриту руку перед камерою");
      } else {
        const thumbVec  = thumbVisible  ? getVector(keypoints[1], keypoints[4])   : null;
        const indexVec  = indexVisible  ? getVector(keypoints[5], keypoints[8])   : null;
        const middleVec = middleVisible ? getVector(keypoints[9], keypoints[12])  : null;
        const ringVec   = ringVisible   ? getVector(keypoints[13], keypoints[16]) : null;
        const pinkyVec  = pinkyVisible  ? getVector(keypoints[17], keypoints[20]) : null;

        // Малюємо точки
        keypoints.forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "red";
          ctx.fill();
        });

        // Виводимо кути
        ctx.font = "20px Arial";
        ctx.fillStyle = "lime";
        let y = 30;

        if (thumbVec && indexVec) {
          const angle = getAngle(thumbVec, indexVec);
          if (angle !== null) ctx.fillText(`Великий–Вказівний: ${angle.toFixed(1)}°`, 10, y += 30);
        }

        if (indexVec && middleVec) {
          const angle = getAngle(indexVec, middleVec);
          if (angle !== null) ctx.fillText(`Вказівний–Середній: ${angle.toFixed(1)}°`, 10, y += 30);
        }

        if (middleVec && ringVec) {
          const angle = getAngle(middleVec, ringVec);
          if (angle !== null) ctx.fillText(`Середній–Безіменний: ${angle.toFixed(1)}°`, 10, y += 30);
        }

        if (ringVec && pinkyVec) {
          const angle = getAngle(ringVec, pinkyVec);
          if (angle !== null) ctx.fillText(`Безіменний–Мізинець: ${angle.toFixed(1)}°`, 10, y += 30);
        }
      }
    } else {
      showHint("Підніміть руку перед камерою");
    }

    requestAnimationFrame(detect);
  }

  function showHint(text) {
    ctx.font = "28px Arial";
    ctx.fillStyle = "orange";
    ctx.fillText(text, 20, canvas.height - 30);
  }

  detect();
}

main();
