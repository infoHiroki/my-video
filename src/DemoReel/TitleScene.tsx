import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 各文字のアニメーション
  const title = "REMOTION";
  const subtitle = "Demo Reel";

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* メインタイトル */}
      <div style={{ display: "flex", gap: 10 }}>
        {title.split("").map((char, i) => {
          const delay = i * 3;
          const scale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 12, stiffness: 200 },
          });
          const rotation = spring({
            frame: frame - delay,
            fps,
            from: -180,
            to: 0,
            config: { damping: 15 },
          });

          return (
            <span
              key={i}
              style={{
                fontSize: 150,
                fontWeight: "bold",
                color: "white",
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                fontFamily: "Arial, sans-serif",
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* サブタイトル */}
      <div
        style={{
          position: "absolute",
          bottom: 300,
          opacity: spring({
            frame: frame - 30,
            fps,
            config: { damping: 20 },
          }),
          transform: `translateY(${spring({
            frame: frame - 30,
            fps,
            from: 50,
            to: 0,
            config: { damping: 15 },
          })}px)`,
        }}
      >
        <span
          style={{
            fontSize: 60,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "Arial, sans-serif",
            letterSpacing: 10,
          }}
        >
          {subtitle}
        </span>
      </div>
    </AbsoluteFill>
  );
};
