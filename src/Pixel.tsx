export const icons = [
  "book",
  "tea",
  "house",
  "broom",
  "crystal",
  "potion",
  "coin",
  "moon",
  "flower",
  "chest",
  "sword",
  "axe",
  "claw",
  "shield",
  "staff",
  "cage",
  "bow",
  "rune",
  "dagger",
  "helmet",
];
export default function Pixel({
  name = "potion",
  size = 40,
}: {
  name?: string;
  size?: number;
}) {
  const paths: Record<string, string[]> = {
    sword: [
      "M20 2h7v7h-3v4h-3v4h-3v4h-4v-4h-3v-4h4v-4h3V5h2z M8 18h4v4h4v4h-4v-2H8v4H4v-4h4z",
      "M22 5h2v4h-3v4h-3v4h-2v-4h3V9h3z",
    ],
    axe: [
      "M15 3h4v26h-4z M5 6h9v13H5v-3H2V9h3z M20 6h7v3h3v7h-3v3h-7z",
      "M5 7h7v3H5z M22 7h5v3h-5z M15 23h4v3h-4z",
    ],
    claw: [
      "M5 22h20v6H5z M7 7h3v15H7z M14 3h3v19h-3z M21 6h3v16h-3z",
      "M7 7h2v10H7z M14 3h2v13h-2z M21 6h2v11h-2z",
    ],
    shield: [
      "M5 4h22v18h-4v4h-4v4h-6v-4H9v-4H5z",
      "M9 8h14v11h-3v4h-3v3h-2v-3h-3v-4H9z",
    ],
    staff: [
      "M14 11h4v19h-4z M10 3h12v10H10z M7 6h3v4H7z M22 6h3v4h-3z",
      "M13 4h6v6h-6z M14 24h4v3h-4z",
    ],
    cage: [
      "M4 11h24v18H4z M8 6h16v5H8z M13 2h6v4h-6z",
      "M7 14h3v11H7z M14 14h3v11h-3z M21 14h3v11h-3z",
    ],
    bow: [
      "M10 3h7v3h4v4h3v12h-3v4h-4v4h-7v-4h5v-4h4V11h-4V7h-5z M8 4h2v24H8z",
      "M3 15h24v3H3z M23 12h4v3h3v3h-3v3h-4z",
    ],
    rune: [
      "M10 2h12v4h4v22h-4v3H10v-3H6V6h4z",
      "M15 7h3v5h4v3h-4v3h4v3h-4v5h-3v-5h-4v-3h4v-3h-4v-3h4z",
    ],
    dagger: [
      "M15 2h6v17h-3v4h-3v-4h-3V6h3z M7 21h20v4H7z M14 25h6v6h-6z",
      "M15 6h2v11h-2z M14 25h3v3h-3z",
    ],
    helmet: [
      "M9 3h14v4h4v21h-8V17h-6v11H5V7h4z",
      "M9 7h14v4H9z M14 3h4v12h-4z",
    ],
    book: [
      "M5 5h9v3h3v17H5z M18 8h9v17h-9z",
      "M8 9h5v2H8z M8 14h5v2H8z M21 12h3v2h-3z M21 17h3v2h-3z",
    ],
    tea: [
      "M6 12h17v12H9v-3H6z M23 14h5v7h-5z M5 26h21v2H5z",
      "M10 4h2v5h-2z M17 3h2v6h-2z",
    ],
    house: [
      "M5 15h22v13H5z M3 12h4V9h4V6h10v3h4v3h4v3H3z",
      "M13 20h6v8h-6z M8 17h3v4H8z M22 17h3v4h-3z",
    ],
    broom: [
      "M19 3h4v4h-3v4h-3v4h-3v4h-3v-4h3v-4h3V7h2z",
      "M6 16h8v3h3v7h-4v3H3v-7h3z",
    ],
    crystal: [
      "M12 3h8v4h4v17h-4v5h-8v-5H8V7h4z",
      "M14 7h3v14h-3z M5 23h3v5H5z M25 17h3v8h-3z",
    ],
    potion: [
      "M12 3h8v3h-2v6h4v3h3v12H7V15h3v-3h4V6h-2z",
      "M10 19h12v5H10z M10 15h3v3h-3z",
    ],
    coin: [
      "M11 4h10v3h4v4h3v10h-3v4h-4v3H11v-3H7v-4H4V11h3V7h4z",
      "M14 10h7v3h-5v3h5v6h-7v-3h5v-1h-5z",
    ],
    moon: [
      "M12 3h9v3h-5v4h-3v9h3v4h9v-3h3v6h-5v3H10v-3H6v-5H3V10h3V6h6z",
      "M24 5h3v3h3v3h-3v3h-3v-3h-3V8h3z",
    ],
    flower: [
      "M14 17h3v13h-3z M7 21h6v4H7z M18 24h7v3h-7z",
      "M12 3h8v4h6v8h-6v5h-8v-5H6V7h6z",
    ],
    chest: ["M5 9h22v19H5z M8 5h16v4H8z", "M5 15h22v3H5z M14 13h5v9h-5z"],
  };
  const p = paths[name] || paths.potion;
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
    >
      <path d={p[0]} transform="translate(2 2)" fill="#3c304c" opacity=".5" />
      <path d={p[0]} fill="currentColor" />
      <path d={p[1]} fill="#f0d49b" className="item-glint" />
      <path
        d={p[0]}
        transform="translate(-.6 -.6)"
        fill="none"
        stroke="#ffffff"
        strokeOpacity=".35"
        strokeWidth=".6"
      />
    </svg>
  );
}
