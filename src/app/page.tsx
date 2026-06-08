import { existsSync } from "node:fs";
import { join } from "node:path";

import { ClickCollectSection } from "@/components/home/ClickCollectSection";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { HeroSection } from "@/components/home/HeroSection";
import { LiveStatusBar } from "@/components/home/LiveStatusBar";
import { MapSection } from "@/components/home/MapSection";
import { MenuPreview } from "@/components/home/MenuPreview";
import { QuickInfoStrip } from "@/components/home/QuickInfoStrip";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { SocialProofBanner } from "@/components/home/SocialProofBanner";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { flattenMenu, getMergedMenu } from "@/lib/menu";

export const revalidate = 60;

export default async function Home() {
  const hasHeroVideo = existsSync(join(process.cwd(), "public", RESTAURANT_CONFIG.heroVideo));
  const menuCategories = await getMergedMenu();
  const menuItems = flattenMenu(menuCategories);

  return (
    <>
      <HeroSection hasHeroVideo={hasHeroVideo} />
      <LiveStatusBar />
      <QuickInfoStrip />
      <FeaturedSection menuItems={menuItems} />
      <WhyChooseUs />
      <MenuPreview menuCategories={menuCategories} />
      <ReviewsSection />
      <MapSection />
      <ClickCollectSection />
      <SocialProofBanner />
    </>
  );
}
