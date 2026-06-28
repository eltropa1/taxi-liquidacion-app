import type { VisualIdentity } from './VisualIdentity';

export interface PlatformIdentity extends VisualIdentity {
  readonly domain: 'platform';
  readonly color: string;
  readonly surfaceColor: string;
  readonly onSurfaceColor: string;
  readonly icon?: never;
}
