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
  {
    id: "butterfly-sky",
    name: "Butterfly Sky",
    imageUrl: "/butterfly-sky.png?v=1",
  },
  {
    id: "beach-sunrise",
    name: "Beach Sunrise",
    imageUrl: "/beach-sunrise.png?v=1",
  },
];

export const defaultBanner = bannerPresets.find((banner) => banner.id === "spring-path");

export function getBannerById(bannerId) {
  return bannerPresets.find((banner) => banner.id === bannerId) || defaultBanner;
}
