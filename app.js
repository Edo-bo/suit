document.addEventListener('DOMContentLoaded', () => {
    // --- GANTI DENGAN KONFIGURASI FIREBASE ANDA ---
    const firebaseConfig = {
  apiKey: "AIzaSyCxC4PSHMlQHoSTrkNO7TaWaANdNWphNto",
  authDomain: "website2625.firebaseapp.com",
  projectId: "website2625",
  storageBucket: "website2625.firebasestorage.app",
  messagingSenderId: "318249754593",
  appId: "1:318249754593:web:99add47bbfb952aaf5bca0",
  measurementId: "G-JRXTC8Y0ND"
};


    // Inisialisasi Firebase (hanya app dan database)
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    // --- Selektor DOM ---
    const ui = {
        menuToggle: document.getElementById('menuToggle'),
        sidebar: document.getElementById('sidebar'),
        navLinks: document.querySelectorAll('.nav-link'),
        pages: document.querySelectorAll('.page'),
        startBtn: document.getElementById('startBtn'),
        registerForm: document.getElementById('registerForm'),
        messageForm: document.getElementById('messageForm'),
        actionButtons: document.querySelectorAll('.action-btn'),
    };
    
    // Variabel untuk menyimpan data pengguna sementara
    let currentUserInfo = null;
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
            // Hanya izinkan navigasi ke dashboard jika data sudah diisi
            const pageId = e.target.getAttribute('href').substring(1);
            if (pageId === 'dashboard' && !currentUserInfo) {
                alert('Harap isi data diri Anda terlebih dahulu.');
                changePage('register');
            } else {
                changePage(pageId);
            }
        });
    });
    
    ui.startBtn.addEventListener('click', () => changePage('register'));

    // --- Logika Form ---
    
    // 1. Tangani form data diri
    ui.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simpan data ke variabel sementara
        currentUserInfo = {
            name: document.getElementById('name').value,
            whatsapp: document.getElementById('whatsapp').value,
            email: document.getElementById('email').value,
        };

        alert('Data berhasil disimpan! Silakan lanjutkan mengisi pesan.');
        changePage('dashboard');
    });

    // 2. Pilih jenis pesan
    ui.actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            ui.actionButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedMessageType = button.dataset.type;
        });
    });

    // 3. Tangani form pengiriman pesan
    ui.messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = document.getElementById('userMessage').value;

        // Validasi
        if (!currentUserInfo) {
            alert('Sesi Anda telah berakhir. Harap isi kembali data diri Anda.');
            changePage('register');
            return;
        }
        if (!selectedMessageType) return alert('Silakan pilih jenis pesan terlebih dahulu.');
        if (!message.trim()) return alert('Pesan tidak boleh kosong.');

        // Gabungkan data pengguna dengan data pesan
        const requestData = {
            senderInfo: currentUserInfo, // Data dari form pertama
            type: selectedMessageType,
            message: message,
            status: 'pending',
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        // Kirim ke Firebase Realtime Database
        db.ref('requests').push(requestData)
          .then(() => {
              alert('Pesan Anda berhasil terkirim ke admin!');
              ui.messageForm.reset();
              ui.actionButtons.forEach(btn => btn.classList.remove('selected'));
              selectedMessageType = null;
              // Opsional: kembalikan ke halaman intro setelah berhasil
              // changePage('intro'); 
          })
          .catch(err => {
              alert('Gagal mengirim pesan: ' + err.message);
          });
    });
});
