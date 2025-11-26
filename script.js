// script.js — control completo de UI, sesión simulada, guías y eventos
(() => {
  // Helpers seguros
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // Elementos principales (si no existen, manejamos sin romper)
  const loginModal = $('#loginModal');
  const registroModal = $('#registroModal');
  const loginBtn = $('#loginBtn');
  const registroBtn = $('#registroBtn');
  const darkToggle = $('#darkModeToggle');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  // Mostrar notificación
  function mostrarNotificacion(texto, esError = false) {
    const n = document.createElement('div');
    n.className = esError ? 'notificacion error show' : 'notificacion show';
    n.innerText = texto;
    document.body.appendChild(n);
    // Quitar después
    setTimeout(() => n.classList.remove('show'), 2800);
    setTimeout(() => n.remove(), 3200);
  }

  // Sesión en localStorage
  function actualizarEstadoSesion() {
    const usuario = localStorage.getItem('usuario');
    if (!loginBtn) return;
    if (usuario) {
      loginBtn.textContent = 'Cerrar Sesión';
      if (registroBtn) registroBtn.style.display = 'none';
    } else {
      loginBtn.textContent = 'Iniciar Sesión';
      if (registroBtn) registroBtn.style.display = 'inline-block';
    }
  }
  actualizarEstadoSesion();

  // Abrir/ cerrar modales auxiliares
  function abrirModal(modal) {
    if (!modal) return;
    modal.style.display = 'flex';
  }
  function cerrarModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
  }

  // Manejo del botón login (iniciar o cerrar sesión)
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const usuario = localStorage.getItem('usuario');
      if (usuario) {
        // cerrar
        localStorage.removeItem('usuario');
        mostrarNotificacion('Sesión cerrada');
        actualizarEstadoSesion();
        return;
      }
      abrirModal(loginModal);
    });
  }

  // Botón registro abre modal
  if (registroBtn) {
    registroBtn.addEventListener('click', () => abrirModal(registroModal));
  }

  // Cerrar modales con X
  $$('.modal .close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      cerrarModal(modal);
    });
  });

  // Cerrar modales al hacer click fuera
  window.addEventListener('click', e => {
    if (e.target && e.target.classList && e.target.classList.contains('modal')) {
      cerrarModal(e.target);
    }
  });

  // Formularios: login y registro (validaciones mínimas)
  const loginForm = $('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = (document.getElementById('loginEmail') || {}).value || '';
      const pass = (document.getElementById('loginPassword') || {}).value || '';
      if (email.length < 5 || pass.length < 3) {
        mostrarNotificacion('Credenciales inválidas', true);
        return;
      }
      localStorage.setItem('usuario', email);
      cerrarModal(loginModal);
      mostrarNotificacion('Sesión iniciada');
      actualizarEstadoSesion();
    });
  }

  const regForm = $('#registroForm');
  if (regForm) {
    regForm.addEventListener('submit', e => {
      e.preventDefault();
      const nombre = (document.getElementById('nombre') || {}).value || '';
      const email = (document.getElementById('email') || {}).value || '';
      const edad = Number((document.getElementById('edad') || {}).value || 0);
      if (!nombre.trim() || !email.trim()) {
        mostrarNotificacion('Completa todos los campos', true);
        return;
      }
      if (!edad || edad < 10) {
        mostrarNotificacion('Debes tener al menos 10 años', true);
        return;
      }
      // Guardamos usuario (simulado)
      localStorage.setItem('usuario', email);
      cerrarModal(registroModal);
      mostrarNotificacion('Registro exitoso, bienvenida ' + nombre + '!');
      actualizarEstadoSesion();
    });
  }

  // Inscribirse en cursos (botones .card-btn, pero NO las que son guia-btn)
  $$('.card-btn').forEach(btn => {
    // si tiene clase guia-btn, lo ignoramos aquí
    if (btn.classList.contains('guia-btn')) return;
    btn.addEventListener('click', () => {
      const usuario = localStorage.getItem('usuario');
      if (!usuario) {
        abrirModal(registroModal);
        mostrarNotificacion('Debes registrarte para continuar', true);
      } else {
        mostrarNotificacion('Inscripción realizada correctamente 🎉');
      }
    });
  });

  // "Ver Guía" — abre modal dinámico con la info de la mentora (foto, nombre, texto)
  function crearModalGuia() {
    // Si ya existe, retornarla
    let mg = document.getElementById('modalGuia');
    if (mg) return mg;

    mg = document.createElement('div');
    mg.id = 'modalGuia';
    mg.className = 'modal';
    mg.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <div class="guia-body" style="text-align:left;">
          <img id="guiaImg" src="" alt="" style="width:100%;height:220px;object-fit:cover;border-radius:8px;margin-bottom:12px;">
          <h3 id="guiaNombre" style="color:#531072;margin-bottom:6px;"></h3>
          <p id="guiaTexto" style="margin-bottom:12px;"></p>
          <div style="text-align:right;">
            <button id="downloadGuia" class="card-btn" style="margin-right:8px;">Descargar PDF</button>
            <button id="closeGuia" class="card-btn">Cerrar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(mg);

    // listeners de cierre
    mg.querySelector('.close').addEventListener('click', () => cerrarModal(mg));
    mg.querySelector('#closeGuia').addEventListener('click', () => cerrarModal(mg));
    mg.addEventListener('click', e => { if (e.target === mg) cerrarModal(mg); });

    return mg;
  }

  $$('.guia-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Obtener tarjeta padre (.card)
      const card = btn.closest('.card');
      if (!card) return;

      // Extraer datos: imagen, nombre, párrafo
      const img = card.querySelector('img') ? card.querySelector('img').src : '';
      const nombre = card.querySelector('h3') ? card.querySelector('h3').innerText : 'Guía';
      const texto = card.querySelector('p') ? card.querySelector('p').innerText : '';

      // Si no está logueada, pedir login
      const usuario = localStorage.getItem('usuario');
      if (!usuario) {
        abrirModal(loginModal);
        mostrarNotificacion('Inicia sesión para ver la guía', true);
        return;
      }

      // Crear o usar modalGuia
      const mg = crearModalGuia();
      mg.style.display = 'flex';
      (mg.querySelector('#guiaImg')).src = img || 'https://via.placeholder.com/800x400';
      mg.querySelector('#guiaNombre').innerText = nombre;
      mg.querySelector('#guiaTexto').innerText = texto + '\\n\\nContenido adicional de la guía...';

      // Download (abre un PDF de ejemplo, puedes cambiar URL)
      mg.querySelector('#downloadGuia').onclick = () => {
        mostrarNotificacion('Descargando guía...');
        setTimeout(() => {
          window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
        }, 500);
      };
    });
  });

  // Eventos: Unirse / Inscribirse / Explorar
  const eventBtns = Array.from(document.querySelectorAll('.event-card .event-btn'));
  // Aseguramos orden: 0->Unirse, 1->Inscribirse, 2->Explorar
  if (eventBtns.length >= 1) {
    eventBtns[0].addEventListener('click', () => {
      mostrarNotificacion('Redirigiendo a transmisión...');
      setTimeout(() => window.open('https://www.youtube.com/', '_blank'), 600);
    });
  }
  if (eventBtns.length >= 2) {
    eventBtns[2] && eventBtns[2].addEventListener('click', () => {
      mostrarNotificacion('Abriendo galería...');
      setTimeout(() => window.open('galeria.html', '_blank'), 600); // si no tienes galeria.html cambia a la URL que quieras
    });
    eventBtns[1].addEventListener('click', () => {
      const usuario = localStorage.getItem('usuario');
      if (!usuario) {
        abrirModal(registroModal);
        mostrarNotificacion('Debes registrarte para inscribirte', true);
      } else {
        mostrarNotificacion('¡Inscripción al Hackatón exitosa! 🎉');
      }
    });
  } else {
    // Fallback: si la estructura no es la esperada, asocia por texto del botón
    Array.from(document.querySelectorAll('.event-btn')).forEach(btn => {
      const txt = (btn.innerText || '').toLowerCase();
      if (txt.includes('unirse')) {
        btn.onclick = () => { mostrarNotificacion('Redirigiendo...'); setTimeout(()=> window.open('https://www.youtube.com/', '_blank'), 600); };
      } else if (txt.includes('inscrib')) {
        btn.onclick = () => { const usuario = localStorage.getItem('usuario'); if (!usuario) { abrirModal(registroModal); mostrarNotificacion('Debes registrarte para inscribirte', true); } else { mostrarNotificacion('Inscripción realizada 🎉'); } };
      } else if (txt.includes('explorar')) {
        btn.onclick = () => { mostrarNotificacion('Abriendo galería...'); setTimeout(()=> window.open('galeria.html','_blank'), 600); };
      }
    });
  }

  // Modo oscuro
  if (darkToggle) {
    darkToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('modoOscuro', document.body.classList.contains('dark'));
    });
    if (localStorage.getItem('modoOscuro') === 'true') document.body.classList.add('dark');
  }

  // Menu hamburguesa (móvil)
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
  }

  // FIN IIFE
})();
