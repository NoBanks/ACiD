/**
 * ACiD Bridge UI
 *
 * Animation Flow (Seamless):
 * 1. IDLE: Static image (frame at 2s) - user sees this on landing
 * 2. PENDING: Video plays full intro (0-5s), then loops (2s-5s repeatedly)
 * 3. SUCCESS: At next loop point (2s), seamlessly switch to success video
 *             Success video starts at 2s for seamless transition
 * 4. COMPLETE: Resolves back to stillness
 *
 * The 2-second mark is the visual anchor throughout.
 */

// Elements
const bridgeIdle = document.getElementById('bridgeIdle');
const bridgePending = document.getElementById('bridgePending');
const bridgeSuccess = document.getElementById('bridgeSuccess');
const pendingQuote = document.getElementById('pendingQuote');
const bridgeForm = document.getElementById('bridgeForm');
const statusCard = document.getElementById('statusCard');
const statusText = document.getElementById('statusText');
const statusIcon = document.getElementById('statusIcon');
const txLink = document.getElementById('txLink');

const connectWalletBtn = document.getElementById('connectWallet');
const bridgeBtn = document.getElementById('bridgeBtn');
const bridgeBtnText = document.getElementById('bridgeBtnText');
const amountInput = document.getElementById('amount');
const balanceEl = document.getElementById('balance');
const maxBtn = document.getElementById('maxBtn');
const swapNetworks = document.getElementById('swapNetworks');
const fromNetwork = document.getElementById('fromNetwork');
const toNetwork = document.getElementById('toNetwork');

// State
let isConnected = false;
let isL1ToL2 = true;
let userBalance = 0;
let bridgeState = 'idle'; // 'idle', 'pending', 'success'
let bridgeSuccessQueued = false; // Flag: success is ready, waiting for loop point

// Animation config
const LOOP_START = 2; // seconds - the anchor point
const LOOP_END = 5;   // seconds - end of loop

// Initialize
function init() {
  setupEventListeners();
  setupVideoLoop();
}

// Event Listeners
function setupEventListeners() {
  connectWalletBtn.addEventListener('click', handleConnectWallet);
  bridgeBtn.addEventListener('click', handleBridge);
  amountInput.addEventListener('input', handleAmountChange);
  maxBtn.addEventListener('click', handleMax);
  swapNetworks.addEventListener('click', handleSwapNetworks);
}

// Video Loop Logic - The Magic
function setupVideoLoop() {
  bridgePending.addEventListener('timeupdate', () => {
    if (bridgeState !== 'pending') return;

    const currentTime = bridgePending.currentTime;

    // Check if we need to loop back to 2s
    if (currentTime >= LOOP_END - 0.05) {
      // If success is queued, transition to success video at the loop point
      if (bridgeSuccessQueued) {
        transitionToSuccess();
      } else {
        // Normal loop: jump back to 2s
        bridgePending.currentTime = LOOP_START;
      }
    }
  });

  bridgeSuccess.addEventListener('ended', () => {
    // Success animation complete - show final idle state
    showIdle();
    showSuccessComplete();
  });
}

// Animation State Management
function showIdle() {
  bridgeIdle.classList.remove('hidden');
  bridgePending.classList.add('hidden');
  bridgeSuccess.classList.add('hidden');
  pendingQuote.classList.add('hidden');
  bridgePending.pause();
  bridgeSuccess.pause();
  bridgeState = 'idle';
  bridgeSuccessQueued = false;
}

function showPending() {
  bridgeState = 'pending';
  bridgeSuccessQueued = false;

  bridgeIdle.classList.add('hidden');
  bridgePending.classList.remove('hidden');
  bridgeSuccess.classList.add('hidden');
  pendingQuote.classList.remove('hidden');

  // Start from very beginning for the full intro
  bridgePending.currentTime = 0;
  bridgePending.play();
}

function queueSuccess() {
  // Don't immediately switch - wait for the next 2s loop point
  bridgeSuccessQueued = true;
  statusText.textContent = 'Confirming...';
}

function transitionToSuccess() {
  // This is called at the 2s/5s boundary for seamless transition
  bridgeState = 'success';
  bridgeSuccessQueued = false;

  bridgePending.pause();
  bridgePending.classList.add('hidden');
  bridgeSuccess.classList.remove('hidden');
  pendingQuote.classList.add('hidden');

  // Start success video at the 2s mark (same visual frame as loop point)
  bridgeSuccess.currentTime = LOOP_START;
  bridgeSuccess.play();
}

function showSuccessComplete() {
  statusText.textContent = 'Bridge complete!';
  statusIcon.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#39FF14" stroke-width="2">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  `;
  txLink.classList.remove('hidden');

  // Show form again after delay
  setTimeout(() => {
    statusCard.classList.add('hidden');
    bridgeForm.classList.remove('hidden');
    resetForm();
  }, 3000);
}

