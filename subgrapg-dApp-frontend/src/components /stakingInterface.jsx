import React, { useState, useEffect } from 'react';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
  useBalance,
  usePrepareContractWrite,
  erc20ABI,
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { STAKING_CONTRACT_ADDRESS } from '../wagmiConfig';
import { stakingABI } from '../abis/stakingABI';

// Tabs for the staking interface
const TABS = {
  STAKE: 'stake',
  WITHDRAW: 'withdraw',
  CLAIM: 'claim',
  EMERGENCY: 'emergency',
  HISTORY: 'history',
};

const StakingInterface = () => {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState(TABS.STAKE);
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Get user details from contract
  const { data: userDetails, refetch: refetchUserDetails } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'getUserDetails',
    args: [address],
    enabled: !!address,
  });

  // Get staking token address
  const { data: stakingTokenAddress } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'stakingToken',
  });

  // Get token balance, symbol and allowance
  const { data: tokenBalance } = useBalance({
    address,
    token: stakingTokenAddress,
    enabled: !!address && !!stakingTokenAddress,
    watch: true,
  });

  const { data: tokenSymbol } = useContractRead({
    address: stakingTokenAddress,
    abi: erc20ABI,
    functionName: 'symbol',
    enabled: !!stakingTokenAddress,
  });

  const { data: tokenAllowance } = useContractRead({
    address: stakingTokenAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, STAKING_CONTRACT_ADDRESS],
    enabled: !!address && !!stakingTokenAddress,
    watch: true,
  });

  // Approve token spending
  const { config: approveConfig } = usePrepareContractWrite({
    address: stakingTokenAddress,
    abi: erc20ABI,
    functionName: 'approve',
    args: [STAKING_CONTRACT_ADDRESS, parseEther('1000000000')], // Large approval amount
    enabled: !!stakingTokenAddress && !!stakeAmount && parseFloat(stakeAmount) > 0,
  });

  const {
    data: approveData,
    write: approveWrite,
    isLoading: isApproveLoading,
  } = useContractWrite(approveConfig);

  const {
    isLoading: isApproveWaiting,
    isSuccess: isApproveSuccess,
    isError: isApproveError,
  } = useWaitForTransaction({
    hash: approveData?.hash,
    enabled: !!approveData?.hash,
  });

  // Stake tokens
  const { config: stakeConfig } = usePrepareContractWrite({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'stake',
    args: [stakeAmount ? parseEther(stakeAmount) : parseEther('0')],
    enabled:
      !!stakeAmount &&
      parseFloat(stakeAmount) > 0 &&
      !!tokenAllowance &&
      tokenAllowance >= parseEther(stakeAmount),
  });

  const {
    data: stakeData,
    write: stakeWrite,
    isLoading: isStakeLoading,
  } = useContractWrite(stakeConfig);

  const {
    isLoading: isStakeWaiting,
    isSuccess: isStakeSuccess,
    isError: isStakeError,
  } = useWaitForTransaction({
    hash: stakeData?.hash,
    enabled: !!stakeData?.hash,
  });

  // Withdraw tokens
  const { config: withdrawConfig } = usePrepareContractWrite({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'withdraw',
    args: [withdrawAmount ? parseEther(withdrawAmount) : parseEther('0')],
    enabled: !!withdrawAmount && parseFloat(withdrawAmount) > 0 && !!userDetails?.canWithdraw,
  });

  const {
    data: withdrawData,
    write: withdrawWrite,
    isLoading: isWithdrawLoading,
  } = useContractWrite(withdrawConfig);

  const {
    isLoading: isWithdrawWaiting,
    isSuccess: isWithdrawSuccess,
    isError: isWithdrawError,
  } = useWaitForTransaction({
    hash: withdrawData?.hash,
    enabled: !!withdrawData?.hash,
  });

  // Claim rewards
  const { config: claimConfig } = usePrepareContractWrite({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'claimRewards',
    enabled: !!userDetails?.pendingRewards && userDetails.pendingRewards > 0n,
  });

  const {
    data: claimData,
    write: claimWrite,
    isLoading: isClaimLoading,
  } = useContractWrite(claimConfig);

  const {
    isLoading: isClaimWaiting,
    isSuccess: isClaimSuccess,
    isError: isClaimError,
  } = useWaitForTransaction({
    hash: claimData?.hash,
    enabled: !!claimData?.hash,
  });

  // Emergency withdraw
  const { config: emergencyConfig } = usePrepareContractWrite({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'emergencyWithdraw',
    enabled: !!userDetails?.stakedAmount && userDetails.stakedAmount > 0n,
  });

  const {
    data: emergencyData,
    write: emergencyWrite,
    isLoading: isEmergencyLoading,
  } = useContractWrite(emergencyConfig);

  const {
    isLoading: isEmergencyWaiting,
    isSuccess: isEmergencySuccess,
    isError: isEmergencyError,
  } = useWaitForTransaction({
    hash: emergencyData?.hash,
    enabled: !!emergencyData?.hash,
  });

  // Update state after transaction completion
  useEffect(() => {
    if (isApproveSuccess) {
      setNotification({
        type: 'success',
        message: 'Token approval successful! You can now stake your tokens.',
      });
      setIsApproving(false);
    } else if (isApproveError) {
      setNotification({
        type: 'error',
        message: 'Token approval failed. Please try again.',
      });
      setIsApproving(false);
    }

    if (isStakeSuccess) {
      setNotification({
        type: 'success',
        message: `Successfully staked ${stakeAmount} ${tokenSymbol || 'tokens'}!`,
      });
      setStakeAmount('');
      refetchUserDetails();
    } else if (isStakeError) {
      setNotification({
        type: 'error',
        message: 'Staking transaction failed. Please try again.',
      });
    }

    if (isWithdrawSuccess) {
      setNotification({
        type: 'success',
        message: `Successfully withdrawn ${withdrawAmount} ${tokenSymbol || 'tokens'}!`,
      });
      setWithdrawAmount('');
      refetchUserDetails();
    } else if (isWithdrawError) {
      setNotification({
        type: 'error',
        message: 'Withdrawal transaction failed. Please try again.',
      });
    }

    if (isClaimSuccess) {
      setNotification({
        type: 'success',
        message: 'Successfully claimed rewards!',
      });
      refetchUserDetails();
    } else if (isClaimError) {
      setNotification({
        type: 'error',
        message: 'Claim transaction failed. Please try again.',
      });
    }

    if (isEmergencySuccess) {
      setNotification({
        type: 'success',
        message: 'Emergency withdrawal successful! Note: A penalty was applied.',
      });
      refetchUserDetails();
    } else if (isEmergencyError) {
      setNotification({
        type: 'error',
        message: 'Emergency withdrawal failed. Please try again.',
      });
    }
  }, [
    isApproveSuccess,
    isApproveError,
    isStakeSuccess,
    isStakeError,
    isWithdrawSuccess,
    isWithdrawError,
    isClaimSuccess,
    isClaimError,
    isEmergencySuccess,
    isEmergencyError,
    stakeAmount,
    withdrawAmount,
    tokenSymbol,
    refetchUserDetails,
  ]);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle stake
  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setNotification({
        type: 'error',
        message: 'Please enter a valid amount to stake',
      });
      return;
    }

    if (!tokenAllowance || tokenAllowance < parseEther(stakeAmount)) {
      setIsApproving(true);
      approveWrite?.();
    } else {
      stakeWrite?.();
    }
  };

  // Handle withdraw
  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setNotification({
        type: 'error',
        message: 'Please enter a valid amount to withdraw',
      });
      return;
    }

    if (!userDetails?.canWithdraw) {
      setNotification({
        type: 'error',
        message: 'Cannot withdraw yet. Lock duration not met.',
      });
      return;
    }

    if (userDetails?.stakedAmount < parseEther(withdrawAmount)) {
      setNotification({
        type: 'error',
        message: 'Insufficient staked balance',
      });
      return;
    }

    withdrawWrite?.();
  };

  // Handle claim rewards
  const handleClaimRewards = () => {
    if (!userDetails?.pendingRewards || userDetails.pendingRewards <= 0n) {
      setNotification({
        type: 'error',
        message: 'No rewards to claim',
      });
      return;
    }

    claimWrite?.();
  };

  // Handle emergency withdraw
  const handleEmergencyWithdraw = () => {
    if (!userDetails?.stakedAmount || userDetails.stakedAmount <= 0n) {
      setNotification({
        type: 'error',
        message: 'No tokens to withdraw',
      });
      return;
    }

    emergencyWrite?.();
  };

  // Format duration from seconds
  const formatDuration = (seconds) => {
    if (!seconds) return '0s';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;

    return result.trim() || '< 1m';
  };

  // Set max amount for stake/withdraw
  const handleMaxStake = () => {
    if (tokenBalance) {
      setStakeAmount(formatEther(tokenBalance.value));
    }
  };

  const handleMaxWithdraw = () => {
    if (userDetails?.stakedAmount) {
      setWithdrawAmount(formatEther(userDetails.stakedAmount));
    }
  };

  return (
    <div className='p-[1px] rounded-xl bg-gradient-to-r from-[#7E3FF2] via-[#00F0FF] to-[#FF1ACD]'>
      <div className='bg-[#0D1526] p-6 rounded-xl'>
        <div className='flex flex-wrap gap-1 mb-6'>
          <TabButton active={activeTab === TABS.STAKE} onClick={() => setActiveTab(TABS.STAKE)}>
            Stake
          </TabButton>
          <TabButton
            active={activeTab === TABS.WITHDRAW}
            onClick={() => setActiveTab(TABS.WITHDRAW)}
          >
            Withdraw
          </TabButton>
          <TabButton active={activeTab === TABS.CLAIM} onClick={() => setActiveTab(TABS.CLAIM)}>
            Claim Rewards
          </TabButton>
          <TabButton
            active={activeTab === TABS.EMERGENCY}
            onClick={() => setActiveTab(TABS.EMERGENCY)}
          >
            Emergency
          </TabButton>
          <TabButton active={activeTab === TABS.HISTORY} onClick={() => setActiveTab(TABS.HISTORY)}>
            History
          </TabButton>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              notification.type === 'success'
                ? 'bg-green-900/30 text-green-300'
                : 'bg-red-900/30 text-red-300'
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Stake Tab */}
        {activeTab === TABS.STAKE && (
          <div className='space-y-4'>
            <h2 className='text-xl font-bold text-white'>Stake Tokens</h2>
            <p className='text-gray-300'>
              Stake your tokens to earn rewards. Tokens will be locked for a minimum period.
            </p>

            <div className='bg-[#192231] p-4 rounded-lg'>
              <div className='flex justify-between items-center mb-2'>
                <label className='text-gray-300'>Amount to Stake</label>
                <div className='text-sm text-gray-400'>
                  Balance:{' '}
                  {tokenBalance ? parseFloat(formatEther(tokenBalance.value)).toFixed(4) : '0'}{' '}
                  {tokenSymbol || 'Tokens'}
                </div>
              </div>
              <div className='flex gap-2'>
                <div className='relative flex-grow'>
                  <input
                    type='number'
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder='0.0'
                    className='w-full p-3 pr-16 bg-[#0D1526] text-white border border-[#7E3FF2]/30 rounded-lg focus:outline-none focus:border-[#7E3FF2]'
                  />
                  <button
                    onClick={handleMaxStake}
                    className='absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs text-[#00F0FF] hover:text-white'
                  >
                    MAX
                  </button>
                </div>
                <button
                  onClick={handleStake}
                  disabled={
                    isApproveLoading || isApproveWaiting || isStakeLoading || isStakeWaiting
                  }
                  className={`px-6 py-3 font-medium text-white rounded-lg transition-all duration-300 ${
                    isApproveLoading || isApproveWaiting || isStakeLoading || isStakeWaiting
                      ? 'bg-[#232B3A] cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#7E3FF2] to-[#FF1ACD] hover:opacity-90'
                  }`}
                >
                  {isApproveLoading || isApproveWaiting
                    ? 'Approving...'
                    : isStakeLoading || isStakeWaiting
                    ? 'Staking...'
                    : isApproving
                    ? 'Approve'
                    : 'Stake'}
                </button>
              </div>
            </div>

            <div className='bg-[#192231] p-4 rounded-lg space-y-3'>
              <h3 className='text-white font-medium'>Staking Information</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-gray-400 text-sm'>Current APR</p>
                  <p className='text-[#00F0FF] font-medium'>14%</p>
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Lock Duration</p>
                  <p className='text-white font-medium'>30 days</p>
                </div>
              </div>
              <p className='text-gray-300 text-sm'>
                Staked tokens are locked for the minimum duration before they can be withdrawn.
                Emergency withdrawals are possible with a penalty.
              </p>
            </div>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === TABS.WITHDRAW && (
          <div className='space-y-4'>
            <h2 className='text-xl font-bold text-white'>Withdraw Tokens</h2>
            <p className='text-gray-300'>Withdraw your staked tokens after the lock period ends.</p>

            <div className='bg-[#192231] p-4 rounded-lg'>
              <div className='flex justify-between items-center mb-2'>
                <label className='text-gray-300'>Amount to Withdraw</label>
                <div className='text-sm text-gray-400'>
                  Staked:{' '}
                  {userDetails?.stakedAmount
                    ? parseFloat(formatEther(userDetails.stakedAmount)).toFixed(4)
                    : '0'}{' '}
                  {tokenSymbol || 'Tokens'}
                </div>
              </div>
              <div className='flex gap-2'>
                <div className='relative flex-grow'>
                  <input
                    type='number'
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder='0.0'
                    className='w-full p-3 pr-16 bg-[#0D1526] text-white border border-[#7E3FF2]/30 rounded-lg focus:outline-none focus:border-[#7E3FF2]'
                  />
                  <button
                    onClick={handleMaxWithdraw}
                    className='absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs text-[#00F0FF] hover:text-white'
                  >
                    MAX
                  </button>
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawLoading || isWithdrawWaiting || !userDetails?.canWithdraw}
                  className={`px-6 py-3 font-medium text-white rounded-lg transition-all duration-300 ${
                    isWithdrawLoading || isWithdrawWaiting || !userDetails?.canWithdraw
                      ? 'bg-[#232B3A] cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#7E3FF2] to-[#FF1ACD] hover:opacity-90'
                  }`}
                >
                  {isWithdrawLoading || isWithdrawWaiting
                    ? 'Withdrawing...'
                    : !userDetails?.canWithdraw
                    ? 'Locked'
                    : 'Withdraw'}
                </button>
              </div>
            </div>

            <div className='bg-[#192231] p-4 rounded-lg'>
              <h3 className='text-white font-medium mb-2'>Lock Status</h3>
              <div className='flex items-center'>
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    userDetails?.canWithdraw ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                ></div>
                <p className='text-white'>
                  {userDetails?.canWithdraw
                    ? 'Unlocked - You can withdraw anytime'
                    : `Locked - ${formatDuration(
                        Number(userDetails?.timeUntilUnlock || 0),
                      )} remaining`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Claim Rewards Tab */}
        {activeTab === TABS.CLAIM && (
          <div className='space-y-4'>
            <h2 className='text-xl font-bold text-white'>Claim Rewards</h2>
            <p className='text-gray-300'>Claim your staking rewards at any time.</p>

            <div className='bg-[#192231] p-4 rounded-lg'>
              <div className='mb-4'>
                <p className='text-gray-400 text-sm'>Pending Rewards</p>
                <p className='text-2xl font-bold text-green-400'>
                  {userDetails?.pendingRewards
                    ? parseFloat(formatEther(userDetails.pendingRewards)).toFixed(6)
                    : '0'}{' '}
                  {tokenSymbol || 'Tokens'}
                </p>
              </div>
              <button
                onClick={handleClaimRewards}
                disabled={
                  isClaimLoading ||
                  isClaimWaiting ||
                  !userDetails?.pendingRewards ||
                  userDetails.pendingRewards <= 0n
                }
                className={`w-full px-6 py-3 font-medium text-white rounded-lg transition-all duration-300 ${
                  isClaimLoading ||
                  isClaimWaiting ||
                  !userDetails?.pendingRewards ||
                  userDetails.pendingRewards <= 0n
                    ? 'bg-[#232B3A] cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#7E3FF2] to-[#00F0FF] hover:opacity-90'
                }`}
              >
                {isClaimLoading || isClaimWaiting
                  ? 'Claiming...'
                  : !userDetails?.pendingRewards || userDetails.pendingRewards <= 0n
                  ? 'No Rewards to Claim'
                  : 'Claim Rewards'}
              </button>
            </div>

            <div className='bg-[#192231] p-4 rounded-lg'>
              <h3 className='text-white font-medium mb-2'>Reward Information</h3>
              <p className='text-gray-300 text-sm'>
                Rewards accrue based on your staked amount and the current APR. You can claim
                rewards at any time without affecting your stake.
              </p>
            </div>
          </div>
        )}

        {/* Emergency Withdraw Tab */}
        {activeTab === TABS.EMERGENCY && (
          <div className='space-y-4'>
            <h2 className='text-xl font-bold text-white'>Emergency Withdrawal</h2>
            <p className='text-gray-300'>Withdraw your tokens immediately with a penalty.</p>

            <div className='p-[1px] rounded-lg bg-gradient-to-r from-[#F24B3F] to-[#FFC700]'>
              <div className='bg-[#0D1526] p-4 rounded-lg'>
                <div className='flex items-center mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#FFC700'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'></path>
                    <line x1='12' y1='9' x2='12' y2='13'></line>
                    <line x1='12' y1='17' x2='12.01' y2='17'></line>
                  </svg>
                  <h3 className='ml-2 text-amber-400 font-medium'>Warning</h3>
                </div>
                <p className='text-gray-300 text-sm mb-4'>
                  Emergency withdrawal allows you to withdraw your staked tokens immediately, even
                  during the lock period. However, a penalty of 10% will be applied to your staked
                  amount.
                </p>
                <div className='mb-4'>
                  <p className='text-gray-400 text-sm'>Your Staked Amount</p>
                  <p className='text-xl font-medium text-white'>
                    {userDetails?.stakedAmount
                      ? parseFloat(formatEther(userDetails.stakedAmount)).toFixed(4)
                      : '0'}{' '}
                    {tokenSymbol || 'Tokens'}
                  </p>
                </div>
                <div className='mb-4'>
                  <p className='text-gray-400 text-sm'>Penalty Amount (10%)</p>
                  <p className='text-lg font-medium text-red-400'>
                    {userDetails?.stakedAmount
                      ? (parseFloat(formatEther(userDetails.stakedAmount)) * 0.1).toFixed(4)
                      : '0'}{' '}
                    {tokenSymbol || 'Tokens'}
                  </p>
                </div>
                <div className='mb-4'>
                  <p className='text-gray-400 text-sm'>You Will Receive</p>
                  <p className='text-lg font-medium text-green-400'>
                    {userDetails?.stakedAmount
                      ? (parseFloat(formatEther(userDetails.stakedAmount)) * 0.9).toFixed(4)
                      : '0'}{' '}
                    {tokenSymbol || 'Tokens'}
                  </p>
                </div>
                <button
                  onClick={handleEmergencyWithdraw}
                  disabled={
                    isEmergencyLoading ||
                    isEmergencyWaiting ||
                    !userDetails?.stakedAmount ||
                    userDetails.stakedAmount <= 0n
                  }
                  className={`w-full px-6 py-3 font-medium text-white rounded-lg transition-all duration-300 ${
                    isEmergencyLoading ||
                    isEmergencyWaiting ||
                    !userDetails?.stakedAmount ||
                    userDetails.stakedAmount <= 0n
                      ? 'bg-[#232B3A] cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#F24B3F] to-[#FFC700] hover:opacity-90'
                  }`}
                >
                  {isEmergencyLoading || isEmergencyWaiting
                    ? 'Processing...'
                    : !userDetails?.stakedAmount || userDetails.stakedAmount <= 0n
                    ? 'No Tokens to Withdraw'
                    : 'Emergency Withdraw'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === TABS.HISTORY && (
          <div className='space-y-4'>
            <h2 className='text-xl font-bold text-white'>Staking History</h2>
            <p className='text-gray-300'>View your staking history and transactions.</p>

            <div className='bg-[#192231] p-4 rounded-lg'>
              <h3 className='text-white font-medium mb-3'>Recent Transactions</h3>
              {/* This will be populated with data from the subgraph */}
              <p className='text-gray-300 text-sm'>
                Connect your wallet and interact with the staking contract to see your transaction
                history.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
      active
        ? 'text-white bg-gradient-to-r from-[#7E3FF2] to-[#FF1ACD]'
        : 'text-gray-300 hover:bg-[#192231]'
    }`}
  >
    {children}
  </button>
);

export default StakingInterface;
