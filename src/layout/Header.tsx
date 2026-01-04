"use client";
import { useStickyHeader } from "@/utility";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";

const Header = ({ header }: { header?: number }) => {
  useStickyHeader();
  const headers = { 1: Header1, 2: Header2, 3: Header3, 4: Header4 };
  const HeaderComponent = headers[header as keyof typeof headers] || Header3;
  const [toggleMobileMenu, setToggleMobileMenu] = useState(false);
  return (
    <Fragment>
      <HeaderComponent open={() => setToggleMobileMenu(true)} />
      <MobileMenu
        open={toggleMobileMenu}
        close={() => setToggleMobileMenu(false)}
      />
    </Fragment>
  );
};

export default Header;

const Logo = ({
  logo = "white-logo.png",
  className = "header-logo",
}: {
  logo?: string;
  className?: string;
}) => (
  <Link href="/" className={className}>
    <Image
      src={`/assets/img/logo/${logo}`}
      width={178}
      height={54}
      alt="logo-img"
    />
  </Link>
);

const SocialIcons = ({ label = "Follow Us:" }: { label?: string }) => (
  <div className="social-icon d-flex align-items-center">
    <span>{label}</span>
    {["facebook-f", "twitter", "linkedin-in", "youtube"].map((icon) => (
      <a href="#" key={icon}>
        <i className={`fab fa-${icon}`} />
      </a>
    ))}
  </div>
);

const ContactList = ({
  items,
}: {
  items: { icon: string; content: string | React.ReactNode }[];
}) => (
  <ul className="contact-list">
    {items.map((item, i) => (
      <li key={i}>
        <i className={item.icon} />
        {item.content}
      </li>
    ))}
  </ul>
);

