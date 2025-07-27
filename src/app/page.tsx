import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ClipboardList, HardHat, BarChart2 } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  const features = [
    {
      icon: <ClipboardList className="h-8 w-8 text-primary" />,
      title: 'Dynamic Safety Checklists',
      description: 'Create and manage pre-shift safety checklists with real-time scoring and compliance tracking.',
    },
    {
      icon: <HardHat className="h-8 w-8 text-primary" />,
      title: 'AI-Powered Reporting',
      description: 'Generate comprehensive safety reports and track violations with AI-assisted regulation recommendations.',
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: 'Certification Tracking',
      description: 'Manage team certifications and receive automated alerts for upcoming expirations.',
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
      title: 'Dashboard Analytics',
      description: 'Visualize safety performance with an interactive dashboard and real-time status indicators.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-card border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Logo />
          <span className="ml-2 text-lg font-semibold">Construction Guardian</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Login
          </Link>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Proactive Safety Management for Modern Construction
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Construction Guardian provides the tools you need to ensure safety compliance, reduce risks, and protect your team on every project.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/signup">Request a Demo</Link>
                  </Button>
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="construction safety"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Everything You Need for a Safer Job Site
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From AI-powered reporting to real-time analytics, our platform is designed to be your comprehensive safety solution.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4 mt-12">
              {features.map((feature, index) => (
                <Card key={index} className="h-full">
                  <CardHeader className="flex flex-col items-center text-center">
                    {feature.icon}
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-card">
        <p className="text-xs text-muted-foreground">&copy; 2024 Construction Guardian. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
