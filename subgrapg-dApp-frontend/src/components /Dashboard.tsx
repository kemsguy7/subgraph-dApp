import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { formatEther } from 'viem';
import { request, gql } from 'graphql-request';
import { STAKING_CONTRACT_ADDRESS } from '../config/wagmi';
import { stakingABI } from '../abis/stakingABI';

// Replace with actual subgraph URL once deployed
const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/yourusername/staking-subgraph';

const Dashboard = () => {
  const { address } = useAccount();
  const [protocolStats, setProtocolStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user details from the contract
  const { data: userDetails } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'getUserDetails',
    args: [address],
    enabled: !!address,
    watch: true,
  });

  // Get protocol stats from the contract
  const { data: totalStaked } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'totalStaked',
    watch: true,
  });

  const { data: currentRewardRate } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'currentRewardRate',
    watch: true,
  });

  const { data: minLockDuration } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'minLockDuration',
    watch: true,
  });

  useEffect(() => {
    const fetchSubgraphData = async () => {
      if (!address) return;

      setIsLoading(true);
      setError(null);

      try {
        // Query protocol stats from the subgraph
        const protocolQuery = gql`
          {
            stakingProtocol(id: "1") {
              totalStaked
              totalUsers
              totalStakePositions
              totalWithdrawals
              totalEmergencyWithdrawals
              totalRewardsClaimed
            }
          }
        `;

        // Query user stats from the subgraph
        const userQuery = gql`
          query GetUserStats($userAddress: String!) {
            user(id: $userAddress) {
              id
              totalStaked
              stakePositions(orderBy: timestamp, orderDirection: desc, first: 5) {
                id
                amount
                timestamp
                withdrawn
                emergencyWithdrawn
              }
              withdrawals(orderBy: timestamp, orderDirection: desc, first: 3) {
                id
                amount
                timestamp
                rewardsAccrued
              }
              rewardClaims(orderBy: timestamp, orderDirection: desc, first: 3) {
                id
                amount
                timestamp
              }
            }
          }
        `;

        // Fetch both queries in parallel
        const [protocolData, userData] = await Promise.all([
          request(SUBGRAPH_URL, protocolQuery),
          request(SUBGRAPH_URL, userQuery, { userAddress: address.toLowerCase() }),
        ]);

        if (protocolData && protocolData.stakingProtocol) {
          setProtocolStats(protocolData.stakingProtocol);
        }

        if (userData && userData.user) {
          setUserStats(userData.user);
        }
      } catch (err) {
        console.error('Error fetching data from subgraph:', err);
        setError('Failed to fetch staking data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubgraphData();

    // Set up an interval to refresh data (every 30 seconds)
    const interval = setInterval(fetchSubgraphData, 30000);

    // Clean up on unmount
    return () => clearInterval(interval);
  }, [address]);

  // Format duration from seconds to a readable format
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

  // Format timestamp to date string
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className='space-y-6'>
      {/* User Stats Card */}
      <div className='p-[1px] rounded-xl bg-gradient-to-r from-[#7E3FF2] via-[#00F0FF] to-[#FF1ACD]'>
        <div className='bg-[#0D1526] p-6 rounded-xl'>
          <h2 className='text-xl font-bold text-white mb-4'>Your Staking Position</h2>

          {isLoading ? (
            <div className='flex justify-center items-center h-32'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF]'></div>
            </div>
          ) : error ? (
            <div className='p-4 bg-red-900/30 text-red-300 rounded-lg'>{error}</div>
          ) : userDetails ? (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-[#192231] p-4 rounded-lg'>
                  <p className='text-gray-400 text-sm'>Staked Amount</p>
                  <p className='text-xl font-bold text-white'>
                    {userDetails.stakedAmount
                      ? parseFloat(formatEther(userDetails.stakedAmount)).toFixed(4)
                      : '0'}{' '}
                    Tokens
                  </p>
                </div>
                <div className='bg-[#192231] p-4 rounded-lg'>
                  <p className='text-gray-400 text-sm'>Pending Rewards</p>
                  <p className='text-xl font-bold text-green-400'>
                    {userDetails.pendingRewards
                      ? parseFloat(formatEther(userDetails.pendingRewards)).toFixed(4)
                      : '0'}{' '}
                    Tokens
                  </p>
                </div>
              </div>

              <div className='bg-[#192231] p-4 rounded-lg'>
                <p className='text-gray-400 text-sm'>Lock Status</p>
                <div className='flex items-center mt-1'>
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      userDetails.canWithdraw ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                  ></div>
                  <p className='text-white'>
                    {userDetails.canWithdraw
                      ? 'Unlocked - You can withdraw anytime'
                      : `Locked - ${formatDuration(userDetails.timeUntilUnlock)} remaining`}
                  </p>
                </div>
              </div>

              {userStats && userStats.stakePositions && userStats.stakePositions.length > 0 && (
                <div>
                  <p className='text-gray-300 mb-2'>Recent Activity</p>
                  <div className='space-y-2'>
                    {userStats.stakePositions.slice(0, 2).map((position) => (
                      <div
                        key={position.id}
                        className='bg-[#141F32] p-2 rounded flex justify-between items-center'
                      >
                        <div>
                          <p className='text-white text-sm'>
                            {position.withdrawn
                              ? 'Withdrawn'
                              : position.emergencyWithdrawn
                              ? 'Emergency Withdrawn'
                              : 'Staked'}
                          </p>
                          <p className='text-gray-400 text-xs'>
                            {formatTimestamp(position.timestamp)}
                          </p>
                        </div>
                        <p className='text-white font-medium'>
                          {parseFloat(formatEther(position.amount)).toFixed(4)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className='text-gray-300'>
              No staking position found. Start staking to see your details!
            </p>
          )}
        </div>
      </div>

      {/* Protocol Stats Card */}
      <div className='p-[1px] rounded-xl bg-gradient-to-r from-[#7E3FF2] via-[#00F0FF] to-[#FF1ACD]'>
        <div className='bg-[#0D1526] p-6 rounded-xl'>
          <h2 className='text-xl font-bold text-white mb-4'>Protocol Stats</h2>

          {isLoading && !protocolStats ? (
            <div className='flex justify-center items-center h-32'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF]'></div>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-[#192231] p-4 rounded-lg'>
                  <p className='text-gray-400 text-sm'>Total Value Locked</p>
                  <p className='text-xl font-bold text-white'>
                    {totalStaked ? parseFloat(formatEther(totalStaked)).toFixed(2) : '0'} Tokens
                  </p>
                </div>
                <div className='bg-[#192231] p-4 rounded-lg'>
                  <p className='text-gray-400 text-sm'>Current APR</p>
                  <p className='text-xl font-bold text-[#00F0FF]'>
                    {currentRewardRate ? currentRewardRate.toString() : '0'}%
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-[#192231] p-4 rounded-lg'>
                  <p className='text-gray-400 text-sm'>Min Lock Duration</p>
                  <p className='text-white font-medium'>
                    {minLockDuration ? formatDuration(minLockDuration) : '0'}
                  </p>
                </div>
                <div className='bg-[#192231] p-4 rounded-lg'>
                  <p className='text-gray-400 text-sm'>Total Users</p>
                  <p className='text-white font-medium'>
                    {protocolStats ? protocolStats.totalUsers : '0'}
                  </p>
                </div>
              </div>

              {protocolStats && (
                <div className='bg-[#192231] p-4 rounded-lg'>
                  <p className='text-gray-400 text-sm mb-2'>Activity Overview</p>
                  <div className='grid grid-cols-3 gap-3'>
                    <div className='bg-[#141F32] p-2 rounded text-center'>
                      <p className='text-xs text-gray-400'>Stakes</p>
                      <p className='text-white font-medium'>{protocolStats.totalStakePositions}</p>
                    </div>
                    <div className='bg-[#141F32] p-2 rounded text-center'>
                      <p className='text-xs text-gray-400'>Withdrawals</p>
                      <p className='text-white font-medium'>{protocolStats.totalWithdrawals}</p>
                    </div>
                    <div className='bg-[#141F32] p-2 rounded text-center'>
                      <p className='text-xs text-gray-400'>Claims</p>
                      <p className='text-white font-medium'>{protocolStats.totalRewardsClaimed}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
