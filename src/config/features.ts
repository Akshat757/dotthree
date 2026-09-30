/** Feature flags — SRS §16.2 */
export const features = {
  visualiser: true,
  visualiserClickSegment: false, // Phase 3 — MobileSAM
  floorPlanner: false, // Phase 3
  ar: false, // Phase 3
  similaritySearch: false, // Phase 3
  projectTracker: true,
  moodBoards: true,
  bgRemoval: false, // U²-Net ONNX — stretch, off by default
  localContentEditor: false, // Phase 3
  demoBanner: true, // flip when real content lands
  serviceWorker: true,
} as const;

export type FeatureKey = keyof typeof features;

export function isEnabled(key: FeatureKey): boolean {
  return features[key];
}
