// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentContract {
    address payable public immutable owner;
    uint256 public constant requiredPayment = 0.0003 ether;
    mapping(address => uint256) public deposits;
    
    event PaymentReceived(address indexed from, uint256 amount);
    event FundsDeposited(address indexed from, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);
    
    constructor() {
        owner = payable(msg.sender);
    }
    
    // Function to deduct 0.0003 ETH from sender's balance and transfer to owner
    function pay() external {
        require(address(msg.sender).balance >= requiredPayment, "Insufficient balance");
        (bool sent, ) = owner.call{value: requiredPayment}("");
        require(sent, "Payment failed");
        emit PaymentReceived(msg.sender, requiredPayment);
    }
    
    // Function to allow anyone except the owner to deposit funds
    function depositFunds() external payable {
        require(msg.sender != owner, "Owner cannot deposit funds");
        require(msg.value > 0, "Deposit amount must be greater than zero");
        deposits[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    // Function to withdraw deposited funds (for demonstration; note this withdraws the entire balance)
    function withdraw() public {
        uint256 amount = deposits[msg.sender];
        require(amount > 0, "No funds to withdraw");
        deposits[msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdrawal failed");
        emit FundsWithdrawn(msg.sender, amount);
    }
    
    // New function to check the deposit balance for the calling user
    function getBalance() external view returns (uint256) {
        return deposits[msg.sender];
    }
}
