const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { StargateClient, SigningStargateClient } = require('@cosmjs/stargate');
const moment = require('moment');

const rpcEndpoint = 'https://warden-testnet.rpc.kjnodes.com';
const denom = 'uwdn';  // Adjust the denom as needed

// ANSI escape sequences for console colors
const colorReset = "\x1b[0m";
const colorRed = "\x1b[31m";
const colorGreen = "\x1b[32m";
const colorYellow = "\x1b[33m";
const colorBlue = "\x1b[34m";
const colorCyan = "\x1b[36m";

async function createWallet() {
  // Buat wallet baru dengan mnemonic baru
  const wallet = await DirectSecp256k1HdWallet.generate(24, { prefix: 'warden' });

  // Dapatkan mnemonic dari wallet yang dibuat
  const mnemonic = wallet.mnemonic;

  // Dapatkan alamat dari wallet
  const [account] = await wallet.getAccounts();
  const address = account.address;

  // Menghubungkan ke RPC endpoint
  const client = await StargateClient.connect(rpcEndpoint);

  // Mendapatkan saldo dari alamat yang baru dibuat
  const balance = await client.getAllBalances(address);

  return { wallet, mnemonic, address, balance };
}

async function loadWalletFromMnemonic(mnemonic) {
  try {
    // Buat wallet dari mnemonic yang diberikan
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'warden' });

    // Dapatkan alamat dari wallet
    const [account] = await wallet.getAccounts();
    const address = account.address;
    console.log(`[ ${moment().format('HH:mm:ss')} ]${colorGreen}Address: ${address}${colorReset}`);

    // Menghubungkan ke RPC endpoint
    const client = await StargateClient.connect(rpcEndpoint);

    // Mendapatkan saldo dari alamat
    const balanceResponse = await client.getAllBalances(address);
    const balance = balanceResponse.find(b => b.denom === 'uward').amount;
    const formattedBalance = (parseInt(balance) / 1000000).toFixed(4);

    console.log(`[ ${moment().format('HH:mm:ss')} ]${colorCyan}Balance for ${address}: ${formattedBalance} ward${colorReset}`);

    return { wallet, mnemonic, address, balance };
  } catch (error) {
    console.error(`[ ${moment().format('HH:mm:ss')} ]${colorRed}Error loading wallet from mnemonic: ${error}${colorReset}`);
    throw error;
  }
}

async function sendTokens(wallet, recipientAddress, amount, memo = '') {
  try {
    // Menghubungkan ke RPC endpoint dengan signing client
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
    //console.log(`${colorGreen}Connected to chain with ID: ${await client.getChainId()}${colorReset}`);

    // Dapatkan alamat dari wallet
    const [account] = await wallet.getAccounts();
    const senderAddress = account.address;

    // Kirim token
    const amountFinal = {
      denom: 'uward',
      amount: amount.toString(),
    };

    const fee = {
      amount: [{
        denom: 'uward', // Ubah denom ke 'uward'
        amount: '2500',   // Sesuaikan dengan jumlah yang mencukupi untuk biaya
      }],
      gas: '200000', // Tetapkan gas sesuai kebutuhan Anda
    };

    const result = await client.sendTokens(senderAddress, recipientAddress, [amountFinal], fee, memo);

    // Ambil transaction hash dari result
    const transactionHash = result.transactionHash;

    // Buat URL explorer
    const explorerUrl = 'https://testnet.warden.explorers.guru';
    const transactionUrl = `${explorerUrl}/tx/${transactionHash}`;

    console.log(`[ ${moment().format('HH:mm:ss')} ]${colorBlue}Transaction Explorer URL: ${transactionUrl}${colorReset}`);

    return result;
  } catch (error) {
    console.error(`[ ${moment().format('HH:mm:ss')} ]${colorRed}Error broadcasting transaction: ${error}${colorReset}`);
    throw error;
  }
}

module.exports = {
  createWallet,
  loadWalletFromMnemonic,
  sendTokens,
};
