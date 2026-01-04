import type { Swiper as SwiperRef } from "swiper";
import SwiperCore from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import {
  Autoplay,
  EffectFade,
  FreeMode,
  Grid,
  Navigation,
  Pagination,
  Parallax,
  Thumbs,
} from "swiper/modules";
SwiperCore.use([
  Pagination,
  Navigation,
  EffectFade,
  Autoplay,
  Grid,
  Parallax,
  FreeMode,
  Thumbs,
]);
const animateElements = (swiper: SwiperRef): void => {
  if (!swiper || !swiper.slides) return;
  swiper.el.querySelectorAll("[data-animation]").forEach((el) => {
    const element = el as HTMLElement;
    const anim = element.dataset.animation;
    if (anim) {
      const classesToRemove = anim.split(" ");
      element.classList.remove("animated", ...classesToRemove);
    }
  });

  const activeSlideEl = swiper.slides[swiper.activeIndex] as HTMLElement;
  const animatedElements = activeSlideEl.querySelectorAll("[data-animation]");

  animatedElements.forEach((element) => {
    const el = element as HTMLElement;
    const anim = el.dataset.animation;
    const delay = el.dataset.delay;
    const duration = el.dataset.duration;

    if (anim) {
      const classesToAdd = anim.split(" ");
      el.classList.add("animated", ...classesToAdd);
      if (delay) el.style.animationDelay = delay;
      if (duration) el.style.animationDuration = duration;
    }
  });
};

export const sliderProps = {
  heroSlider1: {
    loop: true,
    slidesPerView: 1,
    effect: "fade",
    speed: 3000,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".dot",
      clickable: true,
    },
    // @ts-ignore
    onSwiper: (swiper: SwiperRef) => {
      animateElements(swiper);
    },
    onSlideChange: (swiper: SwiperRef) => {
      animateElements(swiper);
    },
  },
  heroSlider2: {
    loop: true,
    slidesPerView: 1,
    effect: "fade",
    speed: 3000,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".array-next",
      prevEl: ".array-prev",
    },
    // @ts-ignore
    onSwiper: (swiper: SwiperRef) => {
      animateElements(swiper);
    },
    onSlideChange: (swiper: SwiperRef) => {
      animateElements(swiper);
    },
  },
  testimonial1: {
    spaceBetween: 30,
    speed: 1000,
    loop: true,
    slidesPerView: 1,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".dot",
      clickable: true,
    },
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
    },
  },
  causes1: {
    spaceBetween: 30,
    speed: 2000,
    loop: true,
    autoplay: {
      delay: 2000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".array-prev",
      prevEl: ".array-next",
    },
    breakpoints: {
      1399: {
        slidesPerView: 4,
      },
      1199: {
        slidesPerView: 3,
      },
      991: {
        slidesPerView: 2,
      },
      767: {
        slidesPerView: 1,
      },
      575: {
        slidesPerView: 1,
      },
      0: {
        slidesPerView: 1,
      },
    },
  },
  testimonial2: {
    spaceBetween: 20,
    speed: 2000,
    loop: true,
    centeredSlides: true,
    pagination: {
      el: ".dot",
      clickable: true,
    },
    autoplay: {
      delay: 1000,
      disableOnInteraction: false,
    },
    breakpoints: {
      1399: {
        slidesPerView: 4,
      },
      1199: {
        slidesPerView: 3,
      },
      991: {
        slidesPerView: 3,
      },
      767: {
        slidesPerView: 2,
      },
      575: {
        slidesPerView: 1,
      },
      0: {
        slidesPerView: 1,
      },
    },
  },
  testimonial3: {
    spaceBetween: 20,
    speed: 2000,
    loop: true,
    centeredSlides: false,
    slidesPerGroupSkip: 3,
    grabCursor: true,
    keyboard: {
      enabled: true,
    },
    autoplay: {
      delay: 1000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".dot",
      clickable: true,
    },
    breakpoints: {
      1199: {
        slidesPerView: 3,
      },
      991: {
        slidesPerView: 3,
      },
      767: {
        slidesPerView: 2,
      },
      575: {
        slidesPerView: 1,
      },
      0: {
        slidesPerView: 1,
      },
    },
  },
  event: {
    spaceBetween: 0,
    speed: 3000,
    loop: true,
    centeredSlides: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    breakpoints: {
      1399: {
        slidesPerView: 5,
      },
      1199: {
        slidesPerView: 4,
      },
      991: {
        slidesPerView: 3,
      },
      767: {
        slidesPerView: 3,
      },
      575: {
        slidesPerView: 2,
      },
      0: {
        slidesPerView: 1,
      },
    },
  },
  causes2: {
    spaceBetween: 30,
    speed: 2000,
    loop: true,
    autoplay: {
      delay: 2000,
      disableOnInteraction: false,
    },
    breakpoints: {
      1199: {
        slidesPerView: 3,
      },
      991: {
        slidesPerView: 2,
      },
      767: {
        slidesPerView: 1,
      },
      575: {
        slidesPerView: 1,
      },
      0: {
        slidesPerView: 1,
      },
    },
  },
};
