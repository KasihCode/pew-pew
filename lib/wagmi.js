import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { metaMask, injected, walletConnect } from 'wagmi/connectors'

const projectId = 'f224cd857c6a73088f23be77d39ee5fa' // Replace with your WalletConnect project ID

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
