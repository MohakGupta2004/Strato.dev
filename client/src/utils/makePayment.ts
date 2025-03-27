import {contract, web3} from '../../config'

export const makePayment = async (address: string) => {
    try {
        const requiredPayment = web3.utils.toWei("3", "ether"); // Convert to Wei
        console.log("YOUOUO", requiredPayment)
        
      const receipt = await contract.methods.releasePayment("0xBcd4042DE499D14e55001CcbB24a551F3b954096", requiredPayment).send({
        from: address,
        // value: requiredPayment, // Sending 0.0003 ETH
      });
  
      console.log("Payment successful:", receipt);
      return receipt;
    } catch (error) {
      console.error("Payment failed:", error);
      return null;
    }
  };
  