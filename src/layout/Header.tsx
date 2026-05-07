"use client";
import { useStickyHeader } from "@/utility";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState, useEffect } from "react";
import { UserDropdown } from "@/components/UserDropdown";
import { UserMenuMobile } from "@/components/UserMenuMobile";
import { useAuth } from "@/contexts/AuthContextProxy";
import NotificationBell from "@/components/NotificationBell";

const Header = ({ header }: { header?: number }) => {
  if (header === 0) return null;
  useStickyHeader();
  const headers = { 1: Header1, 3: Header3, 4: Header4, 5: Header5 };
  const HeaderComponent = headers[header as keyof typeof headers] || Header3;
  const [toggleMobileMenu, setToggleMobileMenu] = useState(false);
  return (
    <Fragment>
      <div className={toggleMobileMenu ? "mobile-menu-open" : ""}>
        <HeaderComponent open={() => setToggleMobileMenu(true)} />
      </div>
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
      width={180}
      height={54}
      alt="logo-img"
      style={{
        height: '44px',
        width: 'auto',
        filter: logo.includes('white')
          ? 'brightness(0) invert(1)'
          : 'none'
      }}
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
        <div className="header-main style-2 d-flex justify-content-between align-items-center">
          <div className="header-left" style={{ flex: 1 }}>
            <div className="logo">
              <Logo />
              <Logo className="header-logo-2" logo="black-logo.png" />
            </div>
          </div>
          <div className="header-middle d-flex justify-content-center" style={{ flex: 2 }}>
            <div className="mean__menu-wrapper">
              <Nav />
            </div>
          </div>
          <div className="header-right d-flex justify-content-end align-items-center gap-3" style={{ flex: 1 }}>
            <NotificationBell />
            <AuthButton />
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

const Header3 = ({ open }: { open: () => void }) => {

  return (
    <Fragment>

      <header className="header-section-1">
        <div id="header-sticky" className="header-1 bg-[var(--theme-light,#f74938)]" style={{ backgroundColor: '#fff5f4' }}>
          <div className="main-logo">
            <Logo logo="white-logo.png" />
          </div>
          <div className="container-fluid">
            <div className="mega-menu-wrapper">
              <div className="header-main d-flex justify-content-between align-items-center">
                <div className="header-left d-flex align-items-center" style={{ flex: 1 }}>
                  <Logo logo="white-logo.png" />
                </div>
                <div className="header-middle d-flex justify-content-center" style={{ flex: 2 }}>
                  <div className="mean__menu-wrapper">
                    <Nav />
                  </div>
                </div>
                <div className="header-right d-flex justify-content-end align-items-center gap-3" style={{ flex: 1 }}>
                  <NotificationBell />
                  <AuthButton />
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

  return (
    <Fragment>

      {/* Main header — trắng, sticky */}
      <header id="header-sticky" className="header-4" style={{ backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '6px 0' }}>
        <div className="container">
          <div className="mega-menu-wrapper">
            <div className="header-main style-2 flex items-center justify-between">
              <div className="header-left d-flex align-items-center" style={{ flex: 1 }}>
                <Logo logo="black-logo.png" />
              </div>
              <div className="header-middle d-flex justify-content-center" style={{ flex: 2 }}>
                <div className="mean__menu-wrapper">
                  <Nav />
                </div>
              </div>
              <div className="header-right d-flex justify-content-end align-items-center gap-3" style={{ flex: 1 }}>
                <NotificationBell />
                <AuthButton />
              </div>
            </div>
          </div>
        </div>
      </header>
    </Fragment>
  );
};

const Header5 = ({ open }: { open: () => void }) => {

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Fragment>

      {/* Transparent overlay header */}
      <header
        className={`header-5 fixed w-full z-50 left-0 top-0 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}
        style={{ borderBottom: 'none' }}
      >
        <div className="container">
          <div className="mega-menu-wrapper">
            <div className="header-main style-2 flex items-center justify-between">
              <div className="header-left d-flex align-items-center" style={{ flex: 1 }}>
                <Logo logo={isScrolled ? "black-logo.png" : "white-logo.png"} />
              </div>
              <div className="header-middle d-flex justify-content-center" style={{ flex: 2 }}>
                <div className="mean__menu-wrapper">
                  <Nav whiteText={!isScrolled} />
                </div>
              </div>
              <div className="header-right d-flex justify-content-end align-items-center gap-3" style={{ flex: 1 }}>
                <NotificationBell />
                <AuthButton whiteText={!isScrolled} />
                <div className="header__hamburger d-xl-none my-auto">
                  <div className="sidebar__toggle" onClick={open}>
                    <i className="fas fa-bars" style={{ color: isScrolled ? '#333' : '#fff' }} />
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
  // NOTE: Kept for minimal diff; now only used for Home 02.
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
        <Link href={n === 2 ? "/" : `/index-${n}`} className="theme-btn">
          <span>Xem demo</span>
        </Link>
      </div>
    </div>
    <div className="homemenu-content text-center">
      <h4 className="homemenu-title">Home 0{n}</h4>
    </div>
  </div>
);

const Nav = ({ whiteText = false }: { whiteText?: boolean }) => (
  <div className="main-menu d-none d-lg-block">
    <nav id="mobile-menu">
      <ul className="d-flex align-items-center mb-0" style={{ gap: '2rem' }}>
        <li className="m-0">
          <Link href="/" className={`font-semibold ${whiteText ? 'text-white' : 'text-gray-700'} hover:text-orange-600`} style={{ fontSize: '14px', whiteSpace: 'nowrap', transition: 'color 0.2s', textShadow: whiteText ? '0 1px 3px rgba(0,0,0,0.5)' : 'none' }}>Trang chủ</Link>
        </li>
        {/* ── Giới thiệu dropdown ── */}
        <li className="m-0 relative" style={{ zIndex: 100 }}>
          <span
            className={`font-semibold ${whiteText ? 'text-white' : 'text-gray-700'} hover:text-[#ff5e14] cursor-pointer inline-flex items-center gap-1 select-none intro-dropdown-trigger`}
            style={{ fontSize: '14px', whiteSpace: 'nowrap', transition: 'color 0.2s', textShadow: whiteText ? '0 1px 3px rgba(0,0,0,0.5)' : 'none' }}
          >
            Giới thiệu
            <svg className="w-3 h-3 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </span>
          {/* Dropdown menu - using CSS :hover on parent li */}
          <div className="intro-dropdown-menu" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '100%', paddingTop: 12, minWidth: 210, opacity: 0, visibility: 'hidden' as any, transition: 'opacity 0.2s, visibility 0.2s' }}>
            <div style={{ borderRadius: 12, background: '#fff', padding: '8px 0', border: '1px solid #f1f5f9', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontFamily: 'var(--font-dm-sans)' }}>
              <Link href="/about" style={{ display: 'block', padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#0f172a', textDecoration: 'none', transition: 'background 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = '#fff0e8'; e.currentTarget.style.color = '#ff5e14'; }} onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#0f172a'; }}>
                Về TrustFundMe
              </Link>
              <Link href="/terms" style={{ display: 'block', padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#0f172a', textDecoration: 'none', transition: 'background 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = '#fff0e8'; e.currentTarget.style.color = '#ff5e14'; }} onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#0f172a'; }}>
                Điều khoản
              </Link>
              <Link href="/trust-score" style={{ display: 'block', padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#0f172a', textDecoration: 'none', transition: 'background 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = '#fff0e8'; e.currentTarget.style.color = '#ff5e14'; }} onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#0f172a'; }}>
                Điểm tin cậy
              </Link>
            </div>
          </div>
          <style jsx>{`
            li:hover .intro-dropdown-menu {
              opacity: 1 !important;
              visibility: visible !important;
            }
            li:hover .intro-dropdown-trigger svg {
              transform: rotate(180deg);
            }
          `}</style>
        </li>
        <li className="m-0">
          <Link href="/campaigns" className={`font-semibold ${whiteText ? 'text-white' : 'text-gray-700'} hover:text-orange-600`} style={{ fontSize: '14px', whiteSpace: 'nowrap', transition: 'color 0.2s', textShadow: whiteText ? '0 1px 3px rgba(0,0,0,0.5)' : 'none' }}>Chiến dịch</Link>
        </li>
        <li className="m-0">
          <Link href="/post" className={`font-semibold ${whiteText ? 'text-white' : 'text-gray-700'} hover:text-orange-600`} style={{ fontSize: '14px', whiteSpace: 'nowrap', transition: 'color 0.2s', textShadow: whiteText ? '0 1px 3px rgba(0,0,0,0.5)' : 'none' }}>Cộng đồng</Link>
        </li>
      </ul>
    </nav>
  </div>
);



const MobileMenu = ({ open, close }: { open: boolean; close: () => void }) => {
  const { isAuthenticated } = useAuth();

  return (
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
                <h4>Thông tin liên hệ</h4>
                <ul>
                  {[
                    {
                      icon: "fas fa-map-marker-alt",
                      link: "#",
                      text: "FPT University, Long Thạnh Mỹ, Thủ Đức, Thành phố Hồ Chí Minh, Vietnam",
                    },
                    {
                      icon: "fas fa-envelope",
                      link: "mailto:trustfundme@co.vn",
                      text: "trustfundme@co.vn",
                    },
                    {
                      icon: "fas fa-clock",
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
                        className={`offcanvas__contact-icon ${i > 0 ? "mr-15" : ""
                          }`}
                      >
                        <i className={item.icon} />
                      </div>
                      <div className="offcanvas__contact-text">
                        <a
                          target={item.link === "#" ? "_blank" : undefined}
                          href={item.link}
                        >
                          {item.text}
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="header-button mt-4">
                  <UserMenuMobile />
                </div>
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
};

const AuthButton = ({ whiteText = false }: { whiteText?: boolean }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="d-flex align-items-center gap-3">
        <UserDropdown />
      </div>
    );
  }

  return (
    <div className="header-button d-none d-xl-block">
      <Link
        href="/sign-in"
        className="theme-btn"
        style={whiteText ? { color: '#fff', border: '1px solid #fff' } : { backgroundColor: '#F84D43', color: '#fff' }}
      >
        Đăng nhập
      </Link>
    </div>
  );
};

const MobileNav = () => {
  const { isAuthenticated } = useAuth();
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
            <li className="has-dropdown">
              <Link href="/about" className="border-none">
                Giới thiệu
                <i className="fas fa-angle-down" />
              </Link>
              <ul className="submenu" style={show("about", activeMenu)}>
                <li><Link href="/about">Về TrustFundMe</Link></li>
                <li><Link href="/terms">Điều khoản</Link></li>
                <li><Link href="/trust-score">Điểm tin cậy</Link></li>
              </ul>
              <a
                className="mean-expand"
                href="#"
                onClick={() => toggle("about", setActiveMenu, activeMenu)}
              >
                <i className="far fa-plus" />
              </a>
            </li>
            <li>
              <Link href="/campaigns">Campaign</Link>
            </li>
            <li>
              <Link href="/post">Communication</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};
