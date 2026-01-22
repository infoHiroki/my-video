import { AbsoluteFill, Sequence } from "remotion";
import { TitleScene } from "./TitleScene";
import { ShapeDanceScene } from "./ShapeDanceScene";
import { SlideScene } from "./SlideScene";
import { ParticleScene } from "./ParticleScene";
import { WaveformScene } from "./WaveformScene";
import { EndCardScene } from "./EndCardScene";

// 各シーンの長さ（フレーム数）
const SCENE_DURATION = {
  title: 90,        // 3秒
  shapeDance: 120,  // 4秒
  slide: 120,       // 4秒
  particle: 120,    // 4秒
  waveform: 120,    // 4秒
  endCard: 120,     // 4秒
};

// 合計: 690フレーム = 23秒 @ 30fps

export const DemoReel: React.FC = () => {
  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Scene 1: Title */}
      <Sequence from={currentFrame} durationInFrames={SCENE_DURATION.title}>
        <TitleScene />
      </Sequence>

      {/* Scene 2: Shape Dance */}
      <Sequence
        from={(currentFrame += SCENE_DURATION.title)}
        durationInFrames={SCENE_DURATION.shapeDance}
      >
        <ShapeDanceScene />
      </Sequence>

      {/* Scene 3: Slide */}
      <Sequence
        from={(currentFrame += SCENE_DURATION.shapeDance)}
        durationInFrames={SCENE_DURATION.slide}
      >
        <SlideScene />
      </Sequence>

      {/* Scene 4: Particle */}
      <Sequence
        from={(currentFrame += SCENE_DURATION.slide)}
        durationInFrames={SCENE_DURATION.particle}
      >
        <ParticleScene />
      </Sequence>

      {/* Scene 5: Waveform */}
      <Sequence
        from={(currentFrame += SCENE_DURATION.particle)}
        durationInFrames={SCENE_DURATION.waveform}
      >
        <WaveformScene />
      </Sequence>

      {/* Scene 6: End Card */}
      <Sequence
        from={(currentFrame += SCENE_DURATION.waveform)}
        durationInFrames={SCENE_DURATION.endCard}
      >
        <EndCardScene />
      </Sequence>
    </AbsoluteFill>
  );
};

// 合計フレーム数をエクスポート
export const TOTAL_DURATION = Object.values(SCENE_DURATION).reduce(
  (sum, d) => sum + d,
  0
);
