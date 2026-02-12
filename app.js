/* =========================================
   RADHE FINVEST - Complete Application Logic
   ========================================= */

// ============ SHOP CONFIGURATION ============
// Edit these details for your shop
const SHOP_CONFIG = {
    name: 'RADHE FINVEST',
    slogan: 'Lets Build Trust',
    address: '11, Main Road, Near Axis ATM, Mahinder Nagar, Ludhiana - 141016',
    phone: '+91 9988116299',
    email: 'radhefinvest@gmail.com',
    logo: '🏦' // You can replace this with an image URL
};

// ============ 1. DEFAULT DATA ============
const DEFAULT_SERVICES = [
    { id: 'money-transfer', name: 'Money Transfer', baseFee: 10, icon: '💸', documents: [], inputs: [{ label: 'Recipient Name', type: 'text' }, { label: 'Account Number', type: 'text' }, { label: 'Amount', type: 'number' }] },
    { id: 'pan-card', name: 'PAN Card Application', baseFee: 200, icon: '🆔', documents: ['Aadhaar Card Copy', 'Passport Size Photo'], inputs: [{ label: 'Full Name', type: 'text' }, { label: 'Date of Birth', type: 'date' }, { label: 'Aadhaar Number', type: 'text' }] },
    { id: 'aadhar', name: 'Aadhaar Update', baseFee: 50, icon: '👆', documents: ['Proof of Identity', 'Proof of Address'], inputs: [{ label: 'Aadhaar Number', type: 'text' }, { label: 'Mobile Number', type: 'text' }, { label: 'Update Details', type: 'text' }] },
    { id: 'bill-pay', name: 'Bill Payment', baseFee: 5, icon: '📄', documents: [], inputs: [{ label: 'Biller Name', type: 'text' }, { label: 'Consumer Number', type: 'text' }, { label: 'Amount', type: 'number' }] },
    { id: 'print', name: 'Color Printing', baseFee: 15, icon: '🖨️', documents: ['File to Print'], inputs: [{ label: 'Number of Pages', type: 'number' }] },
    { id: 'fastag', name: 'FASTag Recharge', baseFee: 0, icon: '🚗', documents: [], inputs: [{ label: 'Vehicle Number', type: 'text' }, { label: 'Recharge Amount', type: 'number' }] }
];

const DEFAULT_DB = {
    staffPin: '1234',  // Default Staff PIN
    services: DEFAULT_SERVICES,
    transactions: [],
    customerSerialCounter: 1000, // Starting serial number for customers

    // Promotional Banner Configuration (editable by Boss)
    promoBanner: {
        title: '✨ Open a New Bank Account Today!',
        subtitle: 'Join thousands of satisfied customers with our hassle-free account opening facility',
        features: [
            'Zero Balance Account',
            'Free Debit Card',
            'Free Passbook',
            'Instant Account Activation',
            'Free UPI Services',
            'Free NetBanking'
        ],
        buttonText: '🚀 Apply Now',
        enabled: true
    },

    // Bank Account Opening Service Configuration
    bankAccountService: {
        id: 'bank-account-opening',
        name: 'Bank Account Opening',
        baseFee: 0,
        icon: '🏦',
        documents: ['Aadhaar Card Copy', 'PAN Card Copy', 'Passport Size Photo', 'Address Proof'],
        inputs: [
            { label: 'Full Name (as per Aadhaar)', type: 'text' },
            { label: 'Date of Birth', type: 'date' },
            { label: 'Aadhaar Number', type: 'text' },
            { label: 'PAN Number', type: 'text' },
            { label: 'Email Address', type: 'email' },
            { label: 'Account Type', type: 'text' }
        ]
    }
};

// ============ 2. DATABASE ============
let DB = JSON.parse(localStorage.getItem('radheFinvest_v1'));
if (!DB || !DB.services) {
    DB = JSON.parse(JSON.stringify(DEFAULT_DB)); // Deep copy
    localStorage.setItem('radheFinvest_v1', JSON.stringify(DB));
}

// Ensure new properties exist (for upgrades)
if (!DB.promoBanner) {
    DB.promoBanner = JSON.parse(JSON.stringify(DEFAULT_DB.promoBanner));
    saveDB();
}
if (!DB.bankAccountService) {
    DB.bankAccountService = JSON.parse(JSON.stringify(DEFAULT_DB.bankAccountService));
    saveDB();
}

function saveDB() {
    localStorage.setItem('radheFinvest_v1', JSON.stringify(DB));
}

// ============ 3. APP STATE ============
const AppState = { currentUser: null };

// ============ 4. DOM REFERENCES ============
const $ = id => document.getElementById(id);

const views = {
    login: $('login-view'),
    customer: $('customer-dashboard-view'),
    receipt: $('customer-view'),
    staff: $('staff-view')
};

const header = $('main-header');
const logoutBtn = $('logout-btn');
const staffLoginForm = $('staff-login-form');
const customerLoginContainer = $('customer-login-container');
const customerTrackForm = $('customer-track-form');
const roleBtns = document.querySelectorAll('.role-btn');
const loginErrorMsg = $('login-error');
const googleLoginBtn = $('google-login-btn');

// Modal
const modalOverlay = $('modal-overlay');
const modalTitle = $('modal-title');
const modalMessage = $('modal-message');
const modalBody = $('modal-body');
const modalBtnConfirm = $('modal-btn-confirm');
const modalBtnCancel = $('modal-btn-cancel');

