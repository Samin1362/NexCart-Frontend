'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

const contactInfo = [
  {
    icon: <Mail className="h-5 w-5" />,
    label: 'Email',
    value: 'support@nexcart.com',
  },
  {
    icon: <Phone className="h-5 w-5" />,
    label: 'Phone',
    value: '+1 (555) 123-4567',
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    label: 'Address',
    value: '123 Commerce Street, San Francisco, CA 94102',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: 'Hours',
    value: 'Mon–Fri: 9AM–6PM PST',
  },
];

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Invalid email address';
    }
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.message.trim()) {
      errs.message = 'Message is required';
    } else if (form.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);
    // Simulate sending — no real backend endpoint for contact form
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSending(false);
    setSuccess(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setErrors({});
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (success) setSuccess(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-bg-card border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">Contact Us</h1>
            <p className="mt-3 text-text-secondary max-w-lg mx-auto">
              Have a question, feedback, or need help? We&apos;d love to hear from you.
              Fill out the form below and we&apos;ll get back to you within 24 hours.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-text-primary mb-6">Send us a message</h2>

                {success && (
                  <div className="mb-6 border border-success bg-success/5 p-4 text-sm text-success">
                    Your message has been sent successfully! We&apos;ll get back to you soon.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Name"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Your name"
                      error={errors.name}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="you@example.com"
                      error={errors.email}
                    />
                  </div>
                  <Input
                    label="Subject"
                    value={form.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder="What is this about?"
                    error={errors.subject}
                  />
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Message
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Tell us how we can help..."
                      rows={6}
                      className="w-full border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-accent focus:outline-none resize-none"
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-error">{errors.message}</p>
                    )}
                  </div>
                  <Button type="submit" loading={sending}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Sidebar */}
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-6">Get in touch</h2>
                <div className="border border-border p-6 space-y-6">
                  {contactInfo.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-primary-accent/10 text-primary-accent">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{item.label}</p>
                        <p className="text-sm text-text-secondary mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="mt-6 border border-border bg-bg-card h-48 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-text-secondary/30 mx-auto mb-2" />
                    <p className="text-sm text-text-secondary">Map placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
