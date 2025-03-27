import {contract, web3} from '../../config'

export const getBalance= async (address: string) => {

    try {
        const balanceDetails: number = await contract.methods.getBalance(address).call({ from: address })
        const balanceInEther = web3.utils.fromWei(balanceDetails, 'ether');
        console.log("BALANCE IN ETH", balanceInEther)
        return balanceInEther
    } catch (error) {
        console.log(error)
    }
}