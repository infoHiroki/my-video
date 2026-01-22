import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];

interface ShapeProps {
  color: string;
  delay: number;
  x: number;
  y: number;
  type: "circle" | "square" | "triangle";
}

const Shape: React.FC<ShapeProps> = ({ color, delay, x, y, type }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  const rotation = interpolate(frame - delay, [0, 60], [0, 360], {
    extrapolateRight: "extend",
  });

  const bounce = Math.sin((frame - delay) * 0.15) * 30;

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: x,
    top: y + bounce,
    transform: `scale(${scale}) rotate(${rotation}deg)`,
    transformOrigin: "center",
  };

  if (type === "circle") {
    return (
      <div
        style={{
          ...baseStyle,
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 10px 30px ${color}66`,
        }}
      />
    );
  }

  if (type === "square") {
    return (
      <div
        style={{
          ...baseStyle,
          width: 100,
          height: 100,
          backgroundColor: color,
          borderRadius: 15,
          boxShadow: `0 10px 30px ${color}66`,
        }}
      />
    );
  }

  // Triangle
  return (
    <div
      style={{
        ...baseStyle,
        width: 0,
        height: 0,
        borderLeft: "60px solid transparent",
        borderRight: "60px solid transparent",
        borderBottom: `100px solid ${color}`,
        filter: `drop-shadow(0 10px 20px ${color}66)`,
      }}
    />
  );
};

export const ShapeDanceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = spring({
    frame,
    fps,
    config: { damping: 20 },
  });

  const shapes: ShapeProps[] = [
    { color: COLORS[0], delay: 0, x: 300, y: 300, type: "circle" },
    { color: COLORS[1], delay: 5, x: 600, y: 500, type: "square" },
    { color: COLORS[2], delay: 10, x: 900, y: 350, type: "triangle" },
    { color: COLORS[3], delay: 15, x: 1200, y: 450, type: "circle" },
    { color: COLORS[4], delay: 20, x: 1500, y: 300, type: "square" },
    { color: COLORS[5], delay: 25, x: 800, y: 700, type: "triangle" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
      }}
    >
      {/* タイトル */}
      <div
        style={{
          position: "absolute",
          top: 80,
          width: "100%",
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <span
          style={{
            fontSize: 48,
            color: "white",
            fontFamily: "Arial, sans-serif",
            letterSpacing: 5,
          }}
        >
          interpolate + spring
        </span>
      </div>

      {/* 図形たち */}
      {shapes.map((shape, i) => (
        <Shape key={i} {...shape} />
      ))}

      {/* 説明テキスト */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          width: "100%",
          textAlign: "center",
          opacity: spring({
            frame: frame - 30,
            fps,
            config: { damping: 20 },
          }),
        }}
      >
        <span
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.7)",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Smooth physics-based animations
        </span>
      </div>
    </AbsoluteFill>
  );
};
