export const bannerPresets = [
  {
    id: "peace-garden",
    name: "Peace Garden",
    imageUrl: "/peace-banner.png",
  },
  {
    id: "spring-path",
    name: "Spring Path",
    imageUrl: "/home-hero.jpg",
  },
  {
    id: "green-branch",
    name: "Green Branch",
    imageUrl: "/greenbranch.png",
  },
  {
    id: "soft-foliage",
    name: "Soft Foliage",
    imageUrl: "/soft-foliage-bg.png",
  },
  {
    id: "rooted-tree",
    name: "Rooted Tree",
    imageUrl: "/treewithroots.png",
  },
];

export const defaultBanner = bannerPresets[0];

export function getBannerById(bannerId) {
  return bannerPresets.find((banner) => banner.id === bannerId) || defaultBanner;
}
