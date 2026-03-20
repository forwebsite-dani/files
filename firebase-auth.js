// ============================================
// FIREBASE AUTHENTICATION - ScholarsArchive
// Phone + Username + Password + 2 Device Limit
// Persistent login + real‑time device validation
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyAgBXZqOFCV35LxJZZ_rMbxLwFEzi7bHyg",
  authDomain: "scholarsarchive-c49ec.firebaseapp.com",
  projectId: "scholarsarchive-c49ec",
  storageBucket: "scholarsarchive-c49ec.firebasestorage.app",
  messagingSenderId: "141216084156",
  appId: "1:141216084156:web:4f8ed08ea59bb48d5fe0b9",
  measurementId: "G-M25G1LT409"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Flag to mark successful validation
let loginValidated = false;

// Device info
let currentDeviceId = '';
let currentDeviceName = '';

// Firestore listener for real‑time device changes
let devicesListener = null;

// ============================================
// TOAST NOTIFICATION
// ============================================

function showLoginToast(message, type = 'success') {
    const toast = document.getElementById('loginToast');
    const icon = document.getElementById('loginToastIcon');
    const msg = document.getElementById('loginToastMessage');
    
    msg.textContent = message;
    icon.textContent = type === 'success' ? 'check_circle' : 'error';
    toast.className = 'login-toast ' + type + ' show';
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, type === 'error' ? 4000 : 2500);
}

// ============================================
// LOADING SPINNER
// ============================================

function showLoginLoader(show) {
    const loginBtn = document.querySelector('.login-btn');
    const originalText = loginBtn.getAttribute('data-original-text') || 'Login';
    
    if (show) {
        loginBtn.setAttribute('data-original-text', originalText);
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="login-spinner"></span> Logging in...';
        loginBtn.style.opacity = '0.8';
        loginBtn.style.cursor = 'not-allowed';
    } else {
        loginBtn.disabled = false;
        loginBtn.textContent = originalText;
        loginBtn.style.opacity = '1';
        loginBtn.style.cursor = 'pointer';
    }
}

// ============================================
// DEVICE LIMIT MODAL
// ============================================

function showDeviceLimitModal(maxDevices) {
    const modal = document.getElementById('deviceLimitModal');
    const limitEl = document.getElementById('limitNumber');
    
    limitEl.textContent = maxDevices;
    modal.classList.add('show');
}

function closeDeviceLimitModal() {
    const modal = document.getElementById('deviceLimitModal');
    modal.classList.remove('show');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('deviceLimitModal');
    if (e.target === modal) {
        closeDeviceLimitModal();
    }
});

// ============================================
// BROWSER DEVICE DETECTION - DYNAMIC
// ============================================

function generateDeviceId() {
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const color = window.screen.colorDepth;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;
  const cores = navigator.hardwareConcurrency || 'unknown';
  const touch = navigator.maxTouchPoints || 0;
  
  const fingerprint = `${ua}-${screen}-${color}-${timezone}-${language}-${platform}-${cores}-${touch}`;
  
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `dev_${Math.abs(hash).toString(36)}`;
}

