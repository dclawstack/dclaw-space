export const metadata = { title: 'DClaw Space', description: 'Office space optimization' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
