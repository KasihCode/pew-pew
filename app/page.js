'use client'

import { useState, useEffect } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWalletClient,
  usePublicClient,
  useSwitchChain,
} from 'wagmi'
import contractsConfig from '../contractsConfig.js'
import { baseSepoliaChain } from '../lib/wagmi'

export default function HomePage() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { switchChain } = useSwitchChain()

  const [selectedContract, setSelectedContract] = useState('')
  const [constructorArgs, setConstructorArgs] = useState({})
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployResult, setDeployResult] = useState(null)
  const [error, setError] = useState('')

  // Reset states when contract changes
  useEffect(() => {
    setConstructorArgs({})
    setDeployResult(null)
    setError('')
  }, [selectedContract])

  // Check if we're on the right network
  const isOnCorrectNetwork = chain?.id === baseSepoliaChain.id

  // Parse constructor inputs from ABI
  const getConstructorInputs = (abi) => {
    const constructor = abi.find((item) => item.type === 'constructor')
    return constructor ? constructor.inputs : []
  }

  const selectedContractData = contractsConfig.find(
    (contract) => contract.id.toString() === selectedContract
  )
  const constructorInputs = selectedContractData
    ? getConstructorInputs(selectedContractData.abi)
    : []

  const handleArgChange = (paramName, value, type) => {
    let processedValue = value

    // Handle different solidity types
    if (type.includes('uint') || type.includes('int')) {
      processedValue = value === '' ? '' : BigInt(value).toString()
    } else if (type === 'bool') {
      processedValue = value === 'true'
    } else if (type === 'address') {
      processedValue = value
    } else if (type.includes('[]')) {
      // Handle arrays - split by comma and trim
      processedValue = value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== '')
    }

    setConstructorArgs((prev) => ({
      ...prev,
      [paramName]: processedValue,
    }))
  }

  const validateArgs = () => {
    for (const input of constructorInputs) {
      const value = constructorArgs[input.name]
      if (value === undefined || value === '') {
        throw new Error(`Parameter "${input.name}" is required`)
      }

      // Additional validation for addresses
      if (input.type === 'address' && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
        throw new Error(`Invalid address format for "${input.name}"`)
      }

      // If array of addresses, validate each
      if (input.type.includes('[]') && input.type.includes('address')) {
        const arr = Array.isArray(value) ? value : []
        for (const v of arr) {
          if (!/^0x[a-fA-F0-9]{40}$/.test(v)) {
            throw new Error(`Invalid address in array for "${input.name}": ${v}`)
          }
        }
      }
    }
  }

  // Safety limits for bytecode size (prevent accidental huge uploads)
  const MAX_BYTECODE_LENGTH = 1_000_000 // characters (hex string length)

  const deployContract = async () => {
    if (!walletClient || !selectedContractData || !publicClient) return

    try {
      setIsDeploying(true)
      setError('')
      setDeployResult(null)

      // Auto-switch to Base Sepolia if needed (do not return early)
      if (!isOnCorrectNetwork) {
        try {
          await switchChain({ chainId: baseSepoliaChain.id })
        } catch (switchErr) {
          // If user rejected chain switch or switch failed, show message
          throw new Error('Please switch your wallet to Base Sepolia to continue')
        }
      }

      // Validate constructor arguments if any
      if (constructorInputs.length > 0) {
        validateArgs()
      }

      // Basic safety checks for bytecode
      const bytecode = selectedContractData.bytecode
      if (typeof bytecode !== 'string' || !bytecode.startsWith('0x')) {
        throw new Error('Invalid bytecode format')
      }
      if (bytecode.length > MAX_BYTECODE_LENGTH) {
        throw new Error('Bytecode too large — aborting for safety')
      }

      // Ask user to confirm before sending a contract deploy (safety)
      const userConfirmed = typeof window !== 'undefined' ? window.confirm(
        `You are about to deploy contract \"${selectedContractData.name}\" from address ${address}. Continue?`
      ) : true
      if (!userConfirmed) {
        setIsDeploying(false)
        return
      }

      // Prepare constructor arguments
      const args = constructorInputs.map((input) => {
        let value = constructorArgs[input.name]

        // Convert based on type
        if (input.type.includes('uint') || input.type.includes('int')) {
          return BigInt(value)
        } else if (input.type === 'bool') {
          return Boolean(value)
        }
        return value
      })

      // Ensure walletClient can deploy (some connectors might not expose deployContract directly)
      if (!walletClient.deployContract || typeof walletClient.deployContract !== 'function') {
        throw new Error('Connected wallet does not support contract deployment via this client')
      }

      // Send deploy transaction (this will prompt the user's wallet to sign)
      const hash = await walletClient.deployContract({
        abi: selectedContractData.abi,
        bytecode,
        args: args.length > 0 ? args : undefined,
      })

      // Wait for transaction receipt using publicClient
      // Increase timeout to 2 minutes to allow for network delays on testnets
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 120000,
      })

      setDeployResult({
        contractAddress: receipt.contractAddress,
        transactionHash: hash,
        explorerUrlTx: `https://sepolia.basescan.org/tx/${hash}`,
        explorerUrlAddress: `https://sepolia.basescan.org/address/${receipt.contractAddress}`,
      })
    } catch (err) {
      console.error('Deployment error:', err)
      // err may be an object — try to extract meaningful message
      const message = err?.message || String(err)
      setError(message)
    } finally {
      setIsDeploying(false)
    }
  }

  const renderInputField = (input) => {
    const { name, type } = input
    const value = constructorArgs[name] ?? ''

    if (type === 'bool') {
      return (
        <select
          key={name}
          value={value.toString()}
          onChange={(e) => handleArgChange(name, e.target.value, type)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
        >
          <option value="" className="text-gray-500">
            Select...
          </option>
          <option value="true" className="text-gray-900">
            true
          </option>
          <option value="false" className="text-gray-900">
            false
          </option>
        </select>
      )
    }

    return (
      <input
        key={name}
        type="text"
        value={value}
        onChange={(e) => handleArgChange(name, e.target.value, type)}
        placeholder={`Enter ${type}`}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Smart Contract Deployer</h1>
          <p className="text-gray-600 text-center mb-8">
            Deploy contracts to Base Sepolia Testnet (Chain ID: {baseSepoliaChain.id})
          </p>

          {/* Wallet Connection */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            {!isConnected ? (
              <div className="text-center">
                <p className="mb-4 text-gray-700">Connect your wallet to get started</p>
                <div className="space-x-4">
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      onClick={() => connect({ connector })}
                      disabled={connector.connecting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-200"
                    >
                      {connector.name}
                      {connector.connecting && ' (connecting)'}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-2 text-gray-700">
                  Connected: <span className="font-mono text-sm">{address}</span>
                </p>
                <p className="mb-4 text-gray-600">
                  Network: {chain?.name} ({chain?.id})
                  {!isOnCorrectNetwork && (
                    <span className="text-red-600 ml-2">⚠️ Please switch to Base Sepolia</span>
                  )}
                </p>
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* Contract Selection */}
          {isConnected && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Contract to Deploy</label>
                <select
                  value={selectedContract}
                  onChange={(e) => setSelectedContract(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-500">Choose a contract...</option>
                  {contractsConfig.map((contract) => (
                    <option key={contract.id} value={contract.id} className="text-gray-900">
                      {contract.name} - {contract.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Constructor Arguments */}
              {selectedContract && constructorInputs.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Constructor Parameters</h3>
                  <div className="space-y-4">
                    {constructorInputs.map((input) => (
                      <div key={input.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {input.name} ({input.type})
                        </label>
                        {renderInputField(input)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deploy Button */}
              {selectedContract && (
                <div className="mb-6">
                  <button
                    onClick={deployContract}
                    disabled={isDeploying}
                    className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    {isDeploying ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deploying...
                      </span>
                    ) : (
                      'Deploy Contract'
                    )}
                  </button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700"><strong>Error:</strong> {error}</p>
                </div>
              )}

              {/* Deployment Result */}
              {deployResult && (
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-medium text-green-800 mb-4">🎉 Contract Deployed Successfully!</h3>
                  <div className="space-y-2 text-sm text-green-800">
                    <p>
                      <strong>Contract Address:</strong>{' '}
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-800">{deployResult.contractAddress}</code>
                    </p>
                    <p>
                      <strong>Transaction Hash:</strong>{' '}
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-800">{deployResult.transactionHash}</code>
                    </p>
                    <div className="mt-4 space-x-2">
                      <a href={deployResult.explorerUrlTx} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">View TX →</a>
                      <a href={deployResult.explorerUrlAddress} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition duration-200">View Address →</a>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Credit Section */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Credit to: <a href="https://kasih-7.blogspot.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://kasih-7.blogspot.com/</a>
          </p>
        </div>
      </div>

      {/* Add CSS for loading spinner */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}
