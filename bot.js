require('dotenv').config();
const { createWallet, loadWalletFromMnemonic, sendTokens } = require('./utils');
const moment = require('moment');

// Define colors
const colors = {
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    MAGENTA: '\x1b[35m',
    CYAN: '\x1b[36m',
    NC: '\x1b[0m' // No Color
};

// ASCII Art
const asciiArt = `
${colors.RED}  ________  ___      ___  ________   ${colors.NC}
${colors.GREEN} /"       )|"  \\    /"  ||"      "\\"  ${colors.NC}
${colors.YELLOW}(:   \\___/  \\   \\  //   |(.  ___  :) ${colors.NC}
${colors.BLUE} \\___  \\    /\\\\  \\/.    ||: \\   ) || ${colors.NC}
${colors.MAGENTA}  __/  \\\\  |: \\.        |(| (___\\ || ${colors.NC}
${colors.CYAN} /" \\   :) |.  \\    /:  ||:       :) ${colors.NC}
(_______/  |___|\\__/|___|(________/  ${colors.NC}
`;

// Print ASCII Art
console.log(asciiArt);

async function createAndSend() {
    try {
        const recipientInfo = await createWallet();
        const { address: recipientAddress } = recipientInfo;

        const mnemonic = process.env.MNEMONIC; // Mengambil mnemonic dari .env
        if (!mnemonic) {
            throw new Error('Mnemonic tidak ditemukan dalam file .env');
        }

        const senderInfo = await loadWalletFromMnemonic(mnemonic);

        const amountToSend = 2500; // Misalnya, 0.0025 warden dalam satuan terkecil
        const transactionsPerDay = 10; // Jumlah transaksi per harinya
        const delayBetweenTransactions = 5000; // Delay antara transaksi dalam milidetik

        // Kirim transaksi pertama segera saat aplikasi dimulai
        for (let i = 0; i < 1; i++) {
            const memo = `Transaction ${i+1} at ${moment().format('HH:mm:ss')}`;
            await sendTokens(senderInfo.wallet, recipientAddress, amountToSend, memo);
            console.log(`[ ${moment().format('HH:mm:ss')} ] Sukses Kirim ${i+1}`);
        }

        // Setelah transaksi pertama, jadwalkan pengiriman berikutnya setelah 24 jam
        setTimeout(async () => {
            // Loop untuk melakukan pengiriman sebanyak transactionsPerDay kali
            for (let i = 1; i < transactionsPerDay; i++) {
                await delay(delayBetweenTransactions); // Delay antara transaksi

                const memo = `Transaction ${i+1} at ${moment().format('HH:mm:ss')}`;
                await sendTokens(senderInfo.wallet, recipientAddress, amountToSend, memo);
                console.log(`[ ${moment().format('HH:mm:ss')} ] Sukses Kirim ${i+1}`);
            }
        }, 24 * 60 * 60 * 1000); // Setelah 24 jam

    } catch (error) {
        console.error('Error:', error);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Jalankan createAndSend untuk transaksi pertama dan jadwalkan transaksi berikutnya
createAndSend();