// ============ 5. MODAL SYSTEM ============
const Modal = {
    show(title, message, { showCancel = false, customHtml = null, onConfirm = null } = {}) {
        return new Promise(resolve => {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            modalBody.innerHTML = '';
            if (customHtml) modalBody.appendChild(customHtml);
            modalBtnCancel.style.display = showCancel ? 'inline-block' : 'none';
            modalOverlay.classList.remove('hidden');

            const close = val => {
                modalOverlay.classList.add('hidden');
                modalBtnConfirm.onclick = null;
                modalBtnCancel.onclick = null;
                resolve(val);
            };

            modalBtnConfirm.onclick = () => {
                if (onConfirm) {
                    const result = onConfirm();
                    if (result !== false) close(result);
                } else close(true);
            };
            modalBtnCancel.onclick = () => close(false);
        });
    },
    alert(title, message) { return this.show(title, message); },

    serviceForm(service) {
        const formContainer = document.createElement('div');
        const inputsMap = {};
        const fileDataMap = {}; // Store base64 data for files

        // Standard inputs
        service.inputs.forEach(field => {
            const wrapper = document.createElement('div');
            wrapper.className = 'input-group';
            wrapper.innerHTML = `<label class="input-label">${field.label}</label>`;
            const input = document.createElement('input');
            input.type = field.type;
            input.className = 'input-field';
            if (field.type === 'number') input.step = '0.01';
            if (AppState.currentUser && field.label.includes('Name')) input.value = AppState.currentUser.name || '';
            wrapper.appendChild(input);
            formContainer.appendChild(wrapper);
            inputsMap[field.label] = input;
        });

        // Document uploads with base64 conversion
        if (service.documents && service.documents.length > 0) {
            const docHeader = document.createElement('h4');
            docHeader.textContent = 'Required Documents';
            docHeader.style.cssText = 'margin: 1rem 0 0.5rem; color: var(--text-muted); font-size: 0.9rem;';
            formContainer.appendChild(docHeader);

            service.documents.forEach(docName => {
                const wrapper = document.createElement('div');
                wrapper.style.marginBottom = '1rem';
                wrapper.innerHTML = `<label class="file-upload-label"><span>📂 Upload ${docName}</span><input type="file" accept="image/*,.pdf" class="hidden"><div class="file-name-display"></div></label>`;
                const input = wrapper.querySelector('input');
                const display = wrapper.querySelector('.file-name-display');

                input.onchange = async e => {
                    if (e.target.files[0]) {
                        const file = e.target.files[0];
                        display.textContent = '⏳ Processing...';

                        // Convert to base64
                        try {
                            const base64Data = await fileToBase64(file);
                            fileDataMap[`DOC_${docName}`] = {
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                data: base64Data
                            };
                            display.textContent = '✅ ' + file.name;
                            wrapper.querySelector('label').style.borderColor = 'var(--accent-secondary)';
                        } catch (err) {
                            display.textContent = '❌ Error uploading';
                            console.error('File upload error:', err);
                        }
                    }
                };
                formContainer.appendChild(wrapper);
                inputsMap[`DOC_${docName}`] = input;
            });
        }

        // Mobile
        const phoneWrapper = document.createElement('div');
        phoneWrapper.className = 'input-group';
        phoneWrapper.innerHTML = `<label class="input-label">Customer Mobile</label><input type="tel" class="input-field">`;
        formContainer.appendChild(phoneWrapper);
        inputsMap['Customer Mobile'] = phoneWrapper.querySelector('input');

        // Fee display
        const feeInfo = document.createElement('p');
        feeInfo.style.cssText = 'margin-top: 1rem; color: var(--accent-secondary);';
        feeInfo.innerHTML = `Service Charge: <strong>₹${service.baseFee}</strong>`;
        formContainer.appendChild(feeInfo);

        return this.show(service.name, 'Complete Application', {
            showCancel: true,
            customHtml: formContainer,
            onConfirm: () => {
                const data = {};
                const documents = {};
                let valid = true;

                for (const [key, input] of Object.entries(inputsMap)) {
                    if (key.startsWith('DOC_')) {
                        if (!fileDataMap[key]) {
                            input.parentElement.style.borderColor = 'red';
                            valid = false;
                        } else {
                            documents[key] = fileDataMap[key];
                        }
                    } else {
                        if (!input.value.trim()) {
                            input.style.borderColor = 'red';
                            valid = false;
                        } else {
                            input.style.borderColor = 'var(--glass-border)';
                            data[key] = input.value;
                        }
                    }
                }
                if (!valid) return false;

                // Return both form data and documents
                return { formData: data, documents: documents };
            }
        });
    }
};

// Helper function to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// ============ 6. VIEW NAVIGATION ============
function switchView(viewName) {
    Object.values(views).forEach(el => el && el.classList.add('hidden'));
    if (views[viewName]) views[viewName].classList.remove('hidden');

    if (viewName === 'login') {
        header.classList.add('hidden');
        staffLoginForm.reset();
        customerTrackForm.reset();
        loginErrorMsg.style.display = 'none';
    } else if (viewName === 'customer') {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }
}

function logout() {
    AppState.currentUser = null;
    switchView('login');
}

// ============ 7. AUTH FUNCTIONS ============
function handleStaffLogin(e) {
    e.preventDefault();
    const id = $('staff-id').value.trim();
    const pin = $('staff-pin').value.trim();

    // Validate against stored PIN
    if (id && pin === DB.staffPin) {
        AppState.currentUser = { name: id, role: 'staff' };
        $('staff-name').textContent = id;
        initStaffDashboard();
        switchView('staff');
        loginErrorMsg.style.display = 'none';
    } else {
        loginErrorMsg.textContent = 'Invalid Agent ID or PIN';
        loginErrorMsg.style.display = 'block';
    }
}

function handleGoogleLogin() {
    googleLoginBtn.innerHTML = 'Connecting...';
    googleLoginBtn.disabled = true;

    setTimeout(() => {
        const mockUser = { name: 'Customer User', email: 'customer@gmail.com', role: 'customer' };
        AppState.currentUser = mockUser;
        $('customer-name-display').textContent = mockUser.name;
        $('customer-email-display').textContent = mockUser.email;
        initCustomerDashboard();
        switchView('customer');
        googleLoginBtn.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" width="20"> Continue with Google';
        googleLoginBtn.disabled = false;
    }, 1000);
}

function handleCustomerTrack(e) {
    e.preventDefault();
    const id = $('track-id').value.trim();
    if (!id) return;
    const record = DB.transactions.find(t => t.receiptId === id || t.customerMobile === id);
    if (record) {
        $('receipt-display-area').innerHTML = generateReceiptHTML(record);
        switchView('receipt');
    } else {
        Modal.alert('Not Found', 'No record found with that ID or Mobile Number.');
    }
}

// ============ 8. CUSTOMER DASHBOARD ============
// Get Bank Account Service from DB (editable by boss)
function getBankAccountService() {
    return DB.bankAccountService || {
        id: 'bank-account-opening',
        name: 'Bank Account Opening',
        baseFee: 0,
        icon: '🏦',
        documents: ['Aadhaar Card Copy', 'PAN Card Copy', 'Passport Size Photo', 'Address Proof'],
        inputs: [
            { label: 'Full Name (as per Aadhaar)', type: 'text' },
            { label: 'Date of Birth', type: 'date' },
            { label: 'Aadhaar Number', type: 'text' },
            { label: 'PAN Number', type: 'text' },
            { label: 'Email Address', type: 'email' },
            { label: 'Account Type', type: 'text' }
        ]
    };
}

function initCustomerDashboard() {
    const grid = $('customer-service-grid');
    grid.innerHTML = '';

    // Filter out money-transfer service from customer portal
    const customerServices = DB.services.filter(svc => svc.id !== 'money-transfer');

    customerServices.forEach(svc => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `<span class="service-icon">${svc.icon}</span><div class="service-name">${svc.name}</div><div style="font-size:0.7rem;color:var(--text-muted);">₹${svc.baseFee}</div>`;
        card.onclick = () => initiateServiceApplication(svc);
        grid.appendChild(card);
    });

    // Render promotional banner dynamically
    renderPromoBanner();

    // Setup Apply Now button for Bank Account Opening
    const applyAccountBtn = $('apply-account-btn');
    if (applyAccountBtn) {
        applyAccountBtn.onclick = () => initiateServiceApplication(getBankAccountService());
    }

    renderCustomerHistory();
}

// Render promotional banner from database config
function renderPromoBanner() {
    const promo = DB.promoBanner;
    if (!promo || !promo.enabled) {
        const banner = document.querySelector('.promo-banner');
        if (banner) banner.style.display = 'none';
        return;
    }

    // Update banner content
    const titleEl = document.querySelector('.promo-banner .promo-text h2');
    const subtitleEl = document.querySelector('.promo-banner .promo-text > p');
    const featuresContainer = document.querySelector('.promo-banner .promo-features');
    const applyBtn = $('apply-account-btn');

    if (titleEl) titleEl.textContent = promo.title;
    if (subtitleEl) subtitleEl.textContent = promo.subtitle;
    if (applyBtn) applyBtn.textContent = promo.buttonText;

    if (featuresContainer && promo.features) {
        featuresContainer.innerHTML = promo.features.map(feature => `
            <div class="feature-item" style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-main);">
                <span style="color: var(--accent-secondary);">✓</span> ${feature}
            </div>
        `).join('');
    }
}

