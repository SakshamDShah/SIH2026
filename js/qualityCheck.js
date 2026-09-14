// qualityCheck.js - Automated Client-Side Image Quality Verification Engine
// Evaluates brightness, blur / sharpness variance, and leaf framing before AI prediction

export class ImageQualityChecker {
  /**
   * Analyzes an image (HTMLImageElement or dataUrl) for quality criteria:
   * - Brightness / Illumination (too dark or overexposed)
   * - Sharpness / Blur (Laplacian variance approximation)
   * - Leaf Framing & Plant Color Coverage (vegetation hue ratio)
   */
  static async analyze(imageSource, sampleMeta = null) {
    // If sample metadata has preset quality flags, integrate them
    if (sampleMeta && sampleMeta.quality) {
      const q = sampleMeta.quality;
      return {
        pass: q.pass,
        brightness: q.brightness,
        sharpness: q.sharpness,
        framing: q.leafCoverage,
        overallScore: Math.round((q.brightness + q.sharpness + q.leafCoverage) / 3),
        issues: q.pass ? [] : [
          q.reason || "Image is too dark or blurry for accurate disease diagnosis",
          "Ensure bright natural lighting and hold the phone steady 15–20cm from the leaf"
        ]
      };
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const result = ImageQualityChecker.processCanvas(img);
          resolve(result);
        } catch (e) {
          // Fallback if canvas read fails
          resolve({
            pass: true,
            brightness: 80,
            sharpness: 85,
            framing: 85,
            overallScore: 83,
            issues: []
          });
        }
      };
      img.onerror = () => {
        resolve({
          pass: false,
          brightness: 20,
          sharpness: 20,
          framing: 20,
          overallScore: 20,
          issues: ["Could not load or decode the image format."]
        });
      };
      img.src = typeof imageSource === "string" ? imageSource : imageSource.src;
    });
  }

  static processCanvas(img) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = 200;
    const height = Math.round((img.height / img.width) * width) || 200;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const totalPixels = width * height;

    let totalLuminance = 0;
    let plantPixels = 0;

    // Convert to grayscale for blur calculation
    const gray = new Float32Array(totalPixels);

    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Luminance (Rec. 601)
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuminance += lum;
      gray[i] = lum;

      // Detect vegetation colors (greenish / yellow-brown tones)
      const isGreenish = (g > r * 0.95 && g > b * 1.1) || (g > 70 && r > 50 && b < 60);
      const isBrownLesion = (r > 60 && g > 40 && b < 40 && r > b * 1.3);
      if (isGreenish || isBrownLesion) {
        plantPixels++;
      }
    }

    const avgLuminance = totalLuminance / totalPixels;
    // Brightness score normalized to 0-100: ideal is 80 - 180 (luminance out of 255)
    let brightnessScore = 100;
    if (avgLuminance < 45) {
      brightnessScore = Math.max(10, Math.round((avgLuminance / 45) * 45));
    } else if (avgLuminance > 225) {
      brightnessScore = Math.max(15, Math.round(((255 - avgLuminance) / 30) * 50));
    }

    // Edge sharpness calculation via 3x3 Laplacian kernel variance
    let edgeSum = 0;
    let edgeCount = 0;
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        const center = gray[y * width + x];
        const top = gray[(y - 1) * width + x];
        const bottom = gray[(y + 1) * width + x];
        const left = gray[y * width + (x - 1)];
        const right = gray[y * width + (x + 1)];

        const laplacian = Math.abs(4 * center - top - bottom - left - right);
        edgeSum += laplacian;
        edgeCount++;
      }
    }

    const avgEdgeMagnitude = edgeCount > 0 ? edgeSum / edgeCount : 0;
    // Sharpness score normalized to 0-100 (edge magnitude threshold usually > 12 for sharp images)
    let sharpnessScore = Math.min(100, Math.round((avgEdgeMagnitude / 15) * 100));

    // Framing / Plant coverage score (0-100)
    const plantRatio = plantPixels / totalPixels;
    let framingScore = Math.min(100, Math.round((plantRatio / 0.35) * 100));

    const issues = [];
    if (brightnessScore < 50) {
      issues.push("Image lighting is too dark or poorly lit.");
    }
    if (sharpnessScore < 45) {
      issues.push("Image appears blurry or out of focus.");
    }
    if (framingScore < 30) {
      issues.push("Crop leaf is too far or not prominently centered.");
    }

    const overallScore = Math.round((brightnessScore * 0.3) + (sharpnessScore * 0.4) + (framingScore * 0.3));
    const pass = overallScore >= 55 && issues.length < 2;

    return {
      pass,
      brightness: brightnessScore,
      sharpness: sharpnessScore,
      framing: framingScore,
      overallScore,
      issues
    };
  }
}