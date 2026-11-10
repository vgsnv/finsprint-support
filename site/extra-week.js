(() => {
  const section = document.querySelector('#week-calculator');
  const form = document.querySelector('#week-form');
  if (!section || !form) return;
  const result = document.querySelector('#week-result');
  const error = document.querySelector('#week-error');
  const day = 86400000;
  const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
  const date = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const put = (id, text) => { document.getElementById(id).textContent = text; };
  const boundary = (time, weekday) => time + ((weekday - new Date(time).getUTCDay() + 7) % 7) * day;
  function update() {
    const fields = [...form.querySelectorAll('input')];
    let valid = true;
    fields.forEach(input => {
      const okay = input.validity.valid && Number.isSafeInteger(input.valueAsNumber);
      input.setAttribute('aria-invalid', String(!okay));
      input.removeAttribute('aria-describedby');
      if (!okay) { valid = false; input.setAttribute('aria-describedby', 'week-error'); }
    });
    let message = 'Заполните даты от 2000 до 2100 года. Суммы — целые числа от 0 до 1 000 000 000 ₽; число доходов для подготовки — от 0 до 100.';
    const values = Object.fromEntries(fields.map(input => [input.name, input.valueAsNumber]));
    const { incomeDate, nextDate, weekly, saved, contributions } = values;
    const weekday = Number(form.elements.weekday.value);
    const start = boundary(incomeDate, weekday);
    const end = boundary(nextDate, weekday);
    if (valid && (nextDate <= incomeDate || nextDate - incomeDate > 366 * day || end <= start)) {
      valid = false;
      message = 'Следующий доход должен быть позже первого, не более чем через 366 дней. Между началами спринтов должна быть хотя бы одна полная неделя.';
      form.elements.nextDate.setAttribute('aria-invalid', 'true');
      form.elements.nextDate.setAttribute('aria-describedby', 'week-error');
    }
    error.hidden = valid;
    result.hidden = !valid;
    if (!valid) { error.textContent = message; return; }
    const weeks = Math.round((end - start) / (7 * day));
    const total = weeks * weekly;
    const extra = Math.max(0, weeks - 4) * weekly;
    const remaining = Math.max(0, total - saved);
    const extraRemaining = Math.max(0, extra - saved);
    put('week-period', `${date.format(start)} — ${date.format(end - day)}`);
    put('week-count', `Недель: ${weeks}`);
    put('week-total', money.format(total));
    put('week-extra', money.format(extra));
    put('week-remaining', money.format(remaining));
    const timeline = document.querySelector('#week-timeline');
    timeline.replaceChildren();
    for (let i = 0; i < weeks; i++) {
      const item = document.createElement('li');
      if (i >= 4) item.className = 'extra-week';
      const title = document.createElement('strong');
      title.textContent = `Неделя ${i + 1}`;
      const dates = document.createElement('span');
      dates.textContent = `${date.format(start + i * 7 * day)} — ${date.format(start + (i * 7 + 6) * day)}`;
      const amount = document.createElement('small');
      amount.textContent = money.format(weekly);
      item.append(title, dates, amount);
      timeline.append(item);
    }
    if (extra === 0) {
      put('week-saving', 'Дополнительный резерв сверх четырёх недель не нужен');
      put('week-saving-detail', `В этом спринте ${weeks} нед. На все недели нужно ${money.format(total)}. Уже отложенное учтено в сумме «Добавить с учётом резерва».`);
    } else if (extraRemaining === 0) {
      put('week-saving', 'Дополнительные порции уже обеспечены');
      put('week-saving-detail', `Отложено ${money.format(saved)}. На все недели ещё нужно ${money.format(remaining)}.${saved > total ? ` Резерв превышает потребность на ${money.format(saved - total)}.` : ''}`);
    } else if (contributions === 0) {
      put('week-saving', `К началу спринта нужно ещё ${money.format(extraRemaining)} на дополнительные недели`);
      put('week-saving-detail', 'Предыдущих доходов для подготовки не указано. Эту сумму потребуется обеспечить к началу спринта; недельные порции остаются полными.');
    } else {
      const installment = Math.ceil(extraRemaining / contributions);
      const count = Math.ceil(extraRemaining / installment);
      const last = extraRemaining - installment * (count - 1);
      put('week-saving', `Откладывайте по ${money.format(installment)} с предыдущих доходов`);
      put('week-saving-detail', `На дополнительные недели осталось собрать ${money.format(extraRemaining)}. Взносов: ${count}; последний — ${money.format(last)}. Сначала используем уже отложенное на дополнительные порции. Остальные недели оплачиваются отдельно; эти взносы не прибавляются к общей стоимости спринта второй раз.`);
    }
  }
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('reset', () => setTimeout(update, 0));
  update();
  section.hidden = false;
})();
