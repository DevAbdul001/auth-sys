// Local In-Memory Operational State Simulation
const VALID_CREDENTIALS = {
  'admin@app.com': { password: 'admin@app', data: { user_id: 'usr_8831', email: 'admin@app.com', role: 'admin' } },
  'user@app.com': { password: 'user@app', data: { user_id: 'usr_4742', email: 'user@app.com', role: 'user' } }
};

const VALID_REVOKE_TARGET = 'usr_9482';

// Utility helper to return a randomized 16-character cryptographic hex string
function generateMockHexToken() {
  const chars = '0123456789abcdef';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars[Math.floor(Math.random() * 16)];
  }
  return token;
}

const ENDPOINTS = [
  { 
    id: 'signup', 
    method: 'POST', 
    path: '/signup', 
    authRequired: false, 
    roleRequired: null, 
    description: 'Register a new user account context within the security layer.', 
    bodyFields: ['email', 'password'],
    instructions: 'Sign up using admin@app.com (pass: admin@app) or user@app.com (pass: user@app) to seed the playground session flow.',
    mockResponse: (inputs) => {
      // Captures the signed up data dynamically to pass seamlessly to the next stage
      const email = inputs.email || 'user@app.com';
      const role = email.includes('admin') ? 'admin' : 'user';
      
      // Seed dynamically into our validation tree so they can log in next
      VALID_CREDENTIALS[email] = {
        password: inputs.password || 'password',
        data: { user_id: `usr_${Math.floor(1000 + Math.random() * 9000)}`, email, role }
      };

      return {
        status: 201,
        statusText: 'Created',
        body: { success: true, message: `User profile [${email}] instantiated successfully via constraint drivers.` }
      };
    }
  },
  { 
    id: 'signin', 
    method: 'POST', 
    path: '/signin', 
    authRequired: false, 
    roleRequired: null, 
    description: 'Authenticate identities to generate HttpOnly JWT tokens.', 
    bodyFields: ['email', 'password'], 
    instructions: 'Sign in with the identity you registered. Use admin@app.com or user@app.com. Bad inputs throw strict 401 hooks.',
    mockResponse: (inputs) => {
      const target = VALID_CREDENTIALS[inputs.email];
      if (target && target.password === inputs.password) {
        return {
          status: 200,
          statusText: 'OK',
          body: { 
            cookies: [`accessToken=eyJhbGciOi.${generateMockHexToken()}`, `refreshToken=${generateMockHexToken()}`], 
            data: target.data 
          }
        };
      }
      return {
        status: 401,
        statusText: 'Unauthorized',
        body: { error: "Invalid credentials. Database authentication verification loop failed." }
      };
    }
  },
  { 
  id: 'me', 
  method: 'GET', 
  path: '/me', 
  authRequired: true, 
  roleRequired: null, 
  description: 'Fetch current authenticated context structures from req.user payloads.', 
  instructions: 'Active login state sequence validation required. Evaluates structural session token authenticity.',
  mockResponse: (auth) => {
    return {
      status: 200,
      statusText: 'OK',
      body: { data: auth }
    };
  }
},
  { 
    id: 'refresh', 
    method: 'POST', 
    path: '/refresh-token', 
    authRequired: true, 
    roleRequired: null, 
    description: 'Rotate active validation scopes using stored refresh key hashes.', 
    instructions: 'Exchanges high-order token signatures without requesting complete user validation steps.',
    mockResponse: () => ({
      status: 200,
      statusText: 'OK',
      body: { success: true, accessToken: `eyJhbGciOi.${generateMockHexToken()}`, message: "Access signature payload rotated cleanly." }
    })
  },
  { 
    id: 'revoke', 
    method: 'PATCH', 
    path: '/refresh-token/revoke/:user_id', 
    authRequired: true, 
    roleRequired: 'admin', 
    description: 'Invalidate operational session ranges. Requires Admin privileges.', 
    paramFields: ['user_id'], 
    instructions: 'Target payload pre-set: usr_9482. Modifying this target parameter triggers a 404 lookup error failure.',
    mockResponse: (inputs) => {
      if (inputs.user_id === VALID_REVOKE_TARGET) {
        return { status: 200, statusText: 'OK', body: { success: true, token_cleared_hash: generateMockHexToken(), message: `Session tree for context ${VALID_REVOKE_TARGET} terminated.` } };
      }
      return { status: 404, statusText: 'Not Found', body: { error: "Target relational table entity not found for specified user_id reference." } };
    }
  },
  { 
    id: 'signout', 
    method: 'POST', 
    path: '/signout', 
    authRequired: true, 
    roleRequired: null, 
    description: 'Clear client session cookies and tear down memory access pointers.', 
    instructions: 'Drops credentials and flips context properties back to a baseline Guest configuration state.',
    mockResponse: { success: true } 
  },
  { 
    id: 'delete', 
    method: 'DELETE', 
    path: '/delete', 
    authRequired: true, 
    roleRequired: null, 
    description: 'Purge user row definitions and trigger structural schema constraint cascades.', 
    instructions: 'Snares relational profile rows and unlinks constraints across junction setups cleanly.',
    mockResponse: { success: true } 
  }
];

