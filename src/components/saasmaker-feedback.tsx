'use client';

import '@saas-maker/feedback/dist/index.css';
import '@saas-maker/testimonials/dist/index.css';
import '@saas-maker/changelog-widget/dist/index.css';

import { ChangelogTimeline } from '@saas-maker/changelog-widget';
import { FeedbackWidget } from '@saas-maker/feedback';
import { TestimonialWall } from '@saas-maker/testimonials';
import { useEffect, useState } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_SAASMAKER_API_KEY ?? '';
const API_BASE = 'https://api.sassmaker.com';

type ContentStatus = 'loading' | 'empty' | 'ready';

function useSaaSMakerContentStatus(path: string) {
  const [status, setStatus] = useState<ContentStatus>('loading');

  useEffect(() => {
    if (!API_KEY) {
      setStatus('empty');
      return;
    }

    let cancelled = false;

    fetch(`${API_BASE}${path}`, {
      headers: { 'X-Project-Key': API_KEY },
    })
      .then((response) => (response.ok ? response.json() : { data: [] }))
      .then((payload) => {
        if (cancelled) return;
        setStatus(Array.isArray(payload.data) && payload.data.length > 0 ? 'ready' : 'empty');
      })
      .catch(() => {
        if (!cancelled) setStatus('empty');
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return status;
}

export function SaaSMakerFeedback() {
  if (!API_KEY) return null;
  return (
    <FeedbackWidget
      projectId={API_KEY}
      apiBaseUrl={API_BASE}
      position="bottom-right"
      theme="auto"
    />
  );
}

export function SaaSMakerTestimonials() {
  if (!API_KEY) return null;
  return <TestimonialWall projectId={API_KEY} apiBaseUrl={API_BASE} theme="auto" layout="grid" />;
}

export function SaaSMakerTestimonialsSection() {
  const status = useSaaSMakerContentStatus('/v1/testimonials?limit=6');

  if (status !== 'ready') return null;

  return (
    <section className="border-t border-border px-4 py-16" style={{ background: '#FAFAFA' }}>
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
          What people are saying
        </h2>
        <SaaSMakerTestimonials />
      </div>
    </section>
  );
}

export function SaaSMakerChangelog() {
  if (!API_KEY) return null;
  return <ChangelogTimeline projectId={API_KEY} apiBaseUrl={API_BASE} theme="auto" />;
}

export function SaaSMakerChangelogSection() {
  const status = useSaaSMakerContentStatus('/v1/changelog?limit=10');

  if (status !== 'ready') return null;

  return (
    <section className="border-t border-border px-4 py-16 bg-card/40">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-8 text-center text-3xl font-bold text-foreground">Changelog</h2>
        <SaaSMakerChangelog />
      </div>
    </section>
  );
}