function renderCustomerHistory() {
    const list = $('customer-history-list');
    const myTxns = DB.transactions.filter(t => t.customerEmail === AppState.currentUser?.email);
    if (myTxns.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:1rem;">No applications yet.</p>';
        return;
    }
    list.innerHTML = '';
    myTxns.forEach(t => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `<div><strong style="color:var(--accent-primary)">${t.serviceName}</strong><div style="font-size:0.8rem;color:var(--text-muted)">${t.date} | ${t.receiptId}</div></div><div style="text-align:right"><div>₹${t.total.toFixed(2)}</div><span class="receipt-status ${t.status === 'Done' ? 'status-done' : 'status-pending'}" style="font-size:0.7rem;padding:2px 6px">${t.status}</span></div>`;
        list.appendChild(item);
    });
}

async function initiateServiceApplication(service) {
    const result = await Modal.serviceForm(service);
    if (!result) return;

    const { formData, documents } = result;
    const amount = parseFloat(formData['Amount'] || formData['Recharge Amount'] || 0);
    let fee = parseFloat(service.baseFee);
    // 1% commission rounded to nearest 10 for money transfer
    if (service.id === 'money-transfer') {
        const commission = Math.round((amount * 0.01) / 10) * 10;
        fee += commission;
    }
    const total = amount + fee;

    // Increment customer serial number
    if (!DB.customerSerialCounter) DB.customerSerialCounter = 1000;
    const customerSerial = 'CST-' + (++DB.customerSerialCounter);

    const record = {
        receiptId: 'APP-' + Math.floor(10000 + Math.random() * 90000),
        customerSerial: customerSerial,
        serviceId: service.id,
        serviceName: service.name,
        customerName: AppState.currentUser.name,
        customerEmail: AppState.currentUser.email,
        customerMobile: formData['Customer Mobile'],
        accountNumber: formData['Account Number'] || null,
        amount, fee, total,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        details: formData,
        documents: documents, // Store base64 documents
        status: 'Pending'
    };

    // SAVE TO SUPABASE IF CONNECTED
    if (supabaseClient) {
        supabaseClient.from('transactions').insert([record]).then(({ error }) => {
            if (error) console.error('Supabase Save Error:', error);
            else console.log('Saved to Supabase');
        });
    }

    DB.transactions.unshift(record);
    saveDB();
    await Modal.alert('Application Submitted', `Receipt ID: ${record.receiptId}`);
    renderCustomerHistory();
}

// ============ 9. STAFF DASHBOARD ============
function initStaffDashboard() {
    const grid = $('service-grid');
    grid.innerHTML = '';
    DB.services.forEach(svc => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `<span class="service-icon">${svc.icon}</span><div class="service-name">${svc.name}</div><div style="font-size:0.7rem;color:var(--text-muted);">₹${svc.baseFee}</div>`;
        card.onclick = () => initiateStaffService(svc);
        grid.appendChild(card);
    });

    // Add Admin Button dynamically
    const statsCard = $('staff-view').querySelector('.dashboard-grid .glass-card:last-child');
    if (!$('btn-admin')) {
        const adminBtn = document.createElement('button');
        adminBtn.id = 'btn-admin';
        adminBtn.className = 'btn-primary';
        adminBtn.style.cssText = 'width:100%;margin-top:1rem;';
        adminBtn.textContent = '⚙️ Admin Settings';
        adminBtn.onclick = showAdminPanel;
        statsCard.appendChild(adminBtn);
    }

    updateDailyStats();
    renderTransactionHistory();
    renderApplications(); // Render customer applications
}

async function initiateStaffService(service) {
    const result = await Modal.serviceForm(service);
    if (!result) return;

    const { formData, documents } = result;
    const amount = parseFloat(formData['Amount'] || formData['Recharge Amount'] || 0);
    let fee = parseFloat(service.baseFee);
    // 1% commission rounded to nearest 10 for money transfer
    if (service.id === 'money-transfer') {
        const commission = Math.round((amount * 0.01) / 10) * 10;
        fee += commission;
    }
    const total = amount + fee;

    // Increment customer serial number
    if (!DB.customerSerialCounter) DB.customerSerialCounter = 1000;
    const customerSerial = 'CST-' + (++DB.customerSerialCounter);

    const record = {
        receiptId: 'RCPT-' + Math.floor(100000 + Math.random() * 900000),
        customerSerial: customerSerial,
        serviceId: service.id,
        serviceName: service.name,
        customerName: formData['Full Name (as per Aadhaar)'] || formData['Full Name'] || formData['Recipient Name'] || 'Walk-in',
        customerMobile: formData['Customer Mobile'],
        accountNumber: formData['Account Number'] || null,
        amount, fee, total,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        details: formData,
        documents: documents, // Store base64 documents
        status: 'Done'
    };

    // SAVE TO SUPABASE IF CONNECTED
    if (supabaseClient) {
        supabaseClient.from('transactions').insert([record]).then(({ error }) => {
            if (error) console.error('Supabase Save Error:', error);
            else console.log('Saved to Supabase');
        });
    }

    DB.transactions.unshift(record);
    saveDB();

    const container = document.createElement('div');
    container.innerHTML = generateReceiptHTML(record);
    await Modal.show('Transaction Complete', '', { customHtml: container });
    initStaffDashboard();
}

function updateDailyStats() {
    const today = new Date().toLocaleDateString();
    const todayTxns = DB.transactions.filter(t => t.date === today && t.status === 'Done');
    const revenue = todayTxns.reduce((sum, t) => sum + (t.fee || 0), 0);
    $('daily-collection').textContent = `₹${revenue.toFixed(2)}`;
}

function renderTransactionHistory() {
    const list = $('transaction-list');
    list.innerHTML = '';
    DB.transactions.slice(0, 10).forEach(t => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `<div><strong>${t.serviceName}</strong><div style="font-size:0.8rem;color:var(--text-muted)">${t.customerName} | ${t.receiptId}</div></div><div style="text-align:right"><div style="color:var(--accent-secondary)">+₹${(t.fee || 0).toFixed(2)}</div><div style="font-size:0.8rem">${t.status}</div></div>`;
        item.onclick = () => {
            const d = document.createElement('div');
            d.innerHTML = generateReceiptHTML(t);
            Modal.show('Receipt', '', { customHtml: d });
        };
        list.appendChild(item);
    });
}

// ============ 9.5 CUSTOMER APPLICATIONS MANAGEMENT ============
let currentFilter = 'all';