function buildDeviceNameFromBrowser() {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const screenInfo = `${window.screen.width}x${window.screen.height}`;
  
  const parts = [];
  
  if (/iPhone/i.test(ua)) {
    parts.push('iPhone');
  } else if (/iPad/i.test(ua)) {
    parts.push('iPad');
  } else if (/Samsung/i.test(ua)) {
    const smCode = ua.match(/(SM-[A-Z]\d{3}[A-Z]?)/i);
    parts.push(smCode ? `Samsung ${smCode[1]}` : 'Samsung');
  } else if (/Pixel/i.test(ua)) {
    const pixelModel = ua.match(/Pixel\s*\d+[a-z]?/i);
    parts.push(pixelModel ? pixelModel[0] : 'Google Pixel');
  } else if (/Xiaomi|Redmi|POCO/i.test(ua)) {
    const miModel = ua.match(/(Mi\s*\d+|Redmi\s*[^;)]+|POCO\s*[^;)]+)/i);
    parts.push(miModel ? miModel[0] : 'Xiaomi');
  } else if (/OnePlus/i.test(ua)) {
    const opModel = ua.match(/OnePlus\s*\d+/i);
    parts.push(opModel ? opModel[0] : 'OnePlus');
  } else if (/OPPO/i.test(ua)) {
    parts.push('OPPO');
  } else if (/vivo/i.test(ua)) {
    parts.push('vivo');
  } else if (/Huawei/i.test(ua)) {
    parts.push('Huawei');
  } else if (/Nokia/i.test(ua)) {
    parts.push('Nokia');
  } else if (/Sony/i.test(ua)) {
    parts.push('Sony Xperia');
  } else if (/Windows/i.test(ua)) {
    const isWin11 = /Windows NT 10\.0/.test(ua) && parseInt((ua.match(/Chrome\/(\d+)/) || [0,0])[1]) >= 115;
    parts.push(isWin11 ? 'Windows 11' : 'Windows');
  } else if (/Mac/i.test(ua)) {
    if (/MacBook/i.test(ua)) parts.push('MacBook');
    else if (/iMac/i.test(ua)) parts.push('iMac');
    else parts.push('Mac');
  } else if (/Linux/i.test(ua)) {
    parts.push('Linux');
  } else if (/Android/i.test(ua)) {
    parts.push('Android Device');
  } else {
    parts.push(platform || 'Unknown Device');
  }
  
  const osMatch = ua.match(/(Windows NT|Mac OS X|Android|iPhone OS)\s*([\d._]+)/i);
  if (osMatch) {
    const osName = osMatch[1];
    const version = osMatch[2].replace(/_/g, '.');
    if (osName === 'Windows NT') {
      if (version === '10.0') parts.push('10/11');
      else if (version === '6.3') parts.push('8.1');
      else if (version === '6.2') parts.push('8');
      else if (version === '6.1') parts.push('7');
    } else {
      parts.push(version);
    }
  }
  
  parts.push(`[${screenInfo}]`);
  
  if (/Win64|x64|WOW64|AMD64/i.test(ua)) parts.push('64-bit');
  else if (/arm|aarch64/i.test(ua)) parts.push('ARM');
  
  return parts.join(' ');
}

function initializeDeviceInfo() {
  currentDeviceId = generateDeviceId();
  currentDeviceName = buildDeviceNameFromBrowser();
  
  const displayEl = document.getElementById('deviceNameDisplay');
  if (displayEl) {
    displayEl.textContent = currentDeviceName;
  }
  
  console.log('Device detected:', {
    id: currentDeviceId,
    name: currentDeviceName
  });
}

// Initialize device info immediately
initializeDeviceInfo();

// ============================================
// REAL‑TIME DEVICE LISTENER
// ============================================
function setupDevicesListener(userId) {
  // Remove any existing listener
  if (devicesListener) {
    devicesListener();
    devicesListener = null;
  }

  devicesListener = db.collection('users').doc(userId).onSnapshot((doc) => {
    if (doc.exists) {
      const devices = doc.data().devices || [];
      const stillExists = devices.some(d => d.deviceId === currentDeviceId);
      if (!stillExists) {
        // Device was removed from the list – force logout
        showLoginToast('Your device has been removed from this account.', 'error');
        logout();
      }
    } else {
      // User document deleted – force logout
      logout();
    }
  }, (error) => {
    console.error('Devices listener error:', error);
  });
}

// ============================================
// PHONE INPUT VALIDATION & PASSWORD TOGGLE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Phone validation
    const phoneInput = document.getElementById('phoneInput');
    const phoneError = document.getElementById('phoneError');

    if (phoneInput && phoneError) {
        phoneInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            
            if (value.startsWith('0')) {
                phoneError.textContent = 'Invalid format – remove leading zero';
                this.value = value.substring(1);
            } else {
                phoneError.textContent = '';
            }
            
            if (value.length > 9) {
                phoneError.textContent = 'Too long – maximum 9 digits';
                this.value = value.slice(0, 9);
            } else {
                this.value = value;
            }
            
            if (this.value.length > 0 && !this.value.startsWith('9')) {
                phoneError.textContent = 'Must start with 9';
            }
        });
    }

    // Password toggle
    const passwordInput = document.getElementById('passwordInput');
    const passwordToggle = document.getElementById('passwordToggle');
    if (passwordInput && passwordToggle) {
        const toggleIcon = passwordToggle.querySelector('.material-icons');
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            toggleIcon.textContent = type === 'password' ? 'visibility_off' : 'visibility';
        });
    }
});

// ============================================
// SHOW MAIN APP
// ============================================

