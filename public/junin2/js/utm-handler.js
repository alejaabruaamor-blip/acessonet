/* Redireciona o quiz para a pagina de registro do proprio funil */
window.addEventListener('DOMContentLoaded', function () {
  window.goWithdraw = function () {
    var dest = new URL('../registro/', window.location.href);
    new URLSearchParams(window.location.search).forEach(function (v, k) {
      dest.searchParams.set(k, v);
    });
    var el = document.getElementById('balance');
    var total = el ? parseFloat(el.textContent.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
    if (!isFinite(total) || total <= 0) total = 868.75;
    dest.searchParams.set('total', total.toFixed(2));
    dest.searchParams.set('last', '78.25');
    if (window.fbq) fbq('track', 'AddToCart', { value: total, currency: 'BRL' });
    window.location.href = dest.toString();
  };
});
