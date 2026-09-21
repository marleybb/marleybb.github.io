const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.project-card, .timeline-row, .education-card, .now-card').forEach((element) => {
  observer.observe(element);
});

document.querySelectorAll('.education-card').forEach((card) => {
  const toggleCard = () => {
    const isFlipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', String(isFlipped));
  };

  card.addEventListener('click', toggleCard);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleCard();
    }
  });
});

const profileNote = document.querySelector('.profile-note');
const profilePaper = profileNote?.querySelector('.profile-paper');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const canHoverProfile = window.matchMedia('(hover: hover) and (pointer: fine)');

if (profileNote && profilePaper && canHoverProfile.matches && !prefersReducedMotion.matches) {
  let previousY = null;

  profileNote.addEventListener('pointermove', (event) => {
    const bounds = profileNote.getBoundingClientRect();
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    const direction = previousY === null ? 0 : Math.max(-1, Math.min(1, (event.clientY - previousY) / 14));
    const lift = Math.max(-9, Math.min(7, (y * 9) + (direction * 3)));
    previousY = event.clientY;

    profilePaper.style.transform = `rotate(4deg) rotateX(${lift}deg)`;
  });

  profileNote.addEventListener('pointerleave', () => {
    previousY = null;
    profilePaper.style.transform = 'rotate(4deg) rotateX(0deg)';
  });
}

const touchMotion = window.matchMedia('(hover: none) and (pointer: coarse) and (prefers-reduced-motion: no-preference)');

if (touchMotion.matches) {
  const replayClass = (element, className, duration = 520) => {
    element.classList.remove(className);
    // Restarting a short CSS animation gives touch a clear, intentional response.
    void element.offsetWidth;
    element.classList.add(className);
    window.setTimeout(() => element.classList.remove(className), duration);
  };

  profileNote?.addEventListener('pointerup', () => replayClass(profileNote, 'is-tapped', 620));

  document.querySelectorAll('.project-shot, .lotte-visual').forEach((visual) => {
    visual.addEventListener('pointerdown', () => replayClass(visual, 'is-tapped', 480), { passive: true });
  });
}

const closingSection = document.querySelector('.closing');
const languageBubble = document.querySelector('.language-bubble');
const canFloatBubble = window.matchMedia('(min-width: 801px) and (prefers-reduced-motion: no-preference)');

