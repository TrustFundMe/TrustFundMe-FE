"use client";
import { useStickyHeader } from "@/utility";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import { UserDropdown } from "@/components/UserDropdown";
import { UserMenuMobile } from "@/components/UserMenuMobile";
import { useAuth } from "@/contexts/AuthContextProxy";
import NotificationBell from "@/components/NotificationBell";

const Header = ({ header }: { header?: number }) => {
  if (header === 0) return null;
  useStickyHeader();
  const headers = { 1: Header1, 3: Header3, 4: Header4 };
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
        <div className="header-main style-2">
          <div className="header-left">
            <div className="logo">
              <Logo />
              <Logo className="header-logo-2" logo="black-logo.png" />
            </div>
          </div>
          <div className="header-right d-flex justify-content-end align-items-center gap-3">
            <div className="mean__menu-wrapper">
              <Nav />
            </div>
            <div className="header-button d-none d-sm-block">
              <Link href="/contact" className="theme-btn">
                Ủng hộ ngay
                <i className="ps-2 far fa-heart" />
              </Link>
            </div>
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
  const [toggle, setToggle] = useState(false);
  return (
    <Fragment>
      <SearchPopup open={toggle} close={() => setToggle(false)} />
      <header className="header-section-1">
        <div id="header-sticky" className="header-1 bg-[var(--theme-light,#f74938)]" style={{ backgroundColor: '#fff5f4' }}>
          <div className="main-logo">
            <Logo logo="white-logo.png" />
          </div>
          <div className="container-fluid">
            <div className="mega-menu-wrapper">
              <div className="header-main">
                <div className="header-left">
                  <div className="mean__menu-wrapper">
                    <Nav />
                  </div>
                </div>
                <div className="header-right d-flex justify-content-end align-items-center gap-3">
                  <a
                    href="#0"
                    className="search-trigger search-icon"
                    onClick={() => setToggle(true)}
                  >
                    <i className="fas fa-search"></i>
                  </a>
                  <div className="header-button">
                    <Link href="/contact" className="theme-btn">
                      Ủng hộ ngay
                      <i className="ps-2 far fa-heart" />
                    </Link>
                  </div>
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
  const [toggle, setToggle] = useState(false);
  return (
    <Fragment>
      <SearchPopup open={toggle} close={() => setToggle(false)} />
      {/* Main header — trắng, sticky */}
      <header id="header-sticky" className="header-4" style={{ backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '6px 0' }}>
        <div className="container">
          <div className="mega-menu-wrapper">
            <div className="header-main style-2 flex items-center justify-between">
              <div className="header-left d-flex align-items-center">
                <Logo logo="black-logo.png" />
              </div>
              <div className="header-right d-flex justify-content-end align-items-center gap-3">
                <div className="mean__menu-wrapper">
                  <Nav />
                </div>
                <a
                  href="#0"
                  className="search-trigger search-icon"
                  onClick={() => setToggle(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', transition: 'all 0.3s' }}
                >
                  <i className="fas fa-search" style={{ color: '#333' }}></i>
                </a>
                <div className="header-button d-none d-sm-block">
                  <Link href="/donation-details" className="theme-btn" style={{ padding: '10px 20px', fontSize: '13px', backgroundColor: '#F84D43', color: '#fff', border: 'none', borderRadius: '6px' }}>
                    Ủng hộ ngay
                    <i className="ps-2 far fa-heart" />
                  </Link>
                </div>
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

const Nav = () => (
  <div className="main-menu d-none d-lg-block">
    <nav id="mobile-menu">
      <ul className="d-flex align-items-center mb-0" style={{ gap: '2rem' }}>
        <li className="m-0">
          <Link href="/" className="font-semibold text-gray-700 hover:text-orange-600" style={{ fontSize: '14px', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>Trang chủ</Link>
        </li>
        <li className="m-0">
          <Link href="/about" className="font-semibold text-gray-700 hover:text-orange-600" style={{ fontSize: '14px', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>Giới thiệu</Link>
        </li>
        <li className="m-0">
          <Link href="/campaigns" className="font-semibold text-gray-700 hover:text-orange-600" style={{ fontSize: '14px', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>Chiến dịch</Link>
        </li>
        <li className="m-0">
          <Link href="/post" className="font-semibold text-gray-700 hover:text-orange-600" style={{ fontSize: '14px', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>Cộng đồng</Link>
        </li>
      </ul>
    </nav>
  </div>
);

const SearchPopup = ({ open, close }: { open: boolean; close: () => void }) => (
  <div className="search-wrap" style={{ display: open ? "block" : "none" }}>
    <div className="search-inner">
      <i className="fas fa-times search-close" onClick={close}></i>
      <div className="search-cell">
        <form method="get">
          <div className="search-field-holder">
            <input
              type="search"
              className="main-search-input"
              placeholder="Tìm kiếm..."
            />
          </div>
        </form>
      </div>
    </div>
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

const AuthButton = () => {
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
      <Link href="/sign-in" className="theme-btn transparent-btn">
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
            <li>
              <Link href="/about">About</Link>
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
