const funFactNumbers = document.querySelectorAll(".fun-fact-number");
const currentPage = decodeURIComponent(window.location.pathname.split("/").pop() || "index.html").trim().toLowerCase();

if (funFactNumbers.length) {
    const animateValue = (element) => {
        const target = Number(element.dataset.target || 0);
        const decimals = Number(element.dataset.decimals || 0);
        const suffix = element.dataset.suffix || "";
        const duration = 1800;
        const startTime = performance.now();

        const step = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentValue = target * eased;
            const formattedValue = decimals > 0
                ? currentValue.toFixed(decimals)
                : Math.round(currentValue).toString();

            element.textContent = `${formattedValue}${suffix}`;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            animateValue(entry.target);
            currentObserver.unobserve(entry.target);
        });
    }, { threshold: 0.45 });

    funFactNumbers.forEach((element) => {
        observer.observe(element);
    });
}

const setActiveMenu = () => {
    const navLinks = document.querySelectorAll(".main-nav > a");
    const dropdownLinks = document.querySelectorAll(".dropdown-menu a");

    if (!navLinks.length) {
        return;
    }

    navLinks.forEach((link) => {
        const linkPage = decodeURIComponent(link.getAttribute("href") || "").trim().toLowerCase();
        const isExactMatch = linkPage === currentPage;

        link.classList.toggle("is-current-page", isExactMatch);
    });

    dropdownLinks.forEach((link) => {
        link.classList.remove("is-current-page");
    });

    const homeTrigger = document.querySelector(".nav-item.has-dropdown > .nav-link");
    if (homeTrigger) {
        homeTrigger.classList.toggle("is-current-page", currentPage === "index.html" || currentPage === "home 2.html");
    }
};

setActiveMenu();

const initMobileNav = () => {
    const headerWrap = document.querySelector(".header-wrap");
    const mainNav = document.querySelector(".main-nav");

    if (!headerWrap || !mainNav) {
        return;
    }

    let menuToggle = headerWrap.querySelector(".menu-toggle");

    if (!menuToggle) {
        menuToggle = document.createElement("button");
        menuToggle.type = "button";
        menuToggle.className = "menu-toggle";
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-controls", "site-navigation");
        menuToggle.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        if (!mainNav.id) {
            mainNav.id = "site-navigation";
        }

        headerWrap.insertBefore(menuToggle, mainNav);
    }

    const syncMenuState = () => {
        const isMobile = window.innerWidth <= 768;

        if (!isMobile) {
            mainNav.classList.remove("is-open");
            menuToggle.classList.remove("is-active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
            document.querySelectorAll(".has-dropdown.is-open").forEach((item) => item.classList.remove("is-open"));
            return;
        }

        menuToggle.setAttribute("aria-expanded", String(mainNav.classList.contains("is-open")));
    };

    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("is-open");
        menuToggle.classList.toggle("is-active", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    mainNav.querySelectorAll(".has-dropdown > .nav-link").forEach((link) => {
        link.addEventListener("click", (event) => {
            if (window.innerWidth > 768) {
                return;
            }

            event.preventDefault();
            const parent = link.parentElement;
            const isOpen = parent?.classList.toggle("is-open");

            mainNav.querySelectorAll(".has-dropdown").forEach((item) => {
                if (item !== parent) {
                    item.classList.remove("is-open");
                }
            });

            if (parent) {
                link.setAttribute("aria-expanded", String(Boolean(isOpen)));
            }
        });
    });

    mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth > 768 || link.classList.contains("nav-link")) {
                return;
            }

            mainNav.classList.remove("is-open");
            menuToggle.classList.remove("is-active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
        });
    });

    window.addEventListener("resize", syncMenuState);
    syncMenuState();
};

const initScrollTopButton = () => {
    if (currentPage === "login.html" || currentPage === "register.html") {
        return;
    }

    let scrollTopButton = document.querySelector(".scroll-top-button");

    if (!scrollTopButton) {
        scrollTopButton = document.createElement("button");
        scrollTopButton.type = "button";
        scrollTopButton.className = "scroll-top-button";
        scrollTopButton.setAttribute("aria-label", "Scroll to top");
        scrollTopButton.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        document.body.appendChild(scrollTopButton);
    }

    const toggleVisibility = () => {
        const shouldShow = window.scrollY > 320;
        scrollTopButton.classList.toggle("is-visible", shouldShow);
    };

    scrollTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();
};

