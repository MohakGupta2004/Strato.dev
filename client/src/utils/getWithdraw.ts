import {contract, web3} from '../../config'

export const withdrawFunds = async (address: string) => {
    try {
      // Call the withdraw function on the contract
      const receipt = await contract.methods.withdraw().send({
        from: address,
      });
      console.log("Withdrawal successful:", receipt);
      return receipt;
    } catch (error) {
      console.error("Withdrawal error:", error);
      throw error;
    }
  };
  