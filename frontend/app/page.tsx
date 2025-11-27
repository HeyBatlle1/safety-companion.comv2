import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground">
          Safety Companion V2
        </h1>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Foundation Ready
          </h2>
          <p className="text-muted-foreground mb-4">
            Next.js 15 + shadcn/ui + Stone/Slate theme configured
          </p>
          <div className="flex gap-4">
            <Button>Test Button - Stone/Slate Theme</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h3 className="text-xl font-semibold mb-2 text-foreground">
            Tech Stack
          </h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>✓ Next.js 15 (App Router, TypeScript)</li>
            <li>✓ shadcn/ui (Component Foundation)</li>
            <li>✓ Tailwind CSS v4 (Stone/Slate Theme)</li>
            <li>✓ Clerk (Authentication Ready)</li>
            <li>✓ Monorepo Structure</li>
          </ul>
        </Card>

        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 bg-accent rounded-md" title="Safety Orange"></div>
          <div className="w-16 h-16 bg-destructive rounded-md" title="Construction Red"></div>
          <div className="w-16 h-16 bg-primary rounded-md" title="Slate Gray"></div>
          <div className="w-16 h-16 bg-card rounded-md border border-border" title="Stone Surface"></div>
        </div>
      </div>
    </main>
  );
}
