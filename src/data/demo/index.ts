/**
 * Demo dataset barrel — the only module `StaticContentRepo` reads from.
 * Cross-links that would otherwise be circular imports are resolved here.
 */
import { priceBooks, CURRENT_PRICEBOOK_VERSION, priceBook202609 } from '@/data/pricebook/2026.09';
import { shades, SHADE_FAMILIES } from '@/data/shades/shades.generated';
import {
  localities,
  indoreLocalities,
  nearbyCities,
  getLocality,
  localityMultiplier,
  isServiceablePin,
} from '@/data/static/localities';
import { vastuRules, VASTU_DISCLAIMER, VASTU_DIRECTION_FAMILIES } from '@/data/static/vastu';

import { demoClientProject, DEMO_TODAY } from './clientProject';
import { designers, getDesigner } from './designers';
import { img, imgSrc, hasImage, allImages } from './images';
import { materials, getMaterial, substituteChain } from './materials';
import { projects, getProject, featuredProjects, budgetBandOf, ROOM_LABELS } from './projects';
import { quizQuestions, quizProfiles } from './quiz';
import { roomGuides, getRoomGuide } from './roomGuides';
import { roomTemplates, getRoomTemplate, sceneTemplates } from './roomTemplates';
import { services, getService, STANDARD_PROCESS } from './services';
import { styles, getStyle } from './styles';
import { testimonials, featuredTestimonials } from './testimonials';

// Link projects → testimonials (testimonials.ts already imports projects, so do it here).
for (const t of testimonials) {
  const pr = projects.find((x) => x.slug === t.projectSlug);
  if (pr && !pr.testimonialId) pr.testimonialId = t.id;
}

export {
  // media
  img,
  imgSrc,
  hasImage,
  allImages,
  // catalogues
  designers,
  getDesigner,
  materials,
  getMaterial,
  substituteChain,
  projects,
  getProject,
  featuredProjects,
  budgetBandOf,
  ROOM_LABELS,
  testimonials,
  featuredTestimonials,
  services,
  getService,
  STANDARD_PROCESS,
  styles,
  getStyle,
  roomGuides,
  getRoomGuide,
  roomTemplates,
  getRoomTemplate,
  sceneTemplates,
  quizQuestions,
  quizProfiles,
  demoClientProject,
  DEMO_TODAY,
  // static
  shades,
  SHADE_FAMILIES,
  priceBooks,
  priceBook202609,
  CURRENT_PRICEBOOK_VERSION,
  localities,
  indoreLocalities,
  nearbyCities,
  getLocality,
  localityMultiplier,
  isServiceablePin,
  vastuRules,
  VASTU_DISCLAIMER,
  VASTU_DIRECTION_FAMILIES,
};