function showApp() {
    const loginContainer = document.getElementById('loginContainer');
    const appContainer = document.getElementById('appContainer');
    
    loginContainer.classList.add('hidden');
    appContainer.classList.add('active');
    
    const userAccount = document.getElementById('userAccount');
    if (userAccount && window.currentUsername) {
        userAccount.textContent = window.currentUsername.charAt(0).toUpperCase();
    }
    
    if (window.innerWidth > 1024) {
        appContainer.style.transform = 'scale(0.8)';
        appContainer.style.transformOrigin = 'center center';
        appContainer.style.width = '125%';
        appContainer.style.height = '125%';
        appContainer.style.position = 'absolute';
        appContainer.style.top = '-12.5%';
        appContainer.style.left = '-12.5%';
    }
}

// ============================================
// LOGIN WITH PHONE + USERNAME + PASSWORD
// ============================================

async function login() {
  const phoneDigits = document.getElementById('phoneInput').value.trim();
  const username = document.getElementById('usernameInput').value.trim();
  const password = document.getElementById('passwordInput').value.trim();

  if (!phoneDigits) {
    showLoginToast('Enter phone number', 'error');
    return;
  }
  if (phoneDigits.length !== 9) {
    showLoginToast('Phone number must be 9 digits', 'error');
    return;
  }
  if (!phoneDigits.startsWith('9')) {
    showLoginToast('Phone number must start with 9', 'error');
    return;
  }

  if (!username || !password) {
    showLoginToast('Enter username and password', 'error');
    return;
  }

  const deviceId = currentDeviceId;
  const deviceName = currentDeviceName;

  if (!deviceId || !deviceName) {
    showLoginToast('Device detection failed. Please refresh.', 'error');
    return;
  }

  loginValidated = false;
  showLoginLoader(true);

  try {
    const fullPhone = '+251' + phoneDigits;
    const email = `${fullPhone.replace(/\D/g, '')}@scholarsarchive.app`;
    
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      await auth.signOut();
      showLoginLoader(false);
      showLoginToast('Account not configured', 'error');
      return;
    }
    
    const userData = userDoc.data();
    
    if (userData.username.toLowerCase() !== username.toLowerCase()) {
      await auth.signOut();
      showLoginLoader(false);
      showLoginToast('Invalid username', 'error');
      return;
    }
    
    const maxDevices = userData.maxDevices || 2;
    let devices = userData.devices || [];
    
    devices = devices.filter(d => d && typeof d === 'object' && d.deviceId && d.deviceName);
    
    const existingDeviceIndex = devices.findIndex(d => d.deviceId === deviceId);
    const isNewDevice = existingDeviceIndex === -1;
    
    if (isNewDevice) {
      if (devices.length >= maxDevices) {
        await auth.signOut();
        showLoginLoader(false);
        showDeviceLimitModal(maxDevices);
        return;
      }
      
      const now = new Date().toISOString();
      devices.push({
        deviceId: deviceId,
        deviceName: deviceName,
        firstLogin: now,
        lastLogin: now
      });
    } else {
      devices[existingDeviceIndex].lastLogin = new Date().toISOString();
      devices[existingDeviceIndex].deviceName = deviceName;
    }
    
    await db.collection('users').doc(user.uid).update({
      devices: devices
    });
    
    loginValidated = true;
    window.currentUsername = userData.username;
    showLoginToast(`Welcome, ${userData.username}!`, 'success');
    
    // Set up real‑time listener for this user
    setupDevicesListener(user.uid);
    
    setTimeout(() => {
      showLoginLoader(false);
      showApp();
    }, 1500);
    
  } catch (error) {
    console.error('Login error:', error);
    showLoginLoader(false);
    let message = 'Login failed';
    if (error.code === 'auth/user-not-found') message = 'Account not found';
    if (error.code === 'auth/wrong-password') message = 'Wrong password';
    if (error.code === 'auth/invalid-email') message = 'Invalid phone format';
    if (error.code === 'auth/too-many-requests') message = 'Too many attempts. Try later.';
    showLoginToast(message, 'error');
  }
}

// ============================================
// LOGOUT
// ============================================
function logout() {
  loginValidated = false;
  
  // Stop the real‑time listener
  if (devicesListener) {
    devicesListener();
    devicesListener = null;
  }
  
  auth.signOut().then(() => {
    location.reload();  // full reload to reset state
  });
}
