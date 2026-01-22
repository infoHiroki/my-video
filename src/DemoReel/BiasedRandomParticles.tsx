import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: "yellow" | "orange" | "red";
  hasBorder: boolean;
  hasTrail: boolean;
  delay: number;
}

const PARTICLE_COUNT = 60;
const WIDTH = 1920;
const HEIGHT = 1080;
const CENTER_X = 960;
const CENTER_Y = 540;

// 偏った乱数: 小さい値に集中
const biasedRandom = (seed: string): number => {
  const r = random(seed);
  return (r * r) ** 1.5; // ほとんどが0付近
};

// 出現率テーブルで色を選択
const pickColor = (seed: string): "yellow" | "orange" | "red" => {
  const colorTable = [
    { color: "yellow" as const, weight: 70 },
    { color: "orange" as const, weight: 20 },
    { color: "red" as const, weight: 10 }, // レア
  ];
  const total = colorTable.reduce((sum, item) => sum + item.weight, 0);
  let r = random(seed) * total;
  for (const item of colorTable) {
    r -= item.weight;
    if (r <= 0) return item.color;
  }
  return "yellow";
};

// 配列からランダムにN個選ぶ
const pickRandomN = <T,>(
  items: T[],
  count: number,
  seedPrefix: string
): Set<number> => {
  const indices = items.map((_, i) => i);
  const shuffled = indices
    .map((idx) => ({ order: random(`${seedPrefix}-${idx}`), idx }))
    .sort((a, b) => a.order - b.order)
    .map((w) => w.idx);
  return new Set(shuffled.slice(0, count));
};

// パーティクル初期化
const initParticles = (): Particle[] => {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: 0,
    y: 0,
    size: 0,
    color: pickColor(`color-${i}`),
    hasBorder: false,
    hasTrail: false,
    delay: Math.floor(random(`delay-${i}`) * 20),
  }));

  // 偏った乱数で飛距離を決定（ほとんどが近く、たまに遠い）
  particles.forEach((p, i) => {
    const angle = random(`angle-${i}`) * Math.PI * 2;
    const distBias = biasedRandom(`dist-${i}`);
    const distance = 100 + distBias * 350; // 100〜450、ほとんどが100付近
    p.x = CENTER_X + Math.cos(angle) * distance;
    p.y = CENTER_Y + Math.sin(angle) * distance;
    // サイズも偏った分布（小さいものが多い）
    p.size = 4 + (1 - biasedRandom(`size-${i}`)) * 16; // 逆にすると大きいものが多い
  });

  // 個数を決めてランダムに選ぶ
  const bigParticles = pickRandomN(particles, Math.round(PARTICLE_COUNT * 0.15), "big");
  const borderParticles = pickRandomN(particles, Math.round(PARTICLE_COUNT * 0.2), "border");
  const trailParticles = pickRandomN(particles, Math.round(PARTICLE_COUNT * 0.25), "trail");

  particles.forEach((p, i) => {
    if (bigParticles.has(i)) {
      p.size *= 2.5;
    }
    if (borderParticles.has(i)) {
      p.hasBorder = true;
    }
    if (trailParticles.has(i)) {
      p.hasTrail = true;
    }
  });

  return particles;
};

const baseParticles = initParticles();

const colorValues = {
  yellow: { h: 50, s: 100, l: 60 },
  orange: { h: 30, s: 100, l: 55 },
  red: { h: 0, s: 100, l: 50 },
};

export const BiasedRandomParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // タイトルのフェードイン
  const titleOpacity = spring({
    frame,
    fps,
    config: { damping: 20 },
  });

  // アニメーションサイクル（120フレーム = 4秒）
  const cycleLength = 120;
  const cycleFrame = frame % cycleLength;

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at center, #1a1520 0%, #0a0810 100%)",
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
            textShadow: "0 0 20px rgba(255, 200, 50, 0.8)",
          }}
        >
          Biased Random
        </span>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.6)",
            marginTop: 10,
            fontFamily: "Arial, sans-serif",
          }}
        >
          偏った乱数 - Weighted probability & skewed distribution
        </div>
      </div>

      {/* 凡例 */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 60,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          opacity: titleOpacity,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: "hsl(50, 100%, 60%)",
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>
            Yellow (70%)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: "hsl(30, 100%, 55%)",
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>
            Orange (20%)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: "hsl(0, 100%, 50%)",
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>
            Red (10%) - Rare!
          </span>
        </div>
      </div>

      {/* 中心の発射点 */}
      <div
        style={{
          position: "absolute",
          left: CENTER_X - 20,
          top: CENTER_Y - 20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          boxShadow: "0 0 30px rgba(255, 200, 50, 0.5)",
        }}
      />

      {/* パーティクル */}
      {baseParticles.map((p) => {
        const delayedFrame = Math.max(0, cycleFrame - p.delay);
        const progress = Math.min(1, delayedFrame / 80);

        // 中心から外への移動
        const currentX = interpolate(
          progress,
          [0, 1],
          [CENTER_X, p.x]
        );
        const currentY = interpolate(
          progress,
          [0, 1],
          [CENTER_Y, p.y]
        );

        // フェードイン・アウト
        const opacity = interpolate(
          progress,
          [0, 0.1, 0.7, 1],
          [0, 1, 1, 0.3]
        );

        const { h, s, l } = colorValues[p.color];

        return (
          <div key={p.id}>
            {/* 残像（hasTrailがtrueの場合） */}
            {p.hasTrail && progress > 0.1 && progress < 0.9 && (
              <div
                style={{
                  position: "absolute",
                  left: interpolate(progress, [0, 1], [CENTER_X, p.x]) - p.size / 2,
                  top: interpolate(progress, [0, 1], [CENTER_Y, p.y]) - p.size / 2,
                  width: p.size,
                  height: p.size,
                  borderRadius: "50%",
                  backgroundColor: `hsla(${h}, ${s}%, ${l}%, 0.3)`,
                  filter: "blur(4px)",
                  transform: `scale(${1 + (1 - progress) * 0.5})`,
                }}
              />
            )}
            {/* メインパーティクル */}
            <div
              style={{
                position: "absolute",
                left: currentX - p.size / 2,
                top: currentY - p.size / 2,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                backgroundColor: p.hasBorder
                  ? "transparent"
                  : `hsla(${h}, ${s}%, ${l}%, ${opacity})`,
                border: p.hasBorder
                  ? `2px solid hsla(${h}, ${s}%, ${l}%, ${opacity})`
                  : "none",
                boxShadow: `0 0 ${p.size}px hsla(${h}, ${s}%, ${l}%, ${opacity * 0.6})`,
              }}
            />
          </div>
        );
      })}

      {/* 分布の説明 */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          width: "100%",
          textAlign: "center",
          opacity: titleOpacity * 0.8,
        }}
      >
        <span
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "monospace",
          }}
        >
          dist = 100 + (r * r)^1.5 * 350 — ほとんどが中心付近、たまに遠くへ
        </span>
      </div>

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
        {String(cycleFrame).padStart(3, "0")}
      </div>
    </AbsoluteFill>
  );
};
