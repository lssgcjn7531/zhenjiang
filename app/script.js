/**
 * ZHENJIANG PROMOTIONAL SITE - JavaScript
 * Handles scroll animations, parallax effects, and 3D Earth
 */

document.addEventListener('DOMContentLoaded', function() {
  // ============================================
  // Intersection Observer for Fade-in Animations
  // ============================================
  const fadeElements = document.querySelectorAll('.fade-in');
  
  const fadeObserverOptions = {
    root: null,
    rootMargin: '-100px',
    threshold: 0.1
  };
  
  const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, fadeObserverOptions);
  
  fadeElements.forEach(el => fadeObserver.observe(el));
  
  // ============================================
  // Hero Parallax Effect
  // ============================================
  const heroSection = document.getElementById('hero');
  const heroBg = document.querySelector('.hero-bg');
  const heroContent = document.querySelector('.hero-content');
  
  function updateHeroParallax() {
    if (!heroSection) return;
    
    const rect = heroSection.getBoundingClientRect();
    const scrollProgress = -rect.top / rect.height;
    
    if (scrollProgress >= 0 && scrollProgress <= 1) {
      // Parallax background
      if (heroBg) {
        heroBg.style.transform = `translateY(${scrollProgress * 40}%)`;
      }
      
      // Fade out content
      if (heroContent) {
        heroContent.style.opacity = 1 - scrollProgress;
      }
    }
  }
  
  // Use requestAnimationFrame for smooth performance
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        updateHeroParallax();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  
  // ============================================
  // Smooth Scroll for Navigation Links
  // ============================================
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // ============================================
  // 3D Earth with Cobe - 支持鼠标拖拽旋转
  // ============================================
  const earthCanvas = document.getElementById('earth-canvas');
  
  if (earthCanvas && typeof createGlobe !== 'undefined') {
    let phi = 0;
    let theta = 0.3;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let isAutoRotating = true;
    
    const globe = createGlobe(earthCanvas, {
      devicePixelRatio: 2,
      width: 1000,
      height: 1000,
      phi: 0,
      theta: 0.3,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.96, 0.94, 0.91],
      markerColor: [0.62, 0.24, 0.20],
      glowColor: [0.98, 0.97, 0.95],
      markers: [
        // Zhenjiang coordinates: ~32.20, 119.45
        { location: [32.20, 119.45], size: 0.1 }
      ],
      onRender: (state) => {
        state.phi = phi;
        state.theta = theta;
        // 只有在非拖拽状态下才自动旋转
        if (isAutoRotating && !isDragging) {
          phi += 0.005;
        }
      }
    });
    
    // 鼠标按下 - 开始拖拽
    earthCanvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      isAutoRotating = false;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      earthCanvas.style.cursor = 'grabbing';
    });
    
    // 鼠标移动 - 拖拽旋转
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      
      // 水平拖动控制 phi（水平旋转）
      phi += deltaX * 0.01;
      
      // 垂直拖动控制 theta（垂直倾斜），限制范围
      theta = Math.max(-0.5, Math.min(0.5, theta - deltaY * 0.01));
      
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    // 鼠标释放 - 停止拖拽
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        earthCanvas.style.cursor = 'grab';
        // 3秒后恢复自动旋转
        setTimeout(() => {
          isAutoRotating = true;
        }, 3000);
      }
    });
    
    // 鼠标离开画布也停止拖拽
    earthCanvas.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        earthCanvas.style.cursor = 'grab';
      }
    });
    
    // 设置初始鼠标样式
    earthCanvas.style.cursor = 'grab';
    
    // 触摸支持（移动端）
    earthCanvas.addEventListener('touchstart', (e) => {
      isDragging = true;
      isAutoRotating = false;
      const touch = e.touches[0];
      previousMousePosition = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - previousMousePosition.x;
      const deltaY = touch.clientY - previousMousePosition.y;
      
      phi += deltaX * 0.01;
      theta = Math.max(-0.5, Math.min(0.5, theta - deltaY * 0.01));
      
      previousMousePosition = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        setTimeout(() => {
          isAutoRotating = true;
        }, 3000);
      }
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
      if (globe && globe.destroy) {
        globe.destroy();
      }
    });
  }
  
  // ============================================
  // Video Play/Pause Control
  // ============================================
  const videoContainer = document.querySelector('.modern-video');
  const video = videoContainer ? videoContainer.querySelector('video') : null;
  const playBtn = videoContainer ? videoContainer.querySelector('.video-play-btn') : null;
  const playIcon = playBtn ? playBtn.querySelector('.play-icon') : null;
  const pauseIcon = playBtn ? playBtn.querySelector('.pause-icon') : null;
  
  if (video && playBtn) {
    // 自动播放（当视频进入视口时）
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // 自动播放被阻止，显示播放按钮
            updatePlayButton(false);
          });
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.5 });
    
    videoObserver.observe(video);
    
    // 更新播放按钮图标
    function updatePlayButton(isPlaying) {
      if (playIcon && pauseIcon) {
        playIcon.style.display = isPlaying ? 'none' : 'block';
        pauseIcon.style.display = isPlaying ? 'block' : 'none';
      }
    }
    
    // 播放/暂停切换
    playBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        updatePlayButton(true);
      } else {
        video.pause();
        updatePlayButton(false);
      }
    });
    
    // 监听视频播放状态
    video.addEventListener('play', () => updatePlayButton(true));
    video.addEventListener('pause', () => updatePlayButton(false));
  }
  
  // ============================================
  // Navigation Background on Scroll
  // ============================================
  const nav = document.querySelector('.nav');
  let lastScrollY = window.scrollY;
  
  function updateNav() {
    const currentScrollY = window.scrollY;
    
    // Add background when scrolled past hero
    if (currentScrollY > window.innerHeight * 0.8) {
      nav.style.backgroundColor = 'rgba(253, 251, 247, 0.95)';
      nav.style.backdropFilter = 'blur(10px)';
      nav.style.mixBlendMode = 'normal';
      nav.querySelector('.nav-logo').style.color = 'var(--color-warm-ink)';
      nav.querySelectorAll('.nav-links a').forEach(link => {
        link.style.color = 'var(--color-warm-muted)';
      });
    } else {
      nav.style.backgroundColor = 'transparent';
      nav.style.backdropFilter = 'none';
      nav.style.mixBlendMode = 'difference';
      nav.querySelector('.nav-logo').style.color = 'white';
      nav.querySelectorAll('.nav-links a').forEach(link => {
        link.style.color = 'rgba(255, 255, 255, 0.8)';
      });
    }
    
    lastScrollY = currentScrollY;
  }
  
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav(); // Initial check
  
  // ============================================
  // Image Lazy Loading with Fade In
  // ============================================
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.onload = () => {
          img.style.opacity = '1';
        };
        observer.unobserve(img);
      }
    });
  });
  
  lazyImages.forEach(img => imageObserver.observe(img));
  
  // ============================================
  // Mountain Cards Hover Effect Enhancement
  // ============================================
  const mountainCards = document.querySelectorAll('.mountain-card');
  
  mountainCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
      this.style.transition = 'transform 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // ============================================
  // Quote Text Animation on Scroll
  // ============================================
  const quotes = document.querySelectorAll('.quote');
  
  const quoteObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }
    });
  }, { threshold: 0.3 });
  
  quotes.forEach(quote => {
    quote.style.opacity = '0';
    quote.style.transform = 'translateX(-20px)';
    quote.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    quoteObserver.observe(quote);
  });
  
  // ============================================
  // Stats Counter Animation
  // ============================================
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const countUp = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        element.textContent = target + (element.textContent.includes('+') ? '+' : '');
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(start) + (element.textContent.includes('+') ? '+' : '');
      }
    }, 16);
  };
  
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumber = entry.target;
        const text = statNumber.textContent;
        const num = parseInt(text.replace(/\D/g, ''));
        
        if (!isNaN(num)) {
          countUp(statNumber, num);
        }
        
        statsObserver.unobserve(statNumber);
      }
    });
  }, { threshold: 0.5 });
  
  statNumbers.forEach(stat => statsObserver.observe(stat));
  
  // ============================================
  // Culture Images Stagger Animation
  // ============================================
  const cultureImages = document.querySelectorAll('.culture-col img');
  
  const cultureObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 150);
        cultureObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  cultureImages.forEach(img => {
    img.style.opacity = '0';
    img.style.transform = 'translateY(30px)';
    img.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    cultureObserver.observe(img);
  });
  
  // ============================================
  // Scroll Progress Indicator (optional)
  // ============================================
  const createScrollProgress = () => {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 2px;
      background: var(--color-warm-red);
      z-index: 100;
      transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      progressBar.style.width = scrollPercent + '%';
    }, { passive: true });
  };
  
  createScrollProgress();
});

// ============================================
// Preload Critical Images
// ============================================
window.addEventListener('load', function() {
  const criticalImages = [
    'https://picsum.photos/seed/yangtze/1920/1080'
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
});
