
    const ENDPOINTS = [
      { id: 'signup', method: 'POST', path: '/signup', authRequired: false, roleRequired: null, description: 'Register a new user account context.', bodyFields: ['email', 'password'], mockResponse: { success: true, message: "User registered successfully" } },
      { id: 'signin', method: 'POST', path: '/signin', authRequired: false, roleRequired: null, description: 'Authenticate user and receive session cookies.', bodyFields: ['email', 'password'], mockResponse: (inputs) => ({ cookies: ['accessToken=mock_token', 'refreshToken=mock_token'], data: { user_id: "usr_9482", email: inputs.email || "user@example.com", role: inputs.email?.includes('admin') ? 'admin' : 'user' } }) },
      { id: 'me', method: 'GET', path: '/me', authRequired: true, roleRequired: null, description: 'Fetch current authenticated user details from req.user context.', mockResponse: (auth) => auth ? { data: auth } : { error: "Unauthorized" } },
      { id: 'refresh', method: 'POST', path: '/refresh-token', authRequired: true, roleRequired: null, description: 'Refresh the current access token using the refresh cookie.', mockResponse: { success: true, message: "access token refreshed" } },
      { id: 'revoke', method: 'PATCH', path: '/refresh-token/revoke/:user_id', authRequired: true, roleRequired: 'admin', description: 'Revoke target user refresh tokens. Requires Admin privileges.', paramFields: ['user_id'], mockResponse: { success: true } },
      { id: 'signout', method: 'POST', path: '/signout', authRequired: true, roleRequired: null, description: 'Clear authentication cookies and terminate session.', mockResponse: { success: true } },
      { id: 'delete', method: 'DELETE', path: '/delete', authRequired: true, roleRequired: null, description: 'Permanently delete the authenticated user profile.', mockResponse: { success: true } }
    ];

    let activeTab = ENDPOINTS[0];
    let currentUser = null;

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
          <span class="${isAdmin ? 'role-badge-admin' : 'role-badge-user'}">
            ${currentUser.role}
          </span>
          <button id="clear-session-btn" class="clear-session-btn">Clear</button>
        `;
        // Setup listener dynamically to avoid inline layout CSP violation
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
          ${ep.roleRequired ? `<span class="role-badge-admin" style="font-size: 9px;">${ep.roleRequired}</span>` : ''}
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
          div.innerHTML = `
            <label class="input-label"><span>:${field}</span><span class="field-tag params">params</span></label>
            <input type="text" data-field="${field}" placeholder="usr_9482" class="form-input">
          `;
          wrapper.appendChild(div);
        });

        ep.bodyFields?.forEach(field => {
          const div = document.createElement('div');
          div.className = "input-field-block";
          div.innerHTML = `
            <label class="input-label"><span>${field}</span><span class="field-tag body">body</span></label>
            <input type="${field === 'password' ? 'password' : 'text'}" data-field="${field}" placeholder="${field === 'email' ? 'admin@app.com or user@app.com' : 'values'}" class="form-input">
          `;
          wrapper.appendChild(div);
        });
      } else {
        paramContainer.classList.add('hidden');
      }
    }

    function handleExecute() {
      if (activeTab.authRequired && !currentUser) {
        renderTerminal(401, 'Unauthorized', { error: "Authentication required for this route." });
        return;
      }

      if (activeTab.roleRequired && currentUser?.role !== activeTab.roleRequired) {
        renderTerminal(403, 'Forbidden', { error: `Requires role: ${activeTab.roleRequired}` });
        return;
      }

      // Collect inputs safely
      const inputs = {};
      document.querySelectorAll('#inputs-wrapper input').forEach(input => {
        inputs[input.getAttribute('data-field')] = input.value;
      });

      let responseBody = typeof activeTab.mockResponse === 'function' 
        ? activeTab.mockResponse(activeTab.id === 'signin' ? inputs : currentUser)
        : activeTab.mockResponse;

      if (activeTab.id === 'signin') {
        currentUser = responseBody.data;
        updateSessionUI();
      } else if (activeTab.id === 'signout' || activeTab.id === 'delete') {
        currentUser = null;
        updateSessionUI();
      }

      renderTerminal(200, 'OK', responseBody);
    }

    function renderTerminal(status, statusMsg, body) {
      const statusWrapper = document.getElementById('response-status-wrapper');
      const indicator = document.getElementById('status-indicator');
      const statusText = document.getElementById('response-status');
      const responseBlock = document.getElementById('response-block');

      statusWrapper.classList.remove('hidden');
      statusText.innerText = `${status} ${statusMsg}`;
      
      if (status === 200) {
        indicator.className = "terminal-indicator ok";
        statusText.className = "terminal-status-text ok";
      } else {
        indicator.className = "terminal-indicator err";
        statusText.className = "terminal-status-text err";
      }

      responseBlock.className = "";
      responseBlock.innerText = JSON.stringify(body, null, 2);
    }

    // Modern Secure Listener Assignment
    document.getElementById('execute-btn').addEventListener('click', handleExecute);

    // Initialize App
    selectEndpoint(ENDPOINTS[0]);
    updateSessionUI();
  