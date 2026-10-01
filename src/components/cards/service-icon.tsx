import {
  Archive,
  BedDouble,
  Building2,
  ClipboardCheck,
  CookingPot,
  Flame,
  Hammer,
  Home,
  Lightbulb,
  PencilRuler,
  Sofa,
  Store,
  Sparkles,
  type LucideProps,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  home: Home,
  'cooking-pot': CookingPot,
  archive: Archive,
  sofa: Sofa,
  'bed-double': BedDouble,
  flame: Flame,
  lightbulb: Lightbulb,
  hammer: Hammer,
  'clipboard-check': ClipboardCheck,
  'pencil-ruler': PencilRuler,
  'building-2': Building2,
  store: Store,
};

/** Maps `Service.icon` (lucide kebab name) to a component; unknown names fall back to a spark. */
export function ServiceIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon aria-hidden {...props} />;
}
