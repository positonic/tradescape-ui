import {
  FaceSmileIcon,
  ChartBarSquareIcon,
  CursorArrowRaysIcon,
  DevicePhoneMobileIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
} from "@heroicons/react/24/solid";

import benefitOneImg from "@/public/img/benefit-one.png";
import benefitTwoImg from "@/public/img/benefit-two.png";

const benefitOne = {
  title: "Because execution is everything",
  desc: "Being able to read a market and make a trade is one thing, but being able to execute on that trade with excellence is another. Tradescape is a platform that allows you to do both.",
  image: benefitOneImg,
  bullets: [
    {
      title: "No more journalling",
      desc: "Journalling is no longer necessary",
      icon: <FaceSmileIcon />,
    },
    {
      title: "No more manually tracking your trades",
      desc: "We do all of that for you",
      icon: <ChartBarSquareIcon />,
    },
    {
      title: "Professional tooling and trade intelligence",
      desc: "If and when someone pays for the work the project has done, you get paid.",
      icon: <CursorArrowRaysIcon />,
    },

    {
      title: "Stop making mistakes",
      desc: "Minimise user error and protect yourself from bad habits",
      icon: <CursorArrowRaysIcon />,
    },
  ],
};

const benefitTwo = {
  title: "Offer more benefits here",
  desc: "You can use this same layout with a flip image to highlight your rest of the benefits of your product. It can also contain an image or Illustration as above section along with some bullet points.",
  image: benefitTwoImg,
  bullets: [
    {
      title: "Mobile Responsive Template",
      desc: "Nextly is designed as a mobile first responsive template.",
      icon: <DevicePhoneMobileIcon />,
    },
    {
      title: "Powered by Next.js & TailwindCSS",
      desc: "This template is powered by latest technologies and tools.",
      icon: <AdjustmentsHorizontalIcon />,
    },
    {
      title: "Dark & Light Mode",
      desc: "Nextly comes with a zero-config light & dark mode. ",
      icon: <SunIcon />,
    },
  ],
};

export { benefitOne, benefitTwo };
