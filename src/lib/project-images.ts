import screenDashboard from "@/assets/hero-screen-dashboard.png";
import screenFitness from "@/assets/hero-screen-fitness.png";
import screenFinance from "@/assets/hero-screen-finance.png";
import screenShop from "@/assets/hero-screen-shop.png";

/** Preview screens used inside phone/browser frames on project cards. */
export const projectImages: Record<string, string> = {
  fintrack: screenFinance,
  medicare: screenDashboard,
  shopease: screenShop,
  ridenow: screenShop,
  edulearn: screenDashboard,
  fitpulse: screenFitness,
};

export const projectGalleries: Record<string, string[]> = {
  fintrack: [screenFinance, screenDashboard, screenShop],
  medicare: [screenDashboard, screenFinance, screenShop],
  shopease: [screenShop, screenDashboard, screenFinance],
  ridenow: [screenShop, screenFitness, screenFinance],
  edulearn: [screenDashboard, screenShop, screenFitness],
  fitpulse: [screenFitness, screenFinance, screenDashboard],
};
