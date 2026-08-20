/* JOSSO Gestion : interactions
   1. Menu mobile
   2. Bandeau d'avis en défilement continu (duplication + pause)
   3. Hauteur réelle de la barre d'action mobile
   4. Révélations au défilement (IntersectionObserver, pas d'écouteur scroll)
   5. Formulaire de contact : validation, états d'erreur, envoi
*/
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Menu mobile ───────────────────────────────────── */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('mobile-menu');

  if (burger && menu) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      menu.hidden = !open;
    };

    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        burger.focus();
      }
    });

    var desktop = window.matchMedia('(min-width:1000px)');
    var syncViewport = function () { if (desktop.matches) setMenu(false); };
    desktop.addEventListener ? desktop.addEventListener('change', syncViewport)
                             : desktop.addListener(syncViewport);
  }

  /* ── 2. Bandeau d'avis ────────────────────────────────── */
  // L'animation translate de -50 % suppose deux copies de la liste :
  // on duplique donc les cartes avant d'armer l'animation.
  document.querySelectorAll('[data-marquee]').forEach(function (marquee) {
    var track = marquee.querySelector('[data-marquee-track]');
    if (!track) return;

    Array.prototype.slice.call(track.children).forEach(function (card) {
      var copy = card.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('a,button').forEach(function (el) { el.tabIndex = -1; });
      track.appendChild(copy);
    });

    marquee.classList.add('is-running');
  });

  /* ── 3. Barre d'action mobile ─────────────────────────── */
  var bar = document.querySelector('.actionbar');
  if (bar) {
    var syncBar = function () {
      var visible = getComputedStyle(bar).display !== 'none';
      document.body.style.setProperty(
        '--actionbar-h',
        visible ? bar.offsetHeight + 'px' : '0px'
      );
    };
    syncBar();
    window.addEventListener('resize', syncBar);
  }

  /* ── 4. Révélations au défilement ─────────────────────── */
  // Les groupes reçoivent une cascade : chaque enfant part avec
  // 90 ms de retard sur le précédent, via la variable --index.
  document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
    Array.prototype.slice.call(group.children).forEach(function (child, i) {
      child.setAttribute('data-reveal', '');
      child.style.setProperty('--index', i);
    });
  });

  var targets = document.querySelectorAll('[data-reveal]');

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    document.documentElement.classList.add('motion-ready');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);          // une seule fois, puis on relâche
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ── 5. Formulaire de contact ─────────────────────────── */
  // Pas de back-end sur ce site statique : on valide, puis on ouvre
  // le client mail pré-rempli en annonçant clairement ce qui se passe.
  var form = document.querySelector('.contact__form');
  var note = document.querySelector('[data-form-note]');

  if (form) {
    var fields = Array.prototype.slice.call(
      form.querySelectorAll('input, select, textarea')
    );

    var setFieldState = function (el) {
      var wrap = el.closest('.field');
      if (!wrap) return true;
      var ok = el.checkValidity();
      wrap.classList.toggle('has-error', !ok);
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };

    // On ne signale l'erreur qu'après une première sortie de champ,
    // jamais pendant que la personne est en train d'écrire.
    fields.forEach(function (el) {
      el.addEventListener('blur', function () { setFieldState(el); });
      el.addEventListener('input', function () {
        var wrap = el.closest('.field');
        if (wrap && wrap.classList.contains('has-error')) setFieldState(el);
      });
    });

    var setNote = function (text, kind) {
      if (!note) return;
      note.textContent = text;
      note.className = 'form-note' + (kind ? ' is-' + kind : '');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalid = null;
      fields.forEach(function (el) {
        if (!setFieldState(el) && !firstInvalid) firstInvalid = el;
      });

      if (firstInvalid) {
        setNote('Quelques champs sont à compléter avant l’envoi.', 'error');
        firstInvalid.focus();
        return;
      }

      var val = function (name) {
        var f = form.elements[name];
        return f && f.value ? f.value.trim() : '';
      };

      var lines = [
        'Nom et prénom : ' + val('nom'),
        'Email : ' + val('email'),
        'Téléphone : ' + (val('telephone') || 'non renseigné'),
        'Je suis : ' + (val('profil') || 'non renseigné'),
        '',
        val('message')
      ];

      var href = 'mailto:jossogestion@gmail.com'
        + '?subject=' + encodeURIComponent('Demande de contact de ' + val('nom'))
        + '&body=' + encodeURIComponent(lines.join('\n'));

      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.classList.add('is-busy');
      setNote('Ouverture de votre logiciel de messagerie…');

      window.location.href = href;

      window.setTimeout(function () {
        if (btn) btn.classList.remove('is-busy');
        setNote(
          'Votre demande est pré-remplie dans votre messagerie. Si rien ne s’ouvre, '
          + 'écrivez directement à jossogestion@gmail.com.',
          'success'
        );
      }, 1200);
    });
  }
})();
