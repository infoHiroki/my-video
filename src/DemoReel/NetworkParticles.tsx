import {
  AbsoluteFill,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const PARTICLE_COUNT = 50;
const LINE_DISTANCE = 180;
const WIDTH = 1920;
const HEIGHT = 1080;

// 初期パーティクル生成（決定論的）
const initParticles = (): Particle[] => {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: random(`x-${i}`) * WIDTH,
    y: random(`y-${i}`) * HEIGHT,
    vx: (random(`vx-${i}`) - 0.5) * 3,
    vy: (random(`vy-${i}`) - 0.5) * 3,
    size: 3 + random(`size-${i}`) * 3,
  }));
};

const baseParticles = initParticles();

// フレームごとの位置計算（跳ね返り付き）
const getPosition = (p: Particle, frame: number) => {
  let x = p.x;
  let y = p.y;
  let vx = p.vx;
  let vy = p.vy;

  for (let f = 0; f < frame; f++) {
    x += vx;
    y += vy;

    // 跳ね返り
    if (x < 0 || x > WIDTH) {
      vx *= -1;
      x = Math.max(0, Math.min(WIDTH, x));
    }
    if (y < 0 || y > HEIGHT) {
      vy *= -1;
      y = Math.max(0, Math.min(HEIGHT, y));
    }
  }

  return { x, y };
};

export const NetworkParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // タイトルのフェードイン
  const titleOpacity = spring({
    frame,
    fps,
    config: { damping: 20 },
  });

  // 現在フレームの位置を計算
  const positions = baseParticles.map((p) => ({
    ...p,
    ...getPosition(p, frame),
  }));

  // 線を描画するペアを計算（マンハッタン距離）
  const lines: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    alpha: number;
  }[] = [];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dist =
        Math.abs(positions[i].x - positions[j].x) +
        Math.abs(positions[i].y - positions[j].y);

      if (dist < LINE_DISTANCE) {
        lines.push({
          x1: positions[i].x,
          y1: positions[i].y,
          x2: positions[j].x,
          y2: positions[j].y,
          alpha: (1 - dist / LINE_DISTANCE) * 0.6,
        });
      }
    }
  }

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0c1445 0%, #1a1a2e 50%, #16213e 100%)",
      }}
    >
      {/* タイトル */}
      <div
        style={{
          position: "absolute",
          top: 60,
          width: "100%",
          textAlign: "center",
          opacity: titleOpacity,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: 52,
            fontWeight: "bold",
            color: "white",
            fontFamily: "Arial, sans-serif",
            letterSpacing: 3,
            textShadow: "0 0 20px rgba(100, 150, 255, 0.8)",
          }}
        >
          Network Particles
        </span>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.6)",
            marginTop: 10,
            fontFamily: "Arial, sans-serif",
          }}
        >
          particles.js style - connected by distance
        </div>
      </div>

      {/* 線（SVG） */}
      <svg
        width={WIDTH}
        height={HEIGHT}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {lines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={`rgba(100, 180, 255, ${line.alpha})`}
            strokeWidth={1}
          />
        ))}
      </svg>

      {/* パーティクル */}
      {positions.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x - p.size / 2,
            top: p.y - p.size / 2,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: "rgba(150, 200, 255, 0.9)",
            boxShadow: "0 0 10px rgba(100, 180, 255, 0.8)",
          }}
        />
      ))}

      {/* フレームカウンター */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 60,
          fontSize: 80,
          fontWeight: "bold",
          color: "rgba(255,255,255,0.1)",
          fontFamily: "monospace",
        }}
      >
        {String(frame).padStart(3, "0")}
      </div>
    </AbsoluteFill>
  );
};
