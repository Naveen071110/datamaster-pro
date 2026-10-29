import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import {
  Mail,
  MapPin,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Github,
  Globe,
  Shield,
  MessageSquare,
  Sparkles,
} from "lucide-react"
import { SEO } from "@/shared/components/SEO"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"

interface FormValues {
  name: string
  email: string
  category: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export default function ContactPage() {
  const navigate = useNavigate()

  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  })

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const validate = (formValues: FormValues): FormErrors => {
    const errs: FormErrors = {}

    // Name validation
    if (!formValues.name.trim()) {
      errs.name = "Full name is required."
    } else if (formValues.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters long."
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formValues.email.trim()) {
      errs.email = "Email address is required."
    } else if (!emailRegex.test(formValues.email.trim())) {
      errs.email = "Please enter a valid email address (e.g., name@domain.com)."
    }

    // Subject validation
    if (!formValues.subject.trim()) {
      errs.subject = "Subject is required."
    } else if (formValues.subject.trim().length < 4) {
      errs.subject = "Subject must be at least 4 characters long."
    }

    // Message validation
    if (!formValues.message.trim()) {
      errs.message = "Message cannot be empty."
    } else if (formValues.message.trim().length < 15) {
      errs.message = `Message must be at least 15 characters (currently ${formValues.message.trim().length}).`
    } else if (formValues.message.length > 2000) {
      errs.message = "Message exceeds the 2,000 character maximum limit."
    }

    return errs
  }

  const handleChange = (field: keyof FormValues, val: string) => {
    const updated = { ...values, [field]: val }
    setValues(updated)
    if (touched[field] || submitAttempted) {
      setErrors(validate(updated))
    }
  }

  const handleBlur = (field: keyof FormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors(validate(values))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
    })

    const validationErrors = validate(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      // Form has error states, scroll to top of form
      return
    }

    setIsSubmitting(true)

    // Construct mailto URI to ensure communication reaches maintainers
    const mailSubject = encodeURIComponent(`[DataMaster Pro] ${values.subject}`)
    const mailBody = encodeURIComponent(`From: ${values.name} (${values.email})\nCategory: ${values.category}\n\nMessage:\n${values.message}`)
    const mailtoUrl = `mailto:naveenguru78@gmail.com?subject=${mailSubject}&body=${mailBody}`

    // Trigger mail client fallback and navigate to Thank You page
    setTimeout(() => {
      window.location.href = mailtoUrl
      setIsSubmitting(false)
      navigate("/thank-you?type=contact")
    }, 700)
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("naveenguru78@gmail.com")
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      <SEO
        title="Contact Us & Developer Support | DataMaster Pro"
        description="Get in touch with the DataMaster Pro team. Report pipeline bugs, request enterprise data features, or inquire about open-source collaboration."
      />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <MessageSquare className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Contact & Support</h1>
            <p className="text-xs text-white/50 font-mono mt-0.5">Direct Developer Inquiries • Verified Response Within 24–48 Hours</p>
          </div>
        </div>
        <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
          Have questions about our 100% in-browser WebAssembly engine, found a bug in an SQL dialect generator, or want to contribute? Connect directly with the core engineering team.
        </p>
      </div>

      {/* Grid: Address & Info Cards on Left, Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Real Contact Address & Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Email Card */}
          <Card className="bg-[#121212] border-white/10">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-blue-400">
                  <Mail className="h-5 w-5" />
                  <span className="font-semibold text-xs uppercase tracking-wider text-white">Direct Email</span>
                </div>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px] font-mono">
                  VERIFIED
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-white/60">Primary developer inbox for issues, features &amp; support:</p>
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-2.5">
                  <span className="font-mono text-xs text-white select-all">naveenguru78@gmail.com</span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors ml-2"
                  >
                    {copiedEmail ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical / Studio Location Card */}
          <Card className="bg-[#121212] border-white/10">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold text-xs uppercase tracking-wider text-white">Operating Studio Base</span>
              </div>

              <div className="space-y-1.5 text-xs text-white/70 leading-relaxed">
                <p className="font-semibold text-white">DataMaster Pro Engineering Studio</p>
                <p>HITEC City, Madhapur</p>
                <p>Hyderabad, Telangana 500081</p>
                <p className="text-white/50 font-mono text-[11px]">Republic of India</p>
              </div>
            </CardContent>
          </Card>

          {/* SLA & Security Disclosure Card */}
          <Card className="bg-[#121212] border-white/10">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-400">
                <Clock className="h-5 w-5" />
                <span className="font-semibold text-xs uppercase tracking-wider text-white">Response Commitment</span>
              </div>

              <div className="space-y-2 text-xs text-white/70">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span>General Inquiries</span>
                  <span className="font-mono text-white/90">24–48 hours</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span>Bug &amp; Pipeline Reports</span>
                  <span className="font-mono text-white/90">12–24 hours</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Security Vulnerabilities</span>
                  <span className="font-mono text-emerald-400">&lt; 4 hours</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <a
                  href="/privacy"
                  className="text-white/60 hover:text-white underline underline-offset-2 transition-colors flex items-center gap-1"
                >
                  <Shield className="h-3 w-3 text-emerald-400" />
                  <span>Privacy Policy</span>
                </a>

                <a
                  href="https://github.com/Naveen071110/datamaster-pro/blob/main/SECURITY.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white underline underline-offset-2 transition-colors flex items-center gap-1"
                >
                  <Github className="h-3 w-3" />
                  <span>Security Policy</span>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://naveenguru.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2"
            >
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              <span>Naveen's Portfolio</span>
            </a>

            <a
              href="https://github.com/Naveen071110/datamaster-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>

        {/* Right Column: Contact Form with Interactive Form Error States (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="bg-[#121212] border-white/10 shadow-2xl">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Send a Direct Message</h2>
                </div>
                <p className="text-xs text-white/60">
                  Fill in the fields below. Client validation checks form syntax before dispatch.
                </p>
              </div>

              {/* Form Validation Alert Banner */}
              {submitAttempted && Object.keys(errors).length > 0 && (
                <div
                  role="alert"
                  className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 animate-in fade-in"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong className="block font-semibold">Please fix the highlighted errors before sending:</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      {Object.values(errors).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Name Field */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-white">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={values.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="e.g. Alex Chen"
                    aria-invalid={touched.name && !!errors.name}
                    aria-describedby={touched.name && errors.name ? "name-error" : undefined}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs bg-white/5 border text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 ${
                      touched.name && errors.name
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-500/5"
                        : "border-white/10 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                  {touched.name && errors.name && (
                    <p id="name-error" className="text-[11px] text-rose-400 flex items-center gap-1.5 pt-0.5 animate-in fade-in">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-white">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={values.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="e.g. alex@datateam.io"
                    aria-invalid={touched.email && !!errors.email}
                    aria-describedby={touched.email && errors.email ? "email-error" : undefined}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs bg-white/5 border text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 ${
                      touched.email && errors.email
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-500/5"
                        : "border-white/10 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                  {touched.email && errors.email && (
                    <p id="email-error" className="text-[11px] text-rose-400 flex items-center gap-1.5 pt-0.5 animate-in fade-in">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-category" className="block text-xs font-semibold text-white">
                    Inquiry Category
                  </label>
                  <select
                    id="contact-category"
                    value={values.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="general">General Question / Feedback</option>
                    <option value="bug">Report an SQL / Tool Bug</option>
                    <option value="feature">Request a New Dialect or Tool</option>
                    <option value="commercial">Commercial / Custom Data Integration</option>
                  </select>
                </div>

                {/* Subject Field */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-subject" className="block text-xs font-semibold text-white">
                    Subject <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={values.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    onBlur={() => handleBlur("subject")}
                    placeholder="e.g. Snowflake COPY stage syntax question"
                    aria-invalid={touched.subject && !!errors.subject}
                    aria-describedby={touched.subject && errors.subject ? "subject-error" : undefined}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs bg-white/5 border text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 ${
                      touched.subject && errors.subject
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-500/5"
                        : "border-white/10 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                  {touched.subject && errors.subject && (
                    <p id="subject-error" className="text-[11px] text-rose-400 flex items-center gap-1.5 pt-0.5 animate-in fade-in">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.subject}</span>
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-white">
                      Message <span className="text-rose-400">*</span>
                    </label>
                    <span className={`text-[10px] font-mono ${values.message.length > 2000 ? "text-rose-400" : "text-white/40"}`}>
                      {values.message.length} / 2,000
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={values.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    onBlur={() => handleBlur("message")}
                    placeholder="Describe your question, request, or issue with relevant dialect details..."
                    aria-invalid={touched.message && !!errors.message}
                    aria-describedby={touched.message && errors.message ? "message-error" : undefined}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs bg-white/5 border text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 resize-y ${
                      touched.message && errors.message
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-500/5"
                        : "border-white/10 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                  {touched.message && errors.message && (
                    <p id="message-error" className="text-[11px] text-rose-400 flex items-center gap-1.5 pt-0.5 animate-in fade-in">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-5 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-50 text-xs sm:text-sm font-semibold transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>Validating &amp; Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
