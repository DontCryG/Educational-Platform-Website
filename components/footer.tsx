import Image from "next/image"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <Image src="/lotus-arcana-logo.png" alt="Lotus Arcana" width={150} height={75} className="h-16 w-auto" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              A safe haven for paranormal seekers. Watch, share stories, and test your memory without barriers. Quality
              content, curated by admins for a true mystery experience.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">© {currentYear} Lotus Arcana. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
