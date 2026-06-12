import { html, raw } from 'hono/html'
import type { Faq } from '../data/faqs'

export function FaqAccordion(faqs: Faq[]) {
  return html`<div class="reveal">
    ${raw(faqs.map((f) => `
      <div class="faq-item">
        <button class="faq-q"><span>${f.q}</span><i class="fas fa-plus"></i></button>
        <div class="faq-a"><p>${f.a}</p></div>
      </div>`).join(''))}
  </div>`
}
