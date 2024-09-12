"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ConnectWallet } from "./ConnectWallet";

type NavbarMenuLinks = {
  label: string;
  href: string;
};

export const navItems: NavbarMenuLinks[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Marketplace",
    href: "/marketplace",
  },
  {
    label: "Create",
    href: "/create",
  },
  {
    label: "My NFT",
    href: "/my-nft",
  },
];

export const NavbarMenuLink = ({ closeMenu }: { closeMenu: () => void }) => {
  const pathname = usePathname();
  return (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              className={`${
                isActive ? "bg-slate-900 shadow-md" : ""
              } hover:bg-slate-900 px-5 py-2 rounded-2xl hover:shadow-md block`}
              href={item.href}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const HumbergurMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={toggleMenu} className="text-xl md:hidden ox-1">
        {isOpen ? "✖️" : "☰"}
      </button>
      {isOpen && (
        <div className="md:hidden absolute right-0 bg-black border-2 border-slate-900 w-48 h-auto mt-2 rounded-lg shadow-lg z-50">
          <ul className="flex flex-col text-xl space-y-2 py-4 px-4">
            <NavbarMenuLink closeMenu={closeMenu} />
          </ul>
        </div>
      )}
    </div>
  );
};

export const Navbar = () => {
  return (
    <header className="border-b border-slate-800 py-3 px-1 md:px-6">
      <div className="md:max-w-7xl mx-auto flex justify-between items-center">
        <Link
          href={"/"}
          className="text-3xl border-r border-slate-800 px-2 md:px-6"
        >
          NFT<span className="text-cyan-300">Space</span>
        </Link>
        <ul className="hidden md:flex text-xl gap-1">
          <NavbarMenuLink closeMenu={() => {}} />
        </ul>
        <div>
          <ConnectWallet />
        </div>
        <div className="md:hidden mr-2">
          <HumbergurMenu />
        </div>
      </div>
    </header>
  );
};
