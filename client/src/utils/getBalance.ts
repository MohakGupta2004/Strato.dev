import {contract, web3} from '../../config'

export const getBalance= async (address: string) => {

    try {
        const balanceDetails: number = await contract.methods.getBalance().call({ from: address })
        const balanceInEther = web3.utils.fromWei(balanceDetails, 'ether');
        return balanceInEther
    } catch (error) {
        console.log(error)
    }
}