import { projects } from '../data/portfolio';
import { useNarrow } from '../lib/device';
import { ArchitectureSlot } from '../components/FeaturedProject';
import FeaturedProject from '../components/FeaturedProject';
import ProjectCard from '../components/ProjectCard';
import ProjectCarousel from '../components/ProjectCarousel';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';

export default function Projects() {
  const narrow = useNarrow();
  const featured = projects.find((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="section">
      <div className="blob -right-32 top-60 h-96 w-96 bg-brand" aria-hidden="true" />
      <div className="container-x">
        <SectionHeading eyebrow="03 / Projects" title="Products I've" accent="designed & shipped">
          Real, deployed apps with auth, payments, role-based access and background jobs, not just tutorials.
        </SectionHeading>

        {narrow ? (
          /* phones / tablets: swipe carousel (Shopzi first), its architecture stacked below */
          <>
            <ProjectCarousel projects={projects} />
            {featured?.architecture && (
              <div className="mt-8">
                <ArchitectureSlot data={featured.architecture} title="Shopzi architecture" />
              </div>
            )}
          </>
        ) : (
          <>
            {featured && <FeaturedProject project={featured} />}

            <h3 className="mb-8 mt-20 font-display text-2xl font-bold sm:text-3xl">
              More <span className="gradient-text">projects</span>
            </h3>
            <ul className="grid gap-6 md:grid-cols-2">
              {others.map((p, i) => (
                <Reveal key={p.id} as="li" delay={(i % 2) * 0.1}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
