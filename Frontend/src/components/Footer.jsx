import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="text-[#1f4d3a]">
          <div className="text-base font-semibold">SmartGive</div>
          <div className="text-xs text-gray-500">
            &copy; 2026 SmartGive. Ethische Raffinesse beim Geben.
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-gray-700">
          <a href="#" className="transition-colors hover:text-[#1f4d3a]">Datenschutzrichtlinie</a>
          <a href="#" className="transition-colors hover:text-[#1f4d3a]">Nutzungsbedingungen</a>
          <a href="#" className="transition-colors hover:text-[#1f4d3a]">Nachhaltigkeitsbericht</a>
          <a href="#" className="transition-colors hover:text-[#1f4d3a]">Kontakt</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
