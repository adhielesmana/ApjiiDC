export type NavItem = {
  label: string;
  href: string;
  isLogout?: boolean;
  isLogin?: boolean;
};

export type SiteConfig = {
  name: string;
  description: string;
  navItems: NavItem[];
  navMenuItems: NavItem[];
  links: {
    github: string;
    twitter: string;
    docs: string;
    discord: string;
    sponsor: string;
  };
};

export const siteConfig: SiteConfig = {
  name: "APJII DC",
  description: "APJII DATA CENTER MARKETPLACE.",
  navItems: [
    {
      label: "Home",
      href: "/customer",
    },
    {
      label: "Product",
      href: "/customer/catalog",
    },
    {
      label: "About",
      href: "/customer/about",
    },
    {
      label: "Partners",
      href: "/customer/provider/list",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/customer",
    },
    {
      label: "Product",
      href: "/customer/catalog",
    },
    {
      label: "About",
      href: "/customer/about",
    },
    // {
    //   label: "Catalog",
    //   href: "/customer/catalog",
    // },
    {
      label: "Partners",
      href: "/customer/provider/list",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
