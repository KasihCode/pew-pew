import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { metaMask, injected, walletConnect } from 'wagmi/connectors'

const projectId = 's' // Replace with your WalletConnect project ID

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    metaMask(),
    injected(),
    walletConnect({ projectId })
  ],
  transports: {
    [baseSepolia.id]: http()
  },
  ssr: true,
})

export const baseSepoliaChain = baseSepolia
