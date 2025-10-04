// Global State
let currentUser = null;
let currentUserType = null;
let users = [];
let jobs = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    checkCurrentUser();
});

// Local Storage Functions
function loadDataFromStorage() {
    const storedUsers = localStorage.getItem('placementPortalUsers');
    const storedJobs = localStorage.getItem('placementPortalJobs');
    const storedCurrentUser = localStorage.getItem('placementPortalCurrentUser');

    if (storedUsers) users = JSON.parse(storedUsers);
    if (storedJobs) jobs = JSON.parse(storedJobs);
    if (storedCurrentUser) {
        currentUser = JSON.parse(storedCurrentUser);
        showDashboard();
    }
}

function saveUsersToStorage() {
    localStorage.setItem('placementPortalUsers', JSON.stringify(users));
}

function saveJobsToStorage() {
    localStorage.setItem('placementPortalJobs', JSON.stringify(jobs));
}

function saveCurrentUser() {
    localStorage.setItem('placementPortalCurrentUser', JSON.stringify(currentUser));
}

function checkCurrentUser() {
    if (currentUser) {
        showDashboard();
    }
}

// Navigation Functions
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    element.scrollIntoView({ behavior: 'smooth' });
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.remove('active');
}

// Auth Modal Functions
function openAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.add('active');
    resetAuthModal();
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('active');
    resetAuthModal();
}

function resetAuthModal() {
    document.getElementById('selectUserType').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('modalTitle').textContent = 'Get Started';
    clearForms();
}

function clearForms() {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupConfirmPassword').value = '';
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('signupError').classList.add('hidden');
}

function showLoginForm(userType) {
    currentUserType = userType;
    document.getElementById('selectUserType').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Login';
}

function showSignupForm(userType) {
    currentUserType = userType;
    document.getElementById('selectUserType').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Sign Up';

    // Show appropriate fields
    document.getElementById('studentFields').classList.add('hidden');
    document.getElementById('recruiterFields').classList.add('hidden');

    if (userType === 'student') {
        document.getElementById('studentFields').classList.remove('hidden');
    } else if (userType === 'recruiter') {
        document.getElementById('recruiterFields').classList.remove('hidden');
    }
}

function backToSelect() {
    resetAuthModal();
}

// Authentication Functions
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    const user = users.find(u => u.email === email && u.type === currentUserType);

    if (user) {
        currentUser = user;
        saveCurrentUser();
        closeAuthModal();
        showDashboard();
    } else {
        errorDiv.textContent = 'Invalid credentials. Please try again.';
        errorDiv.classList.remove('hidden');
    }
}

function handleSignup(event) {
    event.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const errorDiv = document.getElementById('signupError');

    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.classList.remove('hidden');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        email: email,
        type: currentUserType
    };

    if (currentUserType === 'student') {
        newUser.name = document.getElementById('studentName').value;
        newUser.dob = document.getElementById('studentDOB').value;
        newUser.course = document.getElementById('studentCourse').value;
        newUser.semYear = document.getElementById('studentSemYear').value;
        newUser.phone = document.getElementById('studentPhone').value;

        if (!newUser.name || !newUser.dob || !newUser.course || !newUser.semYear || !newUser.phone) {
            errorDiv.textContent = 'Please fill in all required fields';
            errorDiv.classList.remove('hidden');
            return;
        }
    } else if (currentUserType === 'recruiter') {
        newUser.companyName = document.getElementById('companyName').value;
        newUser.companyAddress = document.getElementById('companyAddress').value;
        newUser.companyEmail = document.getElementById('companyEmail').value;

        if (!newUser.companyName || !newUser.companyAddress || !newUser.companyEmail) {
            errorDiv.textContent = 'Please fill in all required fields';
            errorDiv.classList.remove('hidden');
            return;
        }
    }

    users.push(newUser);
    saveUsersToStorage();

    currentUser = newUser;
    saveCurrentUser();

    closeAuthModal();
    showDashboard();
}

function logout() {
    currentUser = null;
    currentUserType = null;
    localStorage.removeItem('placementPortalCurrentUser');

    document.getElementById('homePage').classList.remove('hidden');
    document.getElementById('dashboardPage').classList.add('hidden');
}

