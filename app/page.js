'use client'

import { useState } from 'react'
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

  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentLogs, setDeploymentLogs] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [error, setError] = useState('')
  const [deployedContracts, setDeployedContracts] = useState({})

  // Check if we're on the right network
  const isOnCorrectNetwork = chain?.id === baseSepoliaChain.id

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

  // Deploy all contracts
  const deployAllContracts = async () => {
    if (!walletClient || !publicClient) return

    try {
      setIsDeploying(true)
      setError('')
      setDeploymentLogs([])
      setCurrentStep(0)
      setTotalSteps(15) // Total contracts to deploy
      setDeployedContracts({})

      // Auto-switch to Base Sepolia if needed
      if (!isOnCorrectNetwork) {
        try {
          await switchChain({ chainId: baseSepoliaChain.id })
        } catch (switchErr) {
          throw new Error('Please switch your wallet to Base Sepolia to continue')
        }
      }

      addLog('Starting deployment of all smart contracts...', 'info')
      addLog('='.repeat(60), 'info')

      const deployedAddresses = {}
      let stepCount = 0

      // 1. BasicMath
      stepCount++
      setCurrentStep(stepCount)
      const basicMathContract = contractsConfig.find(c => c.id === 1)
      const basicMathResult = await deployIndividualContract(basicMathContract, [], '1. BasicMath')
      deployedAddresses.basicMath = basicMathResult.contractAddress
      addLog('', 'info') // Empty line for spacing

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
        BigInt('1000'),           // _shares
        'Pat',                    // _name  
        BigInt('50000'),          // _salary
        BigInt('112358132134')    // _idNumber
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
            Deploy all 15 smart contracts to Base Sepolia Testnet (Chain ID: {baseSepoliaChain.id}) with one click
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

          {/* Deploy All Button */}
          {isConnected && (
            <>
              <div className="mb-8 text-center">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Deploy All Smart Contracts</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    This will deploy all 15 smart contracts in sequence. You'll need to approve each transaction in your wallet.
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
                  disabled={isDeploying}
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
