import { site } from '@/config/site';
import type { ShareAdapter } from '@/lib/adapters/contracts';
import { feedbackSchema, sharedDesignSchema, sharedMoodBoardSchema } from '@/lib/schemas/local';
import { decodePayload, encodePayload } from '@/lib/share/codec';
import type {
  Design,
  DesignVariant,
  Feedback,
  MoodBoard,
  SharedDesign,
  SharedMoodBoard,
} from '@/types/local';

export class FragmentShareAdapter implements ShareAdapter {
  encode(design: Design, variants: DesignVariant[], senderName?: string): string {
    if (!design.templateSlug) {
      throw new Error(
        'Only demo-room designs can be shared as a link. Uploads are shared as an image.',
      );
    }
    const payload: SharedDesign = {
      v: 1,
      templateSlug: design.templateSlug,
      designId: design.id,
      designName: design.name,
      senderName,
      variants: variants.map((v) => ({
        id: v.id,
        name: v.name,
        colour: v.colour,
        assignments: v.assignments.map(({ maskRle: _m, ...a }) => a), // template masks already exist in the app
        lighting: v.lighting,
        annotations: v.annotations,
      })),
    };
    return encodePayload(payload);
  }

  decode(fragment: string): SharedDesign | null {
    const r = decodePayload(fragment, sharedDesignSchema);
    return r.ok ? (r.value as SharedDesign) : null;
  }

  encodeFeedback(f: Feedback): string {
    return encodePayload(f);
  }

  decodeFeedback(s: string): Feedback | null {
    const r = decodePayload(s, feedbackSchema);
    return r.ok ? (r.value as Feedback) : null;
  }

  encodeMoodBoard(b: MoodBoard): string {
    const { versions: _v, ...board } = b;
    // Strip heavy cutouts from the shared copy; recipients see the original image.
    const payload: SharedMoodBoard = {
      v: 1,
      board: { ...board, items: board.items.map(({ cutoutDataUrl: _c, ...i }) => i) },
    };
    return encodePayload(payload);
  }

  decodeMoodBoard(s: string): SharedMoodBoard | null {
    const r = decodePayload(s, sharedMoodBoardSchema);
    return r.ok ? (r.value as SharedMoodBoard) : null;
  }

  shareUrl(kind: 'd' | 'b', payload: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : site.url;
    return `${origin}/${kind}/#${payload}`;
  }
}
