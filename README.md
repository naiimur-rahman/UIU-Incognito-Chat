<div align="center">

  <img src="https://upload.wikimedia.org/wikipedia/en/c/c5/United_International_University_Monogram.png" alt="UIU Logo" width="100" />

  # 🍊 UIU Student Chat
  
  **The Anonymous Pulse of the UIU Community**
  
  <p>
    <a href="https://github.com/naiimur-rahman">
      <img src="https://img.shields.io/badge/Developer-Naimur_Rahman-orange?style=for-the-badge&logo=github" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/Status-Live-success?style=for-the-badge" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/Tech-Glassmorphism-blue?style=for-the-badge" />
    </a>
  </p>

  <h3>
    <a href="https://naiimur-rahman.github.io/UIU-CGPA-Calculator/">🔗 Visit CGPA Calculator</a>
    <span> | </span>
    <a href="#">🔴 Live Demo (Coming Soon)</a>
  </h3>
</div>

---

## 🚀 About The Project

**UIU Student Chat** is a real-time, anonymous messaging platform designed exclusively for United International University students. Built to foster open communication, it combines a sleek, modern **Glassmorphism UI** with robust real-time technology.

Whether you want to discuss courses, share memes, or just vent about finals, this is your space. No sign-ups, no passwords—just pick a name and join the conversation.

## ✨ Key Features

### 🎨 **Smart & Modern UI**
* **Glassmorphism Design:** A trendy, frosted-glass aesthetic using backdrop filters and semi-transparent layers.
* **Fluid Animations:** Smooth entry animations (`popUp`, `fadeIn`) and floating background elements make the site feel alive.
* **Lucide Icons:** crisp, lightweight vector icons for a polished look.

### 🛡️ **Secure & Smart Logic**
* **Identity Protection:** Real-time duplicate name detection. If "Sohan" is online, no one else can login as "Sohan" (case-insensitive protection!).
* **Live User Count:** See exactly how many students are online instantly in the header.
* **Auto-Cleanup:** Users are automatically removed from the "Active" list when they close the tab or lose internet connection.

### 🌗 **User Experience**
* **Dark/Light Mode:** A fully persistent theme toggle that remembers your preference.
* **Responsive:** Works perfectly on Mobile, Tablet, and Desktop.
* **Welcome Watermark:** A stylish background watermark that ensures the chat never feels empty.

---

## 📸 Snapshots

<div align="center">
  <img src="image_00e499.jpg" alt="Login Screen" width="45%" />
  <img src="image_00d55b.png" alt="Chat Screen" width="45%" />
</div>

---

## 🛠️ Tech Stack

This project works without a backend server logic file because it leverages **Firebase-as-a-Backend (BaaS)**.

| Component | Technology |
| :--- | :--- |
| **Structure** | HTML5 Semantic |
| **Styling** | CSS3 (Variables, Flexbox, Glassmorphism) |
| **Scripting** | Vanilla JavaScript (ES6+) |
| **Database** | Firebase Realtime Database |
| **Icons** | Lucide Icons |
| **Fonts** | Google Fonts (Poppins) |

---

## ⚡ How to Run Locally

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/uiu-student-chat.git](https://github.com/your-username/uiu-student-chat.git)
    ```

2.  **Navigate to the folder**
    ```bash
    cd uiu-student-chat
    ```

3.  **Launch**
    Simply open `index.html` in your browser.
    * *Note: For the best experience, use a local server (like Live Server in VS Code) to ensure no CORS issues with modules.*

---

## ⚙️ Configuration

The project uses **Firebase** for real-time data. The current configuration is included in `index.html`.

If you wish to fork this project, create your own project at [Firebase Console](https://console.firebase.google.com/):
1.  Create a **Realtime Database**.
2.  Set Rules to `read/write: true` (for testing) or set up Authentication.
3.  Replace the `firebaseConfig` object in the script tag with your own credentials.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## ❤️ Credits

Developed with love by **Naimur Rahman** (CSE 242) for the students of UIU.

* **Icons:** [Lucide](https://lucide.dev)
* **Font:** [Poppins](https://fonts.google.com/specimen/Poppins)

<div align="center">
  <br />
  <i>"Be kind, stay curious, and enjoy the randomness."</i>
</div>
