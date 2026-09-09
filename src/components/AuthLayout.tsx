import type { ReactNode } from "react";

/**
 * Auth page shell — Figma "Main Container" node 1:1383 (1440 x 785).
 *
 * Measurements are taken straight from the Figma node and kept in raw px so the
 * desktop rendering is 1:1 with the design:
 *   page          bg #f1f1f1, overflow clipped
 *   glow          933px circle, fill #ffdbdb, layer blur 420 (= CSS blur 210px)
 *   content row   1189 x 564, centered, 207px gap
 *   left column   502px wide, 22px gap
 *   card          480px wide, bg #fcfcfc, 1.314px rgba(255,255,255,0.27) inside
 *                 border, 16.757px radius, 27.6px horizontal padding. No shadow —
 *                 the design has no effects on this frame.
 */
const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f1f1f1] font-sans">
      {/*
        "Ellipse 3" (1:1384): 933px circle at y 620 in the 785px tall frame, so its
        box ends 768px below the fold — anchored to the bottom so the glow keeps
        hugging the bottom edge at any viewport height.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-768px] left-[calc(50%+0.5px)] size-[933px] -translate-x-1/2 rounded-full bg-[#ffdbdb] blur-[210px]"
      />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-16 xl:px-0 xl:py-0">
        <div className="flex w-full flex-col items-center gap-16 xl:w-auto xl:flex-row xl:items-center xl:gap-[207px]">
          {/* Frame 19 — 502 x 202 */}
          <div className="flex w-full max-w-[706px] shrink-0 flex-col gap-[22px] xl:w-[502px] xl:max-w-none">
            <p className="flex h-[25px] items-center text-[22px] leading-[24.5px] font-semibold tracking-[-0.437px] text-[#0a0a0a]">
              Brandverse
            </p>
            <h1 className="w-full font-display text-[44px] leading-[47px] text-[#383838] xl:w-[706px] xl:text-[72.534px] xl:leading-[77.278px]">
              Secure Access to Your Brand&rsquo;s Universe.
            </h1>
          </div>

          {/* "Background+Border" (1:1389) — 480 x 564 */}
          <div className="w-full max-w-[480px] shrink-0 rounded-[16.757px] border-[1.314px] border-[rgba(255,255,255,0.27)] bg-[#fcfcfc] px-[27.6px] pt-[27.6px] pb-[41.58px] xl:w-[480px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
