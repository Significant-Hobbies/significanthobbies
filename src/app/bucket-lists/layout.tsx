import { FloatingWhale } from '~/components/floating-whale';

export default function BucketListsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingWhale />
    </>
  );
}
