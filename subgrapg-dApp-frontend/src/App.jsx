import React, { useState, useEffect } from 'react';
import { useAccount, useNetwork, useChainId } from 'wagmi';
import { sepolia } from 'wagmi/chains';

// Components
import WalletModal from './components/WalletModal';
import NetworkModal from './components/NetworkModal';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import StakingInterface from './components/StakingInterface';

function App() {
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const chainId = useChainId();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Check if user is on the correct network (Sepolia)
  useEffect(() => {
    if (isConnected) {
      setIsCorrectNetwork(chainId === sepolia.id);
    }
  }, [chainId, isConnected]);

  return (
    <div className='flex flex-col min-h-screen bg-gradient-to-br from-[#0E1629] via-[#0B1322] to-[#131B2E]'>
      {/* Beautiful animated background */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -inset-[10%] opacity-30'>
          <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-[#7E3FF2] rounded-full mix-blend-screen filter blur-3xl animate-blob'></div>
          <div className='absolute top-3/4 left-1/3 w-96 h-96 bg-[#00F0FF] rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000'></div>
          <div className='absolute top-1/3 right-1/4 w-96 h-96 bg-[#FF1ACD] rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000'></div>
        </div>
      </div>

      {/* Header */}
      <Header
        isConnected={isConnected}
        address={address}
        isCorrectNetwork={isCorrectNetwork}
        onConnectWallet={() => setIsWalletModalOpen(true)}
        onSwitchNetwork={() => setIsNetworkModalOpen(true)}
      />

      <main className='flex-grow container mx-auto px-4 py-8 relative z-10'>
        {!isConnected ? (
          <div className='flex justify-center items-center h-[70vh]'>
            <div className='w-full max-w-md'>
              <div className='relative rounded-2xl overflow-hidden'>
                <div className='p-[1px] absolute inset-0 rounded-2xl bg-gradient-to-r from-[#7E3FF2] via-[#00F0FF] to-[#FF1ACD] shadow-[0_0_15px_rgba(126,63,242,0.5)]'></div>
                <div className='relative p-6 bg-[#0D1526]/90 backdrop-blur-sm rounded-2xl shadow-[inset_1px_1px_0.5px_rgba(255,255,255,0.1)]'>
                  <h1 className='mb-2 text-3xl font-bold text-center'>
                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#7E3FF2] via-[#00F0FF] to-[#FF1ACD]'>
                      Staking dApp
                    </span>
                  </h1>
                  <p className='mb-8 text-center text-gray-300'>
                    Connect your wallet to start staking
                  </p>

                  <button
                    onClick={() => setIsWalletModalOpen(true)}
                    className='w-full p-3 font-medium text-white transition-all duration-300 bg-gradient-to-r from-[#7E3FF2] to-[#FF1ACD] rounded-lg hover:opacity-90 hover:shadow-[0_0_15px_rgba(126,63,242,0.4),_inset_0_0_0_1px_rgba(255,255,255,0.15)] hover:scale-[1.02]'
                  >
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : !isCorrectNetwork ? (
          <div className='flex justify-center items-center h-[70vh]'>
            <div className='w-full max-w-md'>
              <div className='relative rounded-2xl overflow-hidden'>
                <div className='p-[1px] absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F24B3F] via-[#FF7A00] to-[#FFC700] shadow-[0_0_15px_rgba(242,75,63,0.5)]'></div>
                <div className='relative p-6 bg-[#0D1526]/90 backdrop-blur-sm rounded-2xl shadow-[inset_1px_1px_0.5px_rgba(255,255,255,0.1)]'>
                  <h1 className='mb-2 text-3xl font-bold text-center'>
                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#F24B3F] via-[#FF7A00] to-[#FFC700]'>
                      Wrong Network
                    </span>
                  </h1>
                  <p className='mb-8 text-center text-gray-300'>
                    This dApp only works on Sepolia Testnet
                  </p>

                  <button
                    onClick={() => setIsNetworkModalOpen(true)}
                    className='w-full p-3 font-medium text-white transition-all duration-300 bg-gradient-to-r from-[#F24B3F] to-[#FFC700] rounded-lg hover:opacity-90 hover:shadow-[0_0_15px_rgba(242,75,63,0.4),_inset_0_0_0_1px_rgba(255,255,255,0.15)] hover:scale-[1.02]'
                  >
                    Switch Network
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2'>
              <StakingInterface />
            </div>
            <div className='lg:col-span-1'>
              <Dashboard />
            </div>
          </div>
        )}
      </main>

      <footer className='mt-auto p-6 text-center text-gray-400 relative z-10'>
        <p>© {new Date().getFullYear()} Staking dApp | Built with The Graph Protocol & React</p>
      </footer>

      {/* Modals */}
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      <NetworkModal isOpen={isNetworkModalOpen} onClose={() => setIsNetworkModalOpen(false)} />
    </div>
  );
}

export default App;