const root = document.documentElement;
const body = document.body;
const storage = {
    get(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            return body.dataset[key] || null;
        }
    },
    set(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            body.dataset[key] = value;
        }
    }
};

const applySitePreferences = () => {
    const modeEnabled = storage.get("silentBeatsMode") === "enabled";
    const rtlEnabled = storage.get("silentBeatsRtl") === "enabled";

    body.classList.toggle("mode-enabled", modeEnabled);
    root.classList.toggle("mode-enabled", modeEnabled);
    body.classList.toggle("is-rtl", rtlEnabled);
    root.setAttribute("dir", rtlEnabled ? "rtl" : "ltr");
    body.setAttribute("dir", rtlEnabled ? "rtl" : "ltr");
};

const createSiteControls = () => {
    const existingControls = document.querySelector(".site-tools");
    if (existingControls) {
        return existingControls;
    }

    const modeEnabled = storage.get("silentBeatsMode") === "enabled";
    const rtlEnabled = storage.get("silentBeatsRtl") === "enabled";

    const controls = document.createElement("div");
    controls.className = "site-tools";
    controls.innerHTML = `
        <button type="button" class="tool-chip tool-chip-icon-only" data-tool="mode" aria-pressed="${modeEnabled}" aria-label="${modeEnabled ? "Switch to dark mode" : "Switch to light mode"}" title="${modeEnabled ? "Dark mode" : "Light mode"}">
            <span class="tool-chip-icon"><i class="fa-regular fa-moon"></i></span>
        </button>
        <button type="button" class="tool-chip" data-tool="rtl" aria-pressed="${rtlEnabled}">
            <span class="tool-chip-label">${rtlEnabled ? "LTR" : "RTL"}</span>
        </button>
    `;

    const authTopbar = document.querySelector(".auth-topbar-inner");
    const headerWrap = document.querySelector(".header-wrap");
    const mainNav = document.querySelector(".main-nav");
    const navButton = mainNav?.querySelector(".nav-btn");

    if (authTopbar) {
        authTopbar.appendChild(controls);
    } else if (mainNav && navButton) {
        navButton.insertAdjacentElement("beforebegin", controls);
    } else if (headerWrap) {
        headerWrap.appendChild(controls);
    } else {
        document.body.appendChild(controls);
    }

    controls.addEventListener("click", (event) => {
        const chip = event.target.closest(".tool-chip");

        if (!chip) {
            return;
        }

        const type = chip.dataset.tool;
        const storageKey = type === "mode" ? "silentBeatsMode" : "silentBeatsRtl";
        const isEnabled = storage.get(storageKey) === "enabled";
        storage.set(storageKey, isEnabled ? "disabled" : "enabled");

        applySitePreferences();
        syncControlStates();
    });

    return controls;
};

const syncControlStates = () => {
    document.querySelectorAll(".tool-chip").forEach((chip) => {
        const isMode = chip.dataset.tool === "mode";
        const enabled = storage.get(isMode ? "silentBeatsMode" : "silentBeatsRtl") === "enabled";
        chip.setAttribute("aria-pressed", String(enabled));
        chip.classList.toggle("is-active", enabled);

        if (isMode) {
            const icon = chip.querySelector(".tool-chip-icon i");

            if (icon) {
                icon.className = enabled ? "fa-regular fa-sun" : "fa-regular fa-moon";
            }

            chip.setAttribute("aria-label", enabled ? "Switch to dark mode" : "Switch to light mode");
            chip.setAttribute("title", enabled ? "Light mode" : "Dark mode");
        }

        const label = chip.querySelector(".tool-chip-label");
        if (label && !isMode) {
            label.textContent = enabled ? "LTR" : "RTL";
        }
    });
};

const passwordToggles = document.querySelectorAll("[data-password-toggle]");

passwordToggles.forEach((toggleButton) => {
    toggleButton.addEventListener("click", () => {
        const passwordField = toggleButton.parentElement?.querySelector("input");

        if (!passwordField) {
            return;
        }

        const isHidden = passwordField.type === "password";
        passwordField.type = isHidden ? "text" : "password";
        toggleButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");

        const icon = toggleButton.querySelector("i");
        if (icon) {
            icon.className = isHidden ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
        }
    });
});

applySitePreferences();
initMobileNav();
initScrollTopButton();
createSiteControls();
syncControlStates();