// Dashboard Functions
function showDashboard() {
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.remove('hidden');

    const dashboardPage = document.getElementById('dashboardPage');

    if (currentUser.type === 'student') {
        dashboardPage.innerHTML = createStudentDashboard();
        loadStudentData();
    } else if (currentUser.type === 'recruiter') {
        dashboardPage.innerHTML = createRecruiterDashboard();
        loadRecruiterData();
    } else if (currentUser.type === 'admin') {
        dashboardPage.innerHTML = createAdminDashboard();
        loadAdminData();
    }
}

// Student Dashboard
function createStudentDashboard() {
    return `
        <nav class="dashboard-nav">
            <div class="dashboard-nav-container">
                <h1>Student Dashboard</h1>
                <button class="logout-btn" onclick="logout()">
                    <span>←</span> Logout
                </button>
            </div>
        </nav>
        <div class="dashboard-container">
            <div class="tabs">
                <button class="tab-btn active" onclick="switchTab('student', 'profile')">Profile</button>
                <button class="tab-btn" onclick="switchTab('student', 'browse')">Browse Jobs</button>
                <button class="tab-btn" onclick="switchTab('student', 'applications')">My Applications</button>
                <button class="tab-btn" onclick="switchTab('student', 'results')">Exam Results</button>
            </div>

            <div id="profile-tab" class="tab-content active">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">My Profile</h2>
                        <button class="btn-secondary" onclick="toggleEditMode()">Edit Profile</button>
                    </div>
                    <div id="profileForm">
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" id="profileName" value="${currentUser.name || ''}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" value="${currentUser.email}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Date of Birth</label>
                            <input type="date" id="profileDOB" value="${currentUser.dob || ''}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Course</label>
                            <input type="text" id="profileCourse" value="${currentUser.course || ''}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Semester/Year</label>
                            <input type="text" id="profileSemYear" value="${currentUser.semYear || ''}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="tel" id="profilePhone" value="${currentUser.phone || ''}" disabled>
                        </div>
                        <div id="editButtons" class="hidden" style="display: flex; gap: 1rem; margin-top: 1rem;">
                            <button class="btn-success" onclick="saveProfile()">Save Changes</button>
                            <button class="btn-secondary" onclick="cancelEdit()">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="browse-tab" class="tab-content">
                <h2 class="card-title" style="margin-bottom: 1.5rem;">Available Jobs</h2>
                <div id="jobsList" class="job-grid"></div>
            </div>

            <div id="applications-tab" class="tab-content">
                <h2 class="card-title" style="margin-bottom: 1.5rem;">My Applications</h2>
                <div id="applicationsList" class="job-grid"></div>
            </div>

            <div id="results-tab" class="tab-content">
                <div class="card">
                    <h2 class="card-title">Exam Results</h2>
                    <div id="resultsContent" class="empty-state">
                        <p>No exam results available yet.</p>
                        <p style="font-size: 0.875rem; margin-top: 1rem;">Results will be displayed here once exams are conducted and evaluated.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadStudentData() {
    loadJobsForStudent();
    loadApplications();
}

function loadJobsForStudent() {
    const jobsList = document.getElementById('jobsList');

    if (jobs.length === 0) {
        jobsList.innerHTML = '<div class="empty-state"><p>No jobs posted yet. Check back later!</p></div>';
        return;
    }

    jobsList.innerHTML = jobs.map(job => `
        <div class="job-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <h3>${job.title}</h3>
                    <p>${job.company}</p>
                </div>
                <button class="btn-secondary" onclick="applyForJob('${job.id}')">Apply Now</button>
            </div>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Salary:</strong> ${job.salary}</p>
            <p><strong>Description:</strong> ${job.description}</p>
            <p><strong>Requirements:</strong> ${job.requirements}</p>
            <p style="color: #9ca3af; font-size: 0.875rem;">Posted on ${job.postedDate}</p>
        </div>
    `).join('');
}

function applyForJob(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const resume = prompt('Enter your resume file name or paste resume text:');
    if (!resume) return;

    const applications = JSON.parse(localStorage.getItem(`applications_${currentUser.id}`) || '[]');

    const newApplication = {
        id: Date.now().toString(),
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        appliedDate: new Date().toLocaleDateString(),
        status: 'Pending Review',
        resume: resume
    };

    applications.push(newApplication);
    localStorage.setItem(`applications_${currentUser.id}`, JSON.stringify(applications));

    alert('Application submitted successfully!');
    loadApplications();
}

function loadApplications() {
    const applicationsList = document.getElementById('applicationsList');
    if (!applicationsList) return;

    const applications = JSON.parse(localStorage.getItem(`applications_${currentUser.id}`) || '[]');

    if (applications.length === 0) {
        applicationsList.innerHTML = '<div class="empty-state"><p>You haven\'t applied to any jobs yet.</p></div>';
        return;
    }

    applicationsList.innerHTML = applications.map(app => `
        <div class="application-card">
            <h3>${app.jobTitle}</h3>
            <p>${app.company}</p>
            <p><strong>Applied on:</strong> ${app.appliedDate}</p>
            <p><strong>Status:</strong> <span style="color: #2563eb; font-weight: 600;">${app.status}</span></p>
        </div>
    `).join('');
}

// Recruiter Dashboard
function createRecruiterDashboard() {
    return `
        <nav class="dashboard-nav recruiter">
            <div class="dashboard-nav-container">
                <h1>Recruiter Dashboard</h1>
                <button class="logout-btn" onclick="logout()">
                    <span>←</span> Logout
                </button>
            </div>
        </nav>
        <div class="dashboard-container">
            <div class="tabs">
                <button class="tab-btn active recruiter" onclick="switchTab('recruiter', 'profile')">Profile</button>
                <button class="tab-btn recruiter" onclick="switchTab('recruiter', 'post')">Post Job</button>
                <button class="tab-btn recruiter" onclick="switchTab('recruiter', 'students')">Browse Students</button>
            </div>

            <div id="profile-tab" class="tab-content active">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Company Profile</h2>
                        <button class="btn-success" onclick="toggleEditMode()">Edit Profile</button>
                    </div>
                    <div id="profileForm">
                        <div class="form-group">
                            <label>Company Name</label>
                            <input type="text" id="profileCompanyName" value="${currentUser.companyName || ''}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Login Email</label>
                            <input type="email" value="${currentUser.email}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Company Email</label>
                            <input type="email" id="profileCompanyEmail" value="${currentUser.companyEmail || ''}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Company Address</label>
                            <textarea id="profileCompanyAddress" rows="3" disabled>${currentUser.companyAddress || ''}</textarea>
                        </div>
                        <div id="editButtons" class="hidden" style="display: flex; gap: 1rem; margin-top: 1rem;">
                            <button class="btn-success" onclick="saveProfile()">Save Changes</button>
                            <button class="btn-secondary" onclick="cancelEdit()">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="post-tab" class="tab-content">
                <div class="card">
                    <h2 class="card-title">Post a New Job</h2>
                    <form onsubmit="handlePostJob(event)">
                        <div class="form-group">
                            <label>Job Title *</label>
                            <input type="text" id="jobTitle" required placeholder="e.g., Software Engineer">
                        </div>
                        <div class="form-group">
                            <label>Location *</label>
                            <input type="text" id="jobLocation" required placeholder="e.g., Bangalore, India">
                        </div>
                        <div class="form-group">
                            <label>Salary *</label>
                            <input type="text" id="jobSalary" required placeholder="e.g., ₹6-8 LPA">
                        </div>
                        <div class="form-group">
                            <label>Job Description *</label>
                            <textarea id="jobDescription" rows="4" required placeholder="Describe the job role and responsibilities..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Requirements *</label>
                            <textarea id="jobRequirements" rows="4" required placeholder="List the required skills and qualifications..."></textarea>
                        </div>
                        <button type="submit" class="btn-success btn-full">Post Job</button>
                    </form>

                    <div style="margin-top: 2rem;">
                        <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">My Posted Jobs</h3>
                        <div id="myJobsList"></div>
                    </div>
                </div>
            </div>

            <div id="students-tab" class="tab-content">
                <h2 class="card-title" style="margin-bottom: 1.5rem;">Browse Students</h2>
                <div id="studentsList" class="student-grid"></div>
            </div>
        </div>
    `;
}

function loadRecruiterData() {
    loadMyJobs();
    loadStudents();
}

function handlePostJob(event) {
    event.preventDefault();

    const newJob = {
        id: Date.now().toString(),
        title: document.getElementById('jobTitle').value,
        company: currentUser.companyName || 'Unknown Company',
        location: document.getElementById('jobLocation').value,
        salary: document.getElementById('jobSalary').value,
        description: document.getElementById('jobDescription').value,
        requirements: document.getElementById('jobRequirements').value,
        postedBy: currentUser.id,
        postedDate: new Date().toLocaleDateString()
    };

    jobs.push(newJob);
    saveJobsToStorage();

    document.getElementById('jobTitle').value = '';
    document.getElementById('jobLocation').value = '';
    document.getElementById('jobSalary').value = '';
    document.getElementById('jobDescription').value = '';
    document.getElementById('jobRequirements').value = '';

    alert('Job posted successfully!');
    loadMyJobs();
}

function loadMyJobs() {
    const myJobsList = document.getElementById('myJobsList');
    if (!myJobsList) return;

    const myJobs = jobs.filter(j => j.postedBy === currentUser.id);

    if (myJobs.length === 0) {
        myJobsList.innerHTML = '<p style="color: #6b7280;">You haven\'t posted any jobs yet.</p>';
        return;
    }

    myJobsList.innerHTML = myJobs.map(job => `
        <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="font-weight: bold; font-size: 1.125rem;">${job.title}</h4>
            <p style="color: #6b7280;">${job.location} | ${job.salary}</p>
            <p style="color: #9ca3af; font-size: 0.875rem; margin-top: 0.5rem;">Posted on ${job.postedDate}</p>
        </div>
    `).join('');
}

function loadStudents() {
    const studentsList = document.getElementById('studentsList');
    if (!studentsList) return;

    const students = users.filter(u => u.type === 'student');

    if (students.length === 0) {
        studentsList.innerHTML = '<div class="empty-state"><p>No students registered yet.</p></div>';
        return;
    }

    studentsList.innerHTML = students.map(student => `
        <div class="student-card">
            <h3>${student.name}</h3>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Course:</strong> ${student.course}</p>
            <p><strong>Year/Sem:</strong> ${student.semYear}</p>
            <p><strong>Phone:</strong> ${student.phone}</p>
        </div>
    `).join('');
}

// Admin Dashboard
function createAdminDashboard() {
    return `
        <nav class="dashboard-nav admin">
            <div class="dashboard-nav-container">
                <h1>Admin Dashboard</h1>
                <button class="logout-btn" onclick="logout()">
                    <span>←</span> Logout
                </button>
            </div>
        </nav>
        <div class="dashboard-container">
            <div class="tabs">
                <button class="tab-btn active admin" onclick="switchTab('admin', 'profile')">Profile</button>
                <button class="tab-btn admin" onclick="switchTab('admin', 'jobs')">Browse Jobs</button>
                <button class="tab-btn admin" onclick="switchTab('admin', 'students')">Browse Students</button>
            </div>

            <div id="profile-tab" class="tab-content active">
                <div class="card">
                    <h2 class="card-title">Admin Profile</h2>
                    <div class="form-group">
                        <label>Role</label>
                        <input type="text" value="University Administrator" disabled>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" value="${currentUser.email}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Institution</label>
                        <input type="text" value="St Joseph University" disabled>
                    </div>
                    <div style="background: #dbeafe; padding: 1.5rem; border-radius: 0.5rem; margin-top: 1.5rem;">
                        <h3 style="font-weight: 600; margin-bottom: 0.5rem;">Admin Responsibilities:</h3>
                        <ul style="margin-left: 1.5rem; color: #374151;">
                            <li>Monitor job postings from recruiters</li>
                            <li>Review student applications</li>
                            <li>Verify candidate eligibility</li>
                            <li>Coordinate with companies for placement drives</li>
                            <li>Manage exam schedules and results</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div id="jobs-tab" class="tab-content">
                <h2 class="card-title" style="margin-bottom: 1.5rem;">All Posted Jobs</h2>
                <div id="adminJobsList" class="job-grid"></div>
            </div>

            <div id="students-tab" class="tab-content">
                <h2 class="card-title" style="margin-bottom: 1.5rem;">Registered Students</h2>
                <div id="adminStudentsList" class="student-grid"></div>
            </div>
        </div>
    `;
}

function loadAdminData() {
    loadAllJobs();
    loadAllStudents();
}

function loadAllJobs() {
    const adminJobsList = document.getElementById('adminJobsList');
    if (!adminJobsList) return;

    if (jobs.length === 0) {
        adminJobsList.innerHTML = '<div class="empty-state"><p>No jobs posted yet.</p></div>';
        return;
    }

    adminJobsList.innerHTML = jobs.map(job => `
        <div class="job-card">
            <h3>${job.title}</h3>
            <p>${job.company}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Salary:</strong> ${job.salary}</p>
            <p><strong>Description:</strong> ${job.description}</p>
            <p><strong>Requirements:</strong> ${job.requirements}</p>
            <p style="color: #9ca3af; font-size: 0.875rem;">Posted on ${job.postedDate}</p>
        </div>
    `).join('');
}

function loadAllStudents() {
    const adminStudentsList = document.getElementById('adminStudentsList');
    if (!adminStudentsList) return;

    const students = users.filter(u => u.type === 'student');

    if (students.length === 0) {
        adminStudentsList.innerHTML = '<div class="empty-state"><p>No students registered yet.</p></div>';
        return;
    }

    adminStudentsList.innerHTML = students.map(student => `
        <div class="student-card">
            <h3>${student.name}</h3>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Course:</strong> ${student.course}</p>
            <p><strong>Year/Sem:</strong> ${student.semYear}</p>
            <p><strong>Phone:</strong> ${student.phone}</p>
            <p><strong>DOB:</strong> ${student.dob}</p>
        </div>
    `).join('');
}

// Tab Switching
function switchTab(userType, tabName) {
    // Hide all tabs
    const allTabs = document.querySelectorAll('.tab-content');
    allTabs.forEach(tab => tab.classList.remove('active'));

    // Remove active from all buttons
    const allButtons = document.querySelectorAll('.tab-btn');
    allButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('recruiter');
        btn.classList.remove('admin');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) selectedTab.classList.add('active');

    // Activate button
    event.target.classList.add('active');
    if (userType === 'recruiter') {
        event.target.classList.add('recruiter');
    } else if (userType === 'admin') {
        event.target.classList.add('admin');
    }
}

// Profile Editing
let isEditMode = false;

function toggleEditMode() {
    isEditMode = true;
    const inputs = document.querySelectorAll('#profileForm input:not([type="email"]:disabled), #profileForm textarea');
    inputs.forEach(input => {
        if (!input.disabled || input.id !== 'profileEmail') {
            input.disabled = false;
        }
    });
    document.getElementById('editButtons').classList.remove('hidden');
}

function cancelEdit() {
    isEditMode = false;
    showDashboard();
}

function saveProfile() {
    if (currentUser.type === 'student') {
        currentUser.name = document.getElementById('profileName').value;
        currentUser.dob = document.getElementById('profileDOB').value;
        currentUser.course = document.getElementById('profileCourse').value;
        currentUser.semYear = document.getElementById('profileSemYear').value;
        currentUser.phone = document.getElementById('profilePhone').value;
    } else if (currentUser.type === 'recruiter') {
        currentUser.companyName = document.getElementById('profileCompanyName').value;
        currentUser.companyEmail = document.getElementById('profileCompanyEmail').value;
        currentUser.companyAddress = document.getElementById('profileCompanyAddress').value;
    }

    // Update in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        saveUsersToStorage();
    }

    saveCurrentUser();
    isEditMode = false;
    alert('Profile updated successfully!');
    showDashboard();
}
