import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Calendar, Copy, Check, Zap, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'
import heroImage from '@/assets/hero-dashboard.jpg'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSeeExample = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/login?redirect=example')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">PostPilot</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              For Local Businesses
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              30 days of posts in 60 seconds
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your social media manager—without the manager. Generate ready-to-post Instagram content tailored to your local business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto text-base">
                  Start $30/month
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto text-base"
                onClick={handleSeeExample}
              >
                See Example
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>No credit card required to try</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
            <img 
              src={heroImage} 
              alt="PostPilot Dashboard" 
              className="relative rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to never run out of content ideas again
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8" />,
                title: '1. Tell us about your business',
                description: 'Business type, location, vibe, and goals. Takes 60 seconds.',
              },
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: '2. AI generates your calendar',
                description: '30 days of posts with captions, hashtags, CTAs, and Canva prompts.',
              },
              {
                icon: <Copy className="h-8 w-8" />,
                title: '3. Copy & post',
                description: 'One-click copy buttons. Download CSV. Create visuals in Canva.',
              },
            ].map((step, idx) => (
              <Card key={idx} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-lg text-muted-foreground">Each post includes all the details</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Calendar className="h-6 w-6" />, title: 'Post Type', desc: 'Reel, Photo, Carousel, Story' },
            { icon: <Copy className="h-6 w-6" />, title: 'Captions', desc: 'Short & long variants' },
            { icon: <TrendingUp className="h-6 w-6" />, title: 'Hashtags', desc: 'Relevant & local tags' },
            { icon: <ArrowRight className="h-6 w-6" />, title: 'CTAs', desc: 'Clear calls-to-action' },
            { icon: <Sparkles className="h-6 w-6" />, title: 'Canva Prompts', desc: 'Design instructions' },
            { icon: <Clock className="h-6 w-6" />, title: 'Themes', desc: 'Varied content pillars' },
            { icon: <Copy className="h-6 w-6" />, title: 'CSV Export', desc: 'Download everything' },
            { icon: <Zap className="h-6 w-6" />, title: 'Regenerate', desc: 'Refresh any day' },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Card className="p-8 md:p-12 text-center shadow-xl border-2 border-primary/20">
              <div className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium mb-6">
                Simple Pricing
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold">$30</span>
                <span className="text-xl text-muted-foreground">/month</span>
              </div>
              <p className="text-lg text-muted-foreground mb-8">
                One plan. Full access. Cancel anytime.
              </p>
              <Link to="/register">
                <Button size="lg" className="w-full text-base mb-6">
                  Generate My First 30 Days
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="space-y-3 text-left">
                {[
                  'Unlimited 30-day calendar generations',
                  'All post types & content pillars',
                  'Captions, hashtags, CTAs, Canva prompts',
                  'CSV & text file exports',
                  'Regenerate individual days',
                  'Monthly themes & trends',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">PostPilot</span>
          </div>
          <p className="text-sm">
            © 2026 PostPilot. Your social media manager—without the manager.
          </p>
        </div>
      </footer>
    </div>
  )
}
