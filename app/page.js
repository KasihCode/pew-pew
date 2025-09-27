'use client'

import { useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useWalletClient, usePublicClient } from 'wagmi'
import contractsConfig from '../contractsConfig.js'
import { baseSepolia } from 'viem/chains'

export default function HomePage() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentLogs, setDeploymentLogs] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [error, setError] = useState('')
  const [deployedContracts, setDeployedContracts] = useState({})

  // Get current wallet info
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy')
  const currentWallet = wallets[0]
  const address = currentWallet?.address

  // Check if we're on the right network
  const isOnCorrectNetwork = currentWallet?.chainId === `eip155:${baseSepolia.id}`

  // Add log entry
  const addLog = (message, type = 'info', contractAddress = null) => {
    const timestamp = new Date().toLocaleTimeString()
    setDeploymentLogs(prev => [...prev, {
      timestamp,
      message,
      type,
      contractAddress
    }])
  }

  // Deploy individual contract helper
  const deployIndividualContract = async (contractData, args = [], contractName = '') => {
    try {
      const bytecode = contractData.bytecode
      if (typeof bytecode !== 'string' || !bytecode.startsWith('0x')) {
        throw new Error(`Invalid bytecode format for ${contractName}`)
      }

      addLog(`Deploying ${contractName}...`, 'info')

      const hash = await walletClient.deployContract({
        abi: contractData.abi,
        bytecode,
        args: args.length > 0 ? args : undefined,
      })

      addLog(`Transaction sent for ${contractName}: ${hash}`, 'pending')

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 120000,
      })

      addLog(`${contractName} deployed successfully!`, 'success', receipt.contractAddress)

      return {
        contractAddress: receipt.contractAddress,
        transactionHash: hash,
      }
    } catch (err) {
      addLog(`Failed to deploy ${contractName}: ${err.message}`, 'error')
      throw err
    }
  }

  // Switch to Base Sepolia network
  const switchToBaseSepolia = async () => {
    try {
      if (currentWallet && currentWallet.switchChain) {
        await currentWallet.switchChain(baseSepolia.id)
        addLog('Successfully switched to Base Sepolia network', 'success')
      }
    } catch (err) {
      throw new Error('Please switch your wallet to Base Sepolia to continue')
    }
  }

  // Deploy all contracts
  const deployAllContracts = async () => {
    if (!walletClient || !publicClient) return

    try {
      setIsDeploying(true)
      setError('')
      setDeploymentLogs([])
      setCurrentStep(0)
      setTotalSteps(15)
      setDeployedContracts({})

      // Auto-switch to Base Sepolia if needed
      if (!isOnCorrectNetwork) {
        await switchToBaseSepolia()
      }

      addLog('Starting deployment of all smart contracts...', 'info')
      addLog('='.repeat(60), 'info')

      const deployedAddresses = {}
      let stepCount = 0

      // Deploy all contracts with the same logic as before
      // 1. BasicMath
      stepCount++
      setCurrentStep(stepCount)
      const basicMathContract = contractsConfig.find(c => c.id === 1)
      const basicMathResult = await deployIndividualContract(basicMathContract, [], '1. BasicMath')
      deployedAddresses.basicMath = basicMathResult.contractAddress
      addLog('', 'info')

      // 2. ControlStructures
      stepCount++
      setCurrentStep(stepCount)
      const controlStructuresContract = contractsConfig.find(c => c.id === 2)
      const controlStructuresResult = await deployIndividualContract(controlStructuresContract, [], '2. ControlStructures')
      deployedAddresses.controlStructures = controlStructuresResult.contractAddress
      addLog('', 'info')

      // 3. EmployeeStorage
      stepCount++
      setCurrentStep(stepCount)
      const employeeStorageContract = contractsConfig.find(c => c.id === 3)
      const employeeStorageArgs = [
        BigInt('1000'),
        'Pat',
        BigInt('50000'),
        BigInt('112358132134')
      ]
      const employeeStorageResult = await deployIndividualContract(employeeStorageContract, employeeStorageArgs, '3. EmployeeStorage')
      deployedAddresses.employeeStorage = employeeStorageResult.contractAddress
      addLog('', 'info')

      // 4. ArraysExercise
      stepCount++
      setCurrentStep(stepCount)
      const arraysExerciseContract = contractsConfig.find(c => c.id === 4)
      const arraysExerciseResult = await deployIndividualContract(arraysExerciseContract, [], '4. ArraysExercise')
      deployedAddresses.arraysExercise = arraysExerciseResult.contractAddress
      addLog('', 'info')

      // 5. FavoriteRecords
      stepCount++
      setCurrentStep(stepCount)
      const favoriteRecordsContract = contractsConfig.find(c => c.id === 5)
      const favoriteRecordsResult = await deployIndividualContract(favoriteRecordsContract, [], '5. FavoriteRecords')
      deployedAddresses.favoriteRecords = favoriteRecordsResult.contractAddress
      addLog('', 'info')

      // 6. GarageManager
      stepCount++
      setCurrentStep(stepCount)
      const garageManagerContract = contractsConfig.find(c => c.id === 6)
      const garageManagerResult = await deployIndividualContract(garageManagerContract, [], '6. GarageManager')
      deployedAddresses.garageManager = garageManagerResult.contractAddress
      addLog('', 'info')

      // 7. Salesperson
      stepCount++
      setCurrentStep(stepCount)
      const salespersonContract = contractsConfig.find(c => c.id === 7)
      const salespersonArgs = [BigInt('55555'), BigInt('12345'), BigInt('20')]
      const salespersonResult = await deployIndividualContract(salespersonContract, salespersonArgs, '7. Salesperson')
      deployedAddresses.salesperson = salespersonResult.contractAddress
      addLog('', 'info')

      // 8. EngineeringManager
      stepCount++
      setCurrentStep(stepCount)
      const engineeringManagerContract = contractsConfig.find(c => c.id === 8)
      const engineeringManagerArgs = [BigInt('54321'), BigInt('11111'), BigInt('200000')]
      const engineeringManagerResult = await deployIndividualContract(engineeringManagerContract, engineeringManagerArgs, '8. EngineeringManager')
      deployedAddresses.engineeringManager = engineeringManagerResult.contractAddress
      addLog('', 'info')

      // 9. InheritanceSubmission
      stepCount++
      setCurrentStep(stepCount)
      const inheritanceSubmissionContract = contractsConfig.find(c => c.id === 9)
      const inheritanceArgs = [deployedAddresses.salesperson, deployedAddresses.engineeringManager]
      const inheritanceSubmissionResult = await deployIndividualContract(inheritanceSubmissionContract, inheritanceArgs, '9. InheritanceSubmission')
      deployedAddresses.inheritanceSubmission = inheritanceSubmissionResult.contractAddress
      addLog('', 'info')

      // 10. ImportsExercise
      stepCount++
      setCurrentStep(stepCount)
      const importsExerciseContract = contractsConfig.find(c => c.id === 10)
      const importsExerciseResult = await deployIndividualContract(importsExerciseContract, [], '10. ImportsExercise')
      deployedAddresses.importsExercise = importsExerciseResult.contractAddress
      addLog('', 'info')

      // 11. ErrorTriageExercise
      stepCount++
      setCurrentStep(stepCount)
      const errorTriageExerciseContract = contractsConfig.find(c => c.id === 11)
      const errorTriageExerciseResult = await deployIndividualContract(errorTriageExerciseContract, [], '11. ErrorTriageExercise')
      deployedAddresses.errorTriageExercise = errorTriageExerciseResult.contractAddress
      addLog('', 'info')

      // 12. AddressBookFactory
      stepCount++
      setCurrentStep(stepCount)
      const addressBookFactoryContract = contractsConfig.find(c => c.id === 12)
      const addressBookFactoryResult = await deployIndividualContract(addressBookFactoryContract, [], '12. AddressBookFactory')
      deployedAddresses.addressBookFactory = addressBookFactoryResult.contractAddress
      addLog('', 'info')

      // 13. UnburnableToken
      stepCount++
      setCurrentStep(stepCount)
      const unburnableTokenContract = contractsConfig.find(c => c.id === 13)
      const unburnableTokenResult = await deployIndividualContract(unburnableTokenContract, [], '13. UnburnableToken')
      deployedAddresses.unburnableToken = unburnableTokenResult.contractAddress
      addLog('', 'info')

      // 14. WeightedVoting
      stepCount++
      setCurrentStep(stepCount)
      const weightedVotingContract = contractsConfig.find(c => c.id === 14)
      const weightedVotingResult = await deployIndividualContract(weightedVotingContract, [], '14. WeightedVoting')
      deployedAddresses.weightedVoting = weightedVotingResult.contractAddress
      addLog('', 'info')

      // 15. HaikuNFT
      stepCount++
      setCurrentStep(stepCount)
      const haikuNFTContract = contractsConfig.find(c => c.id === 15)
      const haikuNFTResult = await deployIndividualContract(haikuNFTContract, [], '15. HaikuNFT')
      deployedAddresses.haikuNFT = haikuNFTResult.contractAddress
      addLog('', 'info')

      // Final summary
      addLog('='.repeat(60), 'info')
      addLog('ALL CONTRACTS DEPLOYED SUCCESSFULLY!', 'success')
      addLog('='.repeat(60), 'info')

      setDeployedContracts(deployedAddresses)

    } catch (err) {
      console.error('Deployment error:', err)
      const message = err?.message || String(err)
      setError(message)
      addLog(`DEPLOYMENT FAILED: ${message}`, 'error')
    } finally {
      setIsDeploying(false)
      setCurrentStep(0)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Smart Contract Mass Deployer</h1>
          <p className="text-gray-600 text-center mb-8">
            Deploy all 15 smart contracts to Base Sepolia Testnet (Chain ID: {baseSepolia.id}) with one click
          </p>

          {/* Wallet Connection Section */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            {!ready ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading Privy...</p>
              </div>
            ) : !authenticated ? (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Connect Your Wallet</h3>
                <p className="mb-4 text-gray-600">
                  Connect using email, social login, or your existing wallet to get started
                </p>
                <button
                  onClick={login}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 font-medium"
                >
                  Connect Wallet with Privy
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Wallet Connected</h3>
                  <p className="text-gray-700">
                    User: <span className="font-mono text-sm">{user?.email?.address || 'Anonymous'}</span>
                  </p>
                  {address && (
                    <p className="text-gray-700 mt-1">
                      Address: <span className="font-mono text-sm">{address}</span>
                    </p>
                  )}
                  <p className="text-gray-600 mt-1">
                    Network: {isOnCorrectNetwork ? 'Base Sepolia ✅' : 'Wrong Network ⚠️'}
                    {!isOnCorrectNetwork && (
                      <span className="text-red-600 ml-2">Please switch to Base Sepolia</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* Deploy Section */}
          {authenticated && (
            <>
              <div className="mb-8 text-center">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Deploy All Smart Contracts</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    This will deploy all 15 smart contracts in sequence. You'll need to approve each transaction.
                  </p>
                  {currentStep > 0 && (
                    <div className="mb-4">
                      <div className="bg-blue-100 rounded-lg p-3">
                        <p className="text-blue-700 font-medium">
                          Progress: {currentStep}/{totalSteps} contracts deployed
                        </p>
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={deployAllContracts}
                  disabled={isDeploying || !walletClient}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold text-lg rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg"
                >
                  {isDeploying ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Deploying All Contracts...
                    </span>
                  ) : (
                    'Deploy All Smart Contracts'
                  )}
                </button>

                {/* Donation Section */}
                <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg shadow-md">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">💝 Support Development</h3>
                    <p className="text-gray-700 mb-4">
                      If this tool helped you complete Base Learn requirements, please consider supporting development
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-600 mb-2 font-medium">Donate to:</p>
                      <div className="flex items-center justify-center space-x-2 bg-gray-50 p-3 rounded-md">
                        <span className="font-mono text-sm text-gray-800 select-all break-all">
                          0x56dcd7fdbbf1fbf34bde48d5e515401f39d8b227
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('0x56dcd7fdbbf1fbf34bde48d5e515401f39d8b227')
                            // Show temporary feedback
                            const btn = event.target
                            const originalText = btn.innerHTML
                            btn.innerHTML = '✅ Copied!'
                            btn.className = btn.className.replace('text-gray-500', 'text-green-500')
                            setTimeout(() => {
                              btn.innerHTML = originalText
                              btn.className = btn.className.replace('text-green-500', 'text-gray-500')
                            }, 2000)
                          }}
                          className="ml-2 p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200 text-xs font-medium"
                          title="Copy address to clipboard"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Ethereum, Base, or any EVM compatible network
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700"><strong>Error:</strong> {error}</p>
                </div>
              )}

              {/* Deployment Logs */}
              {deploymentLogs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Deployment Logs</h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                    {deploymentLogs.map((log, index) => (
                      <div key={index} className={`mb-2 ${
                        log.type === 'error' ? 'text-red-400' : 
                        log.type === 'success' ? 'text-green-400' : 
                        log.type === 'pending' ? 'text-yellow-400' : 
                        'text-gray-300'
                      }`}>
                        <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                        {log.contractAddress && (
                          <div className="ml-16 mt-1 text-blue-400">
                            Contract Address: {log.contractAddress}
                            <br />
                            <a 
                              href={`https://sepolia.basescan.org/address/${log.contractAddress}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:underline text-xs"
                            >
                              View on BaseScan →
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary of Deployed Contracts */}
              {Object.keys(deployedContracts).length > 0 && (
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-medium text-green-800 mb-4">Deployed Contract Addresses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {Object.entries(deployedContracts).map(([name, address]) => (
                      <div key={name} className="bg-white p-3 rounded border border-green-200">
                        <p className="font-medium text-green-800 capitalize">{name.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="font-mono text-xs text-gray-600 break-all">{address}</p>
                        <a 
                          href={`https://sepolia.basescan.org/address/${address}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View on BaseScan →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Credit Section */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Secured by Privy & WalletConnect | Credit to: <a href="https://kasih-7.blogspot.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">kasih-7.blogspot.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
