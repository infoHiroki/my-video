import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface RingParticle {
  id: number;
  rotation: number;      // 初期角度
  rotationSpeed: number; // 回転速度
  hue: number;           // 色相
  delay: number;         // 出現遅延
  size: number;          // サイズ
}

// リングパーティクルを生成
const generateRingParticles = (count: number): RingParticle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    rotation: random(`rot-${i}`) * 360,
    rotationSpeed: (random(`speed-${i}`) - 0.5) * 20, // -10 ~ 10
    hue: random(`hue-${i}`) * 360,
    delay: random(`delay-${i}`) * 20,
    size: 80 + random(`size-${i}`) * 40,
  }));
};

const RING_COUNT = 15;
const ringParticles = generateRingParticles(RING_COUNT);

// 単一のリングパーティクル
const RingParticleComponent: React.FC<{
  particle: RingParticle;
  lifetime: number;
}> = ({ particle, lifetime }) => {
  const frame = useCurrentFrame();

  const activeFrame = frame - particle.delay;
  if (activeFrame < 0) return null;

  // ループ: lifetime経過で再生成
  const loopFrame = activeFrame % lifetime;
  const progress = loopFrame / lifetime;

  // フェードイン/アウト（じわっと現れ、じわっと消える）
  const opacity = progress < 0.3
    ? interpolate(progress, [0, 0.3], [0, 0.8])
    : progress > 0.7
      ? interpolate(progress, [0.7, 1], [0.8, 0])
      : 0.8;

  // サイズ変化（拡大しながら現れる）
  const scale = interpolate(progress, [0, 0.3, 1], [0.3, 1, 1.2], {
    extrapolateRight: "clamp",
  });

  // 回転
  const rotation = particle.rotation + activeFrame * particle.rotationSpeed * 0.1;

  // 虹色（時間で少し変化）
  const hue = (particle.hue + activeFrame * 0.5) % 360;

  return (
    <div
      style={{
        position: "absolute",
        width: particle.size,
        height: particle.size,
        borderRadius: "50%",
        border: `3px solid hsla(${hue}, 80%, 60%, ${opacity})`,
        boxShadow: `
          0 0 20px hsla(${hue}, 80%, 60%, ${opacity * 0.5}),
          inset 0 0 20px hsla(${hue}, 80%, 60%, ${opacity * 0.3})
        `,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        left: "50%",
        top: "50%",
        marginLeft: -particle.size / 2,
        marginTop: -particle.size / 2,
      }}
    />
  );
};

// 内側のグロー粒子
interface GlowParticle {
  id: number;
  angle: number;
  distance: number;
  hue: number;
  size: number;
  speed: number;
}

const generateGlowParticles = (count: number): GlowParticle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: random(`angle-${i}`) * Math.PI * 2,
    distance: 10 + random(`dist-${i}`) * 30,
    hue: random(`ghue-${i}`) * 360,
    size: 5 + random(`gsize-${i}`) * 15,
    speed: 0.02 + random(`gspeed-${i}`) * 0.03,
  }));
};

const GLOW_COUNT = 30;
const glowParticles = generateGlowParticles(GLOW_COUNT);

const GlowParticleComponent: React.FC<{ particle: GlowParticle }> = ({
  particle,
}) => {
  const frame = useCurrentFrame();

  // 円運動
  const angle = particle.angle + frame * particle.speed;
  const x = Math.cos(angle) * particle.distance;
  const y = Math.sin(angle) * particle.distance;

  // パルス
  const pulse = 1 + Math.sin(frame * 0.1 + particle.id) * 0.3;

  // 色変化
  const hue = (particle.hue + frame * 0.3) % 360;

  return (
    <div
      style={{
        position: "absolute",
        width: particle.size * pulse,
        height: particle.size * pulse,
        borderRadius: "50%",
        backgroundColor: `hsla(${hue}, 90%, 70%, 0.8)`,
        boxShadow: `0 0 ${particle.size * 2}px hsla(${hue}, 90%, 60%, 0.6)`,
        left: "50%",
        top: "50%",
        transform: `translate(${x - particle.size / 2}px, ${y - particle.size / 2}px)`,
      }}
    />
  );
};

// メインのオーブコンポーネント
export const RainbowOrb: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 全体のパルス
  const globalPulse = 1 + Math.sin(frame * 0.05) * 0.05;

  // 中心のコアグロー
  const coreHue = (frame * 2) % 360;

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a15 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* タイトル */}
      <div
        style={{
          position: "absolute",
          top: 80,
          width: "100%",
          textAlign: "center",
          opacity: spring({ frame, fps, config: { damping: 20 } }),
        }}
      >
        <span
          style={{
            fontSize: 48,
            color: "white",
            fontFamily: "Arial, sans-serif",
            letterSpacing: 5,
            textShadow: "0 0 20px rgba(255,255,255,0.5)",
          }}
        >
          Rainbow Energy Orb
        </span>
      </div>

      {/* オーブ本体 */}
      <div
        style={{
          position: "relative",
          width: 300,
          height: 300,
          transform: `scale(${globalPulse})`,
        }}
      >
        {/* 外側のリング */}
        {ringParticles.map((p) => (
          <RingParticleComponent key={p.id} particle={p} lifetime={60} />
        ))}

        {/* 内側のグロー粒子 */}
        {glowParticles.map((p) => (
          <GlowParticleComponent key={`glow-${p.id}`} particle={p} />
        ))}

        {/* 中心のコア */}
        <div
          style={{
            position: "absolute",
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: `radial-gradient(circle, hsla(${coreHue}, 80%, 70%, 0.9) 0%, hsla(${coreHue}, 80%, 50%, 0.5) 50%, transparent 70%)`,
            boxShadow: `
              0 0 40px hsla(${coreHue}, 80%, 60%, 0.8),
              0 0 80px hsla(${coreHue}, 80%, 50%, 0.5),
              0 0 120px hsla(${coreHue}, 80%, 40%, 0.3)
            `,
            left: "50%",
            top: "50%",
            marginLeft: -30,
            marginTop: -30,
          }}
        />
      </div>

      {/* 説明 */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          width: "100%",
          textAlign: "center",
          opacity: spring({ frame: frame - 20, fps, config: { damping: 20 } }),
        }}
      >
        <span
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Unity Particle System → Remotion
        </span>
      </div>
    </AbsoluteFill>
  );
};
