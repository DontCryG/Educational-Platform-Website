import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Eye, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background to-card px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">About Lotus Arcana</h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            We believe that every mystery holds a detail waiting to be discovered. Our platform is built for those who don't just watch the paranormal, but study it. Whether you are here to share a haunting story or challenge your memory, this is your sanctuary.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="border-b border-border px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                  <Target className="h-6 w-6 text-background" />
                </div>
                <CardTitle className="text-foreground">Unveil & Recall</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To provide a specialized platform where enthusiasts can upload paranormal media and create interactive quizzes, turning passive viewing into an active test of memory and observation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                  <Eye className="h-6 w-6 text-background" />
                </div>
                <CardTitle className="text-foreground">Access the Unknown</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  A world where mystery is accessible to everyone, everywhere. We aim to be a barrier-free community—no login required, fully responsive on mobile and desktop—so you can explore the paranormal anytime.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                  <Heart className="h-6 w-6 text-background" />
                </div>
                <CardTitle className="text-foreground">Curiosity with Care</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We value freedom of expression balanced with safety. While anyone can contribute, our dedicated admins curate every submission to ensure the content is appropriate, high-quality, and safe for our community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
