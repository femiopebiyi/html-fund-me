import { ethers, formatEther } from "./ethers.js";
import { abi, address } from "./constants.js";

const connectButton = document.querySelector("#connect");
const fundButton = document.querySelector("#fund");
const inputEth = document.querySelector("input");
const balanceBtn = document.querySelector("#balance");
const withdrawBtn = document.querySelector("#withdraw");

connectButton.addEventListener("click", connect);
fundButton.addEventListener("click", fund);
balanceBtn.addEventListener("click", getBalance);
withdrawBtn.addEventListener("click", withdraw);

async function connect() {
  console.log("clicked");
  try {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      connectButton.innerHTML = `connected`;
    } else {
      connectButton.innerHTML = "install metamask";
    }
  } catch (error) {
    console.error(error.message);
  }
}

async function fund(ethAmount) {
  try {
    if (window.ethereum) {
      if (
        !inputEth.value.trim() || // Check if the value is empty
        isNaN(Number(inputEth.value)) || // Check if the value is not a number
        Number(inputEth.value) === 0 // Check if the value is zero
      ) {
        console.log("please input numbers only");
        console.log(Number(inputEth.value));
        return;
      }
      console.log("funding........");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log(signer);

      const contract = new ethers.Contract(address, abi, signer);
      ethAmount = inputEth.value;
      const transactionResponse = await contract.fund({
        value: ethers.parseEther(ethAmount),
      });

      await listenForMine(transactionResponse, provider);
      console.log("funded");
    } else {
      connectButton.innerHTML = "connect your metamask";
    }
  } catch (error) {
    console.log(error.message);
  }
}

function listenForMine(transactionResponse, provider) {
  console.log(`mining ${transactionResponse.hash}...`);

  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, async (transactionReceipt) => {
      console.log(
        `completed with ${await transactionReceipt.confirmations()} confirmations`
      );
      resolve();
    });
  });
}

async function getBalance() {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    console.log(ethers.formatEther(balance));
  }
}

async function withdraw() {
  if (window.ethereum) {
    console.log("withdrawing.....");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    console.log(signer);

    const contract = new ethers.Contract(address, abi, signer);

    try {
      const balance = formatEther(await provider.getBalance(address));
      const transactionResponse = await contract.withdraw();
      await listenForMine(transactionResponse, provider);

      console.log(`${balance}ETH withdrawn successfully`);
    } catch (error) {
      console.log(error.message);
    }
  }
}
