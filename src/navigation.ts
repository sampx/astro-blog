import { getPermalink, getHomePermalink, getBlogPermalink, getAsset } from "./utils/permalinks";

export const headerData = {
  links: [
    {
      text: "Home",
      href: getHomePermalink(),
    },
    {
      text: "Blog",
      href: getBlogPermalink(),
    },
    {
      text: "Tutorials",
      href: "/tutorials",
    },
  ],
};

export const footerData = {
  // secondaryLinks: [
  //   { text: "Terms", href: getPermalink("/terms") },
  //   { text: "Privacy Policy", href: getPermalink("/privacy") },
  // ],
  socialLinks: [
    { ariaLabel: "X", icon: "tabler:brand-x", href: "#" },
    // { ariaLabel: "Instagram", icon: "tabler:brand-instagram", href: "#" },
    { ariaLabel: "Facebook", icon: "tabler:brand-facebook", href: "#" },
    // { ariaLabel: "RSS", icon: "tabler:rss", href: getAsset("/rss.xml") },
    {
      ariaLabel: "Github",
      icon: "tabler:brand-github",
      href: "https://github.com/sampx/auto-login",
    },
  ],
  footNote: `
    Made by <a class="text-blue-600 underline dark:text-muted" href="https://udock.cn/"> uDock</a> · All rights reserved.
  `,
};
