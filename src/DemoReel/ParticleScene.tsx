import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  delay: number;
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#74b9ff", "#fd79a8"];

// シード付きランダムでパーティクルを生成
const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: random(`x-${i}`) * 1920,
    y: random(`y-${i}`) * 1080,
    size: 5 + random(`size-${i}`) * 25,
    color: COLORS[Math.floor(random(`color-${i}`) * COLORS.length)],
    speed: 0.5 + random(`speed-${i}`) * 2,
    delay: random(`delay-${i}`) * 30,
  }));
};

const particles = generateParticles(80);

export const ParticleScene: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig(); // for consistency

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 100%)",
        overflow: "hidden",
      }}
    >
      {/* パーティクル */}
      {particles.map((p) => {
        const activeFrame = frame - p.delay;
        if (activeFrame < 0) return null;

        // 浮遊アニメーション
        const floatY = Math.sin(activeFrame * 0.05 * p.speed) * 50;
        const floatX = Math.cos(activeFrame * 0.03 * p.speed) * 30;

        // フェードイン
        const opacity = interpolate(activeFrame, [0, 20], [0, 0.8], {
          extrapolateRight: "clamp",
        });

        // パルスアニメーション
        const pulse = 1 + Math.sin(activeFrame * 0.1 * p.speed) * 0.3;

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.x + floatX,
              top: p.y + floatY,
              width: p.size * pulse,
              height: p.size * pulse,
              borderRadius: "50%",
              backgroundColor: p.color,
              opacity,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              filter: "blur(1px)",
            }}
          />
        );
      })}

      {/* 中央のテキスト */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: "bold",
            color: "white",
            fontFamily: "Arial, sans-serif",
            textShadow: "0 0 40px rgba(255,255,255,0.5)",
            opacity: interpolate(frame, [0, 30], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          random() + Loops
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "Arial, sans-serif",
            marginTop: 20,
            opacity: interpolate(frame, [20, 50], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {particles.length} particles with deterministic randomness
        </div>
      </div>

      {/* コーナーに数字カウンター */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 60,
          fontSize: 120,
          fontWeight: "bold",
          color: "rgba(255,255,255,0.1)",
          fontFamily: "monospace",
        }}
      >
        {String(Math.floor(frame)).padStart(3, "0")}
      </div>
    </AbsoluteFill>
  );
};