const Header1 = ({ open }: { open: () => void }) => (
  <header id="header-sticky" className="header-4">
    <div className="container">
      <div className="mega-menu-wrapper">
        <div className="header-main style-2">
          <div className="header-left">
            <div className="logo">
              <Logo />
              <Logo className="header-logo-2" logo="black-logo.png" />
            </div>
          </div>
          <div className="header-right d-flex justify-content-end align-items-center">
            <div className="mean__menu-wrapper">
              <Nav />
            </div>
            <div className="header-button d-none d-sm-block">
              <Link href="/contact" className="theme-btn">
                Donate Now
                <i className="ps-2 far fa-heart" />
              </Link>
            </div>
            <div className="header__hamburger d-xl-none my-auto">
              <div className="sidebar__toggle" onClick={open}>
                <i className="fas fa-bars" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

const Header2 = ({ open }: { open: () => void }) => (
  <Fragment>
    <div className="header-top-section-3">
      <div className="container">
        <div className="header-top-wrapper-2 style-3">
          <ContactList
            items={[
              {
                icon: "fal fa-map-marker-alt",
                content: "Main Street, Melbourne, Australia",
              },
              {
                icon: "far fa-envelope",
                content: (
                  <a href="mailto:info@example.com" className="link">
                    info@example.com
                  </a>
                ),
              },
            ]}
          />
          <SocialIcons label="Follow Us On:" />
        </div>
      </div>
    </div>
    <header id="header-sticky" className="header-3">
      <div className="container">
        <div className="mega-menu-wrapper">
          <div className="header-main style-2">
            <div className="header-left">
              <div className="logo">
                <Logo logo="black-logo.png" />
              </div>
              <div className="mean__menu-wrapper">
                <Nav />
              </div>
            </div>
            <div className="header-right d-flex justify-content-end align-items-center">
              <div className="author-icon">
                <div className="icon">
                  <i className="fa fa-regular fa-phone" />
                </div>
                <div className="content">
                  <span>Call Us Now</span>
                  <h5>
                    <a href="tel:+2085550112">+000 (123) 456 88</a>
                  </h5>
                </div>
              </div>
              <div className="header-button">
                <Link href="causes" className="theme-btn">
                  Donate Now
                  <i className="ps-2 far fa-heart" />
                </Link>
              </div>
              <div className="header__hamburger d-xl-none my-auto">
                <div className="sidebar__toggle" onClick={open}>
                  <i className="fas fa-bars" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  </Fragment>
);

const Header3 = ({ open }: { open: () => void }) => {
  const [toggle, setToggle] = useState(false);
  return (
    <Fragment>
      <SearchPopup open={toggle} close={() => setToggle(false)} />
      <header className="header-section-1">
        <div className="header-top-section fix">
          <div className="container-fluid">
            <div className="header-top-wrapper style-2">
              <ContactList
                items={[
                  {
                    icon: "far fa-envelope",
                    content: (
                      <a href="mailto:info@example.com" className="link">
                        info@example.com
                      </a>
                    ),
                  },
                  {
                    icon: "fa fa-regular fa-phone",
                    content: <a href="tel:2086660112">+208-666-0112</a>,
                  },
                ]}
              />
              <div className="top-right">
                <SocialIcons />
              </div>
            </div>
          </div>
        </div>
        <div id="header-sticky" className="header-1">
          <div className="main-logo">
            <Logo />
          </div>
          <div className="container-fluid">
            <div className="mega-menu-wrapper">
              <div className="header-main">
                <div className="logo d-none">
                  <Logo logo="black-logo.png" />
                </div>
                <div className="header-left">
                  <div className="mean__menu-wrapper">
                    <Nav />
                  </div>
                </div>
                <div className="header-right d-flex justify-content-end align-items-center">
                  <a
                    href="#0"
                    className="search-trigger search-icon"
                    onClick={() => setToggle(true)}
                  >
                    <i className="fa-light fa-magnifying-glass"></i>
                  </a>
                  <div className="header-button">
                    <Link href="/contact" className="theme-btn">
                      Donate Now
                      <i className="ps-2 far fa-heart" />
                    </Link>
                  </div>
                  <div className="header__hamburger d-xl-none my-auto">
                    <div className="sidebar__toggle" onClick={open}>
                      <i className="fas fa-bars" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </Fragment>
  );
};

const Header4 = ({ open }: { open: () => void }) => {
  const [toggle, setToggle] = useState(false);
  return (
    <Fragment>
      <SearchPopup open={toggle} close={() => setToggle(false)} />
      <header className="header-section-2">
        <div className="header-top-section-2">
          <div className="container">
            <div className="header-top-wrapper-2">
              <ContactList
                items={[
                  {
                    icon: "fal fa-map-marker-alt",
                    content: "Main Street, Melbourne, Australia",
                  },
                  {
                    icon: "far fa-envelope",
                    content: (
                      <a href="mailto:info@example.com" className="link">
                        info@example.com
                      </a>
                    ),
                  },
                ]}
              />
              <SocialIcons label="Follow Us On:" />
            </div>
          </div>
        </div>
        <div id="header-sticky" className="header-2">
          <div className="container">
            <div className="mega-menu-wrapper">
              <div className="header-main style-2">
                <div className="header-left">
                  <div className="logo">
                    <Logo logo="black-logo.png" />
                  </div>
                </div>
                <div className="header-right d-flex justify-content-end align-items-center">
                  <div className="mean__menu-wrapper">
                    <Nav />
                  </div>
                  <a
                    href="#0"
                    className="search-trigger search-icon"
                    onClick={() => setToggle(true)}
                  >
                    <i className="fa-light fa-magnifying-glass"></i>
                  </a>
                  <div className="header-button">
                    <Link href="/contact" className="theme-btn">
                      Donate Now
                      <i className="ps-2 far fa-heart" />
                    </Link>
                  </div>
                  <div className="header__hamburger d-xl-none my-auto">
                    <div className="sidebar__toggle" onClick={open}>
                      <i className="fas fa-bars" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </Fragment>
  );
};

const HomeMenuItem = ({ n }: { n: number }) => (
  <div className="homemenu">
    <div className={`homemenu-thumb ${n > 1 ? "mb-15" : ""}`}>
      <Image
        src={`/assets/img/header/home-${n}.jpg`}
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
        alt="logo-img"
      />
      <div className="demo-button">
        <Link href={n === 1 ? "/" : `/index-${n}`} className="theme-btn">
          <span>View Demo</span>
        </Link>
      </div>
    </div>
    <div className="homemenu-content text-center">
      <h4 className="homemenu-title">Home 0{n}</h4>
    </div>
  </div>
);

const Nav = () => (
  <div className="main-menu d-none d-xl-block">
    <nav id="mobile-menu">
      <ul>
        <li className="has-dropdown menu-thumb">
          <Link href="/">
            Home
            <i className="fas fa-angle-down" />
          </Link>
          <ul className="submenu has-homemenu">
            <li>
              <div className="homemenu-items">
                {[1, 2, 3, 4].map((n) => (
                  <HomeMenuItem key={n} n={n} />
                ))}
              </div>
            </li>
          </ul>
        </li>
        <li className="has-dropdown d-xl-none">
          <Link href="/team" className="border-none">
            Home
            <i className="fas fa-angle-down" />
          </Link>
          <ul className="submenu">
            {[1, 2, 3, 4].map((n) => (
              <li key={n}>
                <Link href={n === 1 ? "/index" : `/index-${n}`}>Home 0{n}</Link>
              </li>
            ))}
          </ul>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li className="has-dropdown">
          <Link href="/causes-details">
            Causes
            <i className="fas fa-angle-down" />
          </Link>
          <ul className="submenu">
            <li>
              <Link href="/causes">Causes List</Link>
            </li>
            <li>
              <Link href="/causes-details">Causes Details</Link>
            </li>
            <li>
              <Link href="/donation-details">Donation</Link>
            </li>
          </ul>
        </li>
        <li className="has-dropdown">
          <Link href="/news">
            Pages
            <i className="fas fa-angle-down" />
          </Link>
          <ul className="submenu">
            <li className="has-dropdown">
              <Link href="/event-details">
                Events
                <i className="fas fa-angle-down" />
              </Link>
              <ul className="submenu">
                <li>
                  <Link href="/events">Events</Link>
                </li>
                <li>
                  <Link href="/event-details">Event Details</Link>
                </li>
              </ul>
            </li>
            <li className="has-dropdown">
              <Link href="/team-details">
                volunteer
                <i className="fas fa-angle-down" />
              </Link>
              <ul className="submenu">
                <li>
                  <Link href="/team">Our volunteer</Link>
                </li>
                <li>
                  <Link href="/team-details">volunteer Details</Link>
                </li>
              </ul>
            </li>
            <li>
              <Link href="/faq">Faq's</Link>
            </li>
            <li>
              <Link href="/404">404 Page</Link>
            </li>
          </ul>
        </li>
        <li className="has-dropdown">
          <Link href="/news">
            Blog
            <i className="fas fa-angle-down" />
          </Link>
          <ul className="submenu">
            <li>
              <Link href="/news-grid">Blog Grid</Link>
            </li>
            <li>
              <Link href="/news">Blog Standard</Link>
            </li>
            <li>
              <Link href="/news-details">Blog Details</Link>
            </li>
          </ul>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  </div>
);

const SearchPopup = ({ open, close }: { open: boolean; close: () => void }) => (
  <div className="search-wrap" style={{ display: open ? "block" : "none" }}>
    <div className="search-inner">
      <i className="fa fa-light fa-xmark search-close" onClick={close}></i>
      <div className="search-cell">
        <form method="get">
          <div className="search-field-holder">
            <input
              type="search"
              className="main-search-input"
              placeholder="Search..."
            />
          </div>
        </form>
      </div>
    </div>
  </div>
);

const MobileMenu = ({ open, close }: { open: boolean; close: () => void }) => (
  <Fragment>
    <div className="fix-area">
      <div className={`offcanvas__info ${open ? "info-open" : ""}`}>
        <div className="offcanvas__wrapper">
          <div className="offcanvas__content">
            <div className="offcanvas__top mb-5 d-flex justify-content-between align-items-center">
              <div className="offcanvas__logo">
                <Logo logo="black-logo.png" className="" />
              </div>
              <div className="offcanvas__close">
                <button onClick={close}>
                  <i className="fas fa-times" />
                </button>
              </div>
            </div>
            <p className="text d-none d-xl-block">
              Nullam dignissim, ante scelerisque the is euismod fermentum odio
              sem semper the is erat, a feugiat leo urna eget eros. Duis Aenean
              a imperdiet risus.
            </p>
            <MobileNav />
            <div className="offcanvas__contact">
              <h4>Contact Info</h4>
              <ul>
                {[
                  {
                    icon: "fal fa-map-marker-alt",
                    link: "#",
                    text: "Main Street, Melbourne, Australia",
                  },
                  {
                    icon: "fal fa-envelope",
                    link: "mailto:info@azent.com",
                    text: "info@example.com",
                  },
                  {
                    icon: "fal fa-clock",
                    link: "#",
                    text: "Mod-friday, 09am -05pm",
                  },
                  {
                    icon: "far fa-phone",
                    link: "tel:+11002345909",
                    text: "+11002345909",
                  },
                ].map((item, i) => (
                  <li key={i} className="d-flex align-items-center">
                    <div
                      className={`offcanvas__contact-icon ${
                        i > 0 ? "mr-15" : ""
                      }`}
                    >
                      <i className={item.icon} />
                    </div>
                    <div className="offcanvas__contact-text">
                      <a
                        target={item.link === "#" ? "_blank" : undefined}
                        href={item.link}
                      >
                        {i === 1 ? (
                          <span className="mailto:info@example.com">
                            {item.text}
                          </span>
                        ) : (
                          item.text
                        )}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="header-button mt-4">
                <Link href="/contact" className="theme-btn text-center">
                  <span>
                    get A Quote
                    <i className="fa-solid fa-arrow-right-long" />
                  </span>
                </Link>
              </div>
              <SocialIcons label="" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      className={`offcanvas__overlay ${open ? "overlay-open" : ""}`}
      onClick={close}
    ></div>
  </Fragment>
);

const MobileNav = () => {
  const [activeMenu, setActiveMenu] = useState("");
  const [multiMenu, setMultiMenu] = useState("");
  const toggle = (menu: string, setter: (v: string) => void, current: string) =>
    setter(current === menu ? "" : menu);
  const show = (menu: string, current: string) => ({
    display: current === menu ? "block" : "none",
  });

  return (
    <div className="mobile-menu fix mb-3 mean-container">
      <div className="mean-bar">
        <a href="#nav" className="meanmenu-reveal">
          <span>
            <span>
              <span />
            </span>
          </span>
        </a>
        <nav className="mean-nav">
          <ul>
            <li className="has-dropdown">
              <Link href="/team" className="border-none">
                Home
                <i className="fas fa-angle-down" />
              </Link>
              <ul className="submenu" style={show("home", activeMenu)}>
                {[1, 2, 3, 4].map((n) => (
                  <li key={n}>
                    <Link href={n === 1 ? "/index" : `/index-${n}`}>
                      Home 0{n}
                    </Link>
                  </li>
                ))}
              </ul>
              <a
                className="mean-expand"
                href="#"
                onClick={() => toggle("home", setActiveMenu, activeMenu)}
              >
                <i className="far fa-plus" />
              </a>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/causes-details">
                Causes
                <i className="fas fa-angle-down" />
              </Link>
              <ul className="submenu" style={show("Causes", activeMenu)}>
                <li>
                  <Link href="/causes">Causes List</Link>
                </li>
                <li>
                  <Link href="/causes-details">Causes Details</Link>
                </li>
                <li>
                  <Link href="/donation-details">Donation</Link>
                </li>
              </ul>
              <a
                className="mean-expand"
                href="#"
                onClick={() => toggle("Causes", setActiveMenu, activeMenu)}
              >
                <i className="far fa-plus" />
              </a>
            </li>
            <li className="has-dropdown">
              <Link href="/news">
                Pages
                <i className="fas fa-angle-down" />
              </Link>
              <ul className="submenu" style={show("Pages", activeMenu)}>
                <li className="has-dropdown">
                  <Link href="/event-details">
                    Events
                    <i className="fas fa-angle-down" />
                  </Link>
                  <ul className="submenu" style={show("Events", multiMenu)}>
                    <li>
                      <Link href="/events">Events</Link>
                    </li>
                    <li>
                      <Link href="/event-details">Event Details</Link>
                    </li>
                  </ul>
                  <a
                    className="mean-expand"
                    href="#"
                    onClick={() => toggle("Events", setMultiMenu, multiMenu)}
                  >
                    <i className="far fa-plus" />
                  </a>
                </li>
                <li className="has-dropdown">
                  <Link href="/team-details">
                    volunteer
                    <i className="fas fa-angle-down" />
                  </Link>
                  <ul className="submenu" style={show("volunteer", multiMenu)}>
                    <li>
                      <Link href="/team">Our volunteer</Link>
                    </li>
                    <li>
                      <Link href="/team-details">volunteer Details</Link>
                    </li>
                  </ul>
                  <a
                    className="mean-expand"
                    href="#"
                    onClick={() => toggle("volunteer", setMultiMenu, multiMenu)}
                  >
                    <i className="far fa-plus" />
                  </a>
                </li>
                <li>
                  <Link href="/faq">Faq's</Link>
                </li>
                <li>
                  <Link href="/404">404 Page</Link>
                </li>
              </ul>
              <a
                className="mean-expand"
                href="#"
                onClick={() => toggle("Pages", setActiveMenu, activeMenu)}
              >
                <i className="far fa-plus" />
              </a>
            </li>
            <li>
              <Link href="/news">
                Blog
                <i className="fas fa-angle-down" />
              </Link>
              <ul className="submenu" style={show("Blog", activeMenu)}>
                <li>
                  <Link href="/news-grid">Blog Grid</Link>
                </li>
                <li>
                  <Link href="/news">Blog Standard</Link>
                </li>
                <li>
                  <Link href="/news-details">Blog Details</Link>
                </li>
              </ul>
              <a
                className="mean-expand"
                href="#"
                onClick={() => toggle("Blog", setActiveMenu, activeMenu)}
              >
                <i className="far fa-plus" />
              </a>
            </li>
            <li className="mean-last">
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};
