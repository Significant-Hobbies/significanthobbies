'use client';

import '@saas-maker/feedback/dist/index.css';

import { FeedbackWidget } from '@saas-maker/feedback';

const FEEDBACK_INGESTION_URL = 'https://feedback.sassmaker.com/api/feedback';

export function SaaSMakerFeedback() {
  return (
    <>
      <FeedbackWidget ingestionUrl={FEEDBACK_INGESTION_URL} position="bottom-right" theme="auto" />
      <style>{`
        @media (max-width: 639px) {
          [data-feedback-widget] .smw-trigger {
            width: 44px;
            height: 44px;
            right: 8px;
            bottom: 8px;
            justify-content: center;
            padding: 0;
          }

          [data-feedback-widget] .smw-trigger__text {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
