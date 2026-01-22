import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const CARDS = [
  { color: "#FF6B6B", icon: "🎬", label: "Video" },
  { color: "#4ECDC4", icon: "🎨", label: "Design" },
  { color: "#45B7D1", icon: "⚛️", label: "React" },
  { color: "#96CEB4", icon: "🚀", label: "Export" },
];

export const SlideScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 全体のスライドアニメーション
  const slideProgress = interpolate(frame, [0, 90], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        overflow: "hidden",
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
            color: "#333",
            fontFamily: "Arial, sans-serif",
            letterSpacing: 3,
          }}
        >
          Sequence & Transitions
        </span>
      </div>

      {/* カードコンテナ */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          gap: 40,
        }}
      >
        {CARDS.map((card, i) => {
          const cardDelay = i * 10;
          const cardScale = spring({
            frame: frame - cardDelay,
            fps,
            config: { damping: 12, stiffness: 100 },
          });

          const cardY = spring({
            frame: frame - cardDelay,
            fps,
            from: 100,
            to: 0,
            config: { damping: 15 },
          });

          const cardRotation = interpolate(
            frame - cardDelay,
            [0, 30, 60],
            [-10, 5, 0],
            { extrapolateRight: "clamp" }
          );

          // ホバー風のアニメーション
          const hoverY = Math.sin((frame - cardDelay) * 0.1) * 10;

          return (
            <div
              key={i}
              style={{
                width: 300,
                height: 400,
                backgroundColor: card.color,
                borderRadius: 30,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                transform: `scale(${cardScale}) translateY(${cardY + hoverY}px) rotate(${cardRotation}deg)`,
                boxShadow: `0 20px 60px ${card.color}66`,
              }}
            >
              <span style={{ fontSize: 100 }}>{card.icon}</span>
              <span
                style={{
                  fontSize: 36,
                  color: "white",
                  fontWeight: "bold",
                  marginTop: 20,
                  fontFamily: "Arial, sans-serif",
                  textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                }}
              >
                {card.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* プログレスバー */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
          height: 8,
          backgroundColor: "rgba(0,0,0,0.1)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${slideProgress * 100}%`,
            height: "100%",
            backgroundColor: "#667eea",
            borderRadius: 4,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