const parallaxSections = document.querySelectorAll("[data-parallax-section]");

if (parallaxSections.length) {
    const updateParallax = () => {
        parallaxSections.forEach((section) => {
            const bg = section.querySelector("[data-parallax-bg]");

            if (!bg) {
                return;
            }

            const rect = section.getBoundingClientRect();
            const offset = rect.top * -0.18;
            bg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.08)`;
        });
    };

    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
}

const countdownSection = document.querySelector("[data-countdown-target]");

if (countdownSection) {
    const targetDate = new Date(countdownSection.dataset.countdownTarget).getTime();
    const dayEl = countdownSection.querySelector("[data-countdown-days]");
    const hourEl = countdownSection.querySelector("[data-countdown-hours]");
    const minuteEl = countdownSection.querySelector("[data-countdown-minutes]");
    const secondEl = countdownSection.querySelector("[data-countdown-seconds]");

    const updateCountdown = () => {
        const now = Date.now();
        const diff = Math.max(targetDate - now, 0);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        if (dayEl) dayEl.textContent = String(days).padStart(2, "0");
        if (hourEl) hourEl.textContent = String(hours).padStart(2, "0");
        if (minuteEl) minuteEl.textContent = String(minutes).padStart(2, "0");
        if (secondEl) secondEl.textContent = String(seconds).padStart(2, "0");
    };

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
}

const eventSlider = document.querySelector("[data-event-slider]");

if (eventSlider) {
    const track = eventSlider.querySelector("[data-event-slider-track]");
    const prevButton = eventSlider.querySelector("[data-event-slider-prev]");
    const nextButton = eventSlider.querySelector("[data-event-slider-next]");
    const getSlides = () => Array.from(track.querySelectorAll(".event-gallery-card"));

    const renderSlider = () => {
        const slides = getSlides();
        slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === 2);
        });
    };

    const moveSlider = (direction) => {
        const slides = getSlides();
        if (!slides.length) {
            return;
        }

        if (direction > 0) {
            track.appendChild(slides[0]);
        } else {
            track.prepend(slides[slides.length - 1]);
        }

        renderSlider();
    };

    prevButton?.addEventListener("click", () => moveSlider(-1));
    nextButton?.addEventListener("click", () => moveSlider(1));
    renderSlider();
}

const homeTwoSlider = document.querySelector("[data-home-two-slider]");

if (homeTwoSlider) {
    const slides = Array.from(homeTwoSlider.querySelectorAll(".home-two-slide"));
    const prevButton = homeTwoSlider.querySelector("[data-home-two-prev]");
    const nextButton = homeTwoSlider.querySelector("[data-home-two-next]");
    let currentSlide = slides.findIndex((slide) => slide.classList.contains("is-active"));

    if (currentSlide < 0) {
        currentSlide = 0;
    }

    const renderHomeTwoSlider = () => {
        slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === currentSlide);
        });
    };

    const moveHomeTwoSlider = (direction) => {
        currentSlide = (currentSlide + direction + slides.length) % slides.length;
        renderHomeTwoSlider();
    };

    prevButton?.addEventListener("click", () => moveHomeTwoSlider(-1));
    nextButton?.addEventListener("click", () => moveHomeTwoSlider(1));
    renderHomeTwoSlider();
}

const aboutClubSlider = document.querySelector("[data-about-club-slider]");

if (aboutClubSlider) {
    const image = aboutClubSlider.querySelector("[data-about-club-image]");
    const title = aboutClubSlider.querySelector("[data-about-club-title]");
    const text = aboutClubSlider.querySelector("[data-about-club-text]");
    const secondaryText = aboutClubSlider.querySelector("[data-about-club-text-secondary]");
    const dots = Array.from(aboutClubSlider.querySelectorAll("[data-about-club-dot]"));

    const renderAboutClubSlide = (activeDot) => {
        if (!activeDot) {
            return;
        }

        if (image) {
            image.src = activeDot.dataset.image || image.src;
        }

        if (title) {
            title.textContent = activeDot.dataset.title || "";
        }

        if (text) {
            text.textContent = activeDot.dataset.text || "";
        }

        if (secondaryText) {
            secondaryText.textContent = activeDot.dataset.textSecondary || "";
        }

        dots.forEach((dot) => {
            const isActive = dot === activeDot;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-selected", String(isActive));
        });
    };

    dots.forEach((dot) => {
        const activate = () => renderAboutClubSlide(dot);
        dot.addEventListener("click", activate);
        dot.addEventListener("touchstart", activate, { passive: true });
    });

    renderAboutClubSlide(dots.find((dot) => dot.classList.contains("is-active")) || dots[0]);
}

const clientsSlider = document.querySelector("[data-clients-slider]");

if (clientsSlider) {
    const slides = Array.from(clientsSlider.querySelectorAll("[data-clients-slide]"));
    const dots = Array.from(clientsSlider.querySelectorAll("[data-clients-dot]"));
    let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));

    if (activeIndex < 0) {
        activeIndex = 0;
    }

    const renderClientsSlide = () => {
        slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === activeIndex);
        });

        dots.forEach((dot, index) => {
            const isActive = index === activeIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-selected", String(isActive));
        });
    };

    dots.forEach((dot, index) => {
        const activate = () => {
            activeIndex = index;
            renderClientsSlide();
        };

        dot.addEventListener("click", activate);
        dot.addEventListener("touchstart", activate, { passive: true });
    });

    renderClientsSlide();
}

const aboutTestimonialSlider = document.querySelector("[data-about-testimonial-slider]");

if (aboutTestimonialSlider) {
    const slides = Array.from(aboutTestimonialSlider.querySelectorAll("[data-about-testimonial-slide]"));
    const dots = Array.from(aboutTestimonialSlider.querySelectorAll("[data-about-testimonial-dot]"));
    let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));

    if (activeIndex < 0) {
        activeIndex = 0;
    }

    const renderAboutTestimonialSlide = () => {
        slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === activeIndex);
        });

        dots.forEach((dot, index) => {
            const isActive = index === activeIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-selected", String(isActive));
        });
    };

    dots.forEach((dot, index) => {
        const activate = () => {
            activeIndex = index;
            renderAboutTestimonialSlide();
        };

        dot.addEventListener("click", activate);
        dot.addEventListener("touchstart", activate, { passive: true });
    });

    renderAboutTestimonialSlide();
}

const bookingForm = document.querySelector("[data-booking-form]");

if (bookingForm) {
    const packageField = bookingForm.querySelector("#bookingPackage");
    const guestField = bookingForm.querySelector("#bookingGuests");
    const totalField = document.querySelector("[data-booking-total]");
    const packageFieldMirror = document.querySelector("[data-booking-package]");
    const guestFieldMirror = document.querySelector("[data-booking-guests]");
    const statusField = document.querySelector("[data-booking-status]");
    const quickPicks = document.querySelectorAll("[data-booking-pick]");
    const pricing = {
        Basic: 7999,
        Standard: 14999,
        Premium: 24999,
        Wedding: 18999,
        Corporate: 21999
    };

    const updateBookingSummary = () => {
        const packageName = packageField?.value || "Standard";
        const guests = Number(guestField?.value || 50);
        const base = pricing[packageName] || pricing.Standard;
        const total = base + Math.max(guests - 50, 0) * 120;

        if (packageFieldMirror) {
            packageFieldMirror.textContent = packageName;
        }

        if (guestFieldMirror) {
            guestFieldMirror.textContent = `${guests} Guests`;
        }

        if (totalField) {
            totalField.textContent = `Rs ${total.toLocaleString("en-IN")}`;
        }
    };

    quickPicks.forEach((button) => {
        button.addEventListener("click", () => {
            const targetPackage = button.dataset.bookingPick || "Standard";
            packageField.value = targetPackage;
            quickPicks.forEach((chip) => chip.classList.toggle("is-active", chip === button));
            updateBookingSummary();
        });
    });

    packageField?.addEventListener("change", () => {
        quickPicks.forEach((chip) => chip.classList.toggle("is-active", chip.dataset.bookingPick === packageField.value));
        updateBookingSummary();
    });

    guestField?.addEventListener("input", updateBookingSummary);

    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = bookingForm.querySelector("#bookingName")?.value.trim() || "Guest";
        const packageName = packageField?.value || "Standard";
        const eventDate = bookingForm.querySelector("#bookingDate")?.value || "your selected date";

        if (statusField) {
            statusField.textContent = `${name}, your ${packageName} booking request for ${eventDate} has been received.`;
        }
    });

    updateBookingSummary();
}
