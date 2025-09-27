'use client'

import './globals.css'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { WALLET_CONFIG, PRIVY_CONFIG, SUPPORTED_CHAINS } from '../lib/wallet-config'
import { createConfig, http } from 'wagmi'

const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  transports: {
    [SUPPORTED_CHAINS[0].id]: http(),
  },
})

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <html lang="en">
      <head>
        <title>Smart Contract Deployer</title>
        <meta name="description" content="Deploy smart contracts to Base Sepolia Testnet with Privy" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <PrivyProvider
          appId={WALLET_CONFIG.PRIVY_APP_ID}
          config={PRIVY_CONFIG}
        >
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={wagmiConfig}>
              {children}
            </WagmiProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </body>
    </html>
  )
}
