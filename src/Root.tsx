import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { DemoReel, TOTAL_DURATION } from "./DemoReel";
import { RainbowOrb } from "./DemoReel/RainbowOrb";
import { NetworkParticles } from "./DemoReel/NetworkParticles";
import { ParticlesJsStyle } from "./DemoReel/ParticlesJsStyle";
import { MerihariParticles } from "./DemoReel/MerihariParticles";
import { BiasedRandomParticles } from "./DemoReel/BiasedRandomParticles";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Demo Reel - Remotion機能紹介 */}
      <Composition
        id="DemoReel"
        component={DemoReel}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Rainbow Orb - Unity Particle System風 */}
      <Composition
        id="RainbowOrb"
        component={RainbowOrb}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Network Particles - 線で繋ぐparticles.js風 */}
      <Composition
        id="NetworkParticles"
        component={NetworkParticles}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* particles.js Style - 複数シェイプ + ライン */}
      <Composition
        id="ParticlesJsStyle"
        component={ParticlesJsStyle}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Merihari Particles - 予備動作+余韻 */}
      <Composition
        id="MerihariParticles"
        component={MerihariParticles}
        durationInFrames={270}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Biased Random Particles - 偏った乱数 */}
      <Composition
        id="BiasedRandomParticles"
        component={BiasedRandomParticles}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
