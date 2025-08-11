/* ==============================
   VANILLA STORE - JAVASCRIPT (revised)
   Notes:
   - Comments in EN
   - Drop-in replacement
============================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------
     HERO / SLIDER (autoplay + arrows + dots + swipe + keys)
  ----------------------------------- */
  const slider = document.getElementById('slider')
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.slide'))
    const btnPrev = slider.querySelector('.prev')
    const btnNext = slider.querySelector('.next')
    const dotsBox = document.getElementById('slider-dots')

    // current slide index
    let i = slides.findIndex(s => s.classList.contains('is-active'))
    if (i < 0) i = 0

    // build dots
    if (dotsBox) {
      dotsBox.innerHTML = ''
      slides.forEach((_, idx) => {
        const b = document.createElement('button')
        b.type = 'button'
        b.setAttribute('aria-label', `Ir para o slide ${idx + 1}`)
        b.addEventListener('click', () => go(idx, true))
        dotsBox.appendChild(b)
      })
    }

    // update slides + dots
    function mark() {
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i))
      if (dotsBox) {
        dotsBox
          .querySelectorAll('button')
          // CSS expects .active (not .is-active)
          .forEach((d, idx) => d.classList.toggle('active', idx === i))
      }
    }

    // go to specific index
    function go(nextIndex, stopAuto = false) {
      i = (nextIndex + slides.length) % slides.length
      mark()
      if (stopAuto) restart()
    }

    // next/prev
    const next = () => go(i + 1)
    const prev = () => go(i - 1)

    btnNext?.addEventListener('click', () => go(i + 1, true))
    btnPrev?.addEventListener('click', () => go(i - 1, true))

    // autoplay
    let t
    const INTERVAL = 4000
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

    // pause when document hidden (tab out)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop()
      else start()
    })

    // keyboard arrows
    slider.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') {
        go(i + 1, true)
      }
      if (e.key === 'ArrowLeft') {
        go(i - 1, true)
      }
    })
    // make slider focusable for key control
    slider.setAttribute('tabindex', '0')

    // swipe (mobile)
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

    // init
    mark()
    start()
  }

  /* ----------------------------------
     SEARCH TOGGLE (open/close)
  ----------------------------------- */
  const searchContainer = document.querySelector('.search-container')
  const searchToggle = document.querySelector('.search-toggle')
  const searchInput = document.querySelector('.search-bar input')

  if (searchContainer && searchToggle) {
    searchToggle.addEventListener('click', () => {
      searchContainer.classList.toggle('open')
      if (searchContainer.classList.contains('open') && searchInput) {
        searchInput.focus()
      }
    })

    // close when clicking outside
    document.addEventListener('click', e => {
      if (!searchContainer.contains(e.target)) {
        searchContainer.classList.remove('open')
      }
    })

    // close with ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        searchContainer.classList.remove('open')
      }
    })
  }

  /* ----------------------------------
     SEARCH FUNCTIONALITY (debounced)
  ----------------------------------- */
  const debounce = (fn, ms = 200) => {
    let id
    return (...args) => {
      clearTimeout(id)
      id = setTimeout(() => fn(...args), ms)
    }
  }

  const runSearch = term => {
    const q = term.toLowerCase().trim()
    const cards = document.querySelectorAll('.card')

    if (q.length === 0) {
      cards.forEach(card => {
        card.style.display = ''
      })
      return
    }

    cards.forEach(card => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || ''
      const desc =
        card.querySelector('.card-description')?.textContent.toLowerCase() || ''
      const show = title.includes(q) || desc.includes(q)
      // use '' to preserve grid computed display
      card.style.display = show ? '' : 'none'
    })
  }

  if (searchInput) {
    searchInput.addEventListener(
      'input',
      debounce(e => runSearch(e.target.value), 180)
    )
  }

    /* ----------------------------------
     ADD TO CART (event delegation) - REMOVIDO
     Agora só funciona com controles de quantidade
   ----------------------------------- */

  // helper: parse localized price like "R$ 32,90"
  function parsePrice(text) {
    const n = text
      .replace(/[^\d,.-]/g, '')
      .replace('.', '')
      .replace(',', '.')
    const val = parseFloat(n)
    return Number.isFinite(val) ? val : null
  }

  /* ----------------------------------
     QUANTITY CONTROLS
  ----------------------------------- */
  function setupQuantityControls() {
    const quantityControls = document.querySelectorAll('.quantity-controls')
    
    quantityControls.forEach(control => {
      const minusBtn = control.querySelector('.minus')
      const plusBtn = control.querySelector('.plus')
      const input = control.querySelector('.qty-input')
      const product = input.dataset.product
      
      // Minus button
      minusBtn.addEventListener('click', () => {
        let currentValue = parseInt(input.value) || 0
        if (currentValue > 0) {
          input.value = currentValue - 1
          updateButtonStates(minusBtn, plusBtn, input)
        }
      })
      
      // Plus button
      plusBtn.addEventListener('click', () => {
        let currentValue = parseInt(input.value) || 0
        if (currentValue < 100) {
          input.value = currentValue + 1
          updateButtonStates(minusBtn, plusBtn, input)
        }
      })
      
      // Input change
      input.addEventListener('input', () => {
        let value = parseInt(input.value) || 0
        if (value < 0) value = 0
        if (value > 100) value = 100
        input.value = value
        updateButtonStates(minusBtn, plusBtn, input)
      })
      
      // Initial button states
      updateButtonStates(minusBtn, plusBtn, input)
    })
  }
  
  function updateButtonStates(minusBtn, plusBtn, input) {
    const value = parseInt(input.value) || 0
    minusBtn.disabled = value <= 0
    plusBtn.disabled = value >= 100
  }

  /* ----------------------------------
     CART STORAGE
  ----------------------------------- */
  function addToCart(name, priceText, priceNumber, quantity = 1) {
    if (quantity <= 0) return
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(item => item.name === name)

    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({ name, priceText, priceNumber, quantity })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    updateCartCounter()
    
    // Debug log
    console.log(`🛒 Adicionado ao carrinho: ${name} - Quantidade: ${quantity}`)
    console.log('📦 Carrinho atual:', cart)
  }

  function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    let cartBadge = document.querySelector('.cart-badge')
    const cartLink = document.querySelector(
      'a[title="Carrinho"], a[aria-label="Carrinho"]'
    )

    if (totalItems > 0) {
      if (!cartBadge && cartLink) {
        cartBadge = document.createElement('span')
        cartBadge.className = 'cart-badge'
        cartLink.style.position = 'relative'
        cartLink.appendChild(cartBadge)
      }
      if (cartBadge) cartBadge.textContent = String(totalItems)
    } else if (cartBadge) {
      cartBadge.remove()
    }
  }

  /* ----------------------------------
     SMOOTH SCROLL FOR ANCHORS
  ----------------------------------- */
  const anchorLinks = document.querySelectorAll('a[href^="#"]')
  anchorLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const id = this.getAttribute('href')
      if (!id || id === '#') return
      const targetId = id.substring(1)
      const target = document.getElementById(targetId)
      if (target) {
        e.preventDefault()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })

  /* ----------------------------------
     LAZY "FADE-IN" FOR CONTENT IMAGES ONLY
  ----------------------------------- */
  const contentImages = document.querySelectorAll(
    // exclude icons/logos by folder or size; adjust to your paths if needed
    'img[src]:not([src*="icons/"]):not([src$=".svg"])'
  )

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const img = entry.target
        img.style.opacity = '1'
        observer.unobserve(img)
      })
    })
    contentImages.forEach(img => {
      img.style.opacity = '0'
      img.style.transition = 'opacity 0.3s ease'
      io.observe(img)
    })
  }

  /* ----------------------------------
     MOBILE MENU (if present)
  ----------------------------------- */
  const menuToggle = document.querySelector('.menu-toggle')
  const menu = document.querySelector('.menu')
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      menu.classList.toggle('active')
      menuToggle.classList.toggle('active')
    })
  }

  /* ----------------------------------
     PRODUCT BUTTONS WITH QUANTITY
  ----------------------------------- */
  function setupProductButtons() {
    const productButtons = document.querySelectorAll('.btn-secondary[data-product]')
    console.log(`🔧 Configurando ${productButtons.length} botões de produto`)
    
    productButtons.forEach((button, index) => {
      button.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        const product = button.dataset.product
        const price = button.dataset.price
        const card = button.closest('.card')
        const quantityInput = card.querySelector('.qty-input')
        
        console.log(`🖱️ Clique no botão ${index + 1}: produto=${product}, preço=${price}`)
        console.log(`📝 Quantidade selecionada: ${quantityInput?.value || 'N/A'}`)
        
        if (quantityInput) {
          const quantity = parseInt(quantityInput.value) || 0
          if (quantity > 0) {
            const productName = card.querySelector('h3').textContent
            console.log(`✅ Adicionando ${quantity}x ${productName}`)
            addToCart(productName, `€ ${price}`, parseFloat(price), quantity)
            
            // Reset quantity and update button states
            quantityInput.value = 0
            const minusBtn = card.querySelector('.minus')
            const plusBtn = card.querySelector('.plus')
            updateButtonStates(minusBtn, plusBtn, quantityInput)
            
            // Visual feedback
            button.textContent = '✓ Adicionado!'
            button.style.background = 'var(--primary-medium2)'
            setTimeout(() => {
              button.textContent = 'Adicionar ao carrinho'
              button.style.background = 'var(--primary-medium)'
            }, 2000)
          } else {
            console.log('❌ Quantidade 0 selecionada')
            // Show error message
            button.textContent = 'Selecione quantidade!'
            button.style.background = '#ff4444'
            setTimeout(() => {
              button.textContent = 'Adicionar ao carrinho'
              button.style.background = 'var(--primary-medium)'
            }, 2000)
          }
        }
      })
    })
  }

  /* ----------------------------------
     INIT
  ----------------------------------- */
  setupQuantityControls()
  setupProductButtons()
  updateCartCounter()
  document.body.classList.add('js-loaded')
  console.log('🚀 Vanilla Store carregado com sucesso!')
})
