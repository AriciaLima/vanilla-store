/* ==============================
   SLIDER + BOTÃO DE BUSCA
============================== */
document.addEventListener('DOMContentLoaded', () => {
  /* ==============================
     HERO / SLIDER (autoplay + setas + dots + swipe)
  ============================== */
  const slider = document.getElementById('slider')
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.slide'))
    const btnPrev = slider.querySelector('.prev')
    const btnNext = slider.querySelector('.next')
    const dotsBox = document.getElementById('slider-dots')

    // Índice do slide ativo
    let i = slides.findIndex(s => s.classList.contains('is-active'))
    if (i < 0) i = 0

    // Criar dots de navegação
    dotsBox.innerHTML = ''
    slides.forEach((_, idx) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.setAttribute('aria-label', `Ir para o slide ${idx + 1}`)
      b.addEventListener('click', () => go(idx, true))
      dotsBox.appendChild(b)
    })

    // Atualiza slide e dots
    function mark() {
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i))
      dotsBox
        .querySelectorAll('button')
        .forEach((d, idx) => d.classList.toggle('is-active', idx === i))
    }

    // Vai para um slide específico
    function go(nextIndex, stopAuto = false) {
      i = (nextIndex + slides.length) % slides.length
      mark()
      if (stopAuto) restart()
    }

    // Avançar e voltar slides
    function next() {
      go(i + 1)
    }
    function prev() {
      go(i - 1)
    }

    btnNext?.addEventListener('click', () => go(i + 1, true))
    btnPrev?.addEventListener('click', () => go(i - 1, true))

    // Autoplay
    let t
    const INTERVAL = 5000
    function start() {
      t = setInterval(next, INTERVAL)
    }
    function stop() {
      clearInterval(t)
    }
    function restart() {
      stop()
      start()
    }

    slider.addEventListener('mouseenter', stop)
    slider.addEventListener('mouseleave', start)

    // Swipe para mobile
    let x0 = null
    slider.addEventListener(
      'touchstart',
      e => {
        x0 = e.touches[0].clientX
      },
      { passive: true }
    )

    slider.addEventListener('touchend', e => {
      if (x0 === null) return
      const dx = e.changedTouches[0].clientX - x0
      if (Math.abs(dx) > 40) dx > 0 ? prev() : next()
      x0 = null
    })

    // Inicializa slider
    mark()
    start()
  }

  /* ==============================
     BOTÃO DA LUPA (abrir/fechar barra de busca)
  ============================== */
  const searchContainer = document.querySelector('.search-container')
  const searchToggle = document.querySelector('.search-toggle')

  if (searchContainer && searchToggle) {
    searchToggle.addEventListener('click', () => {
      searchContainer.classList.toggle('open')
    })
  }
})