function renderApplications(filter = currentFilter) {
    currentFilter = filter;
    const list = $('applications-list');
    if (!list) return;

    // Get applications (transactions that have documents or are pending)
    let applications = DB.transactions.filter(t =>
        t.documents && Object.keys(t.documents).length > 0 ||
        t.status === 'Pending' ||
        t.status === 'Documents Verified'
    );

    // Apply filter
    if (filter !== 'all') {
        applications = applications.filter(t => t.status === filter);
    }

    if (applications.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem;">No applications found.</p>';
        return;
    }

    list.innerHTML = '';
    applications.forEach(app => {
        const card = document.createElement('div');
        card.className = 'application-card';

        // Determine status class
        let statusClass = 'status-pending-review';
        if (app.status === 'Documents Verified') statusClass = 'status-documents-verified';
        if (app.status === 'Done') statusClass = 'status-done';

        // Build documents HTML
        let documentsHtml = '';
        if (app.documents && Object.keys(app.documents).length > 0) {
            const docItems = Object.entries(app.documents).map(([key, doc]) => {
                const docName = key.replace('DOC_', '');
                return `<div class="document-item has-file" onclick="viewDocument('${app.receiptId}', '${key}')">${docName}</div>`;
            }).join('');
            documentsHtml = `
                <div class="documents-section">
                    <h5>📁 Uploaded Documents (Click to View)</h5>
                    <div class="document-list">${docItems}</div>
                </div>`;
        }

        // Build details grid
        let detailsHtml = '';
        if (app.details && Object.keys(app.details).length > 0) {
            const detailItems = Object.entries(app.details)
                .filter(([key]) => !key.startsWith('DOC_'))
                .map(([key, value]) => `<div class="detail-item"><label>${key}</label><span>${value}</span></div>`)
                .join('');
            detailsHtml = `<div class="details-grid">${detailItems}</div>`;
        }

        // Action buttons based on status
        let actionsHtml = '';
        if (app.status === 'Pending') {
            actionsHtml = `
                <button class="btn-status btn-verify" onclick="updateApplicationStatus('${app.receiptId}', 'Documents Verified')">✓ Mark Documents Verified</button>
                <button class="btn-status btn-complete" onclick="updateApplicationStatus('${app.receiptId}', 'Done')">✓ Complete Application</button>`;
        } else if (app.status === 'Documents Verified') {
            actionsHtml = `
                <button class="btn-status btn-complete" onclick="updateApplicationStatus('${app.receiptId}', 'Done')">✓ Complete Application</button>
                <button class="btn-status" onclick="updateApplicationStatus('${app.receiptId}', 'Pending')">↩ Back to Pending</button>`;
        } else if (app.status === 'Done') {
            actionsHtml = `<button class="btn-status" onclick="viewReceipt('${app.receiptId}')">📄 View Receipt</button>`;
        }

        card.innerHTML = `
            <div class="application-header">
                <div class="application-info">
                    <h4>${app.serviceName}</h4>
                    <p>${app.customerName} | ${app.customerMobile || 'N/A'} | ${app.date}</p>
                    <p style="font-size:0.75rem;color:var(--accent-primary);">Receipt: ${app.receiptId}</p>
                </div>
                <span class="application-status ${statusClass}">${app.status}</span>
            </div>
            ${detailsHtml}
            ${documentsHtml}
            <div class="application-actions">${actionsHtml}</div>
        `;

        list.appendChild(card);
    });

    // Update filter button states
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`filter-${filter === 'all' ? 'all' : filter.toLowerCase().replace(' ', '-')}`);
    if (activeBtn) activeBtn.classList.add('active');
}

function filterApplications(status) {
    currentFilter = status;
    renderApplications(status);
}

function updateApplicationStatus(receiptId, newStatus) {
    const txn = DB.transactions.find(t => t.receiptId === receiptId);
    if (txn) {
        txn.status = newStatus;
        saveDB();
        renderApplications();
        updateDailyStats();
        Modal.alert('Status Updated', `Application ${receiptId} marked as "${newStatus}"`);
    }
}

function viewDocument(receiptId, docKey) {
    const txn = DB.transactions.find(t => t.receiptId === receiptId);
    if (!txn || !txn.documents || !txn.documents[docKey]) {
        Modal.alert('Error', 'Document not found');
        return;
    }

    const doc = txn.documents[docKey];
    const docName = docKey.replace('DOC_', '');

    const container = document.createElement('div');
    container.style.textAlign = 'center';

    if (doc.type.startsWith('image/')) {
        container.innerHTML = `
            <h4 style="margin-bottom:1rem;color:var(--accent-primary);">${docName}</h4>
            <img src="${doc.data}" alt="${docName}" class="document-preview" style="max-width:100%;max-height:60vh;border-radius:8px;">
            <p style="margin-top:1rem;color:var(--text-muted);font-size:0.8rem;">File: ${doc.name} | Size: ${(doc.size / 1024).toFixed(1)} KB</p>
            <a href="${doc.data}" download="${doc.name}" class="btn-primary" style="display:inline-block;margin-top:1rem;text-decoration:none;">📥 Download</a>
        `;
    } else if (doc.type === 'application/pdf') {
        container.innerHTML = `
            <h4 style="margin-bottom:1rem;color:var(--accent-primary);">${docName}</h4>
            <iframe src="${doc.data}" style="width:100%;height:60vh;border:none;border-radius:8px;"></iframe>
            <p style="margin-top:1rem;color:var(--text-muted);font-size:0.8rem;">File: ${doc.name} | Size: ${(doc.size / 1024).toFixed(1)} KB</p>
            <a href="${doc.data}" download="${doc.name}" class="btn-primary" style="display:inline-block;margin-top:1rem;text-decoration:none;">📥 Download</a>
        `;
    } else {
        container.innerHTML = `
            <h4 style="margin-bottom:1rem;color:var(--accent-primary);">${docName}</h4>
            <p>File: ${doc.name}</p>
            <p style="color:var(--text-muted);">Size: ${(doc.size / 1024).toFixed(1)} KB</p>
            <a href="${doc.data}" download="${doc.name}" class="btn-primary" style="display:inline-block;margin-top:1rem;text-decoration:none;">📥 Download File</a>
        `;
    }

    Modal.show('Document Preview', '', { customHtml: container });
}

function viewReceipt(receiptId) {
    const txn = DB.transactions.find(t => t.receiptId === receiptId);
    if (txn) {
        const container = document.createElement('div');
        container.innerHTML = generateReceiptHTML(txn);
        Modal.show('Receipt', '', { customHtml: container });
    }
}

// ============ 10. ADMIN PANEL (BOSS-ONLY ACCESS) ============
// OWNER CREDENTIALS - Only the boss should know this!
const BOSS_ID = 'BOSS';
const BOSS_PASSWORD = 'owner123';

