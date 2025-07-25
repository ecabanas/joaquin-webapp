
import { redirect } from 'next/navigation';

export default function Home() {
  // This page is now part of the (landing) group and has its own layout.
  // We redirect to /list for any users who might still land here.
  // The actual landing page is at /src/app/(landing)/page.tsx
  redirect('/list');
}
