import { useInView } from "../../hooks/useInView";
import "./style.css";

const TIMELINE = [
  { position: "Senior Frontend", company: "Machobear Studio", year: 2024 },
  { position: "Web Contractor", company: "TRPlus", year: 2023 },
  { position: "Senior Frontend", company: "Binance, Canada", year: 2022 },
  { position: "Senior Frontend", company: "Citcon", year: 2021 },
  { position: "Senior Frontend", company: "BMC Software, Canada", year: 2015 },
  { position: "Software Developer", company: null, year: 2009 },
];

function About() {
  const [bioRef, bioInView] = useInView<HTMLParagraphElement>();
  const [timelineRef, timelineInView] = useInView<HTMLDivElement>();

  return (
    <div className="mx-auto max-w-md px-6 pt-32 pb-24 sm:px-10">
      <p
        ref={bioRef}
        data-in-view={bioInView || undefined}
        className="reveal font-geo text-base leading-relaxed text-neutral-700"
      >
        Ting Yun is a Frontend Engineer. Specializes in
        <br />
        <span className="text-sm">
          -React/Next.js development
          <br />
          -GraphQL, useQuery, Tailwind
          <br />
          -Node.js, Auth0, Node.js, MongoDB, PostgreSQL, Redis
        </span>
      </p>

      <div
        ref={timelineRef}
        data-in-view={timelineInView || undefined}
        className="reveal relative mt-5 border-l border-black/20 pl-8"
      >
        <ul className="space-y-3">
          {TIMELINE.map(({ position, company, year }) => (
            <li key={`${position}-${year}`}>
              <p className="font-geo text-xs font-medium text-neutral-800">
                {position}
              </p>
              {company && (
                <p className="font-geo text-xs text-neutral-500">{company}</p>
              )}
              <p className="font-geo text-[10px] tracking-wide text-neutral-400">
                {year}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default About;
