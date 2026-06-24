import { FloatingLumi } from '~/components/floating-lumi';

export default function BucketListsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingLumi />
    </>
  );
}
