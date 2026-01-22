import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface Particle {
  id: number;
  angle: number;
  distance: number;
  stretchLength: number;
  delay: number;
  hue: number;
}

const PARTICLE_COUNT = 24;
const CENTER_X = 960;
const CENTER_Y = 540;

// パーティクル初期化
const initParticles = (): Particle[] => {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (360 / PARTICLE_COUNT) * i + random(`angle-${i}`) * 15,
    distance: 200 + random(`dist-${i}`) * 150,
    stretchLength: 2 + random(`stretch-${i}`) * 6,
    delay: Math.floor(random(`delay-${i}`) * 10),
    hue: 30 + random(`hue-${i}`) * 30, // 暖色系
  }));
};

const baseParticles = initParticles();

// メリハリのあるイージング
// 0-60%: ease-out で勢いよく飛び出す
// 60-100%: ease-in で余韻を持って減速
const merihariEasing = (t: number): number => {
  if (t < 0.6) {
    // ease-out: 最初速く、だんだん遅く
    const localT = t / 0.6;
    return Easing.out(Easing.cubic)(localT) * 0.9;
  } else {
    // ease-in: だんだん減速して停止
    const localT = (t - 0.6) / 0.4;
    return 0.9 + Easing.in(Easing.cubic)(localT) * 0.1;
  }
};

export const MerihariParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // タイトルのフェードイン
  const titleOpacity = spring({
    frame,
    fps,
    config: { damping: 20 },
  });

  // アニメーションサイクル（90フレーム = 3秒）
  const cycleLength = 90;
  const cycleFrame = frame % cycleLength;

  // 予備動作のスケール（最初の15フレームで縮む）
  const anticipationScale = interpolate(
    cycleFrame,
    [0, 15, 20],
    [1, 0.3, 1],
    {
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    }
  );

  // 中心のコア
  const coreScale = interpolate(
    cycleFrame,
    [0, 15, 20, 70, 90],
    [1, 1.5, 0.8, 0.8, 1],
    {
      extrapolateRight: "clamp",
    }
  );

  const coreGlow = interpolate(
    cycleFrame,
    [15, 25],
    [0, 1],
    {
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a15 100%)",
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
            textShadow: "0 0 20px rgba(255, 150, 50, 0.8)",
          }}
        >
          Merihari Particles
        </span>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.6)",
            marginTop: 10,
            fontFamily: "Arial, sans-serif",
          }}
        >
          予備動作 + 余韻 - Anticipation & Follow-through
        </div>
      </div>

      {/* 中心のコア（予備動作で膨らむ） */}
      <div
        style={{
          position: "absolute",
          left: CENTER_X - 30,
          top: CENTER_Y - 30,
          width: 60,
          height: 60,
          borderRadius: "50%",
          backgroundColor: `hsla(40, 100%, 60%, ${0.8 + coreGlow * 0.2})`,
          transform: `scale(${coreScale * anticipationScale})`,
          boxShadow: `
            0 0 ${20 + coreGlow * 40}px hsla(40, 100%, 50%, ${0.5 + coreGlow * 0.5}),
            0 0 ${40 + coreGlow * 80}px hsla(30, 100%, 50%, ${0.3 + coreGlow * 0.3})
          `,
        }}
      />

      {/* パーティクル */}
      {baseParticles.map((p) => {
        // 個別のディレイを適用
        const delayedFrame = Math.max(0, cycleFrame - p.delay - 20);
        const animDuration = 60;
        const progress = Math.min(1, delayedFrame / animDuration);

        // メリハリイージングを適用
        const easedProgress = merihariEasing(progress);

        // 現在の距離（中心から外へ）
        const currentDist = easedProgress * p.distance;

        // 引き伸ばし効果（60%の位置で最大）
        const stretchProgress = interpolate(
          progress,
          [0, 0.3, 0.6, 1],
          [1, p.stretchLength, p.stretchLength * 0.5, 1],
          { extrapolateRight: "clamp" }
        );

        // 角度をラジアンに
        const rad = (p.angle * Math.PI) / 180;
        const x = CENTER_X + Math.cos(rad) * currentDist;
        const y = CENTER_Y + Math.sin(rad) * currentDist;

        // フェードアウト（余韻）
        const opacity = interpolate(
          progress,
          [0, 0.1, 0.7, 1],
          [0, 1, 1, 0],
          { extrapolateRight: "clamp" }
        );

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: x - 5,
              top: y - 5,
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: `hsla(${p.hue}, 100%, 60%, ${opacity})`,
              transform: `
                rotate(${p.angle}deg)
                scaleX(${stretchProgress})
              `,
              transformOrigin: "center",
              boxShadow: `0 0 ${10 + stretchProgress * 5}px hsla(${p.hue}, 100%, 50%, ${opacity * 0.8})`,
            }}
          />
        );
      })}

      {/* サイクルインジケーター */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 10,
        }}
      >
        {["予備", "発射", "余韻"].map((label, i) => {
          const isActive =
            (i === 0 && cycleFrame < 20) ||
            (i === 1 && cycleFrame >= 20 && cycleFrame < 60) ||
            (i === 2 && cycleFrame >= 60);
          return (
            <div
              key={i}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                backgroundColor: isActive
                  ? "rgba(255, 150, 50, 0.8)"
                  : "rgba(255, 255, 255, 0.1)",
                color: isActive ? "white" : "rgba(255,255,255,0.5)",
                fontSize: 18,
                fontFamily: "Arial, sans-serif",
                transition: "all 0.2s",
              }}
            >
              {label}
            </div>
          );
        })}
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
