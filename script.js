'use strict';

function todayInSaoPaulo(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const part = type => parts.find(p => p.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function buildWhatsAppUrl(fields) {
  const lines = ['Olá, Hede! Gostaria de combinar uma montagem.', '', ...fields
    .filter(([, value]) => String(value).trim())
    .map(([label, value]) => {
      const text = String(value).trim();
      return `${label}: ${label === 'Dia preferido' ? text.split('-').reverse().join('/') : text}`;
    })];
  return `https://wa.me/5511966173676?text=${encodeURIComponent(lines.join('\n'))}`;
}

function validateField(field, today = todayInSaoPaulo()) {
  const value = field.value.trim();
  if (field.required && !value) return 'Preencha este campo para continuar.';
  if (!value) return '';
  if (field.type === 'tel' && !/^\(?[1-9]\d\)?[\s.-]?9?\d{4}[\s.-]?\d{4}$/.test(value)) return 'Informe um número válido com DDD.';
  if (field.type === 'date' && value < today) return 'Escolha hoje ou uma data futura.';
  if (field.type === 'number' && (!Number.isInteger(Number(value)) || Number(value) < 1)) return 'Informe uma quantidade inteira, a partir de 1.';
  return '';
}

if (typeof module !== 'undefined') module.exports = {buildWhatsAppUrl,todayInSaoPaulo,validateField};

if (typeof document !== 'undefined') {
  document.querySelector('[data-year]').textContent = todayInSaoPaulo().slice(0,4);
  const form = document.querySelector('#booking-form');
  const day = form.elements.dia;
  const fields = [...form.querySelectorAll('[data-label]')];
  const updateMinimum = () => { day.min = todayInSaoPaulo(); };
  updateMinimum();
  window.addEventListener('pageshow', updateMinimum);
  fields.forEach(field => {
    const validate = () => { updateMinimum(); field.setCustomValidity(validateField(field)); };
    field.addEventListener('input', validate);
    field.addEventListener('change', validate);
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    updateMinimum();
    fields.forEach(field => field.setCustomValidity(validateField(field)));
    if (!form.reportValidity()) return;
    const url = buildWhatsAppUrl(fields.map(field => [field.dataset.label,field.value]));
    const status = document.querySelector('#form-status');
    status.querySelector('a').href = url;
    status.hidden = false;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}
