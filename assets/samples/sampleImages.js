// sampleImages.js - High-fidelity visual SVG representations for quick 1-click testing
export const sampleImages = {
  earlyBlight: {
    id: "earlyBlight",
    name: "Tomato Early Blight",
    crop: "Tomato",
    condition: "Early Blight (Alternaria solani)",
    fileSize: "1.4 MB",
    filename: "tomato_early_blight_sample.jpg",
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="%23d8eedb" />
          <stop offset="100%" stop-color="%23b8d8be" />
        </radialGradient>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%236ba832" />
          <stop offset="50%" stop-color="%234d8520" />
          <stop offset="100%" stop-color="%233a6b16" />
        </linearGradient>
        <radialGradient id="lesion1" cx="45%" cy="45%" r="50%">
          <stop offset="0%" stop-color="%233b200b" />
          <stop offset="40%" stop-color="%23633814" />
          <stop offset="70%" stop-color="%23a87024" />
          <stop offset="90%" stop-color="%23d4b126" />
          <stop offset="100%" stop-color="%234d8520" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="lesion2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%232b1606" />
          <stop offset="45%" stop-color="%23572d0d" />
          <stop offset="75%" stop-color="%23966519" />
          <stop offset="92%" stop-color="%23cfa721" />
          <stop offset="100%" stop-color="%234d8520" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="lesion3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%2342240e" />
          <stop offset="50%" stop-color="%236e3c15" />
          <stop offset="80%" stop-color="%23bd8a28" />
          <stop offset="100%" stop-color="%234d8520" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="500" height="500" fill="url(%23bgGrad)" />
      <!-- Soil & background texture -->
      <circle cx="80" cy="420" r="140" fill="%23a38b6d" opacity="0.15" />
      <circle cx="430" cy="90" r="120" fill="%238fa372" opacity="0.2" />
      
      <!-- Stem -->
      <path d="M 245 490 Q 250 320 250 180" stroke="%234b7322" stroke-width="12" fill="none" stroke-linecap="round" />
      <path d="M 250 320 Q 340 300 390 280" stroke="%23568228" stroke-width="7" fill="none" stroke-linecap="round" />
      <path d="M 248 240 Q 170 210 110 190" stroke="%23568228" stroke-width="6" fill="none" stroke-linecap="round" />

      <!-- Main Leaf Blade -->
      <path d="M 250 120 C 340 80 430 190 380 340 C 340 430 250 420 250 420 C 250 420 160 430 120 340 C 70 190 160 80 250 120 Z" 
            fill="url(%23leafGrad)" filter="drop-shadow(3px 8px 12px rgba(0,0,0,0.18))" />
      
      <!-- Veins -->
      <path d="M 250 400 L 250 140" stroke="%237db83c" stroke-width="4" opacity="0.8" />
      <path d="M 250 350 Q 310 320 350 330" stroke="%237db83c" stroke-width="2.5" opacity="0.7" />
      <path d="M 250 350 Q 190 320 150 330" stroke="%237db83c" stroke-width="2.5" opacity="0.7" />
      <path d="M 250 290 Q 330 250 370 240" stroke="%237db83c" stroke-width="2.5" opacity="0.7" />
      <path d="M 250 290 Q 170 250 130 240" stroke="%237db83c" stroke-width="2.5" opacity="0.7" />
      <path d="M 250 230 Q 320 190 350 170" stroke="%237db83c" stroke-width="2" opacity="0.7" />
      <path d="M 250 230 Q 180 190 150 170" stroke="%237db83c" stroke-width="2" opacity="0.7" />

      <!-- Early Blight Necrotic Lesions with Concentric Target Rings -->
      <!-- Lesion 1 (Upper Right) -->
      <ellipse cx="320" cy="220" rx="52" ry="44" fill="url(%23lesion1)" />
      <circle cx="320" cy="220" r="30" stroke="%232b1606" stroke-width="2" fill="none" opacity="0.6" stroke-dasharray="4 2" />
      <circle cx="320" cy="220" r="18" stroke="%23241205" stroke-width="2.5" fill="none" opacity="0.8" />
      <circle cx="320" cy="220" r="8" fill="%231a0c03" />

      <!-- Lesion 2 (Lower Left) -->
      <ellipse cx="185" cy="300" rx="46" ry="38" fill="url(%23lesion2)" />
      <circle cx="185" cy="300" r="26" stroke="%23261304" stroke-width="2" fill="none" opacity="0.6" stroke-dasharray="3 2" />
      <circle cx="185" cy="300" r="14" stroke="%231f0f03" stroke-width="2" fill="none" opacity="0.8" />
      <circle cx="185" cy="300" r="6" fill="%23140902" />

      <!-- Lesion 3 (Tip / Margin) -->
      <ellipse cx="230" cy="155" rx="30" ry="24" fill="url(%23lesion3)" />
      <circle cx="230" cy="155" r="12" stroke="%23241205" stroke-width="1.8" fill="none" opacity="0.7" />

      <!-- Margin Yellowing / Chlorosis -->
      <path d="M 370 250 Q 390 300 360 360" stroke="%23d6b029" stroke-width="14" fill="none" opacity="0.5" stroke-linecap="round" />
      <path d="M 130 260 Q 110 310 140 360" stroke="%23d6b029" stroke-width="12" fill="none" opacity="0.45" stroke-linecap="round" />
    </svg>`,
    quality: { pass: true, brightness: 84, sharpness: 92, leafCoverage: 88 }
  },

  healthyTomato: {
    id: "healthyTomato",
    name: "Healthy Tomato Leaf",
    crop: "Tomato",
    condition: "Healthy (No pathogen detected)",
    fileSize: "1.2 MB",
    filename: "healthy_tomato_sample.jpg",
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="hBgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="%23e4f3e6" />
          <stop offset="100%" stop-color="%23c5e6ca" />
        </radialGradient>
        <linearGradient id="healthyLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%2356ab2f" />
          <stop offset="50%" stop-color="%233f8e21" />
          <stop offset="100%" stop-color="%23276612" />
        </linearGradient>
      </defs>
      <rect width="500" height="500" fill="url(%23hBgGrad)" />
      <circle cx="250" cy="250" r="230" fill="%2343a047" opacity="0.05" />
      
      <!-- Stem -->
      <path d="M 250 490 Q 252 330 250 150" stroke="%233e751d" stroke-width="11" fill="none" stroke-linecap="round" />
      
      <!-- Healthy Leaf Blade -->
      <path d="M 250 110 C 350 70 440 180 390 330 C 350 420 250 420 250 420 C 250 420 150 420 110 330 C 60 180 150 70 250 110 Z" 
            fill="url(%23healthyLeafGrad)" filter="drop-shadow(4px 10px 14px rgba(27,67,50,0.2))" />
      
      <!-- Crisp Healthy Veins -->
      <path d="M 250 410 L 250 120" stroke="%238de34b" stroke-width="4.5" opacity="0.85" />
      <path d="M 250 360 Q 320 325 365 330" stroke="%238de34b" stroke-width="3" opacity="0.75" />
      <path d="M 250 360 Q 180 325 135 330" stroke="%238de34b" stroke-width="3" opacity="0.75" />
      <path d="M 250 295 Q 335 255 375 240" stroke="%238de34b" stroke-width="3" opacity="0.75" />
      <path d="M 250 295 Q 165 255 125 240" stroke="%238de34b" stroke-width="3" opacity="0.75" />
      <path d="M 250 230 Q 325 185 355 165" stroke="%238de34b" stroke-width="2.5" opacity="0.75" />
      <path d="M 250 230 Q 175 185 145 165" stroke="%238de34b" stroke-width="2.5" opacity="0.75" />
      <path d="M 250 170 Q 300 135 320 125" stroke="%238de34b" stroke-width="2" opacity="0.7" />
      <path d="M 250 170 Q 200 135 180 125" stroke="%238de34b" stroke-width="2" opacity="0.7" />

      <!-- Natural Leaf Highlights (Gloss / Wax) -->
      <path d="M 270 140 C 310 160 330 220 310 260" stroke="%23a4f26b" stroke-width="8" fill="none" opacity="0.25" stroke-linecap="round" />
      <path d="M 210 230 C 180 270 180 330 210 360" stroke="%23a4f26b" stroke-width="7" fill="none" opacity="0.2" stroke-linecap="round" />
    </svg>`,
    quality: { pass: true, brightness: 88, sharpness: 95, leafCoverage: 92 }
  },

  blurryDark: {
    id: "blurryDark",
    name: "Low Quality (Dark / Blurry)",
    crop: "Unknown / Low Contrast",
    condition: "Unsuitable for AI Analysis",
    fileSize: "0.8 MB",
    filename: "poor_lighting_blurry_leaf.jpg",
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <radialGradient id="darkBg" cx="30%" cy="30%" r="80%">
          <stop offset="0%" stop-color="%232c3328" />
          <stop offset="100%" stop-color="%230f140d" />
        </radialGradient>
      </defs>
      <rect width="500" height="500" fill="url(%23darkBg)" />
      
      <!-- Out of focus indistinct shape with severe blur -->
      <g filter="url(%23blurFilter)" opacity="0.5">
        <ellipse cx="230" cy="270" rx="140" ry="170" fill="%23253b1e" transform="rotate(-15 230 270)" />
        <ellipse cx="260" cy="240" rx="90" ry="120" fill="%231a2915" />
        <circle cx="210" cy="240" r="40" fill="%2317130b" />
        <circle cx="270" cy="290" r="50" fill="%23120f09" />
      </g>
      
      <!-- Camera noise simulation dots -->
      <circle cx="120" cy="80" r="1.5" fill="%23666" opacity="0.4" />
      <circle cx="340" cy="120" r="1.5" fill="%23555" opacity="0.4" />
      <circle cx="410" cy="380" r="2" fill="%23666" opacity="0.3" />
      <circle cx="70" cy="420" r="1.8" fill="%23555" opacity="0.4" />
      <circle cx="280" cy="460" r="1.5" fill="%23666" opacity="0.3" />
      
      <!-- Text badge on preview for clarity -->
      <rect x="130" y="440" width="240" height="34" rx="17" fill="rgba(0,0,0,0.6)" />
      <text x="250" y="462" fill="%23ff9999" font-family="sans-serif" font-size="13" text-anchor="middle" font-weight="600">Low Light / Blur Detected</text>
    </svg>`,
    quality: { pass: false, brightness: 28, sharpness: 24, leafCoverage: 35, reason: "Image is underexposed with severe blur" }
  },

  potatoLateBlight: {
    id: "potatoLateBlight",
    name: "Potato Late Blight",
    crop: "Potato",
    condition: "Late Blight (Phytophthora infestans)",
    fileSize: "1.5 MB",
    filename: "potato_late_blight_sample.jpg",
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="pBg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="%23ebe5d8" />
          <stop offset="100%" stop-color="%23d6cbba" />
        </radialGradient>
        <linearGradient id="potatoLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%234f7a28" />
          <stop offset="60%" stop-color="%233e6120" />
          <stop offset="100%" stop-color="%232b4516" />
        </linearGradient>
        <radialGradient id="waterSoaked" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%231a1208" />
          <stop offset="60%" stop-color="%233d2a13" />
          <stop offset="85%" stop-color="%23695222" />
          <stop offset="98%" stop-color="%23c2a632" />
          <stop offset="100%" stop-color="%233e6120" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="500" height="500" fill="url(%23pBg)" />
      
      <!-- Stem -->
      <path d="M 250 490 Q 248 350 250 180" stroke="%23486324" stroke-width="12" fill="none" stroke-linecap="round" />
      
      <!-- Broad Potato Leaf Blade -->
      <path d="M 250 140 C 370 100 440 210 390 350 C 340 430 250 420 250 420 C 250 420 160 430 110 350 C 60 210 130 100 250 140 Z" 
            fill="url(%23potatoLeaf)" filter="drop-shadow(4px 8px 14px rgba(0,0,0,0.2))" />
      
      <!-- Veins -->
      <path d="M 250 410 L 250 150" stroke="%23769c3a" stroke-width="4" opacity="0.8" />
      <path d="M 250 350 Q 320 320 370 330" stroke="%23769c3a" stroke-width="2.5" opacity="0.7" />
      <path d="M 250 350 Q 180 320 130 330" stroke="%23769c3a" stroke-width="2.5" opacity="0.7" />
      <path d="M 250 270 Q 340 230 380 230" stroke="%23769c3a" stroke-width="2.5" opacity="0.7" />
      <path d="M 250 270 Q 160 230 120 230" stroke="%23769c3a" stroke-width="2.5" opacity="0.7" />

      <!-- Large Irregular Water-soaked Late Blight Necrosis -->
      <path d="M 290 190 C 360 170 410 240 370 310 C 330 330 300 280 280 250 C 260 220 270 200 290 190 Z" fill="url(%23waterSoaked)" />
      
      <!-- Secondary lesion on leaf tip -->
      <ellipse cx="230" cy="170" rx="42" ry="28" fill="url(%23waterSoaked)" transform="rotate(-15 230 170)" />
      
      <!-- Pale fungal mildew border simulation -->
      <path d="M 275 250 C 300 290 330 310 365 295" stroke="%23f0f0d8" stroke-width="2.5" stroke-dasharray="3 3" fill="none" opacity="0.8" />
    </svg>`,
    quality: { pass: true, brightness: 81, sharpness: 90, leafCoverage: 89 }
  },

  uncertainSample: {
    id: "uncertainSample",
    name: "Uncertain / Ambiguous Foliage",
    crop: "Mixed Foliage",
    condition: "Low Confidence Condition",
    fileSize: "1.1 MB",
    filename: "ambiguous_foliage_sample.jpg",
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <linearGradient id="unBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23eae7dc" />
          <stop offset="100%" stop-color="%23d8d3c5" />
        </linearGradient>
      </defs>
      <rect width="500" height="500" fill="url(%23unBg)" />
      
      <!-- Overlapping partial leaves with soil and shadows -->
      <path d="M 80 180 C 180 140 280 160 300 260 C 270 350 180 340 120 300 Z" fill="%235a823e" opacity="0.7" />
      <path d="M 220 210 C 320 180 420 220 400 350 C 330 420 240 380 200 310 Z" fill="%23436d2c" opacity="0.6" />
      
      <!-- Random dirt dust / minor blemishes (not distinct disease symptoms) -->
      <circle cx="210" cy="230" r="5" fill="%23826d48" opacity="0.6" />
      <circle cx="240" cy="270" r="3" fill="%23826d48" opacity="0.6" />
      <circle cx="290" cy="240" r="4" fill="%23826d48" opacity="0.5" />
      <circle cx="160" cy="260" r="6" fill="%23826d48" opacity="0.4" />
      
      <!-- High glare area -->
      <ellipse cx="260" cy="280" rx="60" ry="30" fill="%23ffffff" opacity="0.25" transform="rotate(-25 260 280)" />
    </svg>`,
    quality: { pass: true, brightness: 76, sharpness: 78, leafCoverage: 74 }
  }
};
