  <script>
   // Sample Data
        let users = [
            {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                phone: '0712345678',
                address: '123 Main St, Nairobi'
            }
        // Sample Data
        let users = [
            {
        ];
        
        let pets = [
            {
                id: '1',
                ownerId: '1',
                name: 'Max',
                type: 'dog',
                breed: 'German Shepherd',
                age: 3
            },
            {
                id: '2',
                ownerId: '1',
                name: 'Whiskers',
                type: 'cat',
                breed: 'Siamese',
                age: 2
            }
        ];
        
        let appointments = [
            {
                id: '1',
                ownerId: '1',
                petId: '1',
                date: '2023-06-15',
                time: '10:00',
                purpose: 'checkup',
                notes: 'Annual wellness exam',
                status: 'upcoming'
            }
        ];
        
        let vaccinations = [
            {
                id: '1',
                petId: '1',
                name: 'Rabies',
                lastGiven: '2023-01-15',
                nextDue: '2024-01-15',
                status: 'upcoming'
            }
        ];
        
        // Password reset data
        let passwordResetTokens = [];
        let emailQueue = []; // Simulates sending emails
        
        // Load data from localStorage if available
        function loadFromLocalStorage() {
            const savedUsers = localStorage.getItem('petCareUsers');
            const savedPets = localStorage.getItem('petCarePets');
            const savedAppointments = localStorage.getItem('petCareAppointments');
            const savedVaccinations = localStorage.getItem('petCareVaccinations');
            const savedTokens = localStorage.getItem('petCareResetTokens');
            
            if (savedUsers) users = JSON.parse(savedUsers);
            if (savedPets) pets = JSON.parse(savedPets);
            if (savedAppointments) appointments = JSON.parse(savedAppointments);
            if (savedVaccinations) vaccinations = JSON.parse(savedVaccinations);
            if (savedTokens) passwordResetTokens = JSON.parse(savedTokens);
        }
        
        // Save data to localStorage
        function saveToLocalStorage() {
            localStorage.setItem('petCareUsers', JSON.stringify(users));
            localStorage.setItem('petCarePets', JSON.stringify(pets));
            localStorage.setItem('petCareAppointments', JSON.stringify(appointments));
            localStorage.setItem('petCareVaccinations', JSON.stringify(vaccinations));
            localStorage.setItem('petCareResetTokens', JSON.stringify(passwordResetTokens));
        }
        
        // DOM Elements
        const loginModal = document.getElementById('login-modal');
        const loginBtn = document.getElementById('login-btn');
        const mobileLoginBtn = document.getElementById('mobile-login-btn');
        const closeBtns = document.querySelectorAll('.close-btn');
        const registerLink = document.getElementById('register-link');
        const dashboard = document.getElementById('dashboard');
        const dashboardLinks = {
            overview: document.getElementById('dashboard-overview'),
            pets: document.getElementById('dashboard-pets'),
            appointments: document.getElementById('dashboard-appointments'),
            vaccinations: document.getElementById('dashboard-vaccinations'),
            profile: document.getElementById('dashboard-profile'),
            logout: document.getElementById('dashboard-logout')
        };
        const dashboardSections = {
            overview: document.getElementById('overview-section'),
            pets: document.getElementById('pets-section'),
            appointments: document.getElementById('appointments-section'),
            vaccinations: document.getElementById('vaccinations-section'),
            profile: document.getElementById('profile-section')
        };
        const petModal = document.getElementById('pet-modal');
        const addPetBtn = document.getElementById('add-pet-btn');
        const petForm = document.getElementById('pet-form');
        const appointmentModal = document.getElementById('appointment-modal');
        const addAppointmentBtn = document.getElementById('add-appointment-btn');
        const newAppointmentBtn = document.getElementById('new-appointment-btn');
        const appointmentForm = document.getElementById('appointment-form');
        const appointmentPetSelect = document.getElementById('appointment-pet');
        const profileForm = document.getElementById('profile-form');
        const bookAppointmentBtn = document.getElementById('book-appointment-btn');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const passwordToggle = document.getElementById('password-toggle');
        const loginPassword = document.getElementById('login-password');
        const registerPasswordToggle = document.getElementById('register-password-toggle');
        const registerConfirmPasswordToggle = document.getElementById('register-confirm-password-toggle');
        const registerPassword = document.getElementById('register-password');
        const registerConfirmPassword = document.getElementById('register-confirm-password');
        const toast = document.getElementById('toast');
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Password reset elements
        const forgotPasswordLink = document.getElementById('forgot-password-link');
        const forgotPasswordModal = document.getElementById('forgot-password-modal');
        const resetConfirmationModal = document.getElementById('reset-confirmation-modal');
        const resetTokenModal = document.getElementById('reset-token-modal');
        const newPasswordModal = document.getElementById('new-password-modal');
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        const resetTokenForm = document.getElementById('reset-token-form');
        const newPasswordForm = document.getElementById('new-password-form');
        const backToLoginLink = document.getElementById('back-to-login');
        const closeResetConfirmationBtn = document.getElementById('close-reset-confirmation');
        const resendTokenLink = document.getElementById('resend-token');
        
        // Current User
        let currentUser = null;
        
        // Initialize the app
        function init() {
            // Load data from localStorage
            loadFromLocalStorage();
            
            // Check if user is logged in
            const loggedInUserId = localStorage.getItem('petCareUserId');
            if (loggedInUserId) {
                currentUser = users.find(user => user.id === loggedInUserId);
                if (currentUser) {
                    showDashboard();
                    loadDashboardData();
                }
            }
            
            // Set up event listeners
            setupEventListeners();
            
            // Set minimum date for appointment date picker to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('appointment-date').min = today;
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Login button
            loginBtn.addEventListener('click', () => {
                loginModal.classList.add('active');
            });
            
            // Mobile login button
            mobileLoginBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                loginModal.classList.add('active');
            });
            
            // Book appointment button
            bookAppointmentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentUser) {
                    openAppointmentModal();
                } else {
                    loginModal.classList.add('active');
                    showToast('Please login to book an appointment', 'warning');
                }
            });
            
            // Close buttons
            closeBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    loginModal.classList.remove('active');
                    petModal.classList.remove('active');
                    appointmentModal.classList.remove('active');
                    forgotPasswordModal.classList.remove('active');
                    resetTokenModal.classList.remove('active');
                    newPasswordModal.classList.remove('active');
                    resetConfirmationModal.classList.remove('active');
                });
            });
            
            // Dashboard navigation
            Object.keys(dashboardLinks).forEach(key => {
                dashboardLinks[key].addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    if (key === 'logout') {
                        logout();
                        return;
                    }
                    
                    // Hide all sections
                    Object.values(dashboardSections).forEach(section => {
                        section.style.display = 'none';
                    });
                    
                    // Show selected section
                    dashboardSections[key].style.display = 'block';
                    
                    // Update active link
                    document.querySelector('.sidebar-menu a.active').classList.remove('active');
                    dashboardLinks[key].classList.add('active');
                    
                    // Load data for the section
                    if (key === 'pets') {
                        loadPets();
                    } else if (key === 'appointments') {
                        loadAppointments();
                    } else if (key === 'vaccinations') {
                        loadVaccinations();
                    } else if (key === 'profile') {
                        loadProfile();
                    }
                });
            });
            
            // Add pet button
            addPetBtn.addEventListener('click', () => {
                document.getElementById('pet-form').reset();
                document.querySelector('#pet-modal .modal-header h3').textContent = 'Add New Pet';
                document.getElementById('pet-btn-text').textContent = 'Save';
                delete petForm.dataset.editId;
                petModal.classList.add('active');
            });
            
            // Add appointment buttons
            addAppointmentBtn.addEventListener('click', openAppointmentModal);
            newAppointmentBtn.addEventListener('click', openAppointmentModal);
            
            // Form submissions
            petForm.addEventListener('submit', handlePetFormSubmit);
            appointmentForm.addEventListener('submit', handleAppointmentFormSubmit);
            profileForm.addEventListener('submit', handleProfileFormSubmit);
            
            // Login form submission
            document.getElementById('login-form').addEventListener('submit', handleLogin);
            
            // Registration form submission
            document.getElementById('register-form').addEventListener('submit', handleRegister);
            
            // Mobile menu toggle
            mobileMenuBtn.addEventListener('click', toggleMobileMenu);
            
            // Password visibility toggle
            passwordToggle.addEventListener('click', togglePasswordVisibility);
            registerPasswordToggle.addEventListener('click', () => togglePasswordVisibility(registerPassword, registerPasswordToggle));
            registerConfirmPasswordToggle.addEventListener('click', () => togglePasswordVisibility(registerConfirmPassword, registerConfirmPasswordToggle));
            
            // Tab switching
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.getAttribute('data-tab');
                    switchTab(tabId);
                });
            });
            
            // Close mobile menu when clicking a link
            document.querySelectorAll('#mobile-menu .nav-links a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                });
            });
            
            // Password reset event listeners
            setupPasswordResetListeners();
        }
        
        // Set up password reset event listeners
        function setupPasswordResetListeners() {
            // Forgot password event listeners
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                loginModal.classList.remove('active');
                forgotPasswordModal.classList.add('active');
            });
            
            backToLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                forgotPasswordModal.classList.remove('active');
                loginModal.classList.add('active');
            });
            
            closeResetConfirmationBtn.addEventListener('click', () => {
                resetConfirmationModal.classList.remove('active');
                loginModal.classList.add('active');
            });
            
            resendTokenLink.addEventListener('click', (e) => {
                e.preventDefault();
                const email = document.getElementById('reset-email').value;
                if (email) {
                    sendResetToken(email);
                }
            });
            
            // Handle token input navigation
            document.querySelectorAll('.token-input').forEach(input => {
                input.addEventListener('input', function() {
                    if (this.value.length === 1) {
                        const nextIndex = parseInt(this.dataset.index) + 1;
                        const nextInput = document.querySelector(`.token-input[data-index="${nextIndex}"]`);
                        if (nextInput) nextInput.focus();
                    }
                    updateFullToken();
                });
                
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Backspace' && this.value.length === 0) {
                        const prevIndex = parseInt(this.dataset.index) - 1;
                        const prevInput = document.querySelector(`.token-input[data-index="${prevIndex}"]`);
                        if (prevInput) prevInput.focus();
                    }
                    updateFullToken();
                });
            });
            
            // Handle forgot password form submission
            forgotPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = document.getElementById('reset-email').value.trim();
                
                // Validation
                if (!email) {
                    showToast('Please enter your email address', 'error');
                    return;
                }
                
                // Show loading state
                const resetBtnText = document.getElementById('reset-btn-text');
                const resetSpinner = document.getElementById('reset-spinner');
                resetBtnText.style.display = 'none';
                resetSpinner.style.display = 'inline-block';
                
                // Check if email exists
                setTimeout(() => {
                    const userExists = users.some(user => user.email === email);
                    
                    if (userExists) {
                        sendResetToken(email);
                        forgotPasswordModal.classList.remove('active');
                        resetTokenModal.classList.add('active');
                    } else {
                        showToast('No account found with that email address', 'error');
                    }
                    
                    // Reset loading state
                    resetBtnText.style.display = 'inline-block';
                    resetSpinner.style.display = 'none';
                }, 1000);
            });
            
            // Handle token verification form submission
            resetTokenForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const token = document.getElementById('full-token').value;
                const email = document.getElementById('reset-email').value;
                
                // Show loading state
                const verifyTokenText = document.getElementById('verify-token-text');
                const verifyTokenSpinner = document.getElementById('verify-token-spinner');
                verifyTokenText.style.display = 'none';
                verifyTokenSpinner.style.display = 'inline-block';
                
                // Verify token
                setTimeout(() => {
                    const tokenRecord = passwordResetTokens.find(t => 
                        t.email === email && t.token === token && t.expires > Date.now()
                    );
                    
                    if (tokenRecord) {
                        // Token is valid
                        document.getElementById('reset-user-id').value = tokenRecord.userId;
                        resetTokenModal.classList.remove('active');
                        newPasswordModal.classList.add('active');
                    } else {
                        showToast('Invalid or expired verification code', 'error');
                    }
                    
                    // Reset loading state
                    verifyTokenText.style.display = 'inline-block';
                    verifyTokenSpinner.style.display = 'none';
                }, 800);
            });
            
            // Handle new password form submission
            newPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const userId = document.getElementById('reset-user-id').value;
                const newPassword = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-new-password').value;
                
                // Validation
                if (newPassword.length < 6) {
                    showToast('Password must be at least 6 characters', 'error');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    showToast('Passwords do not match', 'error');
                    return;
                }
                
                // Show loading state
                const newPasswordBtnText = document.getElementById('new-password-btn-text');
                const newPasswordSpinner = document.getElementById('new-password-spinner');
                newPasswordBtnText.style.display = 'none';
                newPasswordSpinner.style.display = 'inline-block';
                
                // Update password
                setTimeout(() => {
                    const userIndex = users.findIndex(u => u.id === userId);
                    if (userIndex !== -1) {
                        users[userIndex].password = newPassword;
                        saveToLocalStorage();
                        
                        // Remove used tokens for this user
                        passwordResetTokens = passwordResetTokens.filter(t => t.userId !== userId);
                        
                        newPasswordModal.classList.remove('active');
                        resetConfirmationModal.classList.add('active');
                    } else {
                        showToast('Error updating password', 'error');
                    }
                    
                    // Reset loading state
                    newPasswordBtnText.style.display = 'inline-block';
                    newPasswordSpinner.style.display = 'none';
                }, 800);
            });
            
            // Password toggle for new password fields
            document.getElementById('new-password-toggle').addEventListener('click', () => {
                togglePasswordVisibility(document.getElementById('new-password'), document.getElementById('new-password-toggle'));
            });
            
            document.getElementById('confirm-new-password-toggle').addEventListener('click', () => {
                togglePasswordVisibility(document.getElementById('confirm-new-password'), document.getElementById('confirm-new-password-toggle'));
            });
            
            // Close modals when clicking outside
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    loginModal.classList.remove('active');
                    petModal.classList.remove('active');
                    appointmentModal.classList.remove('active');
                    forgotPasswordModal.classList.remove('active');
                    resetTokenModal.classList.remove('active');
                    newPasswordModal.classList.remove('active');
                    resetConfirmationModal.classList.remove('active');
                }
            });
        }
        
        // Helper function to update the full token from individual inputs
        function updateFullToken() {
            const tokenInputs = document.querySelectorAll('.token-input');
            let fullToken = '';
            tokenInputs.forEach(input => {
                fullToken += input.value;
            });
            document.getElementById('full-token').value = fullToken;
        }
        
        // Function to generate and send reset token
        function sendResetToken(email) {
            // Generate a 6-digit token
            const token = Math.floor(100000 + Math.random() * 900000).toString();
            const userId = users.find(u => u.email === email)?.id;
            
            if (!userId) return;
            
            // Create token record (expires in 1 hour)
            const tokenRecord = {
                email,
                userId,
                token,
                expires: Date.now() + 3600000 // 1 hour
            };
            
            // Remove any existing tokens for this user
            passwordResetTokens = passwordResetTokens.filter(t => t.userId !== userId);
            passwordResetTokens.push(tokenRecord);
            saveToLocalStorage();
            
            // In a real app, you would send an email here
            // For simulation, we'll just log it and add to our email queue
            const emailContent = {
                to: email,
                subject: 'Password Reset Request',
                body: `Your password reset code is: ${token}\n\nThis code will expire in 1 hour.`
            };
            
            emailQueue.push(emailContent);
            console.log('Password reset email sent:', emailContent);
            
            showToast('Reset code sent to your email', 'success');
        }
        
        // Switch between login and register tabs
        function switchTab(tabId) {
            tabs.forEach(tab => {
                if (tab.getAttribute('data-tab') === tabId) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
            tabContents.forEach(content => {
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        }
        
        // Toggle mobile menu
        function toggleMobileMenu() {
            mobileMenu.classList.toggle('active');
            mobileMenuBtn.innerHTML = mobileMenu.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        }
        
        // Toggle password visibility
        function togglePasswordVisibility(inputElement = loginPassword, toggleElement = passwordToggle) {
            const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
            inputElement.setAttribute('type', type);
            toggleElement.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
        }
        
        // Show dashboard
        function showDashboard() {
            document.querySelector('header').style.display = 'none';
            document.querySelectorAll('section').forEach(section => {
                section.style.display = 'none';
            });
            document.querySelector('footer').style.display = 'none';
            dashboard.style.display = 'block';
        }
        
        // Load dashboard data
        function loadDashboardData() {
            if (!currentUser) return;
            
            // Set user name
            document.getElementById('user-name').textContent = currentUser.name;
            
            // Count pets
            const userPets = pets.filter(pet => pet.ownerId === currentUser.id);
            document.getElementById('pet-count').textContent = userPets.length;
            
            // Count upcoming appointments
            const today = new Date();
            const upcomingAppts = appointments.filter(appt => {
                return appt.ownerId === currentUser.id && new Date(appt.date) >= today;
            });
            document.getElementById('upcoming-appointments').textContent = upcomingAppts.length;
            
            // Count due vaccinations
            const dueVaccs = vaccinations.filter(vacc => {
                const pet = pets.find(p => p.id === vacc.petId);
                return pet && pet.ownerId === currentUser.id && new Date(vacc.nextDue) >= today;
            });
            document.getElementById('due-vaccinations').textContent = dueVaccs.length;
            
            // Load recent appointments
            loadRecentAppointments();
        }
        
        // Load recent appointments
        function loadRecentAppointments() {
            const table = document.getElementById('appointments-table');
            table.innerHTML = '';
            
            const userAppts = appointments
                .filter(appt => appt.ownerId === currentUser.id)
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5);
            
            if (userAppts.length === 0) {
                table.innerHTML = '<tr><td colspan="5" style="text-align: center;">No upcoming appointments</td></tr>';
                return;
            }
            
            userAppts.forEach(appt => {
                const pet = pets.find(p => p.id === appt.petId);
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${formatDate(appt.date)}</td>
                    <td>${formatTime(appt.time)}</td>
                    <td>${pet ? pet.name : 'Unknown'}</td>
                    <td>${getAppointmentPurpose(appt.purpose)}</td>
                    <td><span class="badge ${getAppointmentStatusClass(appt.date)}">${getAppointmentStatus(appt.date)}</span></td>
                `;
                
                table.appendChild(row);
            });
        }
        
        // Load all pets
        function loadPets() {
            const table = document.getElementById('pets-list');
            table.innerHTML = '';
            
            const userPets = pets.filter(pet => pet.ownerId === currentUser.id);
            
            if (userPets.length === 0) {
                table.innerHTML = '<tr><td colspan="5" style="text-align: center;">No pets registered</td></tr>';
                return;
            }
            
            userPets.forEach(pet => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${pet.name}</td>
                    <td>${capitalizeFirstLetter(pet.type)}</td>
                    <td>${pet.breed || '-'}</td>
                    <td>${pet.age || '-'}</td>
                    <td>
                        <button class="btn btn-sm" onclick="editPet('${pet.id}')">Edit</button>
                        <button class="btn btn-sm" style="background-color: var(--danger);" onclick="deletePet('${pet.id}')">Delete</button>
                    </td>
                `;
                
                table.appendChild(row);
            });
        }
        
        // Load all appointments
        function loadAppointments() {
            const table = document.getElementById('all-appointments-table');
            table.innerHTML = '';
            
            const userAppts = appointments
                .filter(appt => appt.ownerId === currentUser.id)
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            if (userAppts.length === 0) {
                table.innerHTML = '<tr><td colspan="6" style="text-align: center;">No appointments scheduled</td></tr>';
                return;
            }
            
            userAppts.forEach(appt => {
                const pet = pets.find(p => p.id === appt.petId);
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${formatDate(appt.date)}</td>
                    <td>${formatTime(appt.time)}</td>
                    <td>${pet ? pet.name : 'Unknown'}</td>
                    <td>${getAppointmentPurpose(appt.purpose)}</td>
                    <td><span class="badge ${getAppointmentStatusClass(appt.date)}">${getAppointmentStatus(appt.date)}</span></td>
                    <td>
                        <button class="btn btn-sm" onclick="editAppointment('${appt.id}')">Edit</button>
                        <button class="btn btn-sm" style="background-color: var(--danger);" onclick="deleteAppointment('${appt.id}')">Delete</button>
                    </td>
                `;
                
                table.appendChild(row);
            });
        }
        
        // Load all vaccinations
        function loadVaccinations() {
            const table = document.getElementById('all-vaccinations-table');
            table.innerHTML = '';
            
            const userVaccs = vaccinations.filter(vacc => {
                const pet = pets.find(p => p.id === vacc.petId);
                return pet && pet.ownerId === currentUser.id;
            }).sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));
            
            if (userVaccs.length === 0) {
                table.innerHTML = '<tr><td colspan="5" style="text-align: center;">No vaccination records</td></tr>';
                return;
            }
            
            userVaccs.forEach(vacc => {
                const pet = pets.find(p => p.id === vacc.petId);
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${pet ? pet.name : 'Unknown'}</td>
                    <td>${vacc.name}</td>
                    <td>${formatDate(vacc.lastGiven)}</td>
                    <td>${formatDate(vacc.nextDue)}</td>
                    <td><span class="badge ${getVaccinationStatusClass(vacc.nextDue)}">${getVaccinationStatus(vacc.nextDue)}</span></td>
                `;
                
                table.appendChild(row);
            });
        }
        
        // Load profile data
        function loadProfile() {
            if (!currentUser) return;
            
            document.getElementById('profile-name-input').value = currentUser.name;
            document.getElementById('profile-email-input').value = currentUser.email;
            document.getElementById('profile-phone-input').value = currentUser.phone || '';
            document.getElementById('profile-address-input').value = currentUser.address || '';
        }
        
        // Open appointment modal
        function openAppointmentModal() {
            // Reset form
            appointmentForm.reset();
            document.querySelector('#appointment-modal .modal-header h3').textContent = 'Book Appointment';
            document.getElementById('appointment-btn-text').textContent = 'Book Appointment';
            delete appointmentForm.dataset.editId;
            
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('appointment-date').valueAsDate = tomorrow;
            
            // Set default time to 10:00 AM
            document.getElementById('appointment-time').value = '10:00';
            
            // Populate pet dropdown
            appointmentPetSelect.innerHTML = '<option value="">Select Pet</option>';
            const userPets = pets.filter(pet => pet.ownerId === currentUser.id);
            
            if (userPets.length === 0) {
                showToast('Please add a pet first', 'warning');
                petModal.classList.add('active');
                appointmentModal.classList.remove('active');
                return;
            }
            
            userPets.forEach(pet => {
                const option = document.createElement('option');
                option.value = pet.id;
                option.textContent = pet.name;
                appointmentPetSelect.appendChild(option);
            });
            
            // Show modal
            appointmentModal.classList.add('active');
        }
        
        // Handle login
        function handleLogin(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Simple validation
            if (!email || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            // Show loading state
            const loginBtnText = document.getElementById('login-btn-text');
            const loginSpinner = document.getElementById('login-spinner');
            loginBtnText.style.display = 'none';
            loginSpinner.style.display = 'inline-block';
            
            // Simulate API call
            setTimeout(() => {
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    currentUser = user;
                    localStorage.setItem('petCareUserId', user.id);
                    showDashboard();
                    loadDashboardData();
                    loginModal.classList.remove('active');
                    showToast('Login successful', 'success');
                } else {
                    showToast('Invalid email or password', 'error');
                }
                
                // Reset loading state
                loginBtnText.style.display = 'inline-block';
                loginSpinner.style.display = 'none';
            }, 1000);
        }
        
        // Handle registration
        function handleRegister(e) {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const phone = document.getElementById('register-phone').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Validation
            if (!name || !email || !password || !confirmPassword) {
                showToast('Please fill in all required fields', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            // Check if email already exists
            if (users.some(user => user.email === email)) {
                showToast('Email already registered', 'error');
                return;
            }
            
            // Show loading state
            const registerBtnText = document.getElementById('register-btn-text');
            const registerSpinner = document.getElementById('register-spinner');
            registerBtnText.style.display = 'none';
            registerSpinner.style.display = 'inline-block';
            
            // Create new user
            setTimeout(() => {
                const newUser = {
                    id: generateId(),
                    name,
                    email,
                    password,
                    phone: phone || undefined,
                    address: undefined
                };
                
                users.push(newUser);
                saveToLocalStorage();
                
                // Auto-login the new user
                currentUser = newUser;
                localStorage.setItem('petCareUserId', newUser.id);
                showDashboard();
                loadDashboardData();
                loginModal.classList.remove('active');
                showToast('Registration successful!', 'success');
                
                // Reset loading state
                registerBtnText.style.display = 'inline-block';
                registerSpinner.style.display = 'none';
            }, 1000);
        }
        
        // Handle pet form submission
        function handlePetFormSubmit(e) {
            e.preventDefault();
            
            const name = document.getElementById('pet-name').value.trim();
            const type = document.getElementById('pet-type').value;
            const breed = document.getElementById('pet-breed').value.trim();
            const age = document.getElementById('pet-age').value;
            const isEdit = petForm.dataset.editId;
            
            // Validation
            if (!name) {
                showToast('Please enter pet name', 'error');
                return;
            }
            
            if (!type) {
                showToast('Please select pet type', 'error');
                return;
            }
            
            // Show loading state
            const petBtnText = document.getElementById('pet-btn-text');
            const petSpinner = document.getElementById('pet-spinner');
            petBtnText.style.display = 'none';
            petSpinner.style.display = 'inline-block';
            
            // Add/update pet
            setTimeout(() => {
                if (isEdit) {
                    // Update existing pet
                    const petIndex = pets.findIndex(p => p.id === petForm.dataset.editId);
                    if (petIndex !== -1) {
                        pets[petIndex] = {
                            ...pets[petIndex],
                            name,
                            type,
                            breed: breed || undefined,
                            age: age ? parseFloat(age) : undefined
                        };
                        showToast('Pet updated successfully', 'success');
                    }
                } else {
                    // Add new pet
                    const newPet = {
                        id: generateId(),
                        ownerId: currentUser.id,
                        name,
                        type,
                        breed: breed || undefined,
                        age: age ? parseFloat(age) : undefined
                    };
                    pets.push(newPet);
                    showToast('Pet added successfully', 'success');
                }
                
                saveToLocalStorage();
                
                // Close modal and refresh pets list
                petModal.classList.remove('active');
                loadPets();
                loadDashboardData();
                
                // Reset loading state
                petBtnText.style.display = 'inline-block';
                petSpinner.style.display = 'none';
            }, 800);
        }
        
        // Handle appointment form submission
        function handleAppointmentFormSubmit(e) {
            e.preventDefault();
            
            const petId = document.getElementById('appointment-pet').value;
            const date = document.getElementById('appointment-date').value;
            const time = document.getElementById('appointment-time').value;
            const purpose = document.getElementById('appointment-purpose').value;
            const notes = document.getElementById('appointment-notes').value.trim();
            const isEdit = appointmentForm.dataset.editId;
            
            // Validation
            if (!petId || !date || !time || !purpose) {
                showToast('Please fill in all required fields', 'error');
                return;
            }
            
            // Check if time is within business hours (8AM-5PM)
            const hour = parseInt(time.split(':')[0]);
            if (hour < 8 || hour >= 17) {
                showToast('Please select a time between 8AM and 5PM', 'error');
                return;
            }
            
            // Show loading state
            const appointmentBtnText = document.getElementById('appointment-btn-text');
            const appointmentSpinner = document.getElementById('appointment-spinner');
            appointmentBtnText.style.display = 'none';
            appointmentSpinner.style.display = 'inline-block';
            
            // Add/update appointment
            setTimeout(() => {
                if (isEdit) {
                    // Update existing appointment
                    const apptIndex = appointments.findIndex(a => a.id === appointmentForm.dataset.editId);
                    if (apptIndex !== -1) {
                        appointments[apptIndex] = {
                            ...appointments[apptIndex],
                            petId,
                            date,
                            time,
                            purpose,
                            notes: notes || undefined
                        };
                        showToast('Appointment updated successfully', 'success');
                    }
                } else {
                    // Add new appointment
                    const newAppointment = {
                        id: generateId(),
                        ownerId: currentUser.id,
                        petId,
                        date,
                        time,
                        purpose,
                        notes: notes || undefined,
                        status: 'upcoming'
                    };
                    appointments.push(newAppointment);
                    showToast('Appointment booked successfully', 'success');
                }
                
                saveToLocalStorage();
                
                // Close modal and refresh appointments list
                appointmentModal.classList.remove('active');
                loadAppointments();
                loadDashboardData();
                
                // Reset loading state
                appointmentBtnText.style.display = 'inline-block';
                appointmentSpinner.style.display = 'none';
            }, 800);
        }
        
        // Handle profile form submission
        function handleProfileFormSubmit(e) {
            e.preventDefault();
            
            const name = document.getElementById('profile-name-input').value.trim();
            const email = document.getElementById('profile-email-input').value.trim();
            const phone = document.getElementById('profile-phone-input').value.trim();
            const address = document.getElementById('profile-address-input').value.trim();
            
            // Validation
            if (!name || !email) {
                showToast('Please fill in all required fields', 'error');
                return;
            }
            
            // Show loading state
            const profileBtnText = document.getElementById('profile-btn-text');
            const profileSpinner = document.getElementById('profile-spinner');
            profileBtnText.style.display = 'none';
            profileSpinner.style.display = 'inline-block';
            
            // Update user profile
            setTimeout(() => {
                currentUser.name = name;
                currentUser.email = email;
                currentUser.phone = phone || undefined;
                currentUser.address = address || undefined;
                
                // Update in users array
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex] = currentUser;
                    saveToLocalStorage();
                }
                
                loadDashboardData();
                showToast('Profile updated successfully', 'success');
                
                // Reset loading state
                profileBtnText.style.display = 'inline-block';
                profileSpinner.style.display = 'none';
            }, 800);
        }
        
        // Edit pet
        function editPet(petId) {
            const pet = pets.find(p => p.id === petId);
            if (!pet) return;
            
            document.getElementById('pet-name').value = pet.name;
            document.getElementById('pet-type').value = pet.type;
            document.getElementById('pet-breed').value = pet.breed || '';
            document.getElementById('pet-age').value = pet.age || '';
            
            // Change modal title and button text
            document.querySelector('#pet-modal .modal-header h3').textContent = 'Edit Pet';
            document.getElementById('pet-btn-text').textContent = 'Update';
            
            // Store pet ID in form for reference
            petForm.dataset.editId = petId;
            
            petModal.classList.add('active');
        }
        
        // Delete pet
        function deletePet(petId) {
            if (!confirm('Are you sure you want to delete this pet? All related appointments and vaccinations will also be deleted.')) {
                return;
            }
            
            // Delete pet
            pets = pets.filter(p => p.id !== petId);
            
            // Delete related appointments
            appointments = appointments.filter(appt => appt.petId !== petId);
            
            // Delete related vaccinations
            vaccinations = vaccinations.filter(vacc => vacc.petId !== petId);
            
            saveToLocalStorage();
            loadPets();
            loadAppointments();
            loadVaccinations();
            loadDashboardData();
            showToast('Pet deleted successfully', 'success');
        }
        
        // Edit appointment
        function editAppointment(appointmentId) {
            const appointment = appointments.find(a => a.id === appointmentId);
            if (!appointment) return;
            
            document.getElementById('appointment-pet').value = appointment.petId;
            document.getElementById('appointment-date').value = appointment.date;
            document.getElementById('appointment-time').value = appointment.time;
            document.getElementById('appointment-purpose').value = appointment.purpose;
            document.getElementById('appointment-notes').value = appointment.notes || '';
            
            // Change modal title and button text
            document.querySelector('#appointment-modal .modal-header h3').textContent = 'Edit Appointment';
            document.getElementById('appointment-btn-text').textContent = 'Update Appointment';
            
            // Store appointment ID in form for reference
            appointmentForm.dataset.editId = appointmentId;
            
            // Populate pet dropdown
            appointmentPetSelect.innerHTML = '<option value="">Select Pet</option>';
            const userPets = pets.filter(pet => pet.ownerId === currentUser.id);
            userPets.forEach(pet => {
                const option = document.createElement('option');
                option.value = pet.id;
                option.textContent = pet.name;
                if (pet.id === appointment.petId) {
                    option.selected = true;
                }
                appointmentPetSelect.appendChild(option);
            });
            
            appointmentModal.classList.add('active');
        }
        
        // Delete appointment
        function deleteAppointment(appointmentId) {
            if (!confirm('Are you sure you want to delete this appointment?')) {
                return;
            }
            
            appointments = appointments.filter(a => a.id !== appointmentId);
            saveToLocalStorage();
            loadAppointments();
            loadDashboardData();
            showToast('Appointment deleted successfully', 'success');
        }
        
        // Logout
        function logout() {
            currentUser = null;
            localStorage.removeItem('petCareUserId');
            
            // Show main site
            document.querySelector('header').style.display = 'block';
            document.querySelectorAll('section').forEach(section => {
                section.style.display = 'block';
            });
            document.querySelector('footer').style.display = 'block';
            dashboard.style.display = 'none';
            
            showToast('Logged out successfully', 'success');
        }
        
        // Show toast notification
        function showToast(message, type = 'info') {
            toast.textContent = message;
            toast.className = 'toast';
            toast.classList.add(type);
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
        
        // Helper functions
        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }
        
        function formatDate(dateString) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        }
        
        function formatTime(timeString) {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        }
        
        function getAppointmentPurpose(purpose) {
            const purposes = {
                'checkup': 'Checkup',
                'vaccination': 'Vaccination',
                'grooming': 'Grooming',
                'emergency': 'Emergency',
                'other': 'Other'
            };
            return purposes[purpose] || purpose;
        }
        
        function getAppointmentStatus(date) {
            const appointmentDate = new Date(date);
            const today = new Date();
            
            if (appointmentDate < today) {
                return 'Completed';
            } else if (appointmentDate.toDateString() === today.toDateString()) {
                return 'Today';
            } else {
                return 'Upcoming';
            }
        }
        
        function getAppointmentStatusClass(date) {
            const status = getAppointmentStatus(date);
            return status === 'Completed' ? 'badge-success' : status === 'Today' ? 'badge-primary' : 'badge-warning';
        }
        
        function getVaccinationStatus(dueDate) {
            const due = new Date(dueDate);
            const today = new Date();
            
            if (due < today) {
                return 'Due';
            } else if (due.toDateString() === today.toDateString()) {
                return 'Due Today';
            } else {
                return 'Upcoming';
            }
        }
        
        function getVaccinationStatusClass(dueDate) {
            const status = getVaccinationStatus(dueDate);
            return status === 'Due' ? 'badge-primary' : status === 'Due Today' ? 'badge-primary' : 'badge-success';
        }
        
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        
        // Initialize the app
        init();
    </script>