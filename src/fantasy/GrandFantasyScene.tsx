export default function GrandFantasyScene({
  animate = true,
}: {
  animate?: boolean;
}) {
  return (
    <div
      className="grand-scene"
      aria-hidden="true"
      data-motion={animate ? "on" : "off"}
    >
      <img src="/fantasy-palace-v1.png" alt="" decoding="async" />
      <div className="grand-scene-veil" />
      <svg
        className="grand-arch"
        viewBox="0 0 400 860"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="grand-gold">
            <stop stopColor="#f7e4ac" />
            <stop offset=".5" stopColor="#a57638" />
            <stop offset="1" stopColor="#e6c788" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#grand-gold)">
          <path
            d="M8 850V118Q8 28 80 26Q140 26 200 6Q260 26 320 26Q392 28 392 118V850"
            strokeWidth="3"
          />
          <path
            d="M16 848V120Q16 40 82 38Q145 38 200 18Q255 38 318 38Q384 40 384 120V848"
            strokeWidth="1"
          />
          <path
            d="M18 190Q48 160 20 135Q-4 104 32 82M382 190Q352 160 380 135Q404 104 368 82M17 810Q45 785 17 758M383 810Q355 785 383 758"
            strokeWidth="2"
          />
          <path
            d="M162 26Q177 68 200 42Q223 68 238 26M183 35L200 21L217 35L200 49Z"
            strokeWidth="1.5"
          />
        </g>
      </svg>
      {Array.from({ length: 14 }, (_, i) => (
        <i
          className="grand-spark"
          key={i}
          style={{
            left: 5 + ((i * 31) % 91) + "%",
            top: 9 + ((i * 47) % 83) + "%",
            animationDelay: -(i * 0.53) + "s",
            animationDuration: 3 + (i % 4) + "s",
          }}
        >
          {i % 3 ? "✧" : "✦"}
        </i>
      ))}
    </div>
  );
}
