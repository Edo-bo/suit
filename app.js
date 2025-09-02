document.addEventListener('DOMContentLoaded', () => {
    // --- GANTI DENGAN KONFIGURASI FIREBASE ANDA ---
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCxC4PSHMlQHoSTrkNO7TaWaANdNWphNto",
  authDomain: "website2625.firebaseapp.com",
  projectId: "website2625",
  storageBucket: "website2625.firebasestorage.app",
  messagingSenderId: "318249754593",
  appId: "1:318249754593:web:99add47bbfb952aaf5bca0",
  measurementId: "G-JRXTC8Y0ND"
};

    // Inisialisasi Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    // --- Selektor DOM ---
    const ui = {
        menuToggle: document.getElementById('menuToggle'),
        sidebar: document.getElementById('sidebar'),
        navLinks: document.querySelectorAll('.nav-link'),
        pages: document.querySelectorAll('.page'),
        startBtn: document.getElementById('startBtn'),
        registerForm: document.getElementById('registerForm'),
        messageForm: document.getElementById('messageForm'),
        googleSignInBtn: document.getElementById('googleSignInBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        actionButtons: document.querySelectorAll('.action-btn'),
        nameInput: document.getElementById('name'),
        emailInput: document.getElementById('email')
    };
    
    let selectedMessageType = null;

    // --- Logika UI & Navigasi ---
    const toggleMenu = () => {
        ui.menuToggle.classList.toggle('active');
        ui.sidebar.classList.toggle('active');
    };
    ui.menuToggle.addEventListener('click', toggleMenu);

    const changePage = (pageId) => {
        ui.pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) targetPage.classList.add('active');
        if (ui.sidebar.classList.contains('active')) toggleMenu();
    };

    ui.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            changePage(e.target.getAttribute('href').substring(1));
        });
    });
    ui.startBtn.addEventListener('click', () => changePage('register'));

    // --- Otentikasi Firebase ---
    auth.onAuthStateChanged(user => {
        if (user) {
            ui.logoutBtn.style.display = 'block';
            db.ref('users/' + user.uid).once('value', snapshot => {
                if (snapshot.exists()) {
                    changePage('dashboard');
                } else {
                    ui.nameInput.value = user.displayName || '';
                    ui.emailInput.value = user.email || '';
                    changePage('register');
                }
            });
        } else {
            ui.logoutBtn.style.display = 'none';
            changePage('intro');
        }
    });

    ui.googleSignInBtn.addEventListener('click', () => {
        auth.signInWithPopup(googleProvider).catch(err => alert(err.message));
    });

    ui.logoutBtn.addEventListener('click', () => auth.signOut());

    // --- Interaksi Database Firebase ---
    ui.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return alert('Terjadi kesalahan, silakan login kembali.');

        db.ref('users/' + user.uid).set({
            name: ui.nameInput.value,
            whatsapp: document.getElementById('whatsapp').value,
            email: ui.emailInput.value
        }).then(() => {
            alert('Data berhasil disimpan!');
            changePage('dashboard');
        }).catch(err => alert(err.message));
    });

    ui.actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            ui.actionButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedMessageType = button.dataset.type;
        });
    });

    ui.messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        const message = document.getElementById('userMessage').value;

        if (!user) return alert('Anda harus login untuk mengirim pesan.');
        if (!selectedMessageType) return alert('Silakan pilih jenis pesan terlebih dahulu.');
        if (!message.trim()) return alert('Pesan tidak boleh kosong.');

        const newRequestRef = db.ref('requests').push();
        newRequestRef.set({
            userId: user.uid,
            type: selectedMessageType,
            message: message,
            status: 'pending',
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            alert('Pesan Anda berhasil terkirim ke admin!');
            ui.messageForm.reset();
            ui.actionButtons.forEach(btn => btn.classList.remove('selected'));
            selectedMessageType = null;
        }).catch(err => alert(err.message));
    });
});
