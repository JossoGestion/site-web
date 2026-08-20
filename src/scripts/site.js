/* JOSSO Gestion : interactions
   1. Menu mobile
   2. Bandeau d'avis en défilement continu (duplication + pause)
   3. Hauteur réelle de la barre d'action mobile
   4. Révélations au défilement (IntersectionObserver, pas d'écouteur scroll)
   5. Balayage directionnel des boutons
   6. Formulaire de contact : validation, états d'erreur, envoi
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

  /* ── 3 bis. Hauteur du bandeau et de l'en-tête ────────── */
  // Sert à faire remplir au hero exactement la hauteur visible,
  // pour qu'aucune section suivante n'affleure sous les images.
  var topbar = document.querySelector('.topbar');
  var header = document.querySelector('.header');

  if (topbar && header) {
    var syncChrome = function () {
      document.documentElement.style.setProperty(
        '--chrome-h',
        (topbar.offsetHeight + header.offsetHeight) + 'px'
      );
    };
    syncChrome();
    window.addEventListener('resize', syncChrome);
    window.addEventListener('load', syncChrome);   // après chargement des polices
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

    // Filet de sécurité : si l'observateur ne s'est jamais déclenché
    // (onglet en arrière-plan au chargement, navigateur exotique), on
    // affiche tout au bout de trois secondes. Rien ne doit rester
    // définitivement invisible.
    window.setTimeout(function () {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
    }, 3000);
  }

  /* ── 5. Balayage directionnel des boutons ─────────────── */
  // Le fond entre par le bord que le curseur vient de franchir et
  // ressort par celui qu'il quitte. Aucun déplacement du bouton :
  // on n'écrit que la direction, la transition CSS fait le reste.
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (finePointer && !reduced) {
    // Bord le plus proche du point de contact : haut, droite, bas, gauche.
    var edgeOf = function (btn, e) {
      var r = btn.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      var d = [y, r.width - x, r.height - y, x];
      return d.indexOf(Math.min(d[0], d[1], d[2], d[3]));
    };

    var OFFSETS = [
      ['0', '-101%'],   // haut
      ['101%', '0'],    // droite
      ['0', '101%'],    // bas
      ['-101%', '0']    // gauche
    ];

    var setOrigin = function (btn, edge) {
      btn.style.setProperty('--wipe-tx', OFFSETS[edge][0]);
      btn.style.setProperty('--wipe-ty', OFFSETS[edge][1]);
    };

    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('pointerenter', function (e) {
        setOrigin(btn, edgeOf(btn, e));
        // Le navigateur doit voir la position de départ avant l'arrivée.
        void btn.offsetWidth;
        btn.classList.add('is-wiping');
      });

      btn.addEventListener('pointerleave', function (e) {
        setOrigin(btn, edgeOf(btn, e));
        btn.classList.remove('is-wiping');
      });

      // Au clavier, pas de bord d'entrée : le fond monte depuis le bas.
      btn.addEventListener('focus', function () {
        setOrigin(btn, 2);
        void btn.offsetWidth;
        btn.classList.add('is-wiping');
      });
      btn.addEventListener('blur', function () {
        btn.classList.remove('is-wiping');
      });
    });
  }

  /* ── 6. Formulaire de contact ─────────────────────────── */
  // Envoi vers Web3Forms en arrière-plan : la personne reste sur la
  // page et voit un message de confirmation. Sans JavaScript, le
  // formulaire part en POST classique et Web3Forms affiche sa page.
  var form = document.querySelector('.contact__form');
  var note = document.querySelector('[data-form-note]');

  if (form) {
    var fields = Array.prototype.slice.call(
      form.querySelectorAll('input:not([type="hidden"]):not(.hp), select, textarea')
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
        setNote('Quelques champs sont à compléter avant l\u2019envoi.', 'error');
        firstInvalid.focus();
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.classList.add('is-busy');
      setNote('Envoi en cours…');

      var payload = {};
      new FormData(form).forEach(function (value, key) { payload[key] = value; });

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) {
          return { ok: r.ok, data: d };
        }); })
        .then(function (res) {
          if (btn) btn.classList.remove('is-busy');
          if (res.ok && res.data.success) {
            form.reset();
            fields.forEach(function (el) {
              var w = el.closest('.field');
              if (w) w.classList.remove('has-error');
            });
            setNote(
              'Merci, votre demande est bien partie. Vivien Josso vous répondra sous 48h ouvrées.',
              'success'
            );
          } else {
            setNote(
              'L\u2019envoi a échoué. Écrivez directement à jossogestion@gmail.com ou appelez le 06 89 90 71 16.',
              'error'
            );
          }
        })
        .catch(function () {
          if (btn) btn.classList.remove('is-busy');
          setNote(
            'L\u2019envoi a échoué, vérifiez votre connexion. Vous pouvez aussi écrire à jossogestion@gmail.com.',
            'error'
          );
        });
    });
  }
})();
