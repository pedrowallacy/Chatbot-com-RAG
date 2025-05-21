<template>
  <div class="chat-container">
    <div class="chat-history" ref="chatHistory">
      <div
        v-for="(msg, index) in historico"
        :key="index"
        :class="['chat-message', msg.role]"
      >
        <p class="chat-author">{{ msg.role === 'user' ? 'Você' : 'Assistente' }}</p>
        <div class="chat-bubble">{{ msg.content }}</div>
      </div>
    </div>
    <div class="input-container">
      <div class="input-inner">
        <input v-model="pergunta" placeholder="Digite sua pergunta" @keyup.enter="enviarPergunta" />
        <button @click="enviarPergunta">Enviar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const pergunta = ref('')
const resposta = ref('')
const historico = ref([])
const chatHistory = ref(null)

const enviarPergunta = async () => {
  if (!pergunta.value.trim()) return
  historico.value.push({ role: 'user', content: pergunta.value })

  await nextTick(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight
    }
  })

  const res = await fetch('http://localhost:5000/chat/suporte', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ pergunta: pergunta.value }),
    credentials: 'include'
  })

  const data = await res.json()
  historico.value.push({ role: 'assistant', content: data.resposta })
  pergunta.value = ''

  await nextTick(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight
    }
  })
}
</script>

<style scoped>
body {
  background: #ffffff;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.chat-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
  background: #fefeff;
  width: 100vw;
  overflow: hidden;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0 32px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 700px;
  /* Remove extra scroll from parent */
  box-sizing: border-box;
}

.chat-message {
  display: flex;
  flex-direction: column;
  max-width: 60%;
}

.chat-message.user {
  align-self: flex-end;
  align-items: flex-end;
}

.chat-message.assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.chat-author {
  font-size: 0.85em;
  color: #888;
  margin-bottom: 2px;
}

.chat-bubble {
  background: #e0e0e0;
  color: #222;
  border-radius: 16px;
  padding: 10px 16px;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.chat-message.user .chat-bubble {
  background: #1976d2;
  color: #fff;
}

.input-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 0 32px 0;
  background: transparent;
  box-shadow: none;
  z-index: 100;
  gap: 8px;
  border-top: none;
}

.input-inner {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 700px;
  background: #2a2a2c;
  border-radius: 24px;
  padding: 12px 20px;
  box-shadow: 0 2px 16px 0 rgba(0,0,0,0.18);
  gap: 8px;
}

.input-inner input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.1em;
  outline: none;
  padding: 0;
}

.input-inner button {
  background: #44444a;
  border: none;
  color: #fff;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1.2em;
}

.input-inner button:hover {
  background: #303087;
}
</style>
