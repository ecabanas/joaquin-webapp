
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  ScanLine,
  BarChart,
  Users,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// --- Main Component ---
export function LandingPage() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  return (
    <>
      {/* --- Hero Section --- */}
      <section className="relative h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center text-center p-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter">
            Finally, a shared list that{' '}
            <span className="text-primary">gets it.</span>
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-lg text-muted-foreground">
            The intelligent grocery list that helps you shop smarter, not harder. Analyze receipts with AI, track spending, and never forget the milk again.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/signup">
              Start for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
        <div className="absolute bottom-12 flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
            <p className="text-sm">See how it works</p>
            <div className="w-px h-8 bg-border" />
        </div>
      </section>

      {/* --- Scrollytelling Section --- */}
      <section ref={targetRef} className="relative h-[500vh] w-full">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

          {/* Grid Layout for Text and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full items-center">
            {/* Feature Text on Left (Desktop), on Top (Mobile) */}
            <FeatureText scrollYProgress={scrollYProgress} />

            {/* Phone Mockup on Right (Desktop), Below (Mobile) */}
            <PhoneMockup scrollYProgress={scrollYProgress} />
          </div>
        </div>
      </section>

      {/* --- Final CTA Section --- */}
      <section className="w-full py-20 sm:py-32">
        <div className="container max-w-3xl text-center">
            <Sparkles className="mx-auto h-12 w-12 text-primary" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mt-4">
                Unlock Your Shopping Story
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
                Stop juggling apps and notes. Start making every grocery trip easier and more insightful.
            </p>
            <Button asChild size="lg" className="mt-8">
                <Link href="/signup">
                Sign Up and Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </div>
      </section>
    </>
  );
}

// --- Phone Mockup Component ---
const PhoneMockup = ({ scrollYProgress }: { scrollYProgress: any }) => {
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '0%']);
  const scale = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.8, 1, 1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [5, -5]);

  return (
    <motion.div
      style={{ y, scale, rotate }}
      className="flex items-center justify-center row-start-2 md:row-start-1"
    >
      <div className="relative w-72 h-[580px] sm:w-80 sm:h-[620px] bg-card/80 backdrop-blur-sm border-8 border-gray-800 rounded-[40px] shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10" />
        <div className="h-full w-full bg-background p-4 pt-8">
            <ScreenContent scrollYProgress={scrollYProgress} />
        </div>
      </div>
    </motion.div>
  );
};

// --- Screen Content Component ---
const ScreenContent = ({ scrollYProgress }: { scrollYProgress: any }) => {
  const opacityScene1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const opacityScene2 = useTransform(scrollYProgress, [0.3, 0.4, 0.6], [0, 1, 0]);
  const opacityScene3 = useTransform(scrollYProgress, [0.6, 0.7, 0.9, 1], [0, 1, 1, 0]);

  return (
    <>
      {/* Scene 1: Collaborative List */}
      <motion.div style={{ opacity: opacityScene1 }} className="absolute inset-0 p-4 pt-8 space-y-3">
        <p className="text-center font-bold text-lg mb-4">Grocery List</p>
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.5 } }}
            className="flex items-center gap-3 bg-primary/10 p-2.5 rounded-lg border border-primary/20"
        >
            <Users className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium">Partner added Avocados</p>
        </motion.div>
        <FakeListItem text="Milk" delay={0.6} />
        <FakeListItem text="Bread" delay={0.8} checked />
        <FakeListItem text="Avocados" delay={1.0} />
        <FakeListItem text="Chicken Breast" delay={1.2} />
      </motion.div>

      {/* Scene 2: AI Receipt Scan */}
      <motion.div style={{ opacity: opacityScene2 }} className="absolute inset-0 p-4 pt-8 text-center">
         <p className="font-bold text-lg mb-4">Analyzing Receipt...</p>
         <div className="relative w-full h-5/6 bg-muted/50 rounded-lg overflow-hidden border border-dashed">
            <ScanLine className="absolute inset-0 m-auto w-24 h-24 text-primary/40" />
            <motion.div
                initial={{y: '-100%'}}
                animate={{y: '100%'}}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/20 to-transparent"
             />
         </div>
      </motion.div>
      
      {/* Scene 3: Analytics */}
      <motion.div style={{ opacity: opacityScene3 }} className="absolute inset-0 p-4 pt-8 text-center">
        <p className="font-bold text-lg mb-4">Your Shopping Story</p>
        <div className="space-y-3">
             <div className="bg-muted/50 p-3 rounded-lg text-left">
                <p className="text-sm text-muted-foreground">This Month's Spending</p>
                <p className="text-2xl font-bold text-primary">$128.54</p>
            </div>
             <div className="bg-muted/50 p-3 rounded-lg text-left">
                <p className="text-sm text-muted-foreground">Top Impulse Buy</p>
                <p className="text-lg font-bold">Ice Cream</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg text-left">
                <p className="text-sm text-muted-foreground">Top Shopper</p>
                <p className="text-lg font-bold">You! 🎉</p>
            </div>
        </div>
      </motion.div>
    </>
  );
};

// --- Fake List Item for Animation ---
const FakeListItem = ({ text, delay, checked = false }: { text: string; delay: number; checked?: boolean }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0, transition: { delay } }}
        className={cn("flex items-center gap-3 p-2.5 rounded-lg", checked && 'opacity-50')}
    >
        <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10">
            {checked && <CheckCircle className="w-4 h-4 text-primary" />}
        </div>
        <p className={cn("text-base font-medium", checked && "line-through text-muted-foreground")}>{text}</p>
    </motion.div>
);


// --- Feature Text Component ---
const features = [
  {
    icon: Users,
    title: 'Collaborate in real-time.',
    description: 'Everyone sees the same list, instantly updated. Add items, check them off, and see changes as they happen. No more duplicate purchases.',
  },
  {
    icon: ScanLine,
    title: 'Snap a photo. Get the data.',
    description: 'Use our AI-powered receipt scanner to automatically extract items, prices, and the store name. No more manual entry.',
  },
  {
    icon: BarChart,
    title: 'Discover your habits.',
    description: "Joaquin turns your purchase history into powerful insights. Track spending, identify impulse buys, and become a smarter shopper.",
  },
];

const FeatureText = ({ scrollYProgress }: { scrollYProgress: any }) => {
    const opacityFeature1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [0, 1, 0]);
    const opacityFeature2 = useTransform(scrollYProgress, [0.3, 0.5, 0.6], [0, 1, 0]);
    const opacityFeature3 = useTransform(scrollYProgress, [0.6, 0.8, 0.9], [0, 1, 0]);

    const featureOpacities = [opacityFeature1, opacityFeature2, opacityFeature3];

    return (
        <div className="relative flex items-center justify-center p-8 md:p-12 lg:p-20 row-start-1 md:col-start-1 h-full">
            <div className="max-w-md space-y-2 text-center md:text-left">
            {features.map((feature, index) => (
                <motion.div
                    key={feature.title}
                    style={{ opacity: featureOpacities[index] }}
                    className="absolute"
                >
                    <feature.icon className="w-10 h-10 text-primary mb-4 mx-auto md:mx-0" />
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        {feature.title}
                    </h2>
                    <p className="text-lg text-muted-foreground mt-2">
                        {feature.description}
                    </p>
                </motion.div>
            ))}
            </div>
        </div>
    );
};
