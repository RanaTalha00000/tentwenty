/* ========================
   TenTwenty — Header burger menu
   ======================== */
(function () {
  var burger = document.getElementById('ttBurger');
  var menu   = document.getElementById('ttMobileMenu');
  if (!burger || !menu) return;

  burger.addEventListener('click', function () {
    var isOpen = burger.classList.toggle('active');
    menu.classList.toggle('active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  /* Close menu when a nav link is tapped */
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      burger.classList.remove('active');
      menu.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* Close menu on outside click */
  document.addEventListener('click', function (e) {
    if (!burger.contains(e.target) && !menu.contains(e.target)) {
      burger.classList.remove('active');
      menu.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
})();
