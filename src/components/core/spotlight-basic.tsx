import { Spotlight } from "./spotlight";

export function SpotlightBasic() {
  return (
    <Spotlight
      className="min-h-[480px] w-full bg-void-black border-y border-zurkhai/20"
      color="plasma"
      size="xl"
      intensity="normal"
    >
      <div className="max-w-[1280px] mx-auto px-6 py-[96px] flex flex-col items-center text-center">
        <span className="text-caption text-zurkhai mb-6">[ 01 ]</span>
        <h2 className="text-[34px] md:text-[50px] font-[330] tracking-[-0.02em] leading-[1.1] text-frost max-w-[900px]">
          Fixed radial gradient spotlight on a dark canvas
        </h2>
        <p className="mt-6 text-[15px] leading-[1.5] tracking-[0.025em] text-ash max-w-[640px]">
          A static, centered glow used to emphasize a statement without motion.
          Built with flat color stops, thin borders, and the Aaru color system.
        </p>
      </div>
    </Spotlight>
  );
}
