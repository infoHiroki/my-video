import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FEATURES = [
  "useCurrentFrame()",
  "useVideoConfig()",
  "spring()",
  "interpolate()",
  "<Sequence>",
  "<AbsoluteFill>",
  "random()",
];

export const EndCardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 背景のグラデーションアニメーション
  const gradientAngle = interpolate(frame, [0, 120], [135, 225]);

  // ロゴのアニメーション
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  const logoRotation = spring({
    frame,
    fps,
    from: -20,
    to: 0,
    config: { damping: 15 },
  });

  // フェードアウト
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientAngle}deg, #667eea 0%, #764ba2 50%, #f64f59 100%)`,
        opacity: fadeOut,
      }}
    >
      {/* 背景の装飾円 */}
      {Array.from({ length: 5 }, (_, i) => {
        const delay = i * 10;
        const scale = spring({
          frame: frame - delay,
          fps,
          config: { damping: 20 },
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 200 + i * 150,
              height: 200 + i * 150,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.1)",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          />
        );
      })}

      {/* メインロゴ/テキスト */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${logoScale}) rotate(${logoRotation}deg)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: "bold",
            color: "white",
            fontFamily: "Arial, sans-serif",
            textShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}
        >
          Remotion
        </div>
        <div
          style={{
            fontSize: 36,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "Arial, sans-serif",
            marginTop: 10,
            letterSpacing: 8,
          }}
        >
          Make videos programmatically
        </div>
      </div>

      {/* 機能リスト */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1200,
        }}
      >
        {FEATURES.map((feature, i) => {
          const delay = 20 + i * 5;
          const opacity = spring({
            frame: frame - delay,
            fps,
            config: { damping: 20 },
          });
          const y = spring({
            frame: frame - delay,
            fps,
            from: 30,
            to: 0,
            config: { damping: 15 },
          });

          return (
            <div
              key={i}
              style={{
                padding: "12px 24px",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 30,
                backdropFilter: "blur(10px)",
                opacity,
                transform: `translateY(${y}px)`,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  color: "white",
                  fontFamily: "monospace",
                }}
              >
                {feature}
              </span>
            </div>
          );
        })}
      </div>

      {/* URL */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          width: "100%",
          textAlign: "center",
          opacity: spring({
            frame: frame - 60,
            fps,
            config: { damping: 20 },
          }),
        }}
      >
        <span
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
            fontFamily: "Arial, sans-serif",
            letterSpacing: 3,
          }}
        >
          remotion.dev
        </span>
      </div>
    </AbsoluteFill>
  );
};
