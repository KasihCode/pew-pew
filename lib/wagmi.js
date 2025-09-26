import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { metaMask, injected, walletConnect } from 'wagmi/connectors'

const projectId = "f224cd857c6a73088f23be77d39ee5fa" // ambil dari cloud.walletconnect.com

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    metaMask(),
    injected(),
    walletConnect({
      projectId,
      metadata: {
        name: "My DApp",
        description: "DApp test transaksi di Base Sepolia",
        url: "https://mydapp.com", // bisa placeholder
        icons: ["https://mydapp.com/icon.png"], // wajib ada
      }
    })
  ],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"), // RPC resmi Base Sepolia
  },
  ssr: true,
})

export const baseSepoliaChain = baseSepolia