async function showAdminPanel() {
    // First, verify Boss credentials
    const authContainer = document.createElement('div');
    authContainer.innerHTML = `
        <div style="margin-bottom:1rem;">
            <p style="color:var(--text-muted);margin-bottom:1rem;">⚠️ This section is restricted to the Owner only.</p>
            <div class="input-group">
                <label class="input-label">Boss ID</label>
                <input type="text" id="boss-id-input" class="input-field" placeholder="Enter Boss ID">
            </div>
            <div class="input-group">
                <label class="input-label">Boss Password</label>
                <input type="password" id="boss-pass-input" class="input-field" placeholder="Enter Password">
            </div>
        </div>
    `;

    const authResult = await Modal.show('🔒 Admin Authentication', 'Enter Owner Credentials', {
        showCancel: true,
        customHtml: authContainer,
        onConfirm: () => {
            const enteredId = authContainer.querySelector('#boss-id-input').value.trim();
            const enteredPass = authContainer.querySelector('#boss-pass-input').value.trim();

            if (enteredId === BOSS_ID && enteredPass === BOSS_PASSWORD) {
                return true;
            } else {
                Modal.alert('Access Denied', 'Invalid Boss credentials. Contact the owner.');
                return false;
            }
        }
    });

    if (!authResult) return;

    // Show admin panel with tabs
    const container = document.createElement('div');
    container.style.maxHeight = '70vh';
    container.style.overflowY = 'auto';

    const promo = DB.promoBanner || {};
    const bankSvc = DB.bankAccountService || {};

    container.innerHTML = `
        <style>
            .admin-tabs { display:flex; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap; }
            .admin-tab { padding:0.5rem 1rem; border:1px solid var(--glass-border); border-radius:8px; cursor:pointer; background:transparent; color:var(--text-muted); transition:all 0.2s; }
            .admin-tab:hover { border-color:var(--accent-primary); color:var(--accent-primary); }
            .admin-tab.active { background:var(--accent-primary); border-color:var(--accent-primary); color:white; }
            .admin-section { display:none; }
            .admin-section.active { display:block; }
            .admin-card { padding:1rem; border:1px solid var(--glass-border); border-radius:8px; margin-bottom:1rem; background:rgba(0,0,0,0.2); }
            .admin-card h5 { color:var(--accent-secondary); margin-bottom:0.75rem; }
            .feature-row { display:flex; gap:0.5rem; margin-bottom:0.5rem; align-items:center; }
            .input-row { display:flex; gap:0.5rem; margin-bottom:0.5rem; align-items:center; flex-wrap:wrap; }
        </style>
        
        <div class="admin-tabs">
            <button class="admin-tab active" data-tab="general">🔐 General</button>
            <button class="admin-tab" data-tab="services">🛠️ Services</button>
            <button class="admin-tab" data-tab="promo">📢 Promo Banner</button>
            <button class="admin-tab" data-tab="bankaccount">🏦 Bank Account</button>
        </div>
        
        <!-- GENERAL TAB -->
        <div id="tab-general" class="admin-section active">
            <div class="admin-card">
                <h5>Staff Login PIN</h5>
                <input type="text" id="admin-pin-input" class="input-field" value="${DB.staffPin}" placeholder="Staff PIN">
            </div>
        </div>

        <!-- SERVICES TAB -->
        <div id="tab-services" class="admin-section">
            <div id="admin-services-container"></div>
            <div class="admin-card" style="border-style:dashed; border-color:var(--accent-primary);">
                <h5>➕ Add New Service</h5>
                <div class="input-row">
                    <input type="text" id="new-svc-icon" class="input-field" placeholder="Icon" style="width:60px;">
                    <input type="text" id="new-svc-name" class="input-field" placeholder="Service Name" style="flex:1;">
                    <input type="number" id="new-svc-fee" class="input-field" placeholder="Fee" style="width:80px;">
                    <button type="button" id="btn-add-service" class="btn-primary">Add</button>
                </div>
            </div>
        </div>
        
        <!-- PROMO BANNER TAB -->
        <div id="tab-promo" class="admin-section">
            <div class="admin-card">
                <h5>Banner Settings</h5>
                <div class="input-group">
                    <label class="input-label">Enable Banner</label>
                    <select id="promo-enabled" class="input-field">
                        <option value="true" ${promo.enabled !== false ? 'selected' : ''}>Enabled</option>
                        <option value="false" ${promo.enabled === false ? 'selected' : ''}>Disabled</option>
                    </select>
                </div>
                <div class="input-group">
                    <label class="input-label">Banner Title</label>
                    <input type="text" id="promo-title" class="input-field" value="${promo.title || ''}">
                </div>
                <div class="input-group">
                    <label class="input-label">Banner Subtitle</label>
                    <textarea id="promo-subtitle" class="input-field" rows="2">${promo.subtitle || ''}</textarea>
                </div>
                <div class="input-group">
                    <label class="input-label">Button Text</label>
                    <input type="text" id="promo-button" class="input-field" value="${promo.buttonText || ''}">
                </div>
            </div>
            <div class="admin-card">
                <h5>Features List (one per line)</h5>
                <textarea id="promo-features" class="input-field" rows="6" placeholder="Zero Balance Account&#10;Free Debit Card&#10;...">${(promo.features || []).join('\n')}</textarea>
            </div>
        </div>
        
        <!-- BANK ACCOUNT SERVICE TAB -->
        <div id="tab-bankaccount" class="admin-section">
            <div class="admin-card">
                <h5>Service Details</h5>
                <div class="input-row">
                    <input type="text" id="bank-icon" class="input-field" value="${bankSvc.icon || '🏦'}" style="width:60px;">
                    <input type="text" id="bank-name" class="input-field" value="${bankSvc.name || 'Bank Account Opening'}" style="flex:1;">
                    <span style="color:var(--text-muted);">₹</span>
                    <input type="number" id="bank-fee" class="input-field" value="${bankSvc.baseFee || 0}" style="width:80px;">
                </div>
            </div>
            <div class="admin-card">
                <h5>Required Documents (one per line)</h5>
                <textarea id="bank-documents" class="input-field" rows="4">${(bankSvc.documents || []).join('\n')}</textarea>
            </div>
            <div class="admin-card">
                <h5>Input Fields</h5>
                <div id="bank-inputs-container"></div>
                <button type="button" id="btn-add-bank-input" class="btn-secondary" style="margin-top:0.5rem;">+ Add Field</button>
            </div>
        </div>
    `;

    // Tab switching logic
    container.querySelectorAll('.admin-tab').forEach(tab => {
        tab.onclick = () => {
            container.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            container.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            tab.classList.add('active');
            container.querySelector(`#tab-${tab.dataset.tab}`).classList.add('active');
        };
    });

    // Render services
    const servicesContainer = container.querySelector('#admin-services-container');
    DB.services.forEach((svc, i) => {
        const card = document.createElement('div');
        card.className = 'admin-card';
        card.dataset.index = i;
        card.innerHTML = `
            <div class="input-row">
                <input type="text" class="input-field svc-icon" value="${svc.icon}" style="width:50px;">
                <input type="text" class="input-field svc-name" value="${svc.name}" style="flex:1;">
                <span style="color:var(--text-muted);">₹</span>
                <input type="number" class="input-field svc-fee" value="${svc.baseFee}" style="width:70px;">
                <button type="button" class="btn-secondary btn-edit-svc" style="padding:0.4rem 0.6rem;font-size:0.8rem;">✏️ Edit</button>
                <button type="button" class="btn-secondary btn-delete-svc" style="padding:0.4rem 0.6rem;font-size:0.8rem;color:#f43f5e;">🗑️</button>
            </div>
        `;

        // Edit service button
        card.querySelector('.btn-edit-svc').onclick = () => editServiceDetails(svc, i);

        // Delete service button
        card.querySelector('.btn-delete-svc').onclick = async () => {
            const confirm = await Modal.show('Delete Service?', `Are you sure you want to delete "${svc.name}"?`, { showCancel: true });
            if (confirm) {
                DB.services.splice(i, 1);
                saveDB();
                Modal.alert('Deleted', `${svc.name} has been removed.`);
                initStaffDashboard();
            }
        };

        servicesContainer.appendChild(card);
    });

    // Render bank account inputs
    renderBankInputs(container);

    // Add bank input button
    container.querySelector('#btn-add-bank-input').onclick = () => {
        if (!DB.bankAccountService.inputs) DB.bankAccountService.inputs = [];
        DB.bankAccountService.inputs.push({ label: 'New Field', type: 'text' });
        renderBankInputs(container);
    };

    // Add Service Button
    container.querySelector('#btn-add-service').onclick = () => {
        const icon = container.querySelector('#new-svc-icon').value.trim() || '📦';
        const name = container.querySelector('#new-svc-name').value.trim();
        const fee = parseFloat(container.querySelector('#new-svc-fee').value) || 0;
        if (!name) { Modal.alert('Error', 'Please enter a service name.'); return; }

        const newService = {
            id: 'custom-' + Date.now(),
            name: name,
            baseFee: fee,
            icon: icon,
            documents: [],
            inputs: [{ label: 'Customer Name', type: 'text' }, { label: 'Details', type: 'text' }]
        };
        DB.services.push(newService);
        saveDB();
        Modal.alert('Service Added', `${name} has been added successfully!`);
        initStaffDashboard();
    };

    await Modal.show('⚙️ Admin Settings', 'Configure all features below.', {
        showCancel: true,
        customHtml: container,
        onConfirm: () => {
            // Save General
            const newPin = container.querySelector('#admin-pin-input').value.trim();
            if (newPin) DB.staffPin = newPin;

            // Save Services
            const svcCards = container.querySelectorAll('#admin-services-container .admin-card');
            svcCards.forEach(card => {
                const idx = parseInt(card.dataset.index);
                if (DB.services[idx]) {
                    DB.services[idx].icon = card.querySelector('.svc-icon').value.trim() || '📦';
                    DB.services[idx].name = card.querySelector('.svc-name').value.trim();
                    DB.services[idx].baseFee = parseFloat(card.querySelector('.svc-fee').value) || 0;
                }
            });

            // Save Promo Banner
            DB.promoBanner = {
                enabled: container.querySelector('#promo-enabled').value === 'true',
                title: container.querySelector('#promo-title').value.trim(),
                subtitle: container.querySelector('#promo-subtitle').value.trim(),
                buttonText: container.querySelector('#promo-button').value.trim(),
                features: container.querySelector('#promo-features').value.split('\n').map(f => f.trim()).filter(f => f)
            };

            // Save Bank Account Service
            DB.bankAccountService.icon = container.querySelector('#bank-icon').value.trim() || '🏦';
            DB.bankAccountService.name = container.querySelector('#bank-name').value.trim();
            DB.bankAccountService.baseFee = parseFloat(container.querySelector('#bank-fee').value) || 0;
            DB.bankAccountService.documents = container.querySelector('#bank-documents').value.split('\n').map(d => d.trim()).filter(d => d);

            // Save bank inputs
            const inputRows = container.querySelectorAll('.bank-input-row');
            DB.bankAccountService.inputs = [];
            inputRows.forEach(row => {
                const label = row.querySelector('.bank-input-label').value.trim();
                const type = row.querySelector('.bank-input-type').value;
                if (label) DB.bankAccountService.inputs.push({ label, type });
            });

            saveDB();
            initStaffDashboard();
            return true;
        }
    });
}

