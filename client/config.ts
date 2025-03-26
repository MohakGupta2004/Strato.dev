import Web3 from 'web3'
import PaymentContractABI from './abis/PaymentContractABI.json'
const address = import.meta.env.VITE_SEPOLIA_ADDRESS
const web3 = new Web3(address)
const contractAddress = import.meta.env.VITE_CONTRACT
const contract = new web3.eth.Contract(PaymentContractABI, contractAddress)
export {
    contract,
    web3
}