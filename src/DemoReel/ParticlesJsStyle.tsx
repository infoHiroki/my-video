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
  shape: "circle" | "triangle" | "square" | "star";
  opacity: number;
}

const PARTICLE_COUNT = 80;
const LINE_DISTANCE = 150;
const WIDTH = 1920;
const HEIGHT = 1080;

// パーティクル初期化
const initParticles = (): Particle[] => {
  const shapes: Particle["shape"][] = ["circle", "triangle", "square", "star"];
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: random(`x-${i}`) * WIDTH,
    y: random(`y-${i}`) * HEIGHT,
    vx: (random(`vx-${i}`) - 0.5) * 4,
    vy: (random(`vy-${i}`) - 0.5) * 4,
    size: 2 + random(`size-${i}`) * 4,
    shape: shapes[Math.floor(random(`shape-${i}`) * shapes.length)],
    opacity: 0.3 + random(`opacity-${i}`) * 0.7,
  }));
};

const baseParticles = initParticles();

// フレームごとの位置計算（out_mode: out - 画面外に出たら反対側から出現）
const getPosition = (p: Particle, frame: number) => {
  let x = p.x + p.vx * frame;
  let y = p.y + p.vy * frame;

  // ループ処理
  x = ((x % WIDTH) + WIDTH) % WIDTH;
  y = ((y % HEIGHT) + HEIGHT) % HEIGHT;

  return { x, y };
};

// シェイプ描画コンポーネント
const Shape: React.FC<{
  shape: Particle["shape"];
  size: number;
  color: string;
}> = ({ shape, size, color }) => {
  switch (shape) {
    case "circle":
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
      );
    case "square":
      return (
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: color,
          }}
        />
      );
    case "triangle":
      return (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${size / 2}px solid transparent`,
            borderRight: `${size / 2}px solid transparent`,
            borderBottom: `${size}px solid ${color}`,
          }}
        />
      );
    case "star":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <polygon
            points="12,2 15,9 22,9 17,14 19,22 12,17 5,22 7,14 2,9 9,9"
            fill={color}
          />
        </svg>
      );
    default:
      return null;
  }
};

export const ParticlesJsStyle: React.FC = () => {
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

  // 線を描画するペアを計算（ユークリッド距離）
  const lines: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    alpha: number;
  }[] = [];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dx = positions[i].x - positions[j].x;
      const dy = positions[i].y - positions[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < LINE_DISTANCE) {
        lines.push({
          x1: positions[i].x,
          y1: positions[i].y,
          x2: positions[j].x,
          y2: positions[j].y,
          alpha: (1 - dist / LINE_DISTANCE) * 0.4,
        });
      }
    }
  }

  return (
    <AbsoluteFill
      style={{
        background: "#0a0a1a",
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
            textShadow: "0 0 20px rgba(255, 255, 255, 0.5)",
          }}
        >
          particles.js Style
        </span>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.5)",
            marginTop: 10,
            fontFamily: "Arial, sans-serif",
          }}
        >
          Multiple shapes with line_linked
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
            stroke={`rgba(255, 255, 255, ${line.alpha})`}
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
            opacity: p.opacity,
          }}
        >
          <Shape shape={p.shape} size={p.size} color="rgba(255, 255, 255, 0.8)" />
        </div>
      ))}

      {/* フレームカウンター */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 60,
          fontSize: 80,
          fontWeight: "bold",
          color: "rgba(255,255,255,0.08)",
          fontFamily: "monospace",
        }}
      >
        {String(frame).padStart(3, "0")}
      </div>
    </AbsoluteFill>
  );
};
