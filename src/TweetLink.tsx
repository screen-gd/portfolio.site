'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Tweet } from './tweets';

function tweetDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(date));
}

// A link to an X post that previews the post on hover or keyboard focus.
export function TweetLink({ tweet, children }: { tweet: Tweet; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const link = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef(0);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const show = () => {
    clearTimeout(closeTimer.current);
    // Open toward the side of the viewport with more room.
    if (!open && link.current) setAbove(link.current.getBoundingClientRect().top > innerHeight / 2);
    setOpen(true);
  };
  const hide = () => { closeTimer.current = window.setTimeout(() => setOpen(false), 150); };

  return (
    <span className="tweet-link" ref={link} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <a href={tweet.url} target="_blank" rel="noopener noreferrer">{children}</a>
      <a className={`tweet-card${open ? ' is-open' : ''}${above ? ' is-above' : ''}`} href={tweet.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
        <span className="tweet-card-author">
          <img src={tweet.avatar} alt="" width={36} height={36} />
          <span>
            <strong>{tweet.name}{tweet.verified && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34Zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77Z" /></svg>}</strong>
            <small>@{tweet.handle}</small>
          </span>
          <svg className="tweet-card-logo" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" /></svg>
        </span>
        <span className="tweet-card-text">{tweet.text}</span>
        {tweet.image && (
          <span className="tweet-card-media">
            <img src={tweet.image} alt="" loading="lazy" />
            {tweet.video && <span className="tweet-card-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5L8 5.5Z" /></svg></span>}
          </span>
        )}
        <span className="tweet-card-date">{tweetDate(tweet.date)} · View on X</span>
      </a>
    </span>
  );
}
