// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentContract {
    mapping(address => uint256) public balances;
    
    event PaymentReceived(address indexed from, uint256 amount);
    event PaymentReleased(address indexed to, uint256 amount);
    event FundsDeposited(address indexed from, uint256 amount);

    // Function to deposit funds into the contract
    function depositFunds() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        balances[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    // Function to release payment to freelancer
    function releasePayment(address payable _to, uint256 _amount) external {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        require(_to != address(0), "Invalid recipient address");
        
        balances[msg.sender] -= _amount;
        _to.transfer(_amount);
        
        emit PaymentReleased(_to, _amount);
    }

    // Withdraw function to let a user withdraw their own funds
    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");

        // Reset the balance before transferring to prevent reentrancy attacks
        balances[msg.sender] = 0;
        
        // Transfer the amount back to the sender
        payable(msg.sender).transfer(amount);
        
        emit PaymentReleased(msg.sender, amount);
    }

    // Function to check contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Function to check user balance
    function getBalance(address _user) external view returns (uint256) {
        return balances[_user];
    }

    // Function to receive ETH
    receive() external payable {
        balances[msg.sender] += msg.value;
        emit PaymentReceived(msg.sender, msg.value);
    }
}