// Render bank account input fields in admin panel
function renderBankInputs(container) {
    const inputsContainer = container.querySelector('#bank-inputs-container');
    inputsContainer.innerHTML = '';

    const inputs = DB.bankAccountService?.inputs || [];
    inputs.forEach((input, i) => {
        const row = document.createElement('div');
        row.className = 'input-row bank-input-row';
        row.innerHTML = `
            <input type="text" class="input-field bank-input-label" value="${input.label}" placeholder="Field Label" style="flex:1;">
            <select class="input-field bank-input-type" style="width:100px;">
                <option value="text" ${input.type === 'text' ? 'selected' : ''}>Text</option>
                <option value="number" ${input.type === 'number' ? 'selected' : ''}>Number</option>
                <option value="date" ${input.type === 'date' ? 'selected' : ''}>Date</option>
                <option value="email" ${input.type === 'email' ? 'selected' : ''}>Email</option>
                <option value="tel" ${input.type === 'tel' ? 'selected' : ''}>Phone</option>
            </select>
            <button type="button" class="btn-secondary btn-remove-input" style="padding:0.4rem;color:#f43f5e;">🗑️</button>
        `;
        row.querySelector('.btn-remove-input').onclick = () => {
            DB.bankAccountService.inputs.splice(i, 1);
            renderBankInputs(container);
        };
        inputsContainer.appendChild(row);
    });
}

