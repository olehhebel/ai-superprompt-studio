(() => {
  const dialog = document.getElementById('project-dialog');
  const form = document.getElementById('project-brief-form');
  if (!dialog || !form) return;
  const uk = document.documentElement.lang === 'uk';
  const fields = form.querySelector('[data-brief-fields]');
  const success = form.querySelector('[data-brief-success]');
  const error = form.querySelector('[data-brief-error]');
  const submit = form.querySelector('[type="submit"]');
  const close = form.querySelector('.dialog-close');
  const done = form.querySelector('.success-close');
  let opener;
  let busy = false;
  const dismiss = () => { dialog.close(); opener?.focus(); };
  document.querySelectorAll('[data-open-form]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      opener = event.currentTarget;
      if (!busy) { fields.hidden = false; success.hidden = true; close.hidden = false; error.textContent = ''; }
      dialog.showModal();
      requestAnimationFrame(() => form.querySelector('#brief-email').focus({preventScroll:true}));
    });
  });
  close.addEventListener('click', dismiss);
  done.addEventListener('click', dismiss);
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dismiss();
  } });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    if (data.botcheck) return;
    delete data.botcheck;
    data.page_url = location.href;
    data.cta_source = opener?.dataset.source || 'project-brief';
    busy = true; submit.disabled = true; submit.setAttribute('aria-busy', 'true'); error.textContent = '';
    try {
      const response = await fetch(form.action, {method:'POST', headers:{'Content-Type':'application/json', Accept:'application/json'}, body:JSON.stringify(data)});
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('Submission rejected');
      form.reset(); fields.hidden = true; success.hidden = false; close.hidden = true; done.focus();
    } catch {
      error.textContent = uk ? 'Не вдалося надіслати бриф. Спробуй ще раз або напиши на theolehhebel@gmail.com.' : 'Could not send the brief. Please try again or email theolehhebel@gmail.com.';
    } finally {
      busy = false; submit.disabled = false; submit.removeAttribute('aria-busy');
    }
  });
})();
