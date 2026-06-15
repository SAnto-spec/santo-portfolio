import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Typed from 'typed.js';
import emailjs from '@emailjs/browser';

// Import local assets optimized by Vite
import ecommerceImg from './assets/e-commerce.png';
import culturalImg from './assets/Screenshot 2025-04-22 174157.png';

export default function App() {
  const [menuActive, setMenuActive] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState({ text: '', type: '' }); // type: 'success' | 'error'
  const [formLoading, setFormLoading] = useState(false);

  // Refs for interactive elements
  const canvasContainerRef = useRef(null);
  const roleSpanRef = useRef(null);
  const dotRef = useRef(null);
  const outlineRef = useRef(null);
  const meshGradientRef = useRef(null);
  const heroSectionRef = useRef(null);

  // EmailJS public key init
  useEffect(() => {
    emailjs.init({ publicKey: "MdW7jb8xyJsB8n5Xi" });
  }, []);

  // --- Custom Cursor & Interactive Handlers ---
  useEffect(() => {
    const dot = dotRef.current;
    const outline = outlineRef.current;
    if (!dot || !outline) return;

    let cursorX = 0, cursorY = 0;
    let outlineX = 0, outlineY = 0;

    const handleMouseMove = (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      dot.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    const animateCursor = () => {
      // Lerp outline cursor for smooth trailing effect
      outlineX += (cursorX - outlineX) * 0.15;
      outlineY += (cursorY - outlineY) * 0.15;
      outline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
      animationFrameId = requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Attach hover states to interactables
    const addHoverClass = () => {
      outline.classList.add('hovering');
      dot.classList.add('hovering');
    };
    const removeHoverClass = () => {
      outline.classList.remove('hovering');
      dot.classList.remove('hovering');
    };

    // Re-check elements occasionally for hover logic (due to dynamic render)
    const updateInteractables = () => {
      const interactables = document.querySelectorAll('a, button, input, textarea, .skill-item');
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', addHoverClass);
        el.removeEventListener('mouseleave', removeHoverClass);
        el.addEventListener('mouseenter', addHoverClass);
        el.addEventListener('mouseleave', removeHoverClass);
      });
    };

    updateInteractables();
    // Observe DOM changes to re-bind hover events automatically
    const observer = new MutationObserver(updateInteractables);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  // --- Three.js 3D Globe Animation ---
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Inner & Outer Wireframes
    const geometry = new THREE.IcosahedronGeometry(2.4, 2);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6, // Purple
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    const mesh = new THREE.Mesh(geometry, wireMaterial);
    scene.add(mesh);

    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6, // Blue
      transparent: true,
      opacity: 0.15
    });
    const coreMesh = new THREE.Mesh(geometry, coreMaterial);
    coreMesh.scale.set(0.96, 0.96, 0.96);
    scene.add(coreMesh);

    camera.position.z = 6.5;

    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetRotX = y * 0.005;
      targetRotY = x * 0.005;
    };

    const handleMouseLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    let frameId;
    const animate3D = () => {
      frameId = requestAnimationFrame(animate3D);

      // Auto rotation
      mesh.rotation.y += 0.003;
      mesh.rotation.x += 0.002;
      coreMesh.rotation.y += 0.003;
      coreMesh.rotation.x += 0.002;

      // Mouse interactive tilt
      mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.1;
      mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.1;
      coreMesh.rotation.x += (targetRotX - coreMesh.rotation.x) * 0.1;
      coreMesh.rotation.y += (targetRotY - coreMesh.rotation.y) * 0.1;

      renderer.render(scene, camera);
    };
    animate3D();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      wireMaterial.dispose();
      coreMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // --- Typed.js Role Animation ---
  useEffect(() => {
    if (!roleSpanRef.current) return;

    const typed = new Typed(roleSpanRef.current, {
      strings: ['UI/UX Designer.', 'Frontend Engineer.', 'Interactive Developer.', 'Digital Creator.'],
      typeSpeed: 60,
      backSpeed: 40,
      backDelay: 1500,
      loop: true,
      cursorChar: '<span class="cursor-blink">_</span>'
    });

    return () => {
      typed.destroy();
    };
  }, []);

  // --- Parallax, 3D Card Tilts, and Magnetic Buttons ---
  useEffect(() => {
    // 1. Mesh Gradient Mouse Parallax inside Hero
    const heroBg = meshGradientRef.current;
    const heroSec = heroSectionRef.current;

    const handleHeroMouseMove = (e) => {
      if (!heroBg || !heroSec) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 80;
      const y = (e.clientY / window.innerHeight - 0.5) * 80;
      heroBg.style.transform = `translate(calc(-50% - ${x}px), calc(-50% - ${y}px))`;
    };

    const handleHeroMouseLeave = () => {
      if (heroBg) heroBg.style.transform = 'translate(-50%, -50%)';
    };

    if (heroSec) {
      heroSec.addEventListener('mousemove', handleHeroMouseMove);
      heroSec.addEventListener('mouseleave', handleHeroMouseLeave);
    }

    // 2. 3D Card Tilt Effects
    const applyTilt = (e, el) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt degrees
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      el.style.transition = 'transform 0.1s ease-out';
    };

    const resetTilt = (el) => {
      el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      el.style.transition = 'transform 0.6s ease-out';
    };

    const tiltElements = document.querySelectorAll('.project-img-wrapper, .project-info, .abstract-shape, .contact-card');
    const tiltHandlers = [];

    tiltElements.forEach(el => {
      const moveHandler = (e) => applyTilt(e, el);
      const leaveHandler = () => resetTilt(el);
      el.addEventListener('mousemove', moveHandler);
      el.addEventListener('mouseleave', leaveHandler);
      tiltHandlers.push({ el, moveHandler, leaveHandler });
    });

    // 3. Magnetic Buttons
    const applyMagnetic = (e, btn) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      btn.style.transition = 'transform 0.1s ease-out';
    };

    const resetMagnetic = (btn) => {
      btn.style.transform = `translate(0px, 0px)`;
      btn.style.transition = 'transform 0.5s ease-out';
    };

    const buttons = document.querySelectorAll('.btn, .social-links a');
    const magneticHandlers = [];

    buttons.forEach(btn => {
      const moveHandler = (e) => applyMagnetic(e, btn);
      const leaveHandler = () => resetMagnetic(btn);
      btn.addEventListener('mousemove', moveHandler);
      btn.addEventListener('mouseleave', leaveHandler);
      magneticHandlers.push({ btn, moveHandler, leaveHandler });
    });

    // 4. Smooth Parallax Scrolling
    let targetScroll = window.scrollY;
    let currentScroll = targetScroll;
    let scrollAnimationFrame;

    const handleScroll = () => {
      targetScroll = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);

    const updateScrollParallax = () => {
      currentScroll += (targetScroll - currentScroll) * 0.08;
      const parallaxLayers = document.querySelectorAll('.parallax-layer');
      parallaxLayers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-speed') || '0');
        const yPos = -(currentScroll * speed);
        layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
      scrollAnimationFrame = requestAnimationFrame(updateScrollParallax);
    };
    updateScrollParallax();

    // 5. Intersection Observer Reveal Animations
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    animateElements.forEach(el => observer.observe(el));

    // Cleanup all handlers
    return () => {
      if (heroSec) {
        heroSec.removeEventListener('mousemove', handleHeroMouseMove);
        heroSec.removeEventListener('mouseleave', handleHeroMouseLeave);
      }
      tiltHandlers.forEach(({ el, moveHandler, leaveHandler }) => {
        el.removeEventListener('mousemove', moveHandler);
        el.removeEventListener('mouseleave', leaveHandler);
      });
      magneticHandlers.forEach(({ btn, moveHandler, leaveHandler }) => {
        btn.removeEventListener('mousemove', moveHandler);
        btn.removeEventListener('mouseleave', leaveHandler);
      });
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(scrollAnimationFrame);
      observer.disconnect();
    };
  }, []);

  // --- Form Input Handlers ---
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormStatus({ text: '', type: '' });

    emailjs.send('service_mbn1u07', 'template_lheiz4q', {
      to_email: 'santoxavier5948@gmail.com',
      name: formState.name,
      email: formState.email,
      phone: formState.phone,
      message: formState.message
    })
    .then(() => {
      setFormStatus({ text: 'Message sent beautifully! 🎉', type: 'success' });
      setFormState({ name: '', email: '', phone: '', message: '' });
      setFormLoading(false);
      setTimeout(() => setFormStatus({ text: '', type: '' }), 6000);
    })
    .catch((error) => {
      setFormStatus({ text: 'Error sending message. Try again later.', type: 'error' });
      console.error('EmailJS Error:', error);
      setFormLoading(false);
      setTimeout(() => setFormStatus({ text: '', type: '' }), 6000);
    });
  };

  return (
    <>
      {/* Custom Cursor Elements */}
      <div className="cursor-dot" ref={dotRef}></div>
      <div className="cursor-outline" ref={outlineRef}></div>

      {/* Global Background Glow Elements */}
      <div className="bg-glow top-glow"></div>
      <div className="bg-glow bottom-glow"></div>

      {/* Navigation Header */}
      <header className="glass-header">
        <div className="container nav-container">
          <h1 className="logo">Santo<span className="dot">.</span></h1>
          <button 
            className="nav-toggle-label" 
            aria-label="Toggle navigation"
            onClick={() => setMenuActive(!menuActive)}
            style={{ background: 'transparent', border: 'none', cursor: 'none' }}
          >
            <span className={`hamburger ${menuActive ? 'active' : ''}`}></span>
          </button>
          <nav className={`main-nav ${menuActive ? 'active' : ''}`} aria-label="Main Navigation">
            <a href="#about" className="nav-link" onClick={() => setMenuActive(false)}>About</a>
            <a href="#skills" className="nav-link" onClick={() => setMenuActive(false)}>Skills</a>
            <a href="#projects" className="nav-link" onClick={() => setMenuActive(false)}>Projects</a>
            <a href="/Santo_Xavier_Resume.pdf" download="Santo_Xavier_Resume.pdf" className="btn btn-glass" onClick={() => setMenuActive(false)}>
              <i className="ph ph-download-simple"></i> Resume
            </a>
            <a href="#contact" className="btn btn-glass" onClick={() => setMenuActive(false)}>Contact Me</a>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero" id="home" ref={heroSectionRef}>
          <div className="parallax-layer layer-1" data-speed="0.2">
            <div className="mesh-gradient" ref={meshGradientRef}></div>
          </div>
          <div className="container hero-content parallax-layer layer-2" data-speed="0.5">
            <div className="hero-grid">
              <div className="hero-text-col">
                <div className="hero-badge">Welcome to my universe</div>
                <h2 className="hero-title">I am <span className="highlight">Santo Xavier</span></h2>
                <h1 className="hero-role"><span ref={roleSpanRef}></span></h1>
                <p className="hero-desc">Crafting premium, interactive, and visually stunning digital experiences that captivate and engage.</p>
                <div className="hero-btns">
                  <a href="#projects" className="btn btn-primary glow-efx">Explore My Works</a>
                  <a href="/Santo_Xavier_Resume.pdf" download="Santo_Xavier_Resume.pdf" className="btn btn-outline">
                    <i className="ph ph-download-simple"></i> Download Resume
                  </a>
                  <a href="#contact" className="btn btn-outline">Let's Connect</a>
                </div>
              </div>
              <div className="hero-3d-col" id="canvas-container" ref={canvasContainerRef}>
                {/* Three.js canvas dynamically attaches here */}
              </div>
            </div>
          </div>
          <div className="scroll-indicator">
            <i className="ph ph-mouse-simple"></i>
            <span>Scroll Down</span>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="section section-about">
          <div className="container parallax-group">
            <div className="about-grid">
              <div className="about-text animate-on-scroll slide-up">
                <h2 className="section-title">Behind the Code<span className="dot">.</span></h2>
                <p className="lead">I'm a passionate developer with an eye for detail and a heart for design.</p>
                <p>Bridging the gap between aesthetics and functionality, I specialize in creating responsive, smooth, and highly interactive user interfaces. My goal is to build digital products that not only work flawlessly but leave a lasting impression.</p>
                <div className="stats">
                  <div className="stat-item">
                    <span className="stat-num">50+</span>
                    <span className="stat-label">Projects</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-num">100%</span>
                    <span className="stat-label">Dedication</span>
                  </div>
                </div>
              </div>
              <div className="about-visual animate-on-scroll fade-in">
                <div className="glass-card portrait-card parallax-layer" data-speed="0.1">
                  <div className="abstract-shape">
                    <i className="ph ph-code" style={{ fontSize: '8rem', color: 'rgba(255,255,255,0.1)' }}></i>
                  </div>
                  <h3>Always Building</h3>
                  <p>Turning caffeine into lines of code and bold designs.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" className="section section-skills">
          <div className="container relative">
            <div className="section-header animate-on-scroll slide-up">
              <h2 className="section-title">My Arsenal<span className="dot">.</span></h2>
              <p className="section-subtitle">A curated stack of modern technologies and tools I use to bring ideas to life.</p>
            </div>

            <div className="skills-grid">
              <div className="skill-item animate-on-scroll stagger-1">
                <i className="ph-fill ph-file-html"></i>
                <span>HTML5</span>
              </div>
              <div className="skill-item animate-on-scroll stagger-2">
                <i className="ph-fill ph-file-css"></i>
                <span>CSS3 / SCSS</span>
              </div>
              <div className="skill-item animate-on-scroll stagger-3">
                <i className="ph-fill ph-file-code"></i>
                <span>JavaScript</span>
              </div>
              <div className="skill-item animate-on-scroll stagger-4">
                <i className="ph-fill ph-atom"></i>
                <span>React.js</span>
              </div>
              <div className="skill-item animate-on-scroll stagger-5">
                <i className="ph-fill ph-hexagon"></i>
                <span>Node.js</span>
              </div>
              <div className="skill-item animate-on-scroll stagger-6">
                <i className="ph-fill ph-wind"></i>
                <span>Tailwind CSS</span>
              </div>
              <div className="skill-item animate-on-scroll stagger-7">
                <i className="ph-fill ph-github-logo"></i>
                <span>Git & GitHub</span>
              </div>
              <div className="skill-item animate-on-scroll stagger-8">
                <i className="ph-fill ph-figma-logo"></i>
                <span>Figma / UI</span>
              </div>
              <div className="skill-item animate-on-scroll stagger-9">
                <i className="ph-fill ph-terminal"></i>
                <span>Python</span>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="section section-projects">
          <div className="container relative z-10">
            <div className="section-header animate-on-scroll slide-up">
              <h2 className="section-title">Selected Works<span className="dot">.</span></h2>
              <p className="section-subtitle">A showcase of passion, logic, and creative problem solving.</p>
            </div>

            <div className="projects-list">
              <article className="project-showcase animate-on-scroll slide-up">
                <div className="project-img-wrapper">
                  <img src={ecommerceImg} alt="E-commerce Platform" className="project-img" />
                  <div className="overlay"></div>
                </div>
                <div className="project-info glass-card">
                  <div className="project-tags">
                    <span className="tag">React</span>
                    <span className="tag">Node.js</span>
                    <span className="tag">Custom CSS</span>
                  </div>
                  <h3>NextGen E-Commerce</h3>
                  <p>A high-performance modern e-commerce storefront featuring incredibly smooth animations, product quick-views, and an optimized purchasing flow.</p>
                  <div className="project-links">
                    <a href="http://localhost:5173/" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                      Live Site <i className="ph ph-arrow-up-right"></i>
                    </a>
                    <a href="#" className="btn btn-glass">Source Code</a>
                  </div>
                </div>
              </article>

              <article className="project-showcase reverse animate-on-scroll slide-up">
                <div className="project-img-wrapper">
                  <img src={culturalImg} alt="Cultural Search App" className="project-img" />
                  <div className="overlay"></div>
                </div>
                <div className="project-info glass-card">
                  <div className="project-tags">
                    <span className="tag">Python</span>
                    <span className="tag">Django</span>
                    <span className="tag">PostgreSQL</span>
                  </div>
                  <h3>Cultural Explorer</h3>
                  <p>An immersive platform to explore and archive world heritage sites. Features interactive mapping and an extensive searchable database built on Django.</p>
                  <div className="project-links">
                    <a href="#" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                      Live Site <i className="ph ph-arrow-up-right"></i>
                    </a>
                    <a href="#" className="btn btn-glass">Source Code</a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="section section-contact">
          <div className="container container-sm relative z-10">
            <div className="contact-card glass-card animate-on-scroll slide-up">
              <h2 className="section-title">Let's Create Together</h2>
              <p className="contact-desc">Currently open for new opportunities. Reach out to discuss a project, ask a question, or simply say hello!</p>

              <form id="contactForm" className="contact-form" onSubmit={handleFormSubmit}>
                <div className="input-row">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      placeholder="John Doe" 
                      required 
                      value={formState.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      placeholder="john@example.com" 
                      required 
                      value={formState.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone (Optional)</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    placeholder="+1 234 567 890" 
                    value={formState.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea 
                    id="message" 
                    rows="4" 
                    placeholder="How can I help you?" 
                    required 
                    value={formState.message}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-block glow-efx" 
                  id="submitBtn"
                  style={{ opacity: formLoading ? 0.7 : 1, pointerEvents: formLoading ? 'none' : 'auto' }}
                >
                  <span>{formLoading ? 'Sending...' : 'Send Message'}</span>
                  <i className="ph ph-paper-plane-tilt"></i>
                </button>
                {formStatus.text && (
                  <div className={`status-msg ${formStatus.type}`}>
                    {formStatus.text}
                  </div>
                )}
              </form>

              <div className="social-links">
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=santoxavier5948@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Email">
                  <i className="ph-fill ph-envelope-simple"></i>
                </a>
                <a href="https://www.linkedin.com/in/santo-xavier-409971360/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <i className="ph-fill ph-linkedin-logo"></i>
                </a>
                <a href="https://github.com/SAnto-spec" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <i className="ph-fill ph-github-logo"></i>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-content">
          <p>&copy; {new Date().getFullYear()} Santo Xavier. Engineered with passion.</p>
        </div>
      </footer>
    </>
  );
}
