
import { redirect } from 'next/navigation';

export default function LandingRedirect() {
  // This page is no longer used and now exists to redirect any stray traffic
  // to the new root landing page.
  redirect('/');
}
