<template>
  <div class="container">
    <h1>Read Transcript</h1>
    <input type="file" accept=".pdf,image/*" @change="handleFile" />
    <button @click="extractData" :disabled="!file || loading">
      {{ loading ? 'Processing...' : 'Extract Data' }}
    </button>
    <div v-if="error" class="error">{{ error }}</div>

    <table v-if="result">
      <thead>
        <tr><th>Code</th><th>Name</th><th>Credits</th><th>Grade</th><th>Semester</th></tr>
      </thead>
      <tbody>
        <tr v-for="(c, i) in result.courses" :key="i">
          <td>{{ c.code }}</td><td>{{ c.name }}</td><td>{{ c.credits }}</td><td>{{ c.grade }}</td><td>{{ c.semester }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="result?.GPA">
      <strong>GPA:</strong> {{ result.GPA }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import Tesseract from 'tesseract.js';

const file = ref(null);
const result = ref(null);
const loading = ref(false);
const error = ref('');

function handleFile(e) {
  file.value = e.target.files[0];
}

async function extractData() {
  error.value = '';
  result.value = null;
  loading.value = true;

  try {
    let text = '';
    if (file.value.type === 'application/pdf') {
      text = await extractTextFromPDF(file.value);
    } else if (file.value.type.startsWith('image/')) {
      const { data } = await Tesseract.recognize(file.value, 'eng');
      text = data.text;
    } else {
      throw new Error('Unsupported file type');
    }

    const res = await fetch('http://localhost:3001/api/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);
    result.value = data;
  } catch (err) {
    error.value = err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function extractTextFromPDF(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map(item => item.str).join(' ') + '\n';
  }
  return fullText;
}
</script>
