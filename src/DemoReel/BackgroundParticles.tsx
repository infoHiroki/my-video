import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;

// 背景パーティクルの種類
type ParticleLayer = "far" | "mid" | "near";

interface BackgroundParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  layer: ParticleLayer;
  twinkleSpeed: number;
  twinkleOffset: number;
  driftX: number;
  driftY: number;
}

// レイヤーごとの設定
const layerConfig = {
  far: { count: 100, sizeRange: [1, 2], opacity: 0.3, speed: 0.2 },
  mid: { count: 50, sizeRange: [2, 4], opacity: 0.5, speed: 0.5 },
  near: { count: 20, sizeRange: [3, 6], opacity: 0.8, speed: 1 },
};

// パーティクル初期化
const initParticles = (): BackgroundParticle[] => {
  const particles: BackgroundParticle[] = [];
  let id = 0;

  (["far", "mid", "near"] as ParticleLayer[]).forEach((layer) => {
    const config = layerConfig[layer];
    for (let i = 0; i < config.count; i++) {
      particles.push({
        id: id++,
        x: random(`x-${layer}-${i}`) * WIDTH,
        y: random(`y-${layer}-${i}`) * HEIGHT,
        size:
          config.sizeRange[0] +
          random(`size-${layer}-${i}`) * (config.sizeRange[1] - config.sizeRange[0]),
        layer,
        twinkleSpeed: 0.5 + random(`twinkle-${layer}-${i}`) * 2,
        twinkleOffset: random(`offset-${layer}-${i}`) * Math.PI * 2,
        driftX: (random(`driftX-${layer}-${i}`) - 0.5) * config.speed,
        driftY: (random(`driftY-${layer}-${i}`) - 0.5) * config.speed * 0.5,
      });
    }
  });

  return particles;
};

const particles = initParticles();

export const BackgroundParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // タイトルのフェードイン
  const titleOpacity = spring({
    frame,
    fps,
    config: { damping: 20 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a0a15 0%, #151525 50%, #0a0a15 100%)",
      }}
    >
      {/* パーティクルレイヤー */}
      {particles.map((p) => {
        const config = layerConfig[p.layer];

        // 位置（ゆっくりドリフト）
        let x = p.x + p.driftX * frame;
        let y = p.y + p.driftY * frame;

        // 画面端でループ
        x = ((x % WIDTH) + WIDTH) % WIDTH;
        y = ((y % HEIGHT) + HEIGHT) % HEIGHT;

        // 瞬き効果（sin波）
        const twinkle =
          0.5 + 0.5 * Math.sin(frame * 0.1 * p.twinkleSpeed + p.twinkleOffset);

        const opacity = config.opacity * twinkle;

        // 近いものほど大きく、明るく
        const glowSize = p.layer === "near" ? p.size * 3 : p.size * 2;

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: x - p.size / 2,
              top: y - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: `rgba(255, 255, 255, ${opacity})`,
              boxShadow:
                p.layer === "near"
                  ? `0 0 ${glowSize}px rgba(200, 220, 255, ${opacity * 0.5})`
                  : undefined,
            }}
          />
        );
      })}

      {/* タイトル（コンテンツの例として） */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: titleOpacity,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: "bold",
            color: "white",
            fontFamily: "Arial, sans-serif",
            letterSpacing: 5,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.5)",
          }}
        >
          Background Particles
        </span>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.6)",
            marginTop: 20,
            fontFamily: "Arial, sans-serif",
          }}
        >
          背景効果 - Starfield / Dust / Ambient
        </div>
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.4)",
            marginTop: 30,
            fontFamily: "Arial, sans-serif",
          }}
        >
          3 layers: Far (100) • Mid (50) • Near (20)
        </div>
      </div>

      {/* レイヤー情報（左下） */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 60,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          opacity: titleOpacity * 0.7,
        }}
      >
        {(["far", "mid", "near"] as ParticleLayer[]).map((layer) => {
          const config = layerConfig[layer];
          return (
            <div
              key={layer}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: config.sizeRange[1] * 2,
                  height: config.sizeRange[1] * 2,
                  borderRadius: "50%",
                  backgroundColor: `rgba(255, 255, 255, ${config.opacity})`,
                  boxShadow:
                    layer === "near"
                      ? `0 0 8px rgba(200, 220, 255, 0.5)`
                      : undefined,
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "monospace",
                }}
              >
                {layer.toUpperCase()}: {config.count} particles, opacity{" "}
                {config.opacity}
              </span>
            </div>
          );
        })}
      </div>

      {/* パララックス説明（右下） */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          right: 60,
          textAlign: "right",
          opacity: titleOpacity * 0.5,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.4)",
            fontFamily: "monospace",
          }}
        >
          Parallax effect:
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "monospace",
            marginTop: 4,
          }}
        >
          far: slow drift
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "monospace",
          }}
        >
          mid: medium drift
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "monospace",
          }}
        >
          near: fast drift + glow
        </div>
      </div>

      {/* フレームカウンター */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 60,
          fontSize: 80,
          fontWeight: "bold",
          color: "rgba(255,255,255,0.05)",
          fontFamily: "monospace",
        }}
      >
        {String(frame).padStart(3, "0")}
      </div>
    </AbsoluteFill>
  );
};
