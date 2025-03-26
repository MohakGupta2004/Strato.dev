import {contract, web3} from '../../config'

export const deposit= async (amount: number, address: string) => {

    try {
        const depositAmount = web3.utils.toWei(`${amount}`, "ether");
        const balanceDetails = await contract.methods.depositFunds().send({
            from: address,
            value: depositAmount
        })
        return balanceDetails
    } catch (error) {
        console.log(error)
    }
}