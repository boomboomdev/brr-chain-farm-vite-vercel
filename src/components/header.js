import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import LogoImg from '../assets/image/logo-with-text.png'

const Header = () => {
  // State to manage the navbar's visibility
  const [nav, setNav] = useState(false);

  // Toggle function to handle the navbar's display
  const handleNav = () => {
    setNav(!nav);
  };

  // Array containing navigation items
  const navItems = [
    { id: 1, text: 'Swap' },
    { id: 2, text: 'Farms' },
    { id: 3, text: 'Lending' },
    { id: 4, text: 'NFT Staking' },
    { id: 5, text: 'Bridge' },
  ];

  return (
    <div className='bg-black flex flex-row items-center text-white px-12 py-2 w-full mx-auto' style={{ background: 'linear-gradient(139.73deg, #193357, #000 98%)' }}>
      {/* Logo */}
      {/* <h1 className='text-3xl font-bold text-[#00df9a]'>REACT.</h1> */}
      <img src={LogoImg} alt='logoimg'></img>
      {/* Desktop Navigation */}
      <ul className='hidden md:flex ml-4 text-[#ace3e5]'>
        {navItems.map(item => (
          <li
            key={item.id}
            className='p-4 hover:bg-[#00df9a] rounded-xl m-2 cursor-pointer duration-300 hover:text-black'
          >
            {item.text}
          </li>
        ))}
      </ul>
      <button className='border border-[#58f3cd] px-4 py-2 tramso transition duration-150 cursor-pointer font-medium rounded-xl justify-center items-center ml-auto hover:border-2'>
        <div className='flex items-center gap-3 my-2 text-[#ace3e5]'>Connect Wallet</div>
      </button>
      {/* Mobile Navigation Icon */}
      <div onClick={handleNav} className='block md:hidden ml-auto'>
        {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
      </div>

      {/* Mobile Navigation Menu */}
      <ul
        className={
          nav
            ? 'fixed md:hidden left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500'
            : 'ease-in-out w-[60%] duration-500 fixed top-0 bottom-0 left-[-100%]'
        }
        style={{ background: 'linear-gradient(139.73deg, #193357, #000 98%)' }}
      >
        {/* Mobile Logo */}
        <h1 className='w-full text-3xl font-bold text-[#00df9a] m-4'>REACT.</h1>

        {/* Mobile Navigation Items */}
        {navItems.map(item => (
          <li
            key={item.id}
            className='p-4 border-b rounded-xl hover:bg-[#00df9a] duration-300 hover:text-black cursor-pointer border-gray-600'
          >
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Header;