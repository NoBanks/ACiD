// network.html — Add to MetaMask + copy buttons

const ACID_PARAMS = {
  chainId: '0x6b2', // 1714
  chainName: 'ACiD',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc-acid.livingagentic.me'],
  blockExplorerUrls: [], // populate when explorer is live
};

const btn = document.getElementById('addToWallet');
const status = document.getElementById('walletStatus');

if (btn) {
  btn.addEventListener('click', async () => {
    if (!window.ethereum) {
      status.className = 'status-line error';
      status.textContent = 'No wallet detected. Install MetaMask, Rabby, or any EIP-1193 wallet.';
      return;
    }
    try {
      status.className = 'status-line';
      status.textContent = 'Requesting wallet permission...';
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [ACID_PARAMS],
      });
      status.className = 'status-line success';
      status.textContent = 'ACiD added. Switch network in your wallet to start building.';
    } catch (err) {
      status.className = 'status-line error';
      status.textContent = err.code === 4001 ? 'Cancelled.' : (err.message || 'Failed to add network.');
    }
  });
}

// Copy buttons
document.querySelectorAll('.copy-btn').forEach((b) => {
  b.addEventListener('click', async () => {
    const text = b.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      const orig = b.textContent;
      b.textContent = 'copied';
      b.classList.add('copied');
      setTimeout(() => {
        b.textContent = orig;
        b.classList.remove('copied');
      }, 1200);
    } catch (e) {
      b.textContent = 'failed';
    }
  });
});
