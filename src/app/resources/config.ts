const baseURL: string = "efekurucay.com";

const routes: { [key: string]: boolean } = {
  "/": true,
  "/about": true,
  "/work": true,
  "/blog": true,
  "/gallery": true,
  "/chat": true,
  "/contact": true,
};

// Enable password protection on selected routes
// Set password in the .env file, refer to .env.example
const protectedRoutes: { [key: string]: boolean } = {
  "/work/": true,
};

const style: {
  theme: "dark" | "light";
  neutral: "sand" | "gray" | "slate";
  brand:
    | "blue"
    | "indigo"
    | "violet"
    | "magenta"
    | "pink"
    | "red"
    | "orange"
    | "yellow"
    | "moss"
    | "green"
    | "emerald"
    | "aqua"
    | "cyan";
  accent:
    | "blue"
    | "indigo"
    | "violet"
    | "magenta"
    | "pink"
    | "red"
    | "orange"
    | "yellow"
    | "moss"
    | "green"
    | "emerald"
    | "aqua"
    | "cyan";
  solid: "color" | "contrast";
  solidStyle: "flat" | "plastic";
  border: "rounded" | "playful" | "conservative";
  surface: "filled" | "translucent";
  transition: "all" | "micro" | "macro";
  scaling: "normal" | "compact";
} = {
  theme: "dark", // dark | light
  neutral: "gray", // sand | gray | slate
  brand: "blue", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  accent: "orange", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  solid: "contrast", // color | contrast
  solidStyle: "flat", // flat | plastic
  border: "playful", // rounded | playful | conservative
  surface: "translucent", // filled | translucent
  transition: "all", // all | micro | macro
  scaling: "normal",
};

const effects: {
  mask: {
    cursor: boolean;
    x: number;
    y: number;
    radius: number;
  };
  gradient: {
    display: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    tilt: number;
    colorStart: string;
    colorEnd: string;
    opacity: number;
  };
  dots: {
    display: boolean;
    size: number;
    color: string;
    opacity: number;
  };
  lines: {
    display: boolean;
    color: string;
    opacity: number;
  };
  grid: {
    display: boolean;
    color: string;
    width: number;
    height: number;
    opacity: number;
  };
} = {
  mask: {
    cursor: true,
    x: 0,
    y: 0,
    radius: 75,
  },
  gradient: {
    display: true,
    x: 50,
    y: 0,
    width: 100,
    height: 100,
    tilt: 0,
    colorStart: "brand-background-strong",
    colorEnd: "static-transparent",
    opacity: 50,
  },
  dots: {
    display: true,
    size: 2,
    color: "brand-on-background-weak",
    opacity: 20,
  },
  lines: {
    display: false,
    color: "neutral-alpha-weak",
    opacity: 100,
  },
  grid: {
    display: false,
    color: "neutral-alpha-weak",
    width: 100,
    height: 100,
    opacity: 100,
  },
};

const display: {
  location: boolean;
  time: boolean;
} = {
  location: true,
  time: true,
};

const mailchimp: {
  action: string;
  effects: typeof effects;
} = {
  action: "https://url/subscribe/post?parameters",
  effects: {
    mask: {
      cursor: false,
      x: 100,
      y: 0,
      radius: 100,
    },
    gradient: {
      display: true,
      x: 100,
      y: 50,
      width: 100,
      height: 100,
      tilt: -45,
      colorStart: "accent-background-strong",
      colorEnd: "static-transparent",
      opacity: 100,
    },
    dots: {
      display: false,
      size: 24,
      color: "brand-on-background-weak",
      opacity: 100,
    },
    lines: {
      display: false,
      color: "neutral-alpha-weak",
      opacity: 100,
    },
    grid: {
      display: true,
      color: "neutral-alpha-weak",
      width: 100,
      height: 100,
      opacity: 100,
    },
  },
};

export { routes, protectedRoutes, effects, style, display, mailchimp, baseURL };
