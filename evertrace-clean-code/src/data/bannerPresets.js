export const bannerPresets = [
  {
    id: "peace-garden",
    name: "Peace Garden",
    imageUrl: "/peace-banner.png?v=2",
  },
  {
    id: "spring-path",
    name: "Spring Path",
    imageUrl: "/home-hero.jpg?v=2",
  },
  {
    id: "green-branch",
    name: "Green Branch",
    imageUrl: "/greenbranch.png?v=2",
  },
  {
    id: "soft-foliage",
    name: "Soft Foliage",
    imageUrl: "/soft-foliage-bg.png?v=2",
  },
  {
    id: "rooted-tree",
    name: "Rooted Tree",
    imageUrl: "/treewithroots.png?v=2",
  },
];

export const defaultBanner = bannerPresets.find((banner) => banner.id === "spring-path");

export function getBannerById(bannerId) {
  return bannerPresets.find((banner) => banner.id === bannerId) || defaultBanner;
}
