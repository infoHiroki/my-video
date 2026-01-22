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

// 軌跡のポイント数
const TRAIL_LENGTH = 40;

// リサージュ曲線で軌跡を生成
const getPathPosition = (t: number) => {
  const x = WIDTH / 2 + Math.sin(t * 2) * 400 + Math.sin(t * 3) * 150;
  const y = HEIGHT / 2 + Math.cos(t * 3) * 300 + Math.cos(t * 2) * 100;
  return { x, y };
};

// 軌跡パーティクルの型
interface TrailParticle {
  id: number;
  offsetX: number;
  offsetY: number;
  size: number;
  hue: number;
}

// 各軌跡ポイントに付随するパーティクル
const initTrailParticles = (): TrailParticle[][] => {
  return Array.from({ length: TRAIL_LENGTH }, (_, trailIdx) => {
    const particleCount = 3 + Math.floor(random(`count-${trailIdx}`) * 3);
    return Array.from({ length: particleCount }, (_, pIdx) => ({
      id: pIdx,
      offsetX: (random(`ox-${trailIdx}-${pIdx}`) - 0.5) * 30,
      offsetY: (random(`oy-${trailIdx}-${pIdx}`) - 0.5) * 30,
      size: 3 + random(`size-${trailIdx}-${pIdx}`) * 8,
      hue: 180 + random(`hue-${trailIdx}-${pIdx}`) * 60, // シアン〜青
    }));
  });
};

const trailParticles = initTrailParticles();

export const FadeTrailParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // タイトルのフェードイン
  const titleOpacity = spring({
    frame,
    fps,
    config: { damping: 20 },
  });

  // 軌跡の先頭位置（時間に応じて進む）
  const pathProgress = (frame / 300) * Math.PI * 4;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a0a20 0%, #101030 50%, #0a0a20 100%)",
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
            textShadow: "0 0 20px rgba(100, 200, 255, 0.8)",
          }}
        >
          Fade Trail Particles
        </span>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.6)",
            marginTop: 10,
            fontFamily: "Arial, sans-serif",
          }}
        >
          フェードアウト軌跡 - Mouse trail style animation
        </div>
      </div>

      {/* 軌跡を描画 */}
      {Array.from({ length: TRAIL_LENGTH }, (_, i) => {
        // 軌跡の各ポイントの進行度（0が先頭、TRAIL_LENGTH-1が末尾）
        const trailT = pathProgress - (i / TRAIL_LENGTH) * 0.8;
        const pos = getPathPosition(trailT);

        // フェードアウト（先頭は不透明、末尾は透明）
        const trailOpacity = interpolate(
          i,
          [0, TRAIL_LENGTH - 1],
          [1, 0]
        );

        // スケール（先頭は大きく、末尾は小さく）
        const trailScale = interpolate(
          i,
          [0, TRAIL_LENGTH - 1],
          [1, 0.3]
        );

        const particles = trailParticles[i];

        return (
          <div key={i}>
            {/* 軌跡の核（大きめ） */}
            <div
              style={{
                position: "absolute",
                left: pos.x - 10 * trailScale,
                top: pos.y - 10 * trailScale,
                width: 20 * trailScale,
                height: 20 * trailScale,
                borderRadius: "50%",
                backgroundColor: `hsla(200, 100%, 70%, ${trailOpacity * 0.8})`,
                boxShadow: `
                  0 0 ${20 * trailScale}px hsla(200, 100%, 60%, ${trailOpacity * 0.6}),
                  0 0 ${40 * trailScale}px hsla(200, 100%, 50%, ${trailOpacity * 0.4})
                `,
              }}
            />

            {/* 各ポイントに付随するパーティクル */}
            {particles.map((p) => {
              const pOpacity = trailOpacity * interpolate(
                p.size,
                [3, 11],
                [0.5, 1]
              );

              return (
                <div
                  key={p.id}
                  style={{
                    position: "absolute",
                    left: pos.x + p.offsetX * trailScale - (p.size * trailScale) / 2,
                    top: pos.y + p.offsetY * trailScale - (p.size * trailScale) / 2,
                    width: p.size * trailScale,
                    height: p.size * trailScale,
                    borderRadius: "50%",
                    backgroundColor: `hsla(${p.hue}, 100%, 70%, ${pOpacity})`,
                    boxShadow: `0 0 ${p.size * trailScale}px hsla(${p.hue}, 100%, 60%, ${pOpacity * 0.5})`,
                  }}
                />
              );
            })}
          </div>
        );
      })}

      {/* 先頭のメインパーティクル（輝く） */}
      {(() => {
        const headPos = getPathPosition(pathProgress);
        const pulseScale = 1 + Math.sin(frame * 0.3) * 0.1;

        return (
          <div
            style={{
              position: "absolute",
              left: headPos.x - 25,
              top: headPos.y - 25,
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: "hsla(200, 100%, 80%, 0.9)",
              transform: `scale(${pulseScale})`,
              boxShadow: `
                0 0 30px hsla(200, 100%, 70%, 0.8),
                0 0 60px hsla(200, 100%, 60%, 0.6),
                0 0 100px hsla(200, 100%, 50%, 0.4)
              `,
            }}
          />
        );
      })()}

      {/* 軌跡パスのプレビュー（薄く表示） */}
      <svg
        width={WIDTH}
        height={HEIGHT}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0.1,
        }}
      >
        <path
          d={(() => {
            let d = "";
            for (let t = 0; t <= Math.PI * 4; t += 0.1) {
              const pos = getPathPosition(t);
              d += (t === 0 ? "M" : "L") + `${pos.x},${pos.y}`;
            }
            return d;
          })()}
          stroke="white"
          strokeWidth={2}
          fill="none"
        />
      </svg>

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
