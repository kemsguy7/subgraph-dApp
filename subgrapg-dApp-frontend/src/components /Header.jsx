import React from 'react';
import { useDisconnect } from 'wagmi';

const Header = ({ isConnected, address, isCorrectNetwork, onConnectWallet, onSwitchNetwork }) => {
  const { disconnect } = useDisconnect();

  const shortenAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className='w-full p-4 backdrop-blur-md bg-[#0B1322]/60 border-b border-[#7E3FF2]/20 relative z-20'>
      <div className='container mx-auto flex justify-between items-center'>
        <div className='flex items-center'>
          <div className='w-10 h-10 rounded-full bg-gradient-to-r from-[#7E3FF2] to-[#FF1ACD] p-[1px]'>
            <div className='w-full h-full rounded-full bg-[#0B1322] flex items-center justify-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='url(#grad1)'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <defs>
                  <linearGradient id='grad1' x1='0%' y1='0%' x2='100%' y2='0%'>
                    <stop offset='0%' stopColor='#7E3FF2' />
                    <stop offset='100%' stopColor='#FF1ACD' />
                  </linearGradient>
                </defs>
                <path d='M5 12h14' />
                <path d='M12 5v14' />
              </svg>
            </div>
          </div>
          <h1 className='ml-3 text-xl font-bold text-white'>
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#7E3FF2] via-[#00F0FF] to-[#FF1ACD]'>
              Staking dApp
            </span>
          </h1>
        </div>

        <div className='flex items-center space-x-4'>
          {isConnected ? (
            <>
              {!isCorrectNetwork && (
                <button
                  onClick={onSwitchNetwork}
                  className='px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#F24B3F] to-[#FFC700] rounded-lg hover:opacity-90 transition-all duration-300'
                >
                  Switch to Sepolia
                </button>
              )}

              <div className='flex items-center space-x-2 px-4 py-2 bg-[#192231] rounded-lg border border-[#7E3FF2]/30'>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
                <span className='text-white text-sm font-medium'>{shortenAddress(address)}</span>
              </div>

              <button
                onClick={() => disconnect()}
                className='p-2 text-white bg-[#192231] rounded-lg hover:bg-[#232B3A] transition-all duration-300'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                  <polyline points='16 17 21 12 16 7' />
                  <line x1='21' y1='12' x2='9' y2='12' />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={onConnectWallet}
              className='px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#7E3FF2] to-[#FF1ACD] rounded-lg hover:opacity-90 transition-all duration-300'
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
