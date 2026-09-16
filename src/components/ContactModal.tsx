import React, { useEffect, useRef, useState } from 'react';
import { CONTACT_EMAIL, WEB3FORMS_ACCESS_KEY } from '../data/InteractionZones';
import './ContactModal.css';

interface ContactModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type SendState = 'idle' | 'sending' | 'sent' | 'error';

const EMPTY_FORM = { name: '', email: '', message: '' };

const ContactModal: React.FC<ContactModalProps> = ({ isVisible, onClose }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [state, setState] = useState<SendState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  // Reset whenever the popup opens
  useEffect(() => {
    if (!isVisible) return;
    setState('idle');
    setErrorMessage('');
    const focusTimer = setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => clearTimeout(focusTimer);
  }, [isVisible]);

  // Modal keyboard: ESC closes; every other key stays in the form instead of reaching the game
  // (otherwise typing "w" would walk the character). Keyups still pass so held keys don't stick.
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      e.stopPropagation();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const updateField = (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'sending') return;
    // Bots fill the hidden field; pretend it worked
    if (honeypotRef.current?.checked) {
      setState('sent');
      return;
    }

    setState('sending');
    setErrorMessage('');
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `Portfolio message from ${form.name}`,
          from_name: 'Isometric Portfolio',
          name: form.name,
          email: form.email,
          message: form.message
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'The message could not be sent.');
      }
      setState('sent');
      setForm(EMPTY_FORM);
    } catch (err) {
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : 'The message could not be sent.');
    }
  };

  // Keep drags, scrolls and clicks inside the popup away from the 3D scene
  const stopEvent = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      className="contact-modal-backdrop"
      onClick={onClose}
      onMouseDown={stopEvent}
      onMouseMove={stopEvent}
      onMouseUp={stopEvent}
      onWheel={stopEvent}
      onPointerDown={stopEvent}
      onTouchStart={stopEvent}
      onTouchMove={stopEvent}
      onTouchEnd={stopEvent}
    >
      <div
        className="contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        onClick={stopEvent}
      >
        <button type="button" className="contact-modal-close" onClick={onClose} aria-label="Close">×</button>

        {state === 'sent' ? (
          <div className="contact-modal-done">
            <div className="contact-modal-check" aria-hidden="true">✓</div>
            <h2 id="contact-modal-title" className="contact-modal-title">Message sent</h2>
            <p className="contact-modal-text">Thanks for reaching out. I'll get back to you soon.</p>
            <button type="button" className="contact-modal-submit" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <h2 id="contact-modal-title" className="contact-modal-title">Get in touch</h2>
            <p className="contact-modal-text">
              Got a project, an internship or just a question? Drop me a message.
            </p>

            {WEB3FORMS_ACCESS_KEY ? (
              <form className="contact-modal-form" onSubmit={handleSubmit}>
                <label className="contact-modal-field">
                  <span>Name</span>
                  <input
                    ref={firstFieldRef}
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={updateField('name')}
                  />
                </label>
                <label className="contact-modal-field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={150}
                    value={form.email}
                    onChange={updateField('email')}
                  />
                </label>
                <label className="contact-modal-field">
                  <span>Message</span>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    maxLength={5000}
                    value={form.message}
                    onChange={updateField('message')}
                  />
                </label>

                {/* Honeypot for spam bots, hidden from people */}
                <input ref={honeypotRef} type="checkbox" name="botcheck" className="contact-modal-honeypot" tabIndex={-1} autoComplete="off" />

                {state === 'error' && (
                  <p className="contact-modal-error" role="alert">
                    {errorMessage} You can also email me at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                  </p>
                )}

                <button type="submit" className="contact-modal-submit" disabled={state === 'sending'}>
                  {state === 'sending' ? 'Sending…' : 'Send message'}
                </button>
              </form>
            ) : (
              <a className="contact-modal-submit contact-modal-mail-link" href={`mailto:${CONTACT_EMAIL}`}>
                Email {CONTACT_EMAIL}
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