// Edit service details (documents and inputs)
async function editServiceDetails(svc, index) {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="admin-card" style="background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:8px;padding:1rem;margin-bottom:1rem;">
            <h5 style="color:var(--accent-secondary);margin-bottom:0.75rem;">📋 Required Documents</h5>
            <textarea id="edit-svc-docs" class="input-field" rows="4" placeholder="One document per line">${(svc.documents || []).join('\n')}</textarea>
        </div>
        <div class="admin-card" style="background:rgba(0,0,0,0.2);border:1px solid var(--glass-border);border-radius:8px;padding:1rem;">
            <h5 style="color:var(--accent-secondary);margin-bottom:0.75rem;">📝 Input Fields</h5>
            <div id="edit-svc-inputs"></div>
            <button type="button" id="btn-add-svc-input" class="btn-secondary" style="margin-top:0.5rem;">+ Add Field</button>
        </div>
    `;

    const inputsContainer = container.querySelector('#edit-svc-inputs');
    let tempInputs = JSON.parse(JSON.stringify(svc.inputs || []));

    function renderInputs() {
        inputsContainer.innerHTML = '';
        tempInputs.forEach((input, i) => {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:0.5rem;align-items:center;';
            row.innerHTML = `
                <input type="text" class="input-field" value="${input.label}" style="flex:1;">
                <select class="input-field" style="width:100px;">
                    <option value="text" ${input.type === 'text' ? 'selected' : ''}>Text</option>
                    <option value="number" ${input.type === 'number' ? 'selected' : ''}>Number</option>
                    <option value="date" ${input.type === 'date' ? 'selected' : ''}>Date</option>
                    <option value="email" ${input.type === 'email' ? 'selected' : ''}>Email</option>
                    <option value="tel" ${input.type === 'tel' ? 'selected' : ''}>Phone</option>
                </select>
                <button type="button" class="btn-secondary" style="padding:0.4rem;color:#f43f5e;">🗑️</button>
            `;
            row.querySelector('input').oninput = e => tempInputs[i].label = e.target.value;
            row.querySelector('select').onchange = e => tempInputs[i].type = e.target.value;
            row.querySelector('button').onclick = () => { tempInputs.splice(i, 1); renderInputs(); };
            inputsContainer.appendChild(row);
        });
    }
    renderInputs();

    container.querySelector('#btn-add-svc-input').onclick = () => {
        tempInputs.push({ label: 'New Field', type: 'text' });
        renderInputs();
    };

    const result = await Modal.show(`Edit: ${svc.name}`, 'Configure documents and input fields', {
        showCancel: true,
        customHtml: container,
        onConfirm: () => {
            const docs = container.querySelector('#edit-svc-docs').value.split('\n').map(d => d.trim()).filter(d => d);
            return { documents: docs, inputs: tempInputs };
        }
    });

    if (result) {
        DB.services[index].documents = result.documents;
        DB.services[index].inputs = result.inputs;
        saveDB();
        Modal.alert('Saved', `${svc.name} has been updated.`);
    }
}

// ============ 11. UTILITY ============
function generateSingleReceiptHTML(record, copyType) {
    const copyLabel = copyType === 'shop' ? '📋 SHOP COPY' : '📄 CUSTOMER COPY';
    const copyClass = copyType === 'shop' ? 'shop-copy' : 'customer-copy';

    return `
        <div class="receipt-card ${copyClass}">
            <div class="receipt-copy-label">${copyLabel}</div>
            
            <!-- Shop Header with Logo -->
            <div class="receipt-header">
                <div class="receipt-logo">${SHOP_CONFIG.logo}</div>
                <h3 class="receipt-shop-name">${SHOP_CONFIG.name}</h3>
                <p class="receipt-slogan">${SHOP_CONFIG.slogan}</p>
                <p class="receipt-address">${SHOP_CONFIG.address}</p>
                <p class="receipt-contact">📞 ${SHOP_CONFIG.phone} | ✉️ ${SHOP_CONFIG.email}</p>
            </div>
            
            <!-- Receipt Info -->
            <div class="receipt-info-section">
                <div class="receipt-row"><span>Receipt No:</span><span class="receipt-highlight">#${record.receiptId}</span></div>
                <div class="receipt-row"><span>Date:</span><span>${record.date} ${record.time || ''}</span></div>
                <div class="receipt-row"><span>Serial No:</span><span>${record.customerSerial || 'N/A'}</span></div>
            </div>
            
            <!-- Customer Details -->
            <div class="receipt-customer-section">
                <h4>Customer Details</h4>
                <div class="receipt-row"><span>Name:</span><span>${record.customerName}</span></div>
                <div class="receipt-row"><span>Mobile:</span><span>${record.customerMobile || 'N/A'}</span></div>
                ${record.accountNumber ? `<div class="receipt-row"><span>Account No:</span><span>${record.accountNumber}</span></div>` : ''}
            </div>
            
            <!-- Service Details -->
            <div class="receipt-service-section">
                <h4>Service Details</h4>
                <div class="receipt-row"><span>Service:</span><span>${record.serviceName}</span></div>
                ${record.amount > 0 ? `<div class="receipt-row"><span>Amount:</span><span>₹${record.amount.toFixed(2)}</span></div>` : ''}
                <div class="receipt-row"><span>Service Charges:</span><span>₹${(record.fee || 0).toFixed(2)}</span></div>
            </div>
            
            <!-- Total -->
            <div class="receipt-total-section">
                <div class="receipt-row receipt-total"><span>TOTAL PAID:</span><span>₹${record.total.toFixed(2)}</span></div>
            </div>
            
            <!-- Status -->
            <div class="receipt-status ${record.status === 'Done' ? 'status-done' : 'status-pending'}">${record.status}</div>
            
            <!-- Footer -->
            <div class="receipt-footer">
                <p>Thank you for choosing ${SHOP_CONFIG.name}!</p>
                <p class="receipt-tracking">Track your receipt at: <strong>${record.receiptId}</strong></p>
            </div>
        </div>`;
}

function generateReceiptHTML(record) {
    return `
        <div class="receipt-container">
            <div class="receipt-actions">
                <button onclick="generatePDF('${record.receiptId}', 'shop')" class="btn-print btn-pdf">📥 Download Shop Copy (PDF)</button>
                <button onclick="generatePDF('${record.receiptId}', 'customer')" class="btn-print btn-pdf">📥 Download Customer Copy (PDF)</button>
                <button onclick="generatePDF('${record.receiptId}', 'both')" class="btn-print btn-print-both btn-pdf">📥 Download Both Copies (PDF)</button>
            </div>
            <div class="receipt-dual-view">
                ${generateSingleReceiptHTML(record, 'shop')}
                ${generateSingleReceiptHTML(record, 'customer')}
            </div>
        </div>`;
}

// ============ PDF GENERATION SYSTEM ============
// Store reference to current receipt for PDF generation
let currentReceiptRecord = null;

function setCurrentReceipt(record) {
    currentReceiptRecord = record;
}

// Generate PDF Receipt using jsPDF
function generatePDF(receiptId, copyType) {
    const { jsPDF } = window.jspdf;

    // Find the record
    const record = DB.transactions.find(t => t.receiptId === receiptId) || currentReceiptRecord;
    if (!record) {
        Modal.alert('Error', 'Receipt not found!');
        return;
    }

    const copies = copyType === 'both' ? ['shop', 'customer'] : [copyType];

    copies.forEach((type, index) => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 200] // Receipt paper size (80mm width)
        });

        const pageWidth = 80;
        let y = 10;
        const leftMargin = 5;
        const rightMargin = pageWidth - 5;

        // Copy Label
        doc.setFillColor(type === 'shop' ? '#fef3c7' : '#dbeafe');
        doc.rect(leftMargin, y - 3, pageWidth - 10, 8, 'F');
        doc.setFontSize(9);
        doc.setTextColor(type === 'shop' ? '#92400e' : '#1e40af');
        doc.text(type === 'shop' ? 'SHOP COPY' : 'CUSTOMER COPY', pageWidth / 2, y + 2, { align: 'center' });
        y += 12;

        // Logo/Header
        doc.setTextColor('#1e293b');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(SHOP_CONFIG.name, pageWidth / 2, y, { align: 'center' });
        y += 5;

        // Slogan
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor('#64748b');
        doc.text(SHOP_CONFIG.slogan, pageWidth / 2, y, { align: 'center' });
        y += 5;

        // Address
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        const addressLines = doc.splitTextToSize(SHOP_CONFIG.address, pageWidth - 15);
        addressLines.forEach(line => {
            doc.text(line, pageWidth / 2, y, { align: 'center' });
            y += 3;
        });

        // Contact
        doc.setFontSize(6);
        doc.text(`Ph: ${SHOP_CONFIG.phone}`, pageWidth / 2, y, { align: 'center' });
        y += 3;
        doc.text(`Email: ${SHOP_CONFIG.email}`, pageWidth / 2, y, { align: 'center' });
        y += 5;

        // Dashed line
        doc.setDrawColor('#94a3b8');
        doc.setLineDashPattern([1, 1], 0);
        doc.line(leftMargin, y, rightMargin, y);
        y += 5;

        // Receipt Info Section
        doc.setTextColor('#1e293b');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Receipt No:', leftMargin, y);
        doc.setTextColor('#6366f1');
        doc.text(`#${record.receiptId}`, rightMargin, y, { align: 'right' });
        y += 4;

        doc.setTextColor('#1e293b');
        doc.text('Date:', leftMargin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${record.date} ${record.time || ''}`, rightMargin, y, { align: 'right' });
        y += 4;

        doc.setFont('helvetica', 'bold');
        doc.text('Serial No:', leftMargin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(record.customerSerial || 'N/A', rightMargin, y, { align: 'right' });
        y += 5;

        // Dashed line
        doc.line(leftMargin, y, rightMargin, y);
        y += 5;

        // Customer Details
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor('#64748b');
        doc.text('CUSTOMER DETAILS', leftMargin, y);
        y += 4;

        doc.setTextColor('#1e293b');
        doc.setFontSize(8);
        doc.text('Name:', leftMargin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(record.customerName || 'N/A', rightMargin, y, { align: 'right' });
        y += 4;

        doc.setFont('helvetica', 'bold');
        doc.text('Mobile:', leftMargin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(record.customerMobile || 'N/A', rightMargin, y, { align: 'right' });
        y += 4;

        if (record.accountNumber) {
            doc.setFont('helvetica', 'bold');
            doc.text('Account No:', leftMargin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(record.accountNumber, rightMargin, y, { align: 'right' });
            y += 4;
        }
        y += 2;

        // Dashed line
        doc.line(leftMargin, y, rightMargin, y);
        y += 5;

        // Service Details
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor('#64748b');
        doc.text('SERVICE DETAILS', leftMargin, y);
        y += 4;

        doc.setTextColor('#1e293b');
        doc.setFontSize(8);
        doc.text('Service:', leftMargin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(record.serviceName, rightMargin, y, { align: 'right' });
        y += 4;

        if (record.amount > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Amount:', leftMargin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(`Rs.${record.amount.toFixed(2)}`, rightMargin, y, { align: 'right' });
            y += 4;
        }

        doc.setFont('helvetica', 'bold');
        doc.text('Service Charges:', leftMargin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`Rs.${(record.fee || 0).toFixed(2)}`, rightMargin, y, { align: 'right' });
        y += 5;

        // Double dashed line for total
        doc.setLineDashPattern([2, 1], 0);
        doc.line(leftMargin, y, rightMargin, y);
        y += 5;

        // Total
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor('#10b981');
        doc.text('TOTAL PAID:', leftMargin, y);
        doc.text(`Rs.${record.total.toFixed(2)}`, rightMargin, y, { align: 'right' });
        y += 6;

        // Status
        const statusColor = record.status === 'Done' ? '#166534' : '#d97706';
        const statusBg = record.status === 'Done' ? '#dcfce7' : '#fef3c7';
        doc.setFillColor(statusBg);
        doc.rect(leftMargin + 10, y - 3, pageWidth - 30, 7, 'F');
        doc.setTextColor(statusColor);
        doc.setFontSize(9);
        doc.text(record.status.toUpperCase(), pageWidth / 2, y + 1, { align: 'center' });
        y += 10;

        // Footer
        doc.setLineDashPattern([1, 1], 0);
        doc.line(leftMargin, y, rightMargin, y);
        y += 5;

        doc.setTextColor('#64748b');
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text(`Thank you for choosing ${SHOP_CONFIG.name}!`, pageWidth / 2, y, { align: 'center' });
        y += 3;
        doc.text(`Track your receipt: ${record.receiptId}`, pageWidth / 2, y, { align: 'center' });

        // Save PDF
        const filename = `${record.receiptId}_${type}_copy.pdf`;

        // Store PDF data in localStorage for future access
        const pdfData = doc.output('datauristring');
        storePDFReceipt(record.receiptId, type, pdfData);

        // Download the PDF
        doc.save(filename);
    });

    if (copyType === 'both') {
        Modal.alert('PDF Downloaded', 'Both Shop and Customer copies have been saved as PDF files.');
    }
}

// Store PDF in localStorage for persistent access
function storePDFReceipt(receiptId, copyType, pdfData) {
    const key = `receipt_pdf_${receiptId}_${copyType}`;
    try {
        localStorage.setItem(key, pdfData);
    } catch (e) {
        console.warn('Could not store PDF in localStorage:', e);
    }
}

// Retrieve stored PDF
function getStoredPDF(receiptId, copyType) {
    const key = `receipt_pdf_${receiptId}_${copyType}`;
    return localStorage.getItem(key);
}

// View/Download previously stored PDF
function viewStoredReceipt(receiptId, copyType = 'customer') {
    const storedPDF = getStoredPDF(receiptId, copyType);

    if (storedPDF) {
        // Open stored PDF in new window
        const newWindow = window.open();
        newWindow.document.write(`<iframe width="100%" height="100%" src="${storedPDF}"></iframe>`);
    } else {
        // Generate new PDF if not stored
        generatePDF(receiptId, copyType);
    }
}

// Re-download receipt from transaction history
function redownloadReceipt(receiptId) {
    const record = DB.transactions.find(t => t.receiptId === receiptId);
    if (record) {
        // Find if we have a stored PDF
        const stored = getStoredPDF(receiptId, 'customer');
        if (stored) {
            viewStoredReceipt(receiptId, 'customer');
        } else {
            generatePDF(receiptId, 'customer');
        }
    }
}

// ============ 12. SUPABASE INTEGRATION ============
let supabaseClient = null;

function initSupabase() {
    const SUPABASE_URL = 'https://pgvbysfldujvfgoytbja.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_xeBmpXfU78WBYb66NF4Rcw_EvQRAWEX';

    if (SUPABASE_URL && SUPABASE_KEY) {
        try {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("Supabase Client Initialized with Hardcoded Credentials");

            // Connection Test
            supabaseClient.from('transactions').select('count', { count: 'exact', head: true })
                .then(({ error }) => {
                    if (error) Modal.alert('Cloud Error', 'Failed to connect: ' + error.message);
                    else Modal.alert('Cloud Connected', 'Successfully connected to database!');
                });

            // Realtime Subscription
            supabaseClient
                .channel('transactions')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, payload => {
                    console.log('New transaction received!', payload.new);
                    // Avoid duplicates
                    if (!DB.transactions.find(t => t.receiptId === payload.new.receiptId)) {
                        DB.transactions.unshift(payload.new);
                        saveDB();
                        if (!header.classList.contains('hidden') && $('staff-view') && !$('staff-view').classList.contains('hidden')) {
                            updateDailyStats();
                            renderTransactionHistory();
                            renderApplications();
                            Modal.alert('New Application', `New request from ${payload.new.customerName}`);
                        }
                    }
                })
                .subscribe();

        } catch (e) {
            console.error("Supabase Init Error:", e);
            Modal.alert('Init Error', e.message);
        }
    }
}

// Initialize on Load
// Initialize on Load
// (Moved initSupabase call to main event listener below)

// ============ 12. EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded', () => {
    // Role switcher
    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            roleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.dataset.role === 'staff') {
                staffLoginForm.classList.remove('hidden');
                customerLoginContainer.classList.add('hidden');
            } else {
                staffLoginForm.classList.add('hidden');
                customerLoginContainer.classList.remove('hidden');
            }
        });
    });

    staffLoginForm.addEventListener('submit', handleStaffLogin);
    customerTrackForm.addEventListener('submit', handleCustomerTrack);
    googleLoginBtn.addEventListener('click', handleGoogleLogin);
    logoutBtn.addEventListener('click', logout); // FIXED: Logout button now works

    switchView('login');
    initSupabase();
});