// Wallet Connection
async function handleConnectWallet() {
  if (isConnected) {
    isConnected = false;
    connectWalletBtn.textContent = 'Connect Wallet';
    connectWalletBtn.classList.remove('connected');
    balanceEl.textContent = 'Balance: --';
    userBalance = 0;
    updateBridgeButton();
    return;
  }

  if (typeof window.ethereum !== 'undefined') {
    try {
      connectWalletBtn.textContent = 'Connecting...';

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        isConnected = true;
        const address = accounts[0];
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        connectWalletBtn.textContent = shortAddress;
        connectWalletBtn.classList.add('connected');

        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        userBalance = parseFloat((parseInt(balance, 16) / 1e18).toFixed(4));
        balanceEl.textContent = `Balance: ${userBalance} ETH`;

        updateBridgeButton();
      }
    } catch (error) {
      console.error('Connection error:', error);
      connectWalletBtn.textContent = 'Connect Wallet';
    }
  } else {
    // Demo mode (no MetaMask)
    isConnected = true;
    connectWalletBtn.textContent = '0x1234...5678';
    connectWalletBtn.classList.add('connected');
    userBalance = 1.5;
    balanceEl.textContent = `Balance: ${userBalance} ETH`;
    updateBridgeButton();
  }
}

// Amount Handling
function handleAmountChange() {
  updateBridgeButton();
}

function handleMax() {
  if (userBalance > 0) {
    const maxAmount = Math.max(0, userBalance - 0.01).toFixed(4);
    amountInput.value = maxAmount;
    updateBridgeButton();
  }
}

// Network Swap
function handleSwapNetworks() {
  isL1ToL2 = !isL1ToL2;

  const fromName = fromNetwork.querySelector('.network-name');
  const fromBadge = fromNetwork.querySelector('.network-badge');
  const toName = toNetwork.querySelector('.network-name');
  const toBadge = toNetwork.querySelector('.network-badge');

  if (isL1ToL2) {
    fromName.textContent = 'Ethereum';
    fromBadge.textContent = 'L1';
    fromNetwork.classList.remove('acid');
    toName.textContent = 'ACiD';
    toBadge.textContent = 'L2';
    toNetwork.classList.add('acid');
  } else {
    fromName.textContent = 'ACiD';
    fromBadge.textContent = 'L2';
    fromNetwork.classList.add('acid');
    toName.textContent = 'Ethereum';
    toBadge.textContent = 'L1';
    toNetwork.classList.remove('acid');
  }
}

// Bridge Button State
function updateBridgeButton() {
  const amount = parseFloat(amountInput.value) || 0;

  if (!isConnected) {
    bridgeBtn.disabled = true;
    bridgeBtnText.textContent = 'Connect Wallet';
  } else if (amount <= 0) {
    bridgeBtn.disabled = true;
    bridgeBtnText.textContent = 'Enter Amount';
  } else if (amount > userBalance) {
    bridgeBtn.disabled = true;
    bridgeBtnText.textContent = 'Insufficient Balance';
  } else {
    bridgeBtn.disabled = false;
    bridgeBtnText.textContent = `Bridge to ${isL1ToL2 ? 'ACiD' : 'Ethereum'}`;
  }
}

// Bridge Transaction
async function handleBridge() {
  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) return;

  // Hide form, show status
  bridgeForm.classList.add('hidden');
  statusCard.classList.remove('hidden');
  statusText.textContent = 'Bridging in progress...';
  statusIcon.innerHTML = '<div class="spinner"></div>';
  txLink.classList.add('hidden');

  // Start pending animation (plays full intro, then loops)
  showPending();

  try {
    // Wait for bridge to complete (replace with actual bridge logic)
    await simulateBridge(amount);

    // Bridge succeeded - queue the success animation
    // It will trigger at the next 2s loop point for seamless transition
    queueSuccess();

  } catch (error) {
    console.error('Bridge error:', error);
    showIdle();
    statusText.textContent = 'Bridge failed. Please try again.';
    statusIcon.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M15 9l-6 6M9 9l6 6"/>
      </svg>
    `;

    setTimeout(() => {
      statusCard.classList.add('hidden');
      bridgeForm.classList.remove('hidden');
    }, 2000);
  }
}

// Simulate bridge (replace with actual OP Stack bridge contract calls)
function simulateBridge(amount) {
  return new Promise((resolve) => {
    // Simulate 8-15 seconds bridge time
    const bridgeTime = 8000 + Math.random() * 7000;
    setTimeout(resolve, bridgeTime);
  });
}

// Reset form
function resetForm() {
  amountInput.value = '';
  updateBridgeButton();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
