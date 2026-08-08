export type BucketListCategoryStyle = {
  bg: string;
  border: string;
  text: string;
  dot: string;
};

export const BUCKET_LIST_CATEGORY_STYLES: Record<string, BucketListCategoryStyle> = {
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  coral: {
    bg: 'bg-primary/10',
    border: 'border-lumi-200',
    text: 'text-primary',
    dot: 'bg-primary',
  },
  emerald: {
    bg: 'bg-foreground/10',
    border: 'border-foreground/20',
    text: 'text-foreground',
    dot: 'bg-foreground',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    dot: 'bg-indigo-400',
  },
  lime: {
    bg: 'bg-lime-50',
    border: 'border-lime-200',
    text: 'text-lime-700',
    dot: 'bg-lime-400',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    dot: 'bg-orange-400',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-400',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-400',
  },
  sky: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    dot: 'bg-sky-400',
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    dot: 'bg-teal-400',
  },
};

const FALLBACK_STYLE = BUCKET_LIST_CATEGORY_STYLES.emerald;

export function getBucketListCategoryStyle(color: string): BucketListCategoryStyle {
  return BUCKET_LIST_CATEGORY_STYLES[color] ?? FALLBACK_STYLE;
}