if (closingSection && languageBubble && canFloatBubble.matches) {
  let x = 0;
  let y = 0;
  let velocityX = 0.28;
  let velocityY = 0.18;
  let initialized = false;
  let hasStarted = false;

  languageBubble.style.opacity = '0';

  const positionBubble = () => {
    const sectionBounds = closingSection.getBoundingClientRect();
    const bubbleBounds = languageBubble.getBoundingClientRect();
    x = 56;
    y = 140;
    initialized = true;
  };

  closingSection.addEventListener('pointermove', (event) => {
    const sectionBounds = closingSection.getBoundingClientRect();
    const bubbleBounds = languageBubble.getBoundingClientRect();
    const pointerX = event.clientX - sectionBounds.left;
    const pointerY = event.clientY - sectionBounds.top;
    const bubbleX = bubbleBounds.left - sectionBounds.left + bubbleBounds.width / 2;
    const bubbleY = bubbleBounds.top - sectionBounds.top + bubbleBounds.height / 2;
    const deltaX = bubbleX - pointerX;
    const deltaY = bubbleY - pointerY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance > 0 && distance < 165) {
      const force = (165 - distance) / 165;
      velocityX += (deltaX / distance) * force * 1.25;
      velocityY += (deltaY / distance) * force * 1.25;
    }
  });

  const animateBubble = (time) => {
    if (!initialized) positionBubble();

    const sectionBounds = closingSection.getBoundingClientRect();
    const bubbleBounds = languageBubble.getBoundingClientRect();
    const min = 18;
    const maxX = Math.max(min, sectionBounds.width - bubbleBounds.width - min);
    const maxY = Math.max(min, sectionBounds.height - bubbleBounds.height - min);

    velocityX += Math.sin(time / 1800) * 0.0025;
    velocityY += Math.cos(time / 2100) * 0.0025;
    velocityX *= 0.992;
    velocityY *= 0.992;

    const speed = Math.hypot(velocityX, velocityY);
    if (speed < 0.16) {
      velocityX += 0.012;
      velocityY += 0.008;
    } else if (speed > 2.2) {
      velocityX = (velocityX / speed) * 2.2;
      velocityY = (velocityY / speed) * 2.2;
    }

    x += velocityX;
    y += velocityY;

    if (x <= min || x >= maxX) {
      x = Math.max(min, Math.min(maxX, x));
      velocityX *= -0.92;
    }
    if (y <= min || y >= maxY) {
      y = Math.max(min, Math.min(maxY, y));
      velocityY *= -0.92;
    }

    const tilt = Math.max(-6, Math.min(6, velocityX * 2.2));
    languageBubble.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg)`;
    requestAnimationFrame(animateBubble);
  };

  const bubbleObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting) || hasStarted) return;

    hasStarted = true;
    positionBubble();
    languageBubble.style.opacity = '1';
    requestAnimationFrame(animateBubble);
    bubbleObserver.disconnect();
  }, { threshold: 0.12 });

  bubbleObserver.observe(closingSection);
}

if (closingSection && languageBubble && touchMotion.matches) {
  languageBubble.addEventListener('pointerup', (event) => {
    event.stopPropagation();
    languageBubble.classList.remove('is-nudged');
    void languageBubble.offsetWidth;
    languageBubble.classList.add('is-nudged');
    window.setTimeout(() => languageBubble.classList.remove('is-nudged'), 700);
  });
}

const doodleCanvas = document.querySelector('.doodle-canvas');
const doodleTools = document.querySelectorAll('.doodle-color, .doodle-eraser');
const contactDialog = document.querySelector('.contact-dialog');
const contactForm = document.querySelector('.doodle-form');
const contactStatus = document.querySelector('.form-status');
const contactOpen = document.querySelector('[data-contact-open]');
const contactClose = document.querySelector('[data-contact-close]');

if (closingSection && doodleCanvas) {
  const context = doodleCanvas.getContext('2d');
  let color = '#654638';
  let erasing = false;
  let drawing = false;
  let previousPoint = null;

  const resizeCanvas = () => {
    const bounds = closingSection.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    doodleCanvas.width = Math.round(bounds.width * ratio);
    doodleCanvas.height = Math.round(bounds.height * ratio);
    doodleCanvas.style.width = `${bounds.width}px`;
    doodleCanvas.style.height = `${bounds.height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineCap = 'round';
    context.lineJoin = 'round';
  };

  const pointFromEvent = (event) => {
    const bounds = doodleCanvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const drawSegment = (from, to) => {
    context.save();
    context.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
    context.strokeStyle = color;
    context.lineWidth = erasing ? 22 : 4.5;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    context.restore();
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  doodleCanvas.addEventListener('pointerdown', (event) => {
    drawing = true;
    previousPoint = pointFromEvent(event);
    doodleCanvas.setPointerCapture(event.pointerId);
    drawSegment(previousPoint, { x: previousPoint.x + 0.01, y: previousPoint.y + 0.01 });
  });

  doodleCanvas.addEventListener('pointermove', (event) => {
    if (!drawing || !previousPoint) return;
    const point = pointFromEvent(event);
    drawSegment(previousPoint, point);
    previousPoint = point;
  });

  const stopDrawing = () => {
    drawing = false;
    previousPoint = null;
  };

  doodleCanvas.addEventListener('pointerup', stopDrawing);
  doodleCanvas.addEventListener('pointercancel', stopDrawing);
  doodleCanvas.addEventListener('pointerleave', stopDrawing);

  doodleTools.forEach((tool) => {
    tool.addEventListener('click', () => {
      doodleTools.forEach((item) => item.classList.remove('is-active'));
      tool.classList.add('is-active');
      erasing = tool.classList.contains('doodle-eraser');
      if (!erasing) color = tool.dataset.color;
      doodleCanvas.style.cursor = erasing ? 'cell' : 'crosshair';
    });
  });

  contactOpen?.addEventListener('click', () => {
    if (typeof contactDialog?.showModal === 'function') contactDialog.showModal();
  });

  contactClose?.addEventListener('click', () => contactDialog?.close());
  contactDialog?.addEventListener('click', (event) => {
    if (event.target === contactDialog) contactDialog.close();
  });

  contactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const doodle = await new Promise((resolve) => doodleCanvas.toBlob(resolve, 'image/png'));
    const attachmentInput = contactForm.querySelector('input[name="attachment"]');
    if (!doodle || !attachmentInput) {
      contactStatus.textContent = 'Your doodle could not be prepared. Please try again.';
      return;
    }

    submitButton.disabled = true;
    contactStatus.textContent = 'Sending your doodle…';

    try {
      const transfer = new DataTransfer();
      transfer.items.add(new File([doodle], 'doodle.png', { type: 'image/png' }));
      attachmentInput.files = transfer.files;
      // FormSubmit handles image attachments through a regular multipart form,
      // then sends visitors back to the contact section.
      HTMLFormElement.prototype.submit.call(contactForm);
    } catch (error) {
      submitButton.disabled = false;
      contactStatus.textContent = 'That did not send. Please try again or email Marley directly.';
    }
  });
}
