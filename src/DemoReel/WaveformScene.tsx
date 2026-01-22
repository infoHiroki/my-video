import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BAR_COUNT = 64;
const COLORS = ["#667eea", "#764ba2", "#f64f59", "#c471ed", "#12c2e9"];

export const WaveformScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // タイトルのアニメーション
  const titleOpacity = spring({
    frame,
    fps,
    config: { damping: 20 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      }}
    >
      {/* 波形バー */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "flex-end",
          gap: 4,
          height: 400,
        }}
      >
        {Array.from({ length: BAR_COUNT }, (_, i) => {
          // 複数の周波数を組み合わせて複雑な波形を生成
          const phase1 = Math.sin((frame * 0.15) + (i * 0.3)) * 0.5 + 0.5;
          const phase2 = Math.sin((frame * 0.08) + (i * 0.5)) * 0.3 + 0.3;
          const phase3 = Math.cos((frame * 0.12) + (i * 0.2)) * 0.2 + 0.2;

          const combinedHeight = (phase1 + phase2 + phase3) / 3;
          const barHeight = 50 + combinedHeight * 350;

          // グラデーションカラー
          const colorIndex = Math.floor((i / BAR_COUNT) * COLORS.length);
          const nextColorIndex = Math.min(colorIndex + 1, COLORS.length - 1);

          // バーの登場アニメーション
          const barScale = spring({
            frame: frame - i * 0.5,
            fps,
            config: { damping: 15, stiffness: 150 },
          });

          return (
            <div
              key={i}
              style={{
                width: 20,
                height: barHeight,
                background: `linear-gradient(180deg, ${COLORS[colorIndex]} 0%, ${COLORS[nextColorIndex]} 100%)`,
                borderRadius: 10,
                transform: `scaleY(${barScale})`,
                transformOrigin: "bottom",
                boxShadow: `0 0 20px ${COLORS[colorIndex]}66`,
              }}
            />
          );
        })}
      </div>

      {/* 円形ビジュアライザー（背景） */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {Array.from({ length: 3 }, (_, i) => {
          const scale = 1 + Math.sin(frame * 0.1 + i) * 0.2;
          const opacity = 0.1 - i * 0.03;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 300 + i * 100,
                height: 300 + i * 100,
                borderRadius: "50%",
                border: `2px solid rgba(255,255,255,${opacity})`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                left: "50%",
                top: "50%",
              }}
            />
          );
        })}
      </div>

      {/* タイトル */}
      <div
        style={{
          position: "absolute",
          top: 100,
          width: "100%",
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: "bold",
            color: "white",
            fontFamily: "Arial, sans-serif",
            textShadow: "0 0 30px rgba(102, 126, 234, 0.8)",
          }}
        >
          Audio Visualization
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "Arial, sans-serif",
            marginTop: 15,
          }}
        >
          Math.sin() + frame-based animation
        </div>
      </div>

      {/* BPM表示 */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 80,
          display: "flex",
          alignItems: "baseline",
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 64,
            fontWeight: "bold",
            color: "white",
            fontFamily: "monospace",
            opacity: 0.8 + Math.sin(frame * 0.2) * 0.2,
          }}
        >
          120
        </span>
        <span
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "Arial, sans-serif",
          }}
        >
          BPM
        </span>
      </div>
    </AbsoluteFill>
  );
};