let activeTab = ENDPOINTS[0];
let currentUser = null;
let lastRegisteredEmail = 'admin@app.com'; // Keeps track of the workflow context between tabs

function getMethodClass(method) {
  switch (method) {
    case 'POST': return 'method-post';
    case 'GET': return 'method-get';
    case 'PATCH': return 'method-patch';
    case 'DELETE': return 'method-delete';
    default: return '';
  }
}

function updateSessionUI() {
  const wrapper = document.getElementById('session-status');
  if (currentUser) {
    const isAdmin = currentUser.role === 'admin';
    wrapper.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.375rem;">
        <span class="status-dot active"></span>
        <span style="color: #e4e4e7; font-weight: 500;">${currentUser.email}</span>
      </div>
      <span class="${isAdmin ? 'role-badge-admin' : 'role-badge-user'}">${currentUser.role}</span>
      <button id="clear-session-btn" class="clear-session-btn">Clear</button>
    `;
    document.getElementById('clear-session-btn').addEventListener('click', clearSession);
  } else {
    wrapper.innerHTML = `<span class="status-dot guest"></span><span>Guest Context</span>`;
  }
  renderWarnings();
}

function clearSession() {
  currentUser = null;
  updateSessionUI();
  document.getElementById('response-status-wrapper').classList.add('hidden');
  const responseBlock = document.getElementById('response-block');
  responseBlock.className = "terminal-placeholder";
  responseBlock.innerText = "No active logs. Execute query.";
}

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = '<div class="section-title">Router Endpoints</div>';
  
  ENDPOINTS.forEach(ep => {
    const isActive = activeTab.id === ep.id;
    const btn = document.createElement('button');
    btn.className = `nav-btn ${isActive ? 'active' : ''}`;
    
    btn.innerHTML = `
      <div class="nav-btn-meta">
        <span class="method-badge ${getMethodClass(ep.method)}">${ep.method}</span>
        <span class="endpoint-path">${ep.path}</span>
      </div>
      ${ep.roleRequired ? `<span class="role-badge-admin">${ep.roleRequired}</span>` : ''}
    `;
    
    btn.addEventListener('click', () => selectEndpoint(ep));
    sidebar.appendChild(btn);
  });
}

function renderWarnings() {
  const authNotice = document.getElementById('auth-notice');
  const roleNotice = document.getElementById('role-notice');

  if (activeTab.authRequired && !currentUser) authNotice.classList.remove('hidden');
  else authNotice.classList.add('hidden');

  if (activeTab.roleRequired === 'admin' && currentUser && currentUser.role !== 'admin') roleNotice.classList.remove('hidden');
  else roleNotice.classList.add('hidden');
}

function selectEndpoint(ep) {
  activeTab = ep;
  renderSidebar();
  
  const methodBadge = document.getElementById('endpoint-method');
  methodBadge.className = `method-badge ${getMethodClass(ep.method)}`;
  methodBadge.innerText = ep.method;
  
  document.getElementById('endpoint-path').innerText = ep.path;
  document.getElementById('endpoint-description').innerText = ep.description;
  document.getElementById('endpoint-instructions').innerText = ep.instructions;

  renderWarnings();

  const paramContainer = document.getElementById('param-container');
  const wrapper = document.getElementById('inputs-wrapper');
  wrapper.innerHTML = '';

  const hasParams = ep.paramFields && ep.paramFields.length > 0;
  const hasBody = ep.bodyFields && ep.bodyFields.length > 0;

  if (hasParams || hasBody) {
    paramContainer.classList.remove('hidden');
    
    ep.paramFields?.forEach(field => {
      const div = document.createElement('div');
      div.className = "input-field-block";
      let defaultVal = ep.id === 'revoke' && field === 'user_id' ? VALID_REVOKE_TARGET : '';
      div.innerHTML = `
        <label class="input-label"><span>:${field}</span><span class="field-tag params">params</span></label>
        <input type="text" data-field="${field}" value="${defaultVal}" class="form-input">
      `;
      wrapper.appendChild(div);
    });

    ep.bodyFields?.forEach(field => {
      const div = document.createElement('div');
      div.className = "input-field-block";
      
      let defaultVal = '';
      if (ep.id === 'signup') {
        defaultVal = field === 'email' ? 'admin@app.com' : 'admin@app';
      } else if (ep.id === 'signin') {
        // Automatically references whatever email context was loaded/read on signup tab
        defaultVal = field === 'email' ? lastRegisteredEmail : (VALID_CREDENTIALS[lastRegisteredEmail]?.password || 'admin@app');
      }
      
      div.innerHTML = `
        <label class="input-label"><span>${field}</span><span class="field-tag body">body</span></label>
        <input type="${field === 'password' ? 'password' : 'text'}" data-field="${field}" value="${defaultVal}" class="form-input">
      `;
      wrapper.appendChild(div);
    });
  } else {
    paramContainer.classList.add('hidden');
  }
}

function handleExecute() {
  if (activeTab.authRequired && !currentUser) {
    renderTerminal(401, 'Unauthorized', { error: "Authentication missing. Token parsing failed inside server middleware verification blocks." });
    return;
  }

  if (activeTab.roleRequired && currentUser?.role !== activeTab.roleRequired) {
    renderTerminal(403, 'Forbidden', { error: `Access Denied. Role assertion constraints requires tier level: ${activeTab.roleRequired}` });
    return;
  }

  const inputs = {};
  document.querySelectorAll('#inputs-wrapper input').forEach(input => {
    inputs[input.getAttribute('data-field')] = input.value;
  });

  // Track what email was processed on signup/signin tabs to chain fields
  if (inputs.email) {
    lastRegisteredEmail = inputs.email;
  }

  let response;
  if (typeof activeTab.mockResponse === 'function') {
    response = activeTab.mockResponse(activeTab.id === 'signin' || activeTab.id === 'signup' || activeTab.id === 'revoke' ? inputs : currentUser);
  } else {
    response = { status: 200, statusText: 'OK', body: activeTab.mockResponse };
  }

  if (activeTab.id === 'signin' && response.status === 200) {
    currentUser = response.body.data;
    updateSessionUI();
  } else if ((activeTab.id === 'signout' || activeTab.id === 'delete') && response.status === 200) {
    currentUser = null;
    updateSessionUI();
  }

  renderTerminal(response.status, response.statusText, response.body);
}

function renderTerminal(status, statusMsg, body) {
  const statusWrapper = document.getElementById('response-status-wrapper');
  const indicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('response-status');
  const responseBlock = document.getElementById('response-block');

  statusWrapper.classList.remove('hidden');
  statusText.innerText = `${status} ${statusMsg}`;
  
  if (status === 200 || status === 201) {
    indicator.className = "terminal-indicator ok";
    statusText.className = "terminal-status-text ok";
  } else {
    indicator.className = "terminal-indicator err";
    statusText.className = "terminal-status-text err";
  }

  responseBlock.className = "";
  responseBlock.innerText = JSON.stringify(body, null, 2);
}

document.getElementById('execute-btn').addEventListener('click', handleExecute);
selectEndpoint(ENDPOINTS[0]);
updateSessionUI();