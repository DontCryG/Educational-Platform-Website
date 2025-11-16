import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  const faqs = [
    {
      question: "Do I need an account to upload stories or create quizzes?",
      answer:
        "Not at all! We believe in open access. You can upload paranormal media and create memory quizzes immediately without logging in. However, to maintain quality and safety, your submission will be reviewed by our admins before it goes public.",
    },
    {
      question: "Is this platform free to use?",
      answer:
        "Yes, completely. We believe that the truth—and the thrill—should be accessible to everyone. There are no subscriptions or hidden fees. You can upload stories, watch clips, and take quizzes freely without any cost.",
    },
    {
      question: "Can I explore the mysteries on mobile?",
      answer:
        "Absolutely. The unknown is everywhere, and so is our platform. Whether you are on a smartphone, tablet, or desktop, you can watch stories, upload evidence, and challenge your memory seamlessly—anytime, anywhere.",
    },
    {
      question: "Do I get a score after taking a quiz?",
      answer:
        "Yes! You will receive instant feedback on your memory accuracy. While we don't offer formal certificates, the real reward is proving that you observed every hidden detail that others might have missed.",
    },
    {
      question: "How often are new mysteries added?",
      answer:
        "Constantly! Since our platform is community-driven, new stories and quizzes are submitted by users like you every day. Once verified by our admins, fresh content is released immediately for you to explore.",
    },
    {
      question: "Can I create my own quizzes or upload stories?",
      answer:
        "Absolutely! We welcome all mystery enthusiasts to contribute. You don't need to be an expert—just use our 'Create' page to submit your paranormal media or build a memory challenge. Our team will review every submission to ensure quality and safety.",
    },
    {
      question: "What if I encounter a technical glitch?",
      answer:
        "Don't let a bug stop your investigation. If you face any issues with uploading, playback, or quizzes, please report the anomaly through our Contact page. Our team will exorcise the bugs and resolve the issue as soon as possible.",
    },
    {
      question: "Can I download videos to watch offline?",
      answer:
        "Currently, content is available for streaming only. This ensures you can immediately jump into the memory quiz right after watching. You can access the site anytime via your browser on any device without installing an app.",
    },
    {
      question: "Can I remove my content after uploading?",
      answer:
        "Yes. You own your stories. If you change your mind, simply contact our support team with details of your submission. We respect your rights and will promptly remove your content from the platform upon request.",
    },
    {
      question: "How can I join the Moderator team?",
      answer:
        "We are always looking for sharp-eyed 'Guardians' to help verify the unknown. If you have a passion for mystery and want to help keep our community safe and high-quality, please reach out to us via the Contact page.",
    },
  ]

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-muted-foreground">Find answers to common questions about Lotus Arcana</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border border-border bg-card px-6">
              <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-primary hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
