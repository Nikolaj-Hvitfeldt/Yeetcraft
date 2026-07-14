import { Link } from "react-router-dom";
import logoDaytimeFull from "../../assets/logos/logoDaytimeFull.webp";
import logoMidnightFull from "../../assets/logos/logoMidnightFull.webp";
import { useTheme } from "../../hooks";
import { ThemeSwitcher } from "../ThemeSwitcher";

const logosByTheme = {
  daytime: logoDaytimeFull,
  midnight: logoMidnightFull,
} as const;

export function HomeNavigation({ homePath }: HomeNavigationProps) {
  const { theme } = useTheme();

  return (
    <nav className="flex w-full items-center justify-between px-xs py-sm">
      <Link
        to={homePath}
        className="flex items-center gap-md rounded-md border border-transparent py-sm pr-md outline-none transition-colors focus:border-accent-primary focus-visible:border-accent-primary"
      >
        <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md shadow-lg">
          <img
            src={logosByTheme[theme]}
            alt=""
            className="size-full object-contain"
          />
        </span>
        <div>
          <p className="font-heading text-xl font-bold leading-6 text-accent-primary">
            YeetCraft
          </p>
          <p className="text-on-image text-xs font-semibold leading-4 text-text-accent">
            Mythic+ Hall of Shame
          </p>
        </div>
      </Link>
      <ThemeSwitcher />
    </nav>
  );
}

interface HomeNavigationProps {
  homePath: string;
}
