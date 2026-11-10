(() => {
  const calculator = document.querySelector('#calculator');
  const form = document.querySelector('#sprint-form');
  if (!calculator || !form) return;
  const inputs = [...form.querySelectorAll('input')];
  const result = document.querySelector('#calculator-result');
  const error = document.querySelector('#calculator-error');
  const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
  const put = (id, text) => { document.getElementById(id).textContent = text; };

  function update() {
    const valid = inputs.map(input => {
      const okay = input.validity.valid && Number.isSafeInteger(input.valueAsNumber);
      input.setAttribute('aria-invalid', String(!okay));
      if (okay) input.removeAttribute('aria-describedby');
      else input.setAttribute('aria-describedby', 'calculator-error');
      return okay;
    }).every(Boolean);
    error.hidden = valid;
    result.hidden = !valid;
    if (!valid) return;

    const { income, weeks, weekly, payment } = Object.fromEntries(inputs.map(input => [input.name, input.valueAsNumber]));
    const weeklyTotal = weeks * weekly;
    const total = weeklyTotal + payment;
    const balance = income - total;
    put('income-result', money.format(income));
    put('weeks-result', money.format(weeklyTotal));
    put('weeks-detail', `${weeks} × ${money.format(weekly)}`);
    put('payment-result', money.format(payment));
    put('total-result', money.format(total));
    result.dataset.state = balance < 0 ? 'shortfall' : 'funded';
    put('balance-result', balance < 0 ? `Не хватает ${money.format(-balance)}` : balance === 0 ? 'Доход распределён полностью' : `Остаётся ${money.format(balance)}`);
    put('balance-detail', balance < 0
      ? 'Недельная порция остаётся полной. Чтобы выполнить этот план, нужен дополнительный доход или пересмотр будущих трат.'
      : balance === 0 ? 'На все недели и платёж хватает ровно. Свободного остатка нет.'
      : 'Этот остаток можно направить на цели, будущие платежи или резерв.');
  }
  form.addEventListener('input', update);
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('reset', () => setTimeout(update, 0));
  update();
  calculator.hidden = false;
})();
