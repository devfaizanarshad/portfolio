"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy } from "lucide-react";

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path below.
  }

  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    field.style.pointerEvents = "none";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  } catch {
    return false;
  }
}

interface CopyEmailButtonProps {
  email: string;
  className?: string;
}

export function CopyEmailButton({ email, className = "" }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const [toastMounted, setToastMounted] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const onCopy = async () => {
    const ok = await writeToClipboard(email);
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];

    setCopied(ok);
    setFailed(!ok);
    setToastMounted(true);
    // Two frames: let the toast mount hidden, then transition it in.
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setToastVisible(true)));
    timers.current.push(window.setTimeout(() => setToastVisible(false), 2200));
    timers.current.push(window.setTimeout(() => setCopied(false), 2600));
  };

  return (
    <>
      <button type="button" data-magnetic onClick={onCopy} className={`btn btn-primary ${className}`}>
        {copied ? (
          <Check className="size-[18px]" strokeWidth={2} aria-hidden="true" />
        ) : (
          <Copy className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
        )}
        Copy Email
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Email address copied to clipboard." : failed ? `Copy failed. The address is ${email}.` : ""}
      </span>
      {toastMounted &&
        createPortal(
          <div className="toast" data-show={toastVisible} aria-hidden="true">
            {failed ? `Couldn’t copy. Email: ${email}` : "Copied to clipboard ✓"}
          </div>,
          document.body,
        )}
    </>
  );
}
