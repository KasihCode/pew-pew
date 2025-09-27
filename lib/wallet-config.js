// lib/wallet-config.js
import { baseSepolia } from 'viem/chains'

export const WALLET_CONFIG = {
  PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''
}

export const SUPPORTED_CHAINS = [baseSepolia]

export const PRIVY_CONFIG = {
  appearance: {
    theme: 'light',
    accentColor: '#0969da',
  },
  
  loginMethods: [
    'email',
    'wallet',
    'google',
  ],
  
  supportedChains: SUPPORTED_CHAINS,
  
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: false,
  },
  
  walletConnectCloudProjectId: WALLET_CONFIG.WALLETCONNECT_PROJECT_ID,
  
  // Add timeout configuration
  rpcTimeoutMs: 10000,
}

export default WALLET_CONFIG
