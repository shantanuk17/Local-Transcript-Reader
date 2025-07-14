#  Local Transcript Reader — README

This project is a local transcript reader powered by AI (UNPAID/FREE) using [Ollama](https://ollama.com/), Node.js, and Vue.js.

---

##  Recommended IDE Setup

We recommend using **Visual Studio Code (VS Code)** as your development environment.

### Steps:
1. Visit [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Download the appropriate installer for your operating system (Windows/macOS/Linux).
3. Run the installer and follow the instructions.
4. Launch **VS Code** after installation.

---

## DOWNLOAD NODE.JS AND NPM

Node.js comes with npm (Node Package Manager), which is essential to run this project.

### Steps:
1. Visit the official Node.js website: [https://nodejs.org/en](https://nodejs.org/en)
2. Click the green **"Download"** button.
3. Download the **LTS (Recommended for most users)** version.
4. Run the installer:
   - **Windows**: Make sure to check the box **“Install npm”** and **“Add to PATH”** during setup.
   - **macOS**: Use the `.pkg` file provided on the site.
   - **Linux**: Follow the instructions provided for your distribution.
5. After installation, verify:
```sh
   node -v
   npm -v
```
##  INSTALL VUE.JS CLI
   ```sh
   npm install -g @vue/cli
   ```

## To verify the installation:
   ```sh
      vue --version
   ```

## DOWNLOAD OLLAMA
This project uses Ollama, a local AI model engine that allows you to run LLMs locally.

Steps:
Visit https://ollama.com/download

Download and install it according to your operating system.

After installation, open the Ollama app or make sure it is running in the background before starting the project.

## RUNNING THE LOCAL TRANSCRIPT READER PROJECT
Follow these steps to run the complete application locally.

1. OPEN PROJECT IN THE EDITOR (VS-Code)

2. GO TO THE PROJECT ROOT DIRECTORY
From your terminal, navigate to the root directory where package.json is located.

3. INSTALL BACKEND DEPENDENCIES
Run the following command to install backend dependencies:
```sh
npm install
```

4. START THE BACKEND SERVER
To start the backend server, run:
```sh
npm start
```

5. START THE FRONTEND
In a new terminal window:
Navigate to the frontend folder:
```sh
cd frontend
```
```sh
npm install
```
```sh
npm run dev
```

The frontend application will run at:

http://localhost:5173/
